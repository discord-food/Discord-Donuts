const DDCommand = require("../../structures/DDCommand.struct");
const DDEmbed = require("../../structures/DDEmbed.struct");

const { Orders } = require("../../sequelize");
const { isBotAdmin } = require("../../permissions");
const { getOrder, messageAlert, findUser } = require("../../helpers");
const { channels: { kitchenChannel }, mainServer, employeeRole } = require("../../auth.json");

module.exports =
	new DDCommand()
		.setName("assign")
		.setDescription("Use this to assign orders to users.")
		.addShortcuts("ao")
		.addSyntax("orderId", "id")
		.addSyntax("userId", "snowflake", true)
		.setPermissions(isBotAdmin)
		.setFunction(async(message, args, client) => {
			if (message.channel.id !== kitchenChannel) return message.channel.send("<:no:501906738224562177> **You may only utilize this command in the kitchen.**");


			const user = await findUser(client, message, args, 1);
			if (!user) return;
			const order = await getOrder("assign", message, args, [0, 3]);
			if (!order) return message.channel.send("<:no:501906738224562177> **There was an issue fetching that order, please try again.**");
			await order.update({ status: 1, claimer: user.id });

			const claimEmbed = new DDEmbed(client)
				.setStyle("blank")
				.setDescription(`🎫 **Your order has been assigned to \`${message.author.tag}\`!\nPlease wait while they process your order.**`)
				.setFooter(message.author.tag, message.author.displayAvatarURL());
			await client.users.get(order.user).send(claimEmbed);

			const embed = new DDEmbed(client)
				.setStyle("blank")
				.setDescription(`<:yes:501906738119835649> **You have successfully assigned that ticket to ${user.tag}.**`)
				.setFooter(message.author.tag, message.author.displayAvatarURL());
			await message.channel.send(embed);
			await client.channels.get(kitchenChannel).send(`<@${user.id}> has been assigned \`${order.id}\`. We hope you can prepare the order!`);
			await messageAlert(client, "**An order has just been assigned, there are now [orderCount] orders left.**");
		});

