const { timeout } = require("../../helpers");
const { isBotOwner } = require("../../permissions");
const { pullScript } = require("../../auth.json");

const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const util = require("child_process");

module.exports =
	new DDCommand()
		.setName("bash")
		.addAliases("sh")
		.setDescription("Run a bash script.")
		.setPermissions(isBotOwner)
		.setFunction(async(message, args, client) => {
			if (!args.length) return message.channel.send("No arguments were provided.");
			util.exec(args.join(" "), (e, ao, ae) => {
				if (ae) return message.channel.send(`**ERROR**\n\`\`\`bash\n${ae}\n\`\`\``);
				message.channel.send(`\`\`\`bash\n${ao}\n\`\`\``);
			});
		});
