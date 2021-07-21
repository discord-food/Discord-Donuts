const DDCommand = require("../../structures/DDCommand.struct");
const DDEmbed = require("../../structures/DDEmbed.struct");

const { Orders } = require("../../sequelize");
const { canCook } = require("../../permissions");
const { messageAlert, getOrder } = require("../../helpers");
const { channels: { kitchenChannel } } = require("../../auth.json");

module.exports =
	new DDCommand()
		.setName("claim")
		.setDescription("Use this to claim donut orders.")
		.addShortcuts("cl")
		.addSyntax("orderId", "id")
		.setPermissions(canCook)
		.setFunction(async(message, args, client) => {
			if (message.channel.id !== kitchenChannel) return message.channel.send("<:no:501906738224562177> **You may only utilize this command in the kitchen.**");


			const order = await getOrder("claim", message, args, [0, 0]);
			if (!order) return;
			if (order.claimer != null || order.status !== 0) return message.channel.send(`<:no:501906738224562177> **Order \`${order.id}\` has already been claimed.**`);
			if (client.user.id == "335637950044045314" && message.author.id == order.user) return message.channel.send("<:no:501906738224562177> You may not claim your own order.");
			await order.update({ status: 1, claimer: message.author.id });

			const claimEmbed = new DDEmbed(client)
				.setStyle("blank")
				.setDescription(`🎫 **Your order has been claimed by \`${message.author.tag}\`!\nPlease wait while they process your order.**`)
				.setFooter(message.author.tag, message.author.displayAvatarURL());
			await client.users.get(order.user).send(claimEmbed);

			const embed = new DDEmbed(client)
				.setStyle("blank")
				.setDescription(`<:yes:501906738119835649> **You have successfully claimed that ticket.**`)
				.setFooter(message.author.tag, message.author.displayAvatarURL());
			await message.channel.send(embed);

			await messageAlert(client, "**An order has just been claimed, there are now [orderCount] orders left.**");
		});

