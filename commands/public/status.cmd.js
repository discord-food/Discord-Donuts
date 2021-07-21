const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Orders, Op } = require("../../sequelize");
const { status, generateTicket } = require("../../helpers");
const { everyone } = require("../../permissions");

module.exports =
	new DDCommand()
		.setName("status")
		.addAliases("myorder", "myticket")
		.setDescription("Lists info about your current order.")
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			const order = await Orders.findOne({ where: { user: message.author.id, status: { [Op.lt]: 4 } } });

			if (!order) return message.reply("<:no:501906738224562177> **You do not currently have a donut**");
			message.channel.send(generateTicket(client, order));
		});
