const DDCommand = require("../../structures/DDCommand.struct");
const DDEmbed = require("../../structures/DDEmbed.struct");

const { Orders } = require("../../sequelize");
const { isBotAdmin } = require("../../permissions");
const { messageAlert } = require("../../helpers");
const { channels: { kitchenChannel } } = require("../../auth.json");

module.exports =
	new DDCommand()
		.setName("forceuncook")
		.addAlias("funcook")
		.addSyntax("orderId", "id")
		.setDescription("Use this to forcefully uncook donut orders.")
		.setPermissions(isBotAdmin)
		.setFunction(async(message, args, client) => {
			if (!args[0]) return message.channel.send("<:no:501906738224562177> **Invalid arguments provided. Please ensure that you've provided an ID to claim.**");
			if (!args[0].match(/^0[a-zA-Z0-9]{6}$/)) return message.channel.send("<:no:501906738224562177> **Invalid arguments provided. Please ensure that you've provided a valid ID.**");

			const order = await Orders.findById(args[0]);
			if (!order) return;
			if (order.claimer === null || (order.status !== 2 && order.status !== 3)) return message.channel.send(`<:no:501906738224562177> **Order \`${order.id}\` is not cooking or cooked.**`);

			await order.update({ status: 1, url: null });

			const claimEmbed =
				new DDEmbed(client)
					.setStyle("blank")
					.setDescription(`🎫 **Your order has been uncooked forcefully.**`);
			await client.users.get(order.user).send(claimEmbed);

			const embed =
				new DDEmbed(client)
					.setStyle("blank")
					.setDescription(`<:yes:501906738119835649> **Uncook successful.**`);
			await message.channel.send(embed);

			await messageAlert(client, "**An order has just been forcefully uncooked, there are now [orderCount] orders left.**");
		});

