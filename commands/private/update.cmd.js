const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { isBotOwner } = require("../../permissions");
const sequelize = require("../../sequelize");
const { updateDB } = require("../../helpers.js");
module.exports =
	new DDCommand()
		.setName("update")
		.addShortcuts("upd")
		.setDescription("Update a database.")
		.addSyntax("database", "text", true)
		.setPermissions(isBotOwner)
		.setFunction(async(message, args, client) => {
			if (args.length < 1) {
				const embed =
					new DDEmbed(client)
						.setStyle("blank")
						.setTitle("Notification")
						.setDescription("<:no:501906738224562177> **Please incorporate a database to upload.**")
						.setTimestamp();
				return message.channel.send(embed);
			}
			if (!sequelize[args.join(" ")]) return message.channel.send("<:no:501906738224562177> **Database was not detected.**");
			await updateDB(sequelize[args.join(" ")]);
			message.channel.send("<:yes:501906738119835649> **Database updated.**");
		});

