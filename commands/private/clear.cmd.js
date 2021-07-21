const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Orders, Op } = require("../../sequelize");
const { isBotOwner } = require("../../permissions");
const { channels: { ticketChannel } } = require("../../auth");
const { messageAlert } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("clear")
		.addShortcuts("clr")
		.addAliases("ctickets", "corders")
		.setDescription("Deletes all orders.")
		.setPermissions(isBotOwner)
		.setFunction(async(message, args, client) => {
			(await Orders.all()).map(async order => { (await client.channels.get(ticketChannel).messages.fetch(order.ticketMessageID)).delete(); });
			const deletedOrders = await Orders.update({ status: 5 }, { where: { status: { [Op.lt]: 4 } } });
			if (deletedOrders > 0) {
				messageAlert(client, "All orders has been cleared. There are now [orderCount] orders.");
				return message.react("501906738119835649");
			}
			return message.channel.send("<:no:501906738224562177> **There are currently no orders to delete.**");
		});
