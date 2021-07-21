const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Teams } = require("../../sequelize");
const { isBotAdmin } = require("../../permissions");
const { findUser } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("removeteam")
		.setDescription("Removes a team.")
		.setPermissions(isBotAdmin)
		.setFunction(async(message, args, client) => {
			if (!args[0]) return message.channel.send(`No id was provided.`);
			const team = await Teams.findById(args[0]);
			if (!team) return message.channel.send("No team was found.");
			await team.destroy();
			await message.channel.send("Successfully removed.")

		});
