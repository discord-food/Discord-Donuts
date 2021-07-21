const DDEmbed = require("../../../structures/DDEmbed.struct");
const DDCommand = require("../../../structures/DDCommand.struct");
const { AdvancedArray } = require("multipurpose-utils");
const { Orders, Op } = require("../../../sequelize");
const { everyone } = require("../../../permissions");
const { findUser } = require("../../../helpers");
const j = require("jimp");
const { MessageAttachment } = require("discord.js");
module.exports =
	new DDCommand()
		.setName("invert")
		.addShortcuts("ivr")
		.setDescription("Invert your profile picture.")
		.addSyntax("user", "mention|id|tag")
		.setPermissions(everyone)
		.setFunction(async(message, args, client, account) => {
			const user = await findUser(client, message, args, 0, true, false);
			if (!user) return;
			const url = user.displayAvatarURL({ format: "png", size: 2048 });
			const img = await j.read(url);
			img.invert();
			await img.writeAsync(`./temps/temp_invert.${img.getExtension()}`);
			const atch = new MessageAttachment(`./temps/temp_invert.${img.getExtension()}`, `generated.${img.getExtension()}`);
			return message.channel.send(`Successfully inverted ${user.tag}'s profile picture!`, atch);
		});
