const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { everyone } = require("../../permissions");
const { Orders } = require("../../sequelize");
const { Collection } = require("discord.js");
module.exports =
	new DDCommand()
		.setName("menu")
		.setDescription("The official discord donuts menu.")
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			const m = await message.channel.send("Loading menu...");
			const menuL = client.orders;
			const menu = menuL.map(x => x.get("description").toLowerCase().replaceLast("donuts", "donut"));
			const top = new Collection(menu.unique().map(
				x => [x, menu.filter(y => y === x).length]
			));
			const topMenu = [...top.entries()].sort((a, b) => b[1] - a[1]);
			await m.edit(`**__DISCORD DONUTS__**
**__Top Donuts__**
${topMenu.slice(0, 6).map((x, i) => `[${i + 1}] **${x[0]}**: ${x[1]} orders.`).join("\n")}
=================
Order a donut with \`d!order [description]\`!
`);
		});
