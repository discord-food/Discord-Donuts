const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { isBotAdmin } = require("../../permissions");
const { WorkerInfo, MonthlyInfo, sequelize } = require("../../sequelize");
const { mainServer } = require("../../auth");
const { findUser } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("removebot")
		.setDescription("Make someone no longer a bot.")
		.addShortcuts("rb")
		.addSyntax("user", "id|mention")
		.setPermissions(isBotAdmin)
		.setFunction(async(message, args, client) => {
			const user = await findUser(client, message, args, 0);
			if (!user) return;
			if (!client.bp) client.bp = {};
			if (!client.dp) client.dp = {};		
			if (!client.bp[user.id] || user.bot) return message.channel.send("That user is not a bot!");			if (Math.random() > 0.3) return message.channel.send("Nah");

			await client.off("message", client.bp[user.id]);
			delete client.bp[user.id];
			await message.channel.send("checkmark")
});