const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");
const { mainServer, channels: { absenceChannel }, awayRole } = require("../../auth");
const { canCook } = require("../../permissions");
const { hasRole } = require("../../helpers");
const { Absences } = require("../../sequelize");
const moment = require("moment-timezone");
module.exports =
	new DDCommand()
		.setName("updateaway")
		.addAliases("updateabsence")
		.addShortcuts("uaw")
		.setDescription("Update absence message countdowns.")
		.setPermissions(canCook)
		.setFunction(async(message, args, client) => {
			await message.channel.send("Updating absence message countdowns...");
			client.updateAbsences();
		});
