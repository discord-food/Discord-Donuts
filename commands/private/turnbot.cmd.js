const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { isBotAdmin } = require("../../permissions");
const { WorkerInfo, MonthlyInfo, sequelize } = require("../../sequelize");
const { mainServer } = require("../../auth");
const { findUser } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("turnbot")
		.setDescription("Turn someone into the DD bot.")
		.addShortcuts("tb")
		.addSyntax("user", "id|mention")
		.setPermissions(isBotAdmin)
		.setFunction(async(message, args, client) => {
			const user = await findUser(client, message, args, 0);
			if (!user) return;
			if (!client.dp) client.dp = {};
			if (!client.bp) client.bp = {};
			if (client.dp[user.id] || client.bp[user.id] || user.bot) return message.channel.send("That user is already a bot!");
			client.dp[user.id] = async m => {if (m.author.id === user.id) {await m.delete();await m.channel.send(m.content)}}
await client.on("message", client.dp[user.id]);
						await message.channel.send("checkmark")
});