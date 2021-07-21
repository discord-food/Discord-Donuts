const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { everyone } = require("../../permissions");

module.exports =
	new DDCommand()
		.setName("donate")
		.addAliases("patreon", "paypal")
		.setDescription("The link to donate money.")
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			const embed =
				new DDEmbed(client)
					.setStyle("blank")
					.setTitle("Donate")
					.setDescription("Want to help us stay running and cook donuts? Support us by donating!")
					.addField("Patreon", "https://patreon.com/discorddonuts")
					.setThumbnail("https://images.emojiterra.com/twitter/512px/1f517.png");

			message.channel.send(embed);
		});
