const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");
const { Prefixes } = require("../../sequelize");
const { canEditGuild, everyone } = require("../../permissions");
const { prefix } = require("../../auth");

module.exports =
	new DDCommand()
		.setName("prefix")
		.setDescription("Check or change the guild prefix.")
		.addSyntax("prefix", "text")
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			const gprefixraw = await Prefixes.findOrCreate({ where: { id: message.guild.id }, defaults: { id: message.guild.id, prefix: prefix } });
			const gprefix = gprefixraw[0];
			let editing = false;
			if (!canEditGuild(client, message.member) && args[0]) message.channel.send("<:no:501906738224562177> **You do not have the `MANAGE_GUILD` permission!**");
			if (canEditGuild(client, message.member) && args[0]) editing = true;
			if (editing) {
				const gprefixnew = await gprefix.update({ prefix: args[0] });
				await message.react("501906738119835649");
			} else {
				message.channel.send(`**${message.guild.name}'s prefix is \`${gprefix.prefix}\`!**`);
			}
		});
