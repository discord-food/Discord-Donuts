const DDCommand = require("../../structures/DDCommand.struct");
const DDEmbed = require("../../structures/DDEmbed.struct");

const { Orders } = require("../../sequelize");
const { isBotAdmin } = require("../../permissions");
const { getOrder, messageAlert, status } = require("../../helpers");
const { channels: { kitchenChannel } } = require("../../auth.json");

module.exports =
	new DDCommand()
		.setName("forcesetstatus")
		.addAliases("fsetstatus", "setstatus")
		.addSyntax("orderId", "id")
		.addSyntax("status", "number", true)
		.setDescription("Use this to forcefully change the status of an order.")
		.setPermissions(isBotAdmin)
		.setFunction(async(message, args, client) => {
			if (!args[1]) return message.channel.send("<:no:501906738224562177> **Invalid arguments provided. Please ensure that you've provided a status.**");
			if (isNaN(args[1])) return message.channel.send("<:no:501906738224562177> **Invalid arguments provided. Please ensure that you've provided a status that is valid.**");
			const order = await getOrder("forcesetstatus", message, args, [0, 10]);
			if (!order) return;

			await order.update({ status: Number(args[1]) });

			const claimEmbed =
				new DDEmbed(client)
					.setStyle("blank")
					.setDescription(`🎫 **Your order's status has modified to "${status(Number(args[1]))}".**`);
			await client.users.get(order.user).send(claimEmbed);

			const embed =
				new DDEmbed(client)
					.setStyle("blank")
					.setDescription(`<:yes:501906738119835649> **Modify successful.**`);
			await message.channel.send(embed);

			await messageAlert(client, `**An order's status has just been modified to "${status(Number(args[1]))}", there are now [orderCount] orders left.**`);
		});

