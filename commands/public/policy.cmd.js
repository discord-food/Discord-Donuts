const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { everyone } = require("../../permissions");
module.exports =
	new DDCommand()
		.setName("policy")
		.setDescription("Our official policy.")
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			const embed =
				new DDEmbed(client)
                    .setStyle("blank")
                    .setTitle("Privacy & Policy")
                    .setDescription("By adding our bot(s) to your server. You agree to have the following data collected, unless an exception was made.\nThe data that is collected may include guild names, guild IDs, user IDs, usernames, user tags, message contents, guild channels, and executed commands. We do not, and will not sell any data that is collected commercially, and all data that is collected shall only be used for the functionalities of the bot. The data that is collected may be permanently stored, unless an excepted is made. If you would like a deletion of your data, please contact a creator of the bot. If you do not wish to follow this policy, you are not permitted to use our bot, or any of its services.")
                    .setColor("#F04747")
                    .setFooter("If you want your data removed then feel free to contact gagi12#9698")
                    message.channel.send(embed)
		});
