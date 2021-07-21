const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Collection } = require("discord.js");

const { Orders, Op, Cooldowns } = require("../../sequelize");

const { generateID, createOrder, messageAlert, generateTicket, addAchievement, getActiveWorkers } = require("../../helpers");

const {
	dutyRole,
	mainServer,
	channels: { kitchenChannel },
	employeeRole,
} = require("../../auth");

const { everyone } = require("../../permissions");

module.exports = new DDCommand()
	.setName("order")
	.setDescription("Order your donuts here.")
	.addSyntax("order", "text", true)
	.setPermissions(everyone)
	.setFunction(async(message, args, client, account, cooldown) => {
		if (message.guild.verificationLevel >= 3) return message.channel.send('You cannot order donuts in this server, because you will not recieve the delivery due to this guild\'s verification level having the requirement "Must be a member of this server for more than 10 minutes". Please contact an administrator.');
		if (["fuck", "shit", "wtf", "gtfo", "bitch", "ass"].some(b => message.content.match(new RegExp(`\\b${b}\\b`, "i")))) return message.channel.send("No swear words allowed!");
		const paramcheck = new RegExp("(?=\\[(.+)\\])");
		const params = paramcheck.test(args.join(" ")) ? paramcheck.exec(args.join(" "))[1] : false;
		// eslint-disable-next-line no-useless-escape
		const parameters = params ?
			new Map(
				params
					.split(/(?<!\\),/)
					.map(x => x.trim())
				// eslint-disable-next-line no-useless-escape
					.map(y => y.split(/(?<!\\)\:/).map(x => x.trim().replace(/\\/g, "")))
			) :
			new Map();

		const cooldowng = (await Cooldowns.findOrCreate({ where: { id: message.guild.id }, defaults: { id: message.guild.id, order: 0 } }))[0];
		if (Number(cooldowng.order) + 10000 >= Date.now()) return message.channel.send("<:no:501906738224562177> You are ordering too fast!");
		let description = args.join(" ").trim();
		if (parameters.size) {
			description = description.replace(`[${params}]`, "").trim();
		}
		if (description.length > 40) return message.channel.send("<:no:501906738224562177> **Your donut description cannot exceed a character count of 40, please try again.**");
		if (!description) return message.channel.send("<:no:501906738224562177> **Please provide a description of your order.**");
		if (await Orders.count({ where: { user: message.author.id, status: { [Op.lt]: 4 } } })) return message.channel.send("<:no:501906738224562177> **Failed to create order; you already have an order created, please try again later.**");
		/*if (!getActiveWorkers(client).length) {
			await message.channel.send("Are you sure you want to place an order? There are currently no available workers.");
			const res = await message.channel.awaitMessages(msg => msg.author.id === message.author.id && msg.content.match(/yes|no/i), { max: 1, time: 43000 });
			if (!res.size || res.first().content.toLowerCase() !== "yes") return message.channel.send("Cancelled.");
		}*/
/*		let canSend = true;
		try {
			await message.author.send("Thank you for ordering! Your order was sent to our workers.");
		} catch (err) {
			await message.channel.send("I was unable to send a DM to you. The order was cancelled.");
			canSend = false;
		}
		if (!canSend) return; */

		if (!description.toLowerCase().includes("donut")) description += " donut";
		description = description.toLowerCase().replaceLast("donuts", "donut");

		await createOrder(message, { description, account, parameters });
	});
