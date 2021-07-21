const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Orders } = require("../../sequelize");
const { getOrder, status } = require("../../helpers");
const { canCook } = require("../../permissions");

module.exports =
	new DDCommand()
		.setName("ostatus")
		.setDescription("Lists info about a specific order.")
		.addSyntax("orderId", "id")
		.addShortcuts("os")
		.setPermissions(canCook)
		.setFunction(async(message, args, client) => {
			const order = await getOrder("get", message, args, [0, 3], true);

			if (!order) return;

			const embed =
				new DDEmbed(client)
					.setStyle("blank")
					.setTitle("Ticket Status")
					.addField("🆔 Ticket ID", order.id, true)
					.addField("🎫 Ticket Description", order.description, true)
					.addField("<:yes:501906738119835649> Ticket Status", status(order.status), true)
					.setTimestamp();

			message.channel.send(embed);
		});
