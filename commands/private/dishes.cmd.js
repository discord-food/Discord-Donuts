const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Orders, Op, Dishes } = require("../../sequelize");
const { canCook } = require("../../permissions");
const { channels: { ticketChannel } } = require("../../auth.json");
const { getOrder } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("dishes")
		.addAlias("plates")
		.addShortcuts("dsh")
		.setDescription("Get a list of all dirty dishes.")
		.setPermissions(canCook)
		.setFunction(async(message, args, client) => {
			const statuses = ["Filthy", "Smells Weird", "Literally Ancient", "Mildly Dirty"];
			const all = await Dishes.findAll();
			const sliced = all.slice(0, 15);
			const list = new DDEmbed(client)
				.setTitle("🍽 Dishes")
				.setStyle("blank")
				.setFooter("Run d!wash [id] to wash a dish!")
				.setDescription(`A list of all unwashed dishes. ${sliced.length}/${all.length} showing.`);
			for (const dish of sliced) {
				list.addField(dish.id, `${statuses[Math.floor(Math.abs(Math.sin(dish.statusID)) * statuses.length)]}`, true);
			}
			await message.channel.send(list);
		});
