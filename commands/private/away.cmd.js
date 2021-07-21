const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");
const { mainServer, channels: { absenceChannel }, awayRole } = require("../../auth");
const { canCook } = require("../../permissions");
const { hasRole } = require("../../helpers");
const { Absences } = require("../../sequelize");
const moment = require("moment-timezone");
module.exports =
	new DDCommand()
		.setName("away")
		.addAliases("request-absence", "absence")
		.addShortcuts("aw")
		.addSyntax("timezone", "text")
		.setDescription("Request absence with this command.")
		.setPermissions(canCook)
		.setFunction(async(message, args, client) => {
			Date.prototype.addDays = function(d) {
				this.setMilliseconds(Math.floor(d * 86400000));
				return this;
			};
			Array.prototype.count = function() {
				let res = {};
				for (let x of this) {
					if (!res[x]) res[x] = 0;
					res[x]++;
				}
				return res;
			};
			async function endAbsence() {
				await message.channel.send("Ending/Cancelling your absence... This may take up to 10 seconds.");
				const abs = await Absences.findById(message.author.id);
				await abs.update({ endTime: new Date() });
			}
			const defformat = "YYYY, MMMM D, LT Z z";
			const quickformat = "YYYY, MMMM D LT UTC";
			async function getConfirmation(display) {
				await message.channel.send(display);
				const confirm = await message.channel.awaitMessages(
					m => m.author.id === message.author.id &&
						m.content.match(/(yes|no)/i),
					{ max: 1, time: 30000 });
				if (!confirm.size) return false;
				return confirm.first().content.toString();
			}
			async function getTime(time, display) {
				await message.channel.send(display);
				const response = await message.channel.awaitMessages(
					m => m.author.id === message.author.id &&
						(!isNaN(m.content) || m.content.toLowerCase() === "unknown"),
					{ max: 1, time: 40000 });
				if (!response.size) {
					message.channel.send("Query timed out.");
					return false;
				}
				if (response.first().content.toLowerCase() === "unknown") return moment("3000", "YYYY");
				return moment().tz(time).add(Math.floor(Number(response.first().content) * 86400000), "ms");
			}


			if (await Absences.findById(message.author.id)) {
				if (args.length && args[0].toLowerCase() === "end") {
					return await endAbsence();
				}
				await message.channel.send("You're already away or you have a future absence.");
				const c = await getConfirmation("Would you like to end/cancel your absence?");
				if (!c || c === "no") return message.channel.send("Cancelled prompt.");
				return await endAbsence();
			}
			let sel = args.join(" ");
			if (!args[0]) {
				await message.channel.send("What is your time zone? ex. `EST`, `PDT`...");
				const s = await message.channel.awaitMessages(
					m => m.author.id === message.author.id,
					{ max: 1, time: 30000 });
				if (!s.size) return message.channel.send("Query timed out.");
				sel = s.first().content;
			}
			sel = sel.toUpperCase();
			let timezones = moment.tz.names().filter(x => moment.tz.zone(x).abbrs.includes(sel));
			if (!timezones.length) return message.channel.send("That timezone is not valid!");
			let full = timezones.map(x => {
				let abbrs = moment.tz.zone(x).abbrs;
				let count = abbrs.count();
				let tcount = Object.keys(count).map(xx => ({ key: xx , value: count[xx] / abbrs.length }));
				return [x, tcount];
			});
			full = full.sort((a,b) => b[1].find(x => x.key === sel).value - a[1].find(x => x.key === sel).value);
			full = full.filter(x => x[1].find(y => y.key === sel).value >= 0.4);
			let conts = [];
			full = full.filter(x => {
				let key = x[0];
				if (!conts.some(v => key.startsWith(v))) {
					conts.push(key.split("/")[0]);
					return true;
				} else {
					return false;
				}
			});
			full.forEach((x, i) => x.push(i + 1));
			let fuller = full.map(x => `[${x[2]}] ${x[0]}: ${x[1].map(y => `${y.key}: ${Math.ceil(y.value * 100)}%`).join(", ")}`);
			let fullest = fuller.join("\n");
			message.channel.send(`**Please choose one of the following.**\n\`\`\`ini\n${fullest}\n\`\`\``);
			const t = await message.channel.awaitMessages(
				m => m.author.id === message.author.id &&
					!isNaN(m.content),
				{ max: 1, time: 30000 });
			if (!t.size) return message.channel.send("Query timed out.");
			const z = Number(t.first().content);
			if (full.length < z || z < 1) return message.channel.send("Number out of bounds.");
			const selected = full.find(x => x[2] === z)[0];
			await message.channel.send(`You selected **${selected}**.`);
			await message.channel.send("What is your absence reason?");
			const reason = await message.channel.awaitMessages(
				m => m.author.id === message.author.id,
				{ max: 1, time: 40000 });
			if (!reason.size) {
				message.channel.send("Query timed out.");
				return false;
			}
			let r = reason.first().content;
			await message.channel.send(`Reason set to \`${r}\``);
			const start = await getTime(selected, "When will your absence start in days from now? ex. -2, 5, 3.14...");
			if (!start) return;
			if (isNaN(Number(start))) return message.channel.send("The start time is not valid.");
			const end = await getTime(selected, "When will your absence end in days from now? ex. 11, 62.12, 52.3...\nReply with unknown if unknown.");
			if (!end) return;
			if (isNaN(Number(end))) return message.channel.send("The end time is not valid.");
			if ((end - start) < 1) return message.channel.send("You can't time travel.");
			if (((end - start) > 7889231490) && end.get("y") !== 3000) {
return message.channel.send(`The maximum absence length is 3 months. 
Please contact a council member if your absence exceeds this limit.`);
}
			const cm = await getConfirmation(`Your start time is **${start.format(defformat)}**,\nand your end time is **${end.format(defformat)}**.\nIs that correct? Reply with \`yes\` or \`no\`.`);
			if (!cm) return message.channel.send("Confirmation timed out.");
			if (cm === "no") return message.channel.send("Cancelled.");
			await message.channel.send("Thank you for submitting absence.");
			await Absences.create({ reason: r,startFormat: start.utc().format(quickformat), endFormat: end.utc().format(quickformat), started: false, id: message.author.id, startTime: start.toDate(), endTime: end.toDate(), awayMessage: null });
		});
