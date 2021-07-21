const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");
const { isBotAdmin } = require("../../permissions");
const { channels } = require("../../auth");
module.exports =
	new DDCommand()
		.setName("replydm")
		.setDescription("Reply to a DM.")
		.addSyntax("userid", "id", true)
		.addSyntax("content", "text", true)
		.addShortcuts("rdm")
		.setPermissions(isBotAdmin)
		.setFunction(async(message, args, client) => {
			if (!args[0] || isNaN(args[0])) return message.channel.send("Please provide an ID.");
			if (!args[1]) return message.channel.send("Please provide content to send to the user.");
			if (!client.users.get(args[0])) return message.channel.send("We were unable to fetch the user.");
			const user = client.users.get(args.shift());
			try {
				await user.send(args.join(" "));
				await message.channel.send(`I have sent \`${args.join(" ")}\` to ${user.tag}.`);
			} catch (err) {
				return message.channel.send("I was unable to send that message to the user.");
			}
			const dmembed = new DDEmbed(client)
				.setStyle("blank")
				.setAuthor(client.user.tag, client.user.displayAvatarURL())
				.setTitle(`${message.author.tag} has told me to send ${user.tag} this:`)
				.setDescription(args.join(" "));
			await client.channels.get(channels.botDMChannel).send(dmembed);
		});
