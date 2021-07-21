const DDEmbed = require("../../../structures/DDEmbed.struct");
const DDCommand = require("../../../structures/DDCommand.struct");

const { channels: { tipChannel } } = require("../../../auth.json");

const { everyone } = require("../../../permissions");
const { Orders, Donuts } = require("../../../sequelize");
module.exports =
	new DDCommand()
		.setName("tip")
		.setDescription("Give virtual tips.")
		.addSyntax("amount", "number", true)
		.setPermissions(everyone)
		.setFunction(async(message, args, client, account) => {
			function decs(num) {
				return (num.toString().split('.')[1] || []).length;
			}
			if (!args[0]) return message.channel.send("<:no:501906738224562177> **Please provide an amount to tip.**");
			if (isNaN(args[0])) return message.channel.send("<:no:501906738224562177> **That doesn't look like a number.**");
			if (Number(args[0]) < 0) return message.channel.send("<:no:501906738224562177> **Don't try to steal money from us.**");
			if (Number(args[0]) < 1) return message.channel.send("<:no:501906738224562177> **That's not a tip. That's nothing.**");
			if (Number(args[0]) > 1073741824) return message.channel.send("<:no:501906738224562177> **I doubt you have that much money.**");
			if (decs(args[0]) > 2) return message.channel.send("<:no:501906738224562177> **Please input a real value.**");
			if (Number(args[0]) % 1 > 0) return message.channel.send("<:no:501906738224562177> **Only whole numbers are allowed.**");
			if (account.donuts < Number(args[0])) return message.channel.send(`<:no:501906738224562177> **You don't have that much. You only have ${account.donuts} donuts.**`);
			const orders = await Orders.findAll({ where: { status: 4, tipped: false, user: message.author.id }, order: [["createdAt", "DESC"]] });
			if (!orders.length) return message.channel.send("You don't have any orders to tip.");
			const order = orders[0];
			const toadd = Number(args[0]);
			const cookacc = await (await Donuts.findOrCreate({ where: { id: order.claimer }, defaults: { id: order.claimer, donuts: 0 } }))[0];
			const deliveracc = order.deliverer ? await (await Donuts.findOrCreate({ where: { id: order.deliverer }, defaults: { id: order.deliverer, donuts: 0 } }))[0] : false;
			const cookuser = client.users.get(order.claimer);
			const deliveruser = order.deliverer ? client.users.get(order.deliverer) : { tag: "nobody" };
			if (!cookuser) {
				await order.update({ tipped: true });
				return message.channel.send(`We couldn't reach the workers that prepared \`${order.id}\`! Sorry about that. Please try again.`);
			}
			const embed =
				new DDEmbed(client)
					.setStyle("blank")
					.setTitle(`New tip from ${message.author.tag} (${message.author.id})`)
					.setDescription(`${Number(args[0])} donuts has been given to ${cookuser.tag} and ${deliveruser.tag} for order \`${order.id}\``)
					.setThumbnail("https://images.emojiterra.com/twitter/512px/1f4b0.png");
			await cookacc.update({ donuts: cookacc.donuts + toadd });
			if (deliveracc) await deliveracc.update({ donuts: deliveracc.donuts + toadd });
			await account.update({ donuts: account.donuts - toadd });
			await client.channels.get(tipChannel).send(embed);
			await order.update({ tipped: true });
			return message.channel.send(`**Thank you for tipping us!**\nYou have tipped order \`${order.id}\`.\nYou have ${orders.length - 1} more orders to tip.`);
		});
