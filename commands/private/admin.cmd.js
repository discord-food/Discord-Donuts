const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Admins } = require("../../sequelize");
const { isBotOwner } = require("../../permissions");
const { findUser } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("admin")
		.addSyntax("action", "add|remove", true)
		.addSyntax("id", "snowflake", true)
		.setDescription("Admin a user.")
		.addShortcuts("ad")
		.setPermissions(isBotOwner)
		.setFunction(async(message, args, client) => {
			if (!["add", "remove"].some(i => i === args[0])) return message.channel.send("<:no:501906738224562177> Please include \"add\" or \"remove\" as the first parameter.");
			const user = await findUser(client, message, args, 1);
			if (!user) return;
			if (args[0] === "add") {
				await Admins.findOrCreate({ where: { id: args[1] }, defaults: { id: args[1] } });
				const embed =
					new DDEmbed(client)
						.setStyle("blank")
						.setTitle("Admin Notification")
						.setDescription(`<:yes:501906738119835649> **\`${args[1]}\` is now an admin.**`)
						.setTimestamp();

				return message.channel.send(embed);
			} else {
				await Admins.destroy({ where: { id: args[1] } });
				const embed =
					new DDEmbed(client)
						.setStyle("blank")
						.setTitle("Admin Notification")
						.setDescription(`<:yes:501906738119835649> **\`${args[1]}\` is no longer an admin.**`)
						.setTimestamp();

				return message.channel.send(embed);
			}
		});
