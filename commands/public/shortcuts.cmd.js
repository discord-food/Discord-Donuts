const DDCommand = require("../../structures/DDCommand.struct");
const DDEmbed = require("../../structures/DDEmbed.struct");
const { everyone } = require("../../permissions.js");
const { chunk } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("shortcuts")
		.setDescription("Shows all the shortcuts.")
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			const uniqueCommands = client.commands.array()
				.filter((val, index, arr) => arr.indexOf(val) === index)
				.filter((val, index, arr) => val.shortcuts.length > 0);
			chunk(25)(uniqueCommands).forEach(async(section, index, arr) => {
				const embed = new DDEmbed(client)
					.setStyle("blank")
					.setTitle(`Discord Donuts Commands Shortcuts (Page ${index + 1} of ${arr.length})`)
					.setThumbnail("https://images.emojiterra.com/twitter/512px/2754.png");
				section.forEach(command => {
					if (!(command instanceof DDCommand)) return;
					if (command.getHidden()) return;
					if (!command.getPermissions(client, message.member)) return;
					if (command.getShortcuts().length === 0) return;
					const label = command.getLabel() ? `[${command.getLabel()}] ` : "";
					embed.addField(`${command.getName()}${command.getShortcuts().map(x => `, ${x}`).join("")}`, `${label}${command.getDescription()}`);
				});
				try {
					await message.author.send(embed);
				} catch (e) {
					return message.channel.send("<:no:501906738224562177> **I need to be able to send the list of commands to your DM.**");
				}
			});

			await message.channel.send("<:yes:501906738119835649> **Check your DM's for my command list!**");
		});
