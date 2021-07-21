const { Blacklist } = require("../../sequelize");
const { isBotAdmin } = require("../../permissions");

const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");
const { findUser } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("unblacklist")
		.setDescription("Use this unblacklist a guild/user.")
		.addSyntax("id", "snowflake", true)
		.addShortcuts("ubl")
		.setPermissions(isBotAdmin)
		.setFunction(async(message, args, client) => {
			if (!args[0]) return message.channel.send("<:no:501906738224562177> **Please provide a valid User/Guild ID.**");

			const blacklist = await Blacklist.findById(args[0]);

			if (!blacklist) return message.channel.send("<:no:501906738224562177> **That user/guild hasn't been blacklisted**");

			await blacklist.destroy();

			await message.react("501906738119835649");
		});
