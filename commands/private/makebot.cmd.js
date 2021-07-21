const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { isBotAdmin } = require("../../permissions");
const { WorkerInfo, MonthlyInfo, sequelize } = require("../../sequelize");
const { mainServer } = require("../../auth");
const { findUser } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("makebot")
		.setDescription("Turn someone into a bot.")
		.addShortcuts("mb")
		.addSyntax("user", "id|mention")
		.addSyntax("owo", "text:owo")
		.setPermissions(isBotAdmin)
		.setFunction(async(message, args, client) => {
			const user = await findUser(client, message, args, 0);
const owo = args[1]
			if (!user) return;
			if (!client.dp) client.dp = {};		
			if (!client.bp) client.bp = {};

			if (client.bp[user.id] || client.dp[user.id]  || user.bot) return message.channel.send("That user is already a bot!");
			client.bp[user.id] = async message => {
    if (message.author.id === user.id) {
        const h = await message.channel.createWebhook(message.member.nickname || message.author.username, {avatar: message.author.avatarURL({format:"png"})});
        if (owo) { await h.send(String.UWUFX(String.UWU(message.content))) } else {await h.send(message.content.replaceAll("@everyone", "im a dickhead").replaceAll("@here", "im a dickhead"))};
        await h.delete();
        await message.delete();
    }
};
			client.on("message", client.bp[user.id]);
			await message.channel.send("checkmark")			});