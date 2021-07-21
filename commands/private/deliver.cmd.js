const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { EasyDelivers, Orders, WorkerInfo, MonthlyInfo, Event, EventInfo } = require("../../sequelize");
const { canCook } = require("../../permissions");
const { channels: { deliveryChannel, ticketChannel } } = require("../../auth.json");
const { getOrder, checkMilestones, timeout } = require("../../helpers");

module.exports =
	new DDCommand()
		.setName("deliver")
		.setDescription("Use this to deliver cooked donuts.")
		.addShortcuts("dlv", "dv")
		.addSyntax("orderId", "id")
		.setPermissions(canCook)
		.setFunction(async(message, args, client, account) => {
			if (message.channel.id !== deliveryChannel) return message.channel.send("<:no:501906738224562177> **You can only use this command in the delivery channel.**");


			const order = await getOrder("deliver", message, args, [3, 3]);
			if (!order) return;
			if (order.claimer !== message.author.id) return message.channel.send("<:no:501906738224562177> **Permission denied; not original claimer.**");

			// if (order.user === message.author.id) return message.channel.send("<:no:501906738224562177> That's your order!");

			if (order.status > 3) return message.channel.send("<:no:501906738224562177> **Requested order has already been delivered.**");
			if (order.status < 3) return message.channel.send("<:no:501906738224562177> **Requested order has not been cooked.**");
			const wait = Date.now() - order.createdAt;
			await order.update({ status: 4, deliverer: message.author.id, deliverTime: new Date(), waitTime: isNaN(wait) ? null : wait });
			const gendelmsg = "[user], here's your order, enjoy [url] ! If you enjoy using the bot and would like to take an extra step further to support it, you may donate via PayPal(**<https://paypal.me/noah3561>**). Enjoyed your donut? Give us feedback with **d!feedback <feedback>**.";
			(await client.channels.get(ticketChannel).messages.fetch(order.ticketMessageID)).delete();
			const delmsg = (await EasyDelivers.findOrCreate({ where: { id: message.author.id }, defaults: { id: message.author.id, content: gendelmsg } }))[0].content;
			let invite;

			try {
				invite = await client.channels.get(order.channel).createInvite({
					maxAge: 86400,
					maxUses: 1,
					unique: true,
				});
			} catch (e) {
				if (e.message === "Cannot read property 'createInvite' of undefined") {
					await order.destroy();
					return message.channel.send("<:no:501906738224562177> I cannot find the order channel. The order has been deleted");
				}
				await order.destroy();
				await client.channels.get(order.channel).send("<:no:501906738224562177> **I require invite permisisons so that our deliverers can deliver donuts. Your order has been deleted**");
				return message.channel.send("<:no:501906738224562177> **I was unable to create an invite, this has been reported to the guild owner, and the order has been deleted**");
			}

			const orderEmbed =
				new DDEmbed(client)
					.setStyle("blank")
					.setTitle(`Delivery Information`)
					.addField("🎫 Ticket Description", order.description)
					.addField("ℹ Additional Information", `User: **${client.users.get(order.user).tag} (${order.user})**\nChannel: **#${client.channels.get(order.channel).name} (${order.channel})**`)
					.addField("Supplied Image", order.url);

			try {
				await message.author.send(orderEmbed);
				await message.author.send(invite.url);
				const delmsgformatted = delmsg.convertTemplate(`<@${order.user}>`, order.url, order.description, order.id, client.users.get(order.claimer).tag, client.users.get(order.user).tag);
				await message.author.send(`\`\`\`\n${delmsgformatted}\n\`\`\``);
			} catch (e) {
				return message.channel.send(`<:no:501906738224562177> **Unable to send ticket information.**\n\`\`\`${e}\`\`\``);
			}

			await message.react("501906738119835649");

			const workerraw = await WorkerInfo.findOrCreate({ where: { id: message.author.id }, defaults: { id: message.author.id, cooks: 0, delivers: 0, lastCook: 0, lastDeliver: 0, username: message.author.tag } });
			const worker = workerraw[0];
			await worker.update({ delivers: worker.delivers + 1, lastDeliver: Date.now(), lastWork: new Date() });
			const monthlyraw = await MonthlyInfo.findOrCreate({ where: { id: message.author.id }, defaults: { id: message.author.id, cooks: 0, delivers: 0, username: message.author.tag } });
			const monthly = monthlyraw[0];
			await monthly.update({ delivers: monthly.delivers + 1 });
			checkMilestones(client, worker);
			const evt = await Event.findOne({ where: { id: 0 } });
			if (evt) {
				const event = await (await EventInfo.findOrCreate({ where: { id: message.author.id }, defaults: { id: message.author.id, points: 0, username: message.author.tag } }))[0];
				await event.update({ points: event.points + 1 });
			}
			await account.update({donuts: account.donuts + 25});
			await message.channel.send("You got 25 donuts!");

		});
