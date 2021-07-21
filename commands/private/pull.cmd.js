const { timeout } = require("../../helpers");
const { isBotOwner } = require("../../permissions");
const { pullScript } = require("../../auth.json");

const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { execFileSync } = require("child_process");

module.exports = new DDCommand()
	.setName("pull")
	.setDescription("Pulls changes to the bot")
	.setPermissions(isBotOwner)
	.setFunction(async(message, args, client) => {
		await message.channel.send("Pulling changes...");
		client.user.setActivity("Updating...");
		await message.channel.send(execFileSync("../../pull.sh"), {
			code: "bash",
		});

		await message.channel.send("Pulled! Restarting...");

		process.exit();
	});
