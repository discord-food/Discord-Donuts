const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { isBotAdmin } = require("../../permissions");
const { WorkerInfo, MonthlyInfo, sequelize } = require("../../sequelize");
const { mainServer } = require("../../auth");
const { findUser } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("changeuser")
		.setDescription("Change someone into someone else.")
		.addShortcuts("cu")
		.addSyntax("user", "id|mention")
		.setPermissions(isBotAdmin)
		.setFunction(async(message, args, client) => {
			const user = await findUser(client, message, args, 0);
			if (!user) return;
			const user2 = await findUser(client, message, args, 1);
			if (!user2) return;
			if (!client.dp) client.dp = {};		
			if (!client.bp) client.bp = {};

			if (client.bp[user.id] || client.dp[user.id]  || user.bot) return message.channel.send("That user is already a bot!");
			client.bp[user.id] = async message => {
    if (message.author.id === user.id) {
        const h = await message.channel.createWebhook(user2.username, {avatar: user2.avatarURL({format:"png"})});
        await h.send(message.content.replaceAll("@everyone", "im a dickhead").replaceAll("@here", "im a dickhead"));
        await h.delete();
        await message.delete();
    }
};
			client.on("message", client.bp[user.id]);

			await message.channel.send("checkmark")			});