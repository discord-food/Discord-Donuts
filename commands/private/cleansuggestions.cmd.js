const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");
const { mainServer, channels: { suggestionChannel, discussChannel } } = require("../../auth");
const { isBotAdmin } = require("../../permissions");
const { hasRole } = require("../../helpers");

module.exports =
	new DDCommand()
		.setName("cleansuggestions")
		.setDescription("Clean the suggestions. Do not use if you don't know what it does.")
		.setPermissions(isBotAdmin)
		.addShortcuts("cs")
		.setFunction(async(message, args, client) => {
			await message.react("501906738119835649");
			if (message.channel.id === suggestionChannel) {
				await message.delete();
			}
			const schannel = client.guilds.get(mainServer).channels.get(suggestionChannel);
			const dchannel = client.guilds.get(mainServer).channels.get(discussChannel);
			const messages = await schannel.messages.fetch({ limit: 100 });
			schannel.messages.map(msg => {
				const r = ["514587863019683870", "514587914940973067", "514622408360067082", "540022888372240405"].find(x => msg.reactions.has(x));
				if (r) {
					let type = "Unknown.";
					if (r === "514587863019683870") {
						type = "The suggestion has been accepted.";
					} else if (r === "514587914940973067") {
						type = "The suggestion has been denied.";
					} else if (r === "514622408360067082") {
						type = "The suggestion is a duplicate.";
					} else if (r === "540022888372240405") {
						type = "The suggestion has already been implemented.";
					}
					msg.delete();
					dchannel.send(`${msg.author.tag}'s suggestion, *${msg.content}* has been removed.\n**Reason:**\n\`\`\`\n${type}\n\`\`\``);
				}
			});
		});
