const DDEmbed = require("../../../structures/DDEmbed.struct");
const DDCommand = require("../../../structures/DDCommand.struct");

const { Orders, Op, Items } = require("../../../sequelize");
const { everyone } = require("../../../permissions");
const { messageAlert, findUser, awardIds, chunk, addAchievement, itemIds } = require("../../../helpers");
const { channels: { ticketChannel } } = require("../../../auth.json");

module.exports =
	new DDCommand()
		.setName("inventory")
		.addAlias("items")
		.addShortcuts("inv")
		.setDescription("Checks your inventory.")
		.addSyntax("function", "text")
		.addSyntax("arguments", "*+")
		.setPermissions(everyone)
		.setFunction(async(message, args, client, account) => {
			const items = await Items.findAll({ where: { id: message.author.id } });
			const mapped = await Promise.all(items.map(async x => x.itemId));
			if (!args[0]) {
				const embed = new DDEmbed(client)
					.setStyle("blank")
					.setTitle("Your inventory.")
					.setDescription(`${items.length} item(s).`)
					.setFooter("Run d!inv use <item> to use an item. Run d!inv remove <item> to remove an item.");
				for (const item of items) {
					const it = await itemIds.get(item.itemId);
					embed.addField(`${it.name} [${item.count}]`, it.description);
				}
				message.channel.send(embed);
			} else if (args[0].toLowerCase() === "use") {
				args.shift();
				if (!args.length) return message.channel.send("Please include the name of the item to use.");
				const item = itemIds.get(args.join(" "));
				if (!mapped.includes(item.id)) return message.channel.send(`You do not have a ${item.name}.`);
				if (!item.canUse) return message.channel.send("This item cannot be used.");
				await item.use(client, message.author, message);
			} else if (args[0].toLowerCase() === "remove") {
				args.shift();
				if (!args.length) return message.channel.send("Please include the name of the item to use.");
				const item = itemIds.get(args.join(" "));
				if (!mapped.includes(item.id)) return message.channel.send(`You do not have a ${item.name}.`);
				await item.remove(message.author.id);
				await message.channel.send(`You have removed 1 ${item.name} from your inventory.`);
			}
		});
