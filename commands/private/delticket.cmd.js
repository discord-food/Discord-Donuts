const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Orders, Op } = require("../../sequelize");
const { canCook } = require("../../permissions");
const { channels: { ticketChannel } } = require("../../auth.json");
const { getOrder } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("delticket")
		.addAlias("delorder")
		.addShortcuts("dt")
		.addSyntax("orderId", "id")
		.addSyntax("reason", "text")
		.setDescription("Delete tickets.")
		.setPermissions(canCook)
		.setFunction(async(message, args, client) => {
			const order = await getOrder("delete", message, args, [-1, 3]);
			if (!order) return;
			await message.channel.send("What is the reason?");
			let reason = "";
			let reasons = await message.channel.awaitMessages(m => m.author.id === message.author.id, { time: 20000, max: 1 });
			if (!reasons.size) {
				reason = false;
			} else {
				reason = reasons.first().content;
			}
			if (!reason) reason = "None specified.";

			if (!order) return;
			if (order.status === 4) return message.reply("<:no:501906738224562177> **The order you requested to be deleted was already delivered.**");
			if (order.status > 4) return message.reply(`<:no:501906738224562177> **Order \`${args[0]}\` has already been deleted!**`);

			await order.update({ status: 5 });
			client.users.get(order.user).send(`Your ticket has been deleted. Reason: \`${reason}\``);
			(await client.channels.get(ticketChannel).messages.fetch(order.ticketMessageID)).delete();
			await message.channel.send(`<:yes:501906738119835649> **Order \`${order.id}\` was successfully deleted!**`);
		});
