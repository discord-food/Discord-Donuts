const DDCommand = require("../../structures/DDCommand.struct");
const DDEmbed = require("../../structures/DDEmbed.struct");

const { Orders } = require("../../sequelize");
const { canCook } = require("../../permissions");
const { mainMember } = require("../../helpers");
const { dutyRole } = require("../../auth");
module.exports =
	new DDCommand()
		.setName("duty")
		.setDescription("Use this to get notified of every order.")
		.addShortcuts("dty")
		.setPermissions(canCook)
		.setFunction(async(message, args, client) => {
			const member = mainMember(client, message.author.id);
			if (!member) return message.channel.send("You don't seem to be in the discord donuts server.");
			if (member.roles.has(dutyRole)) {
				member.roles.remove([dutyRole]);
				message.channel.send("You are no longer on duty.");
			} else {
				member.roles.add([dutyRole]);
				message.channel.send("You are now on duty.");
			}
		});

