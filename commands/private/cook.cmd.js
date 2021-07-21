const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Orders, WorkerInfo, MonthlyInfo, PrecookedDonuts, Event, EventInfo } = require("../../sequelize");
const { getOrder, getCustomReactions, generateSize, checkMilestones, timeout, messageAlert, isurl } = require("../../helpers");
const { canCook } = require("../../permissions");
const { channels: { kitchenChannel, deliveryChannel } } = require("../../auth.json");

const statuses = ["Can you taste it already?", "Smells good!", "It'll be amazing.", "You can smell it from here.", "That smells good!", "Can you taste it yet?"];

const randomstatus = statuses[Math.floor(Math.random() * statuses.length)];
let img = { height: 100, width: 200 };
module.exports =
	new DDCommand()
		.setName("cook")
		.addAlias("bake")
		.addShortcuts("ck", "bk")
		.setDescription("Use this to cook donuts.")
		.addSyntax("orderId", "id")
		.setPermissions(canCook)
		.setFunction(async(message, args, client, account) => {
			if (message.channel.id !== kitchenChannel) return message.channel.send("<:no:501906738224562177> **You may only utilize this command in the kitchen.**");
			const order = await getOrder("cook", message, args, [1, 1]);
			const e = await Event.findById(await Event.count() - 1);
			if (!order) return;
			if (order.claimer !== message.author.id) return message.channel.send("<:no:501906738224562177> **Permission denied; not original claimer.**");
			if (Math.random() < 0.2) order.e.cook.e
			if (order.status === 2) return message.channel.send("<:no:501906738224562177> **Requested order is currently being cooked, please check back later.**");
			if (order.status > 2) return message.channel.send("<:no:501906738224562177> **Requested order has already been cooked.**");

			let url;
			const precookedDonuts = await PrecookedDonuts.findAll({ where: { name: order.description } });
			if (precookedDonuts.length > 0) {
				const randomDonut = precookedDonuts[Math.floor(Math.random() * precookedDonuts.length)];
				message.channel.send(`**I found a precooked donut for you. Reply \`yes\` to use it, or \`no\` to use your own.** \n ${randomDonut.url}`);

				const response = await message.channel.awaitMessages(
					m => m.author.id === order.claimer &&
						m.content.match(/(yes|no)/i),
					{ max: 1, time: 30000 });

				if (response.size && response.first().content.match(/yes/i)) {
					url = randomDonut.url;
					img = { height: randomDonut.height, width: randomDonut.width };
				}
			}


			if (!url) {
				const urlEmbed =
					new DDEmbed(client)
						.setStyle("blank")
						.setTitle("Cook Wizard")
						.setURL("https://discordapp.com/oauth2/authorize?client_id=335637950044045314&scope=bot&permissions=84993")
						.setDescription("**The next message you send will be set as the order's image.**")
						.setFooter(message.author.tag, message.author.displayAvatarURL());

				await message.channel.send(urlEmbed);

				const response = await message.channel.awaitMessages(
					m => m.author.id === order.claimer,
					{ max: 1, time: 30000 });

				if (!response.size) return message.channel.send("<:no:501906738224562177> **Cook sequence failed, please try again.**");

				if (isurl(response.first().content.trim())) {
					url = response.first().content.trim();
					img = response.first().embeds[0] ? response.first().embeds[0].thumbnail : undefined;
				} else if (response.first().attachments.size) {
					url = response.first().attachments.first().proxyURL;
					img = response.first().attachments.first();
				} else { return message.channel.send("<:no:501906738224562177> **Invalid response, please try again.**"); }
				let r = await getCustomReactions("Do you want to add your donut to the database?", ["501906738224562177", "501906738119835649"], message);
				if (r === false) r = 1;
				if (r) {
					if (console.log("true")) 
						message.channel.send("<:yes:501906738119835649> **Successfully added to the precooked collection.**");
				} else {
					message.channel.send("<:no:501906738224562177> **Your donut was not added to the precooked collection.**");
				}
			}
			if (!isurl(url)) return message.channel.send("<:no:501906738224562177> **Invalid response, please try again.**");
			if (!img) img = { height: 100, width: 200 };
			const generated = generateSize(img.height * img.width);
			let time = { tiny: 1, small: 1.75, medium: 2.25, large: 2.5, extralarge: 3, massive: 3.5, gigantic: 4.5, "somehow negative": 3, unknown: 3 }[generated];
			await order.update({ cookTotal: time * 60000, cookTimeout: new Date((time * 60000) + Date.now()), status: 2, url, });
			await message.channel.send(`The image size is **${generated}**.`);
			const cookEmbed =
				new DDEmbed(client)
					.setStyle("blank")
					.setTitle("Cook Wizard")
					.setDescription(`<:yes:501906738119835649> **Your request has been acknowledged. This order will take \`${time}\` minutes to cook.**`)
					.setFooter(message.author.tag, message.author.displayAvatarURL());

			const cookedEmbed =
				new DDEmbed(client)
					.setStyle("blank")
					.setDescription(`**${randomstatus} \`${message.author.tag}\` has put your order in the oven, it'll take \`${time}\` minutes to cook.**`)
					.setFooter(message.author.tag, message.author.displayAvatarURL());

			await message.channel.send(cookEmbed);
			await client.users.get(order.user).send(cookedEmbed);
			const workerraw = await WorkerInfo.findOrCreate({ where: { id: message.author.id }, defaults: { id: message.author.id, cooks: 0, delivers: 0, lastCook: 0, lastDeliver: 0, username: message.author.tag } });
			const worker = workerraw[0];
			await worker.update({ cooks: worker.cooks + 1, lastCook: Date.now(), lastWork: new Date() });
			const monthlyraw = await MonthlyInfo.findOrCreate({ where: { id: message.author.id }, defaults: { id: message.author.id, cooks: 0, delivers: 0, username: message.author.tag } });
			const monthly = monthlyraw[0];
			await monthly.update({ cooks: monthly.cooks + 1 });
			const evt = await Event.findOne({ where: { id: 0 } });
			if (evt) {
				const event = await (await EventInfo.findOrCreate({ where: { id: message.author.id }, defaults: { id: message.author.id, points: 0, username: message.author.tag } }))[0];
				await event.update({ points: event.points + 1 });
			}
			checkMilestones(client, worker);
			await account.update({donuts: account.donuts + 25});
			await message.channel.send("You got 25 donuts!");
		});
