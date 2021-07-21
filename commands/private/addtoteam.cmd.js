const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Teams } = require("../../sequelize");
const { isBotAdmin } = require("../../permissions");
const { mainServer } = require("../../auth");
const { findUser, getText } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("addtoteam")
		.setDescription("Adds a user to a team.")
		.setPermissions(isBotAdmin)
		.setFunction(async(message, args, client) => {
			const user = await findUser(client, message, args, 0, false, true);
			if (!user) return;
			const member = client.guilds.get(mainServer).members.get(user.id);
			if (!member) message.channel.send("<:no:501906738224562177> **The person seems to not be in this server.**");
			const id = args[1];
			if (!id) return message.channel.send("No ID was provided.");
			const team = await Teams.findById(id);
			if (!team) return message.channel.send("Team was not found.");
			await team.update({ members: team.members.concat(user.id) });
			await message.channel.send(`Successfully added **${user.tag}** to the team **${team.name}**!`)
		});
