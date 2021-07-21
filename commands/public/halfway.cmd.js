const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { channels: { feedbackChannel } } = require("../../auth.json");

const { everyone } = require("../../permissions");

module.exports =
	new DDCommand()
		.setName("halfway")
		.setHidden(true)
		.setDescription("???")
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			if (args[0] === "last") return message.author.send("Piece them together, one by one. https://cdn.discordapp.com/attachments/534955958301098004/535672160685916210/4.png");
			message.author.send("Good job. https://cdn.discordapp.com/attachments/534955958301098004/535672158106681385/3.png\nGo and say to me... \"I know the secrets.\"");
		});
