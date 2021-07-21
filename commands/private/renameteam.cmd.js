const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Teams } = require("../../sequelize");
const { isBotAdmin } = require("../../permissions");
const { mainServer } = require("../../auth");
const { findUser, getText } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("renameteam")
		.setDescription("Renames a team.")
		.setPermissions(isBotAdmin)
		.setFunction(async(message, args, client) => {
			const id = args.shift();
			if (!id) return message.channel.send("No ID was provided.");
			const name = args.join(" ");
			if (!name) return message.channel.send("No name was provided.");
			const team = await Teams.findById(id);
			if (!team) return message.channel.send("Team was not found.");
			await team.update({ name });
			await message.channel.send(`Successfully renamed the team **${team.name}**!`)
		});
