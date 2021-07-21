const DDCommand = require("../../../structures/DDCommand.struct");
const DDEmbed = require("../../../structures/DDEmbed.struct");
const { everyone } = require("../../../permissions");
const { randomArray } = require("../../../helpers");
module.exports =
	new DDCommand()
		.setName("owo")
		.addAlias("uwu")
		.setDescription("Weebify text!")
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			const content = args.join(" ");
			if (!content) return message.channel.send("Pweazse specifwy twext!");
			await message.channel.send(`OUTPUT:
\`\`\`uwu
${String.UWU(String.UWUFX(content))}
\`\`\`
`);
		});
