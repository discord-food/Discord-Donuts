const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { isBotAdmin } = require("../../permissions");

const { messageAlert } = require("../../helpers.js");
module.exports =
	new DDCommand()
		.setName("alert")
		.setDescription("Use this to send an alert to kitchen.")
		.addSyntax("message", "text", true)
		.setPermissions(isBotAdmin)
		.setFunction(async(message, args, client) => {
			if (args.length < 1) {
				const embed =
					new DDEmbed(client)
						.setStyle("blank")
						.setTitle("Notification")
						.setDescription("<:no:501906738224562177> **Please incorporate a message to send.**")
						.setTimestamp();

				message.channel.send(embed);
				return;
			}
			message.channel.send("<:yes:501906738119835649> **Request acknowledged.**");
			messageAlert(client, args.join(" "));
		});

