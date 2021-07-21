const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Collection } = require("discord.js");

const { Orders, Op } = require("../../sequelize");

const { generateID, messageAlert } = require("../../helpers");

const { dutyRole, channels: { kitchenChannel } } = require("../../auth");

const { isBotAdmin } = require("../../permissions");

module.exports =
		new DDCommand()
			.setName("corder")
			.setDescription("Create an order for a user.")
			.setLabel("WIP")
			.setPermissions(() => true)
			.setHidden(true)
			.addSyntax("userId", "snowflake", true)
			.addSyntax("orderId", "id")
			.setFunction(async(message, args, client, account) => {
args.shift()
				const id = args.shift();
				const user = client.users.get(id) || false;
				if (!args[0]) return message.channel.send("<:no:501906738224562177> **Please provide a description of your order.**");
				if (await Orders.count({ where: { user: id, status: { [Op.lt]: 4 } } })) return message.channel.send("<:no:501906738224562177> **Failed to create order; you already have an order created, please try again later.**");
				let canSend = true;
				try {
					await user.send("Thanks you for ordering! Your order was sent to our workers.");
				} catch (err) {
					await message.channel.send("I was unable to send a DM to you. The order was cancelled.");
					canSend = false;
				}
				if (!canSend) return;
				let generatedID;
				do generatedID = generateID(7);
				while (await Orders.findById(generatedID));

				let description = args.join(" ").trim();

				if (description.length > 40) return message.channel.send("<:no:501906738224562177> **Your donut description cannot exceed a character count of 40, please try again.**");
				if (!description.toLowerCase().includes("donut")) description += " donut";
				client.counting += 1;
				const order = await Orders.create({
					id: generatedID,
					user: user.id,
					description: description,
					channel: "294980943746170883",
					status: 0,
					deliverer: null,
					url: null,
					ticketMessageID: null,
					timeLeft: 20,
					cookTimeLeft: 3,
					deliveryTimeLeft: 7,
					cookTipped: false,		expireTimeout: new Date(Date.now() + (60000 * 20)),
		expireTotal: 60000 * 20,
		cookTimeout: new Date(Date.now() + (60000 * 3)),
		deliverTimeout: new Date(Date.now() + (60000 * 10)),

					deliverTipped: false,
					cookRated: false,
					deliverRated: false
				});


				await message.channel.send(`<:yes:501906738119835649> **Successfully placed their order for \`${description}\`. Their ticket ID is \`${generatedID}\`, please wait patiently for your order to be processed.**`);

				messageAlert(client, "An order has been placed, there are now [orderCount] order(s) to claim", kitchenChannel, true);
			});
