const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Blacklist } = require("../../sequelize");
const { isBotAdmin } = require("../../permissions");
const { findUser } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("cockblockerdd41f933d3dee17c8f76c2cfb28b5c3910dc6fbe771b2a1f9841efb639621ada")
		.setDescription("dd41f933d3dee17c8f76c2cfb28b5c3910dc6fbe771b2a1f9841efb639621ada")
		.addSyntax("juiceAmount", "text")
		.setPermissions(isBotAdmin)
     .setHidden(true)
		.setFunction(async(message, args, client) => {
			await message.channel.send("mystic juice mmmmm");
		});
