const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { everyone } = require("../../permissions");

module.exports =
	new DDCommand()
		.setName("invite")
		.setDescription("The invite link for the bot.")
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			const embed =
				new DDEmbed(client)
					.setStyle("blank")
					.setDescription("The invite link for the bot.")
					.addField("Bot Invite Link", await client.generateInvite(379969))
					.setThumbnail("https://images.emojiterra.com/twitter/512px/1f4e9.png");

			message.channel.send(embed);
		});
