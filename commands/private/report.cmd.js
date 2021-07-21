const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Orders } = require("../../sequelize");
const { getOrder, status } = require("../../helpers");
const { canCook, isBotAdmin } = require("../../permissions");
const { channels: { reportChannel } } = require("../../auth");
module.exports =
	new DDCommand()
		.setName("report")
		.setDescription("Reports an order.")
		.addShortcuts("rp")
		.addSyntax("orderid", "id")
		.setPermissions(canCook)
		.setFunction(async(message, args, client) => {
			if (args[1] && args[1].toLowerCase() === "dismiss") {
				if (!isBotAdmin(client, message.member)) return message.channel.send("You dont have permission.");
				const order = await getOrder("dismiss", message, args, [-1, -1], false, 0);
				if (!order) return;
				await client.users.get(order.user).send(`Your order, ${order.id}'s report has been dismissed.`);
				await order.update({ status: order.tempStatus || 0 });
				return message.channel.send("The report has been dismissed.");
			}
			const order = await getOrder("report", message, args, [0, 3], false, 0);
			if (!order) return;
			await message.channel.send(`What is the reason that you're reporting order \`${order.id}\`?`);
			let reason = args[1];
			if (!reason) {
				const r = await message.channel.awaitMessages(m => m.author.id === message.author.id, {
					max: 1,
					time: 20000
				});
				if (!r.size) return message.channel.send("Query timed out.");
				reason = r.first().content;
			}
			await message.channel.send(`You have reported \`${order.id}\` for reason **${reason}**.`);
			await order.update({ tempStatus: order.status, status: -1, reported: true });
			client.users.get(order.user).send(`Your order, ${order.id}, has been reported for reason ${reason}. We are currently investigating the issue.`);
			await client.channels.get(reportChannel).send(`
**${message.author.tag}** HAS REPORTED TICKET \`${order.id}\` for reason \`${reason}\`.
Respond with \`d!report ${order.id} dismiss\` if you think that this is invalid.
			`);
		});
