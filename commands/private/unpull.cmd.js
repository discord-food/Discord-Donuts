const { timeout } = require("../../helpers");
const { isBotOwner } = require("../../permissions");
const { unpullScript } = require("../../auth.json");

const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { execFileSync } = require("child_process");

module.exports =
	new DDCommand()
		.setName("unpull")
		.addAliases("revert")
		.setDescription("Reverts changes from the bot")
		.setPermissions(isBotOwner)
		.setFunction(async(message, args, client) => {
			await message.channel.send("Reverting changes...");
			client.user.setActivity("Downgrading...");
			await message.channel.send(execFileSync(unpullScript), { code: "bash" });

			await message.channel.send("Reverted! Restarting...");

			process.exit();
		});
