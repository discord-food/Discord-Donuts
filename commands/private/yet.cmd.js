const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Blacklist } = require("../../sequelize");
const { everyone } = require("../../permissions");
const { getText } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("50bbe8d34c4a93ad0bf072915e373a10d55cd5b9d8ad87a519c813e246c0b33f")
		.setDescription("?")
		.setPermissions(everyone)
     .setHidden(true)
		.setFunction(async(message, args, client) => {
			await message.channel.send("```md\n# BOT CONTROL AUTHENTICATION #\n```")
			await getText(message, "```yaml\nPLEASE TYPE IN THE PASSKEY\n```")			
			if (Math.random() > 0.5 && message.author.id !== "256392197648154624") {
				return message.channel.send("```diff\n- ACCESS DENIED -\n DUE TO MANY WRONG ATTEMPTS, YOU HAVE BEEN BLACKLISTED.THE STAFF HAS BEEN NOTIFIED.\n```")
			} else {
				await message.channel.send("```css\n - ACCESS GRANTED -\nYOU NOW HAVE ACCESS TO THE BOT CONTROL PANEL. THE LINK HAS BEEN DM'ED TO YOU. IT MAY TAKE UP TO 10 MINUTES FOR THE MESSAGE TO BE FULLY SENT.\n```")
await message.channel.send("```yaml\nTHANK YOU FOR USING BOT CONTROL AUTHENTICATION. HAVE A GREAT DAY.\n```")
			}
		});