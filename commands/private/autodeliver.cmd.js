const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { EasyDelivers, Orders, WorkerInfo, MonthlyInfo, Event, EventInfo } = require("../../sequelize");
const { canCook } = require("../../permissions");
const { channels: { deliveryChannel, ticketChannel } } = require("../../auth.json");
const { getOrder, checkMilestones, timeout } = require("../../helpers");

module.exports =
	new DDCommand()
		.setName("autodeliver")
		.setDescription("Use this to auto deliver cooked donuts.")
		.addShortcuts("adv", "gago")
		.addSyntax("orderId", "id")
		.setPermissions(canCook)
		.setFunction(async(message, args, client, account) => {
			if (message.channel.id !== deliveryChannel) return message.channel.send("<:no:501906738224562177> **You can only use this command in the delivery channel.**");

            const order = await getOrder("deliver", message, args, [3, 3]);
			if (!order) return;

			if (order.status > 3) return message.channel.send("<:no:501906738224562177> **Requested order has already been delivered.**");
			if (order.status < 3) return message.channel.send("<:no:501906738224562177> **Requested order has not been cooked.**");
			const wait = Date.now() - order.createdAt;
			await order.update({ status: 4, deliverer: message.author.id, deliverTime: new Date(), waitTime: isNaN(wait) ? null : wait });
            const embed = new DDEmbed(client)
            .setStyle("blank")
            .setTitle("Delivery!")
            .setImage(order.url)
            .addField(`Hello ${order.usertag}`, "Here is your donut", true)
            .addField(`Order id:`, `${order.id}`, true)
            .addField(`Baked by:`, `<@${order.claimer}>`, true)
            .addField(`Order Desc:`, `${order.description}`, true)
            .addField("Why not tip?", `d!tip`, true)
            .addField("Join our server for support", `[**Support Server**](https://discord.gg/ttBcxbfcmN 'Discord Server')`)
            .setFooter("Thank you for using Donut Delivery today!")
            .setColor("GREEN")
		client.channels.get(order.channel).send(embed);

			await message.react("501906738119835649");

			await account.update({donuts: account.donuts + 25});
			await message.channel.send("You got 25 donuts!");

		});