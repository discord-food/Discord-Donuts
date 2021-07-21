const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Blacklist } = require("../../sequelize");
const { isBotAdmin } = require("../../permissions");
const { findUser } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("blacklist")
		.setDescription("Blacklist a user or a guild, with a reason.")
		.addShortcuts("bl")
		.addSyntax("id", "snowflake", true)
		.addSyntax("reason", "text")
		.setPermissions(isBotAdmin)
		.setFunction(async(message, args, client) => {
			if (!args[0]) return message.channel.send("Please provide an ID.");
			if (isNaN(args[0])) return message.channel.send("Invalid ID.");
			if (await Blacklist.findById(args[0])) return message.channel.send("That user/guild is already blacklisted.");
			let reason = args[1];
			if (!reason) reason = `Responsible Moderator: ${message.author.tag}`;
			await Blacklist.create({ id: args[0], reason: reason, end: "-1" });

			const embed =
				new DDEmbed(client)
					.setStyle("blank")
					.setTitle("Blacklist Notification")
					.setDescription(`<:yes:501906738119835649> **\`${args[0]}\` has successfully been blacklisted.**`)
					.setTimestamp();

			return message.channel.send(embed);
		});
