const DDEmbed = require("../../../structures/DDEmbed.struct");
const DDCommand = require("../../../structures/DDCommand.struct");

const { everyone } = require("../../../permissions");
const { itemIds } = require("../../../helpers");
const { Donuts, Items } = require("../../../sequelize");

module.exports =
	new DDCommand()
		.setName("shop")
		.setDescription("Check the shop.")
		.setPermissions(everyone)
		.setFunction(async(message, args, client, account) => {
			if (!args[0]) {
				const embed = new DDEmbed(client)
					.setStyle("blank")
					.setTitle("The Shop")
					.setDescription("A list of things that you can buy!")
					.setFooter("Run d!shop buy <item> to buy an item!");
				for (const item of itemIds) {
					embed.addField(`${item.name}: ${item.price} donuts.`, `${item.hint}${isFinite(item.limit) ? ` [Limit: ${item.limit}]` : ""}`);
				}
				message.channel.send(embed);
			} else if (args[0].toLowerCase() === "buy") {
				args.shift();
				if (!args[0]) return message.channel.send("Please provide the item name.");
				const item = itemIds.get(args.join(" "));
				if (await item.count(message.author.id) >= item.limit) return message.channel.send("Sorry, you have reached the limit for this item.");
				if (account.donuts < item.price) return message.channel.send("You don't have enough donuts to buy this item.");
				const newitem = await item.add(message.author.id);
				await account.update({ donuts: account.donuts - item.price });
				message.channel.send(`You have bought 1 ${item.name}.`);
			}
		});
