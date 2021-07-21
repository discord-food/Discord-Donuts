const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Orders, Op } = require("../../sequelize");
const { everyone } = require("../../permissions");
const { messageAlert } = require("../../helpers");
const { channels: { ticketChannel } } = require("../../auth.json");

module.exports =
	new DDCommand()
		.setName("cancel")
		.addAlias("delete")
		.addShortcuts("del")
		.setDescription("Cancel an order.")
		.setPermissions(everyone)
		.setFunction(async(message, args, client, account) => {
			const order = await Orders.findOne({ where: { user: message.author.id, status: { [Op.lt]: 4 } } });

			if (!order) return message.reply("<:no:501906738224562177> **You do not have an order**");

			await order.update({ status: 7 });
			await account.update({ donuts: account.donuts - 50 });
			await message.react("501906738119835649");

			(await client.channels.get(ticketChannel).messages.fetch(order.ticketMessageID)).delete();
			messageAlert(client, ":cry: An order has been cancelled, there are now [orderCount] orders left");
		});
