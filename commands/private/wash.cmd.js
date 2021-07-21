const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Orders, Op, Dishes } = require("../../sequelize");
const { canCook } = require("../../permissions");
const { channels: { ticketChannel } } = require("../../auth.json");
const { getIndex } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("wash")
		.addAlias("clean")
		.addShortcuts("ws")
		.addSyntax("dishId", "text")
		.setDescription("Wash a dish.")
		.setPermissions(canCook)
		.setFunction(async(message, args, client, account) => {
			const all = await Dishes.findAll({limit: 10});
			if (!all.length) return message.channel.send("There are currently no dishes to wash.");
			let dish;
			if (args[0]) dish = args[0];
			if (!dish) dish = await getIndex(message, all.map(x => x.id), "dish");
			if (!dish) return;
			if (dish.item) dish = dish.item;
			dish = all.find(x => x.id === dish);
			if (!dish) return message.channel.send("That is not a valid dish.");
			const time = Math.floor(Math.random() * 12) + 12;
			await message.channel.send(`Washing dish \`${dish.id}\`, this will take ${time} seconds.`);				await dish.destroy();

			setTimeout(async() => {
				await message.channel.send(`${message.author}, dish ${dish.id} has finished washing. You recieved 60 donuts.`);
				await account.update({ donuts: account.donuts + 60 });
			}, time * 1000);
		});
