const DDEmbed = require("../../../structures/DDEmbed.struct");
const DDCommand = require("../../../structures/DDCommand.struct");

const { everyone } = require("../../../permissions");
const { findUser } = require("../../../helpers");
const { Donuts } = require("../../../sequelize");
module.exports =
	new DDCommand()
		.setName("gift")
		.setDescription("Gift everyone in your guild some donuts.")
		.addSyntax("donuts", "number", true)
		.setPermissions(everyone)
		.setFunction(async(message, args, client, account) => {
			const num = Math.abs(Math.floor(args[0]));
			if (isNaN(num)) return message.channel.send("The argument is not a number.");
			if (num === 0) return message.channel.send("You can't gift nothing.");
			if (num > 1000000) {
				await message.channel.send("Nice try.");
				return console.log(`${message.author.tag} tried ${num}. ID=${message.author.id} CHANNEL=${message.channel.id} GUILD=${message.guild.id}`);
			}
			if (account.donuts < num) return message.channel.send(`You do not have enough donuts to gift ${num} donuts.`);
			const members = await (await Donuts.findAll()).filter(x => message.guild.members.get(x.id) && x.id !== message.author.id);
			const each = Math.ceil(num / members.length) + 5;
			for (const member of members) {
				await member.update({ donuts: member.donuts + each });
			}
			await account.update({ donuts: account.donuts - num });
			await message.channel.send(`Everybody with an account has recieved your gift of donuts. They have recieved ${each} donuts each.`);
		});
