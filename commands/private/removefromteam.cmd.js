const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Teams } = require("../../sequelize");
const { isBotAdmin } = require("../../permissions");
const { mainServer } = require("../../auth");
const { findUser, getText } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("removefromteam")
		.setDescription("Removes a user from a team.")
		.setPermissions(isBotAdmin)
		.setFunction(async(message, args, client) => {
			const user = await findUser(client, message, args, 0, false, true);
			if (!user) return;
			const id = args[1];
			if (!id) return message.channel.send("No ID was provided.");
			const team = await Teams.findById(id);
			if (!team) return message.channel.send("Team was not found.");
			await team.update({ members: team.members.filter(x => x !== user.id) });
			await message.channel.send(`Successfully removed **${user.tag}** from the team **${team.name}**!`)
		});
