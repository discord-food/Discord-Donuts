const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");
const { Warning } = require("../../sequelize");

const { canEditGuild } = require("../../permissions");
module.exports =
	new DDCommand()
		.setName("warn")
		.addShortcuts("wrn")
		.setDescription("Warn someone who has been bad or just for the fun of it.")
		.setPermissions(canEditGuild)
		.setFunction(async(message, args, client) => {
            if (message.guild?.members.get(args.user)) return message.channel.send("The specified user is not in the guild.");
            let user = args.user
            client.users.get(user).send("test")
	//if (!args.reason) args.reason = "No reason specified.";
	//await message.channel.send(`<:yes:501906738119835649> Successfully warned **${args.user}**.`);
	//await client.users.get(`${args.user}`).send(`Hey there, you have been warned!\n**Reason**: ${args.reason}\n**Executor**: ${message.author}\n**Channel**: ${message.channel.name} \n**Guild**: ${message.guild.name}`)
		});

