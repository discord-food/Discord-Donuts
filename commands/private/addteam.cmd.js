const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Teams } = require("../../sequelize");
const { isBotAdmin } = require("../../permissions");
const { findUser } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("addteam")
		.setDescription("Creates a team.")
		.setPermissions(isBotAdmin)
		.setFunction(async(message, args, client) => {
			const id = await Teams.count();
			if (!args[0]) return message.channel.send(`No name was provided.`);
			await Teams.create({ id, name: args.join(" ") });
			await message.channel.send("Successfully created.")
		});
