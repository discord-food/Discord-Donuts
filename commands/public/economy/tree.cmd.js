const DDEmbed = require("../../../structures/DDEmbed.struct");
const DDCommand = require("../../../structures/DDCommand.struct");

const { everyone } = require("../../../permissions");
const moment = require("moment");
const { Donuts, Trees } = require("../../../sequelize");
const prettyms = require("pretty-ms");
module.exports =
	new DDCommand()
		.setName("tree")
		.addAliases("donuttree")
		.addShortcuts("tr")
		.addSyntax("option", "text")
		.setDescription("Check or buy a donut tree!")
		.setPermissions(everyone)
		.setFunction(async(message, args, client, account, cooldown) => {
			const formula = x => Math.ceil(((+x + 5) ** 2.075) / 1.08) + 30;
			const tree = await Trees.findById(message.author.id);
			if (!args[0]) {
				if (!tree) { return message.channel.send("You do not have a donut tree! Run `d!tree buy` to buy one."); } else {
					const water = tree.water - Date.now();
					let watertime = prettyms(water, { verbose: true });
					if (water < 1) watertime = "Now";
					if (tree.age >= tree.maxAge) watertime = "N/A";
					const age = tree.age.toString().padStart(2, 0);
					const maxAge = tree.maxAge.toString().padStart(2, 0);
					message.channel.send(`
\`\`\`ini
Your donut tree
=============== 
AGE: [ ${age} / ${maxAge} ]
NEXT WATERING: [ ${watertime} ]
WORTH: [ ${formula(age)} Donuts ]
===============
Run d!tree harvest to cut down your tree and sell it.
Run d!tree water to water your tree.
\`\`\`

					`);
				}
			} else if (args[0].toLowerCase() === "buy") {
				if (tree) return message.channel.send("You can't buy two donut trees!");
				const cost = Math.floor((await Trees.count() + 1) ** 1.5) * 10;
				if (account.donuts < cost) return message.channel.send(`You don't have enough donuts to buy a tree! A tree costs ${cost} donuts while you only have ${account.donuts} donuts.`);
				await Trees.create({ id: message.author.id, age: 0, water: Date.now() + 1800000, maxAge: Math.randint(46) + 53 });
				await account.update({ donuts: account.donuts - cost });
				await message.channel.send(`You have bought a tree! ${cost} donuts have been deducted. You have ${account.donuts} left.`);
			} else if (args[0].toLowerCase() === "water") {
				if (!tree) return message.channel.send("You can't water nothing. Buy a tree first!");
				if (tree.age >= tree.maxAge) return message.channel.send(`Your donut tree has hit the max age. Please harvest your tree.`);
				if (tree.water > Date.now()) return message.channel.send(`Your tree is not ready to be watered yet! Please wait ${prettyms(tree.water - Date.now(), { verbose: true })} before watering your tree.`);
				await tree.update({ water: Date.now() + 1800000, age: tree.age + 1 });
				await message.channel.send(`You have watered your tree. Its age is now ${tree.age}.`);
			} else if (args[0].toLowerCase() === "harvest") {
				if (!tree) return message.chanel.send("You can't harvest nothing. Buy a donut tree first!");
				if (tree.age < 1) return message.channel.send("You won't gain any donuts yet. Water your tree first!");
				const gain = formula(tree.age);
				await account.update({ donuts: account.donuts + gain });
				await tree.destroy();
				await message.channel.send(`You have cut down your tree and sold it. You gained ${gain} donuts.`);
			} else {
				return message.channel.send("That is not a valid option.");
			}
		});
