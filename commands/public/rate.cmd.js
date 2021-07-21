const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Orders, Op, Ratings, WorkerInfo } = require("../../sequelize");
const { everyone } = require("../../permissions");
const { messageAlert } = require("../../helpers");
const { channels: { ticketChannel } } = require("../../auth.json");

module.exports =
	new DDCommand()
		.setName("rate")
		.setDescription("Rate your cook or deliverer.")
		.addShortcuts("rt")
		.addSyntax("selection", "cook|deliver", true)
		.addSyntax("ratings", "1-5", true)
		.setPermissions(everyone)
		.setFunction(async(message, args, client, account) => {
			async function getReactions(display, reactions) {
				const filter = (reaction, user) => reactions.includes(reaction.emoji.id) && user.id === message.author.id;
				let msg = await message.channel.send(display);
				for (const r of reactions) {
					msg.react(r);
				}
				const col = await msg.awaitReactions(filter, { time: 15000, max: 1 });
				if (!col.size) return false;
				return reactions.indexOf(col.first().emoji.id);
			}
			const corders = await Orders.findAll({ where: { user: message.author.id, status: { [Op.gt]: 1 }, cookRated: false, claimer: { [Op.ne]: null } }, order: [["createdAt", "DESC"]] });
			const dorders = await Orders.findAll({ where: { user: message.author.id, status: 4, deliverRated: false, deliverer: { [Op.ne]: null } }, order: [["createdAt", "DESC"]] });
			if (!corders.length && !dorders.length) return message.channel.send("You don't have any prepared donuts yet!");
			let edit;
			let user;
			let ed;
			let selected;
			let mt;
			if (!args[0]) return message.channel.send("You didn't give me any parameters. Try `d!rate cook 4` or `d!rate deliver 5`!");
			if (args[0].includes("cook")) {
				if (!corders.length) return message.channel.send("You don't have any cooked donuts yet!");
				user = corders[0].claimer;
				edit = corders[0].id;
				ed = "cookRated";
				selected = corders;
				mt = "cooks";
			} else if (args[0].includes("deliver")) {
				if (!dorders.length) return message.channel.send("You don't have any delivered donuts yet!");
				user = dorders[0].deliverer;
				edit = dorders[0].id;
				ed = "deliverRated";
				selected = dorders;
				mt = "deliveries";
			} else {
				return message.channel.send("That is not an option. Try `d!rate cook 4` or `d!rate deliver 5`!");
			}
			let e = (await Ratings.findOrCreate({ where: { id: user }, default: { id: user, rate1: 0, rate2: 0, rate3: 0, rate4: 0, rate5: 0, } }))[0];
			if (!args[1]) return message.channel.send("You didn't give me a number. Try `d!rate cook 4` or `d!rate deliver 5`!");
			if (isNaN(args[1])) return message.channel.send("That is not a number. Try `d!rate cook 4` or `d!rate deliver 5`!");
			let sel = Number(args[1]);
			if (sel < 0 || sel > 5) return message.channel.send("That is not between 1 and 5. Try `d!rate cook 4` or `d!rate deliver 5`!");
			let val = e[`rate${sel}`];
			if (val === undefined) return message.channel.send("Error.");
			const tag = client.users.get(user);
			const backup = await WorkerInfo.findById(user);
			if (!tag && !backup) tag = { tag: "Unknown#????" };
			if (!tag && backup) tag = { tag: backup.username };
			const embed = new DDEmbed(client)
				.setTitle("Confirmation Notice")
				.setStyle("blank")
				.setDescription(`You are rating ${tag.tag} ${args[1]}/5. Do you accept this?`)
				.setFooter(`There are ${selected.length - 1} more ${mt} to rate.`);
			let r = await getReactions(embed, ["501906738224562177", "501906738119835649"]);
			if (!r) return message.channel.send("You did not react to the message so I ended this session.");
			if (r != 1) return message.channel.send("I have cancelled this session.");
			await e.update({ [`rate${sel}`]: val + 1 });
			await (await Orders.findById(edit)).update({ [ed]: true });
			message.channel.send("Rated!");
			messageAlert(client, `${tag.tag} was rated ${args[1]} stars by ${message.author.tag} for order \`${edit}\`. They were rated on their ${mt}.`);
		});
