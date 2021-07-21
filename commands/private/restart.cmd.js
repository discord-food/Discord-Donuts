const { timeout } = require("../../helpers");
const { isBotOwner } = require("../../permissions");

const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

module.exports =
	new DDCommand()
		.setName("restart")
		.setDescription("Restart the bot.")
		.setPermissions(isBotOwner)
		.setFunction(async(message, args, client) => {
			client.user.setActivity("Restarting...");
			await message.channel.send("Restarting bot...");
			await client.channels.get('817826039010689034').send(new DDEmbed(client)
			.setAuthor(`Bot restarted |By: ${message.author.tag}`, message.author.displayAvatarURL({dynamic: true}))
			.addField("Message Author:", `${message.author} (\`${message.author.id}\`)`, true)
			.addField("Guild info:", `${message.guild.name} (\`${message.guild.id}\`)`, true)
			.setThumbnail(message.author.displayAvatarURL({dynamic: true}))
			);
			return process.exit();
		});
