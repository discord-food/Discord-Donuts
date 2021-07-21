const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Teams } = require("../../sequelize");
const { everyone } = require("../../permissions");
const { findUser } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("teammembers")
		.addShortcuts("tm")
		.setDescription("Gets the team members of a team.")
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			if (!args[0]) return message.channel.send(`No id was provided.`);
			const team = await Teams.findById(args[0]);
			if (!team) return message.channel.send("No team was found.");
			return message.channel.send(`__Team members of **${team.name}**__
**${team.members.length}** in total.
${team.members.map(x => `**${client.users.get(x) ? client.users.get(x).tag : "???"}** (ID:${x})`).join("\n")}`)

		});
