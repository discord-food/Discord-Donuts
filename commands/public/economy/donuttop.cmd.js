const DDCommand = require("../../../structures/DDCommand.struct");
const DDEmbed = require("../../../structures/DDEmbed.struct");
const { everyone } = require("../../../permissions");
const { mainServer } = require("../../../auth");
const { Donuts, Orders } = require("../../../sequelize");
module.exports =
	new DDCommand()
		.setName("donuttop")
		.addAliases("dtop", "dlb")
		.addSyntax("start", "number")
		.addSyntax("size", "number")
		.setDescription("Lists the top 10 users with the most donuts!")
		.setPermissions(everyone)
		.setFunction(async(message, args, client, account) => {
			let start = +args[0] - 1 || 0;
			let size = +args[1] || 10;
			const embed = new DDEmbed(client)
				.setStyle("blank")
				.setTitle("Donut Leaderboard")
				.setDescription("The donut leaderboard.");
			const allDonuts = await Donuts.findAll({ order: [["donuts", "DESC"]] });
			if (size - start > allDonuts.length) return message.channel.send("INDEX OUT OF BOUNDS");
			const donuts = await Donuts.findAll({ order: [["donuts", "DESC"]], limit: start + size });
			donuts.splice(0, start);
			for (const acc of donuts) {
				const i = donuts.indexOf(acc) + start;
				const orders = await Orders.count({ where: { user: acc.id } });
				if (!client.users.get(acc.id)) return acc.destroy();
				embed.addField(`[${i + 1}] ${client.users.get(acc.id).tag}`, `${acc.donuts} donuts and ${orders} orders.`);
			}
			await message.channel.send(embed);
		});
