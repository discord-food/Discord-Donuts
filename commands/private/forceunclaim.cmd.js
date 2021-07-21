const DDCommand = require("../../structures/DDCommand.struct");
const DDEmbed = require("../../structures/DDEmbed.struct");

const { Orders } = require("../../sequelize");
const { isBotAdmin } = require("../../permissions");
const { getOrder, messageAlert } = require("../../helpers");
const { channels: { kitchenChannel } } = require("../../auth.json");

module.exports =
	new DDCommand()
		.setName("forceunclaim")
		.addAlias("funclaim")
		.addSyntax("orderId", "id")
		.setDescription("Use this to forcefully unclaim donut orders.")
		.setPermissions(isBotAdmin)
		.setFunction(async(message, args, client) => {
			const order = await getOrder("forceunclaim", message, args, [1, 3]);

			if (!order) return;
			if (order.claimer === null || order.status !== 1) return message.channel.send(`<:no:501906738224562177> **Order \`${order.id}\` is not claimed.**`);

			await order.update({ status: 0, claimer: null });

			const claimEmbed =
				new DDEmbed(client)
					.setStyle("blank")
					.setDescription(`🎫 **Your order has been unclaimed forcefully.**`);
			await client.users.get(order.user).send(claimEmbed);

			const embed =
				new DDEmbed(client)
					.setStyle("blank")
					.setDescription(`<:yes:501906738119835649> **Unclaim successful.**`);
			await message.channel.send(embed);

			await messageAlert(client, "**An order has just been forcefully unclaimed, there are now [orderCount] orders left.**");
		});

