const DDEmbed = require("../../../structures/DDEmbed.struct");
const DDCommand = require("../../../structures/DDCommand.struct");

const { everyone } = require("../../../permissions");
const { findUser } = require("../../../helpers");
const { Donuts } = require("../../../sequelize");
module.exports =
	new DDCommand()
		.setName("give")
		.setDescription("Give donuts to others.")
		.addSyntax("amount", "number", true)
		.addSyntax("user", "id|mention", true)
		.setPermissions(everyone)
		.setFunction(async(message, args, client, account) => {
			if (isNaN(args[0])) return message.channel.send("That is not a number!");
			const amount = Number(args[0]);
			if (amount % 1 !== 0) return message.channel.send("That is not a whole number.");
			if (account.donuts < amount) return message.channel.send(`You don't have that much. You only have ${account.donuts} donuts.`);
			if (amount < 0) return message.channel.send("Negative amounts may not be given.");
			if (amount > -1 && amount < 1) return message.channel.send("That's pointless.");
			const user = await findUser(client, message, args, 1, false, true);
			if (!user) return;
			if (user.id === message.author.id) return message.channel.send("no.");
			const useracc = await (await Donuts.findOrCreate({ where: { id: user.id }, defaults: { id: user.id, donuts: 0 } }))[0];
			await account.update({ donuts: account.donuts - amount });
			await useracc.update({ donuts: useracc.donuts + amount });
			message.channel.send(`You gave ${amount} donuts to ${user.tag}.`);
		});
