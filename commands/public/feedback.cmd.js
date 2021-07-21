const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { channels: { feedbackChannel } } = require("../../auth.json");

const { everyone } = require("../../permissions");

module.exports =
	new DDCommand()
		.setName("feedback")
		.addSyntax("feedback", "text", true)
		.setDescription("Feedback on the bot.")
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			if (!args[0]) return message.channel.send("<:no:501906738224562177> **Please provide your feedback.**");

			const embed =
				new DDEmbed(client)
					.setStyle("blank")
					.setTitle(`New feedback from ${message.author.tag} (${message.author.id})`)
					.setDescription(args.join(" "))
					.setThumbnail("https://images.emojiterra.com/twitter/72px/1f4ad.png");

			await client.channels.get(feedbackChannel).send(embed);

			await message.channel.send("<:yes:501906738119835649> **Thank you for giving us your feedback! We seriously appreciate it.**");
		});
