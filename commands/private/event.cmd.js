const DDCommand = require("../../structures/DDCommand.struct");
const DDEmbed = require("../../structures/DDEmbed.struct");
const pms = x => require("pretty-ms")(x, { unitCount: 3, verbose: true });
const { Orders, EventInfo, Event, Op } = require("../../sequelize");
const { canCook, isBotAdmin } = require("../../permissions");
const { mainMember } = require("../../helpers");
const { dutyRole, channels: { eventChannel } } = require("../../auth");
const moment = require("moment-timezone");
module.exports =
	new DDCommand()
		.setName("event")
		.setDescription("Event stuff.")
		.addShortcuts("evt")
		.setPermissions(canCook)
		.setFunction(async(message, args, client) => {
			const getString = async(d, t = 40000) => {
				await message.channel.send(d);
				const res = await message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: t });
				if (!res.size) return void message.channel.send("Query timed out");
				return res.first().content;
			};
			const einfo = await Event.findOne({ where: { id: 0 } });
			const elb = await (await EventInfo.findAll({ order: [["points", "DESC"]] })).map(x => x.get("id"));
			const es = await EventInfo.findById(message.author.id);
			const opt = (args[0] && args[0].toLowerCase()) || "info";
			switch (opt) {
				case "info": {
					if (!einfo) return message.channel.send("There isn't currently an event going on.");
					await message.channel.send(`
__**CURRENT EVENT**__
**${einfo.name}**
${einfo.description}
**TIME LEFT**: ${pms(einfo.end - Date.now())}
**YOUR POINTS**: ${es ? es.points : 0} points.
**YOUR RANK**: #${elb.indexOf(message.author.id)}
			`);
					break;
				}
				case "start" :
				case "create": {
					if (!await isBotAdmin(client, message.member)) return message.channel.send("you dont have permission");
					const title = await getString("What is the title?");
					if (!title) return;
					const description = await getString("What is the description?");
					if (!description) return;
					const time = await getString("When will it end from now in days?");
					if (!time || isNaN(time)) return;
					const end = new Date(Date.now() + (86400000 * time));
					await Event.create({ id: 0, name: title, description, end });
					await message.channel.send("Added.");
					await client.channels.get(eventChannel).send(`__**NEW EVENT**__
**${title}**\n
${description}
Ends at \`${moment(end).tz("UTC").format("LL z Z")}\`
Run \`d!event info\` for information.
`);

					break;
				}
				case "leaderboard":
				case "lb": {
					if (!einfo) return message.channel.send("There is no event currently.");
					const lb = await EventInfo.findAll({ order: [["points", "DESC"]], limit: 5 });
					const lbm = lb.map(async(x, i) => `[${i + 1}] **${["🥇", "🥈", "🥉"][i] || ""} ${client.users.get(x.id) ? client.users.get(x.id).tag : "??"}**: ${x.points} points.`);
					message.channel.send(`__**EVENT LEADERBOARD**__
${(await Promise.all(lbm)).join("\n")}
`);
				}
			}
		});
