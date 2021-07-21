const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { everyone } = require("../../permissions");

module.exports =
	new DDCommand()
		.setName("upvote")
		.addAlias("vote")
		.setDescription("The link to upvote the bot.")
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			const embed =
				new DDEmbed(client)
					.setStyle("blank")
					.setTitle("Upvote")
					.setDescription("Spread the joy of donuts and upvote us!")
					.addField("Upvote Link", "https://its-mustard.me/upvote")
					.setThumbnail("https://images.emojiterra.com/twitter/512px/1f517.png");

			message.channel.send(embed);
		});
