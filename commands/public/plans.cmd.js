const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { everyone } = require("../../permissions");
const { channels: { suggestionChannel } } = require("../../auth");
const empty = "󠂪󠂪";
module.exports =
	new DDCommand()
		.setName("plans")
		.addAliases("todo", "planned")
		.addShortcuts("pl", "td")
		.setDescription("Checks the future plans for the bot!")
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			const s = client.channels.get(suggestionChannel);
			const m = await s.messages.fetch({ limit: 100 });
			const a = m.filter(x => x.reactions.some(y => y.emoji.id === "514606860993691658"));
			const embed =
				new DDEmbed(client)
					.setStyle("blank")
					.setTitle("Future planned additions to the bot!");
			a.map(x => embed.addField(empty, x.content));
			message.channel.send(embed);
		});
