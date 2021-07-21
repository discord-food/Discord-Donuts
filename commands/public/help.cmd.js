const DDCommand = require("../../structures/DDCommand.struct");
const DDEmbed = require("../../structures/DDEmbed.struct");
const { everyone } = require("../../permissions.js");
const permissions = require("../../permissions.js");
const { chunk, listCommands } = require("../../helpers");
const { Collection } = require("discord.js");
module.exports =
	new DDCommand()
		.setName("help")
		.setDescription("Shows help about the bot")
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			/*
			const sorted = Array.from(client.commands);
			const sortedmap = new Collection(sorted);
			const uniqueCommands = sortedmap.array()
				.filter((val, index, arr) => arr.indexOf(val) === index);
			Array.prototype.groupBy = function(prop, moreprop) {
				return this.reduce((groups, item) => {
				const val = prop.split('.').reduce((o,i) => o[i], item);
				groups[val] = groups[val] || [];
				groups[val].push(item);
				return groups;
				}, {});
			};
			Object.keys(uniqueCommands.groupBy("permissions.name")).forEach(async sectName => {
				const sectCommands = uniqueCommands.groupBy("permissions.name")[sectName];
				if (!permissions[sectname](client, message.member))
				chunk(25)(sectCommands).forEach(async(section, index, arr) => {
					const embed = new DDEmbed(client)
						.setStyle("blank")
						.setFooter("Run d!syntax or d!syntax {command} to check the syntaxes of commands!")
						.setTitle(`Discord Donuts Commands, Category: [${sectName}], (Page ${index + 1} of ${arr.length})`)
						.setThumbnail("https://images.emojiterra.com/twitter/512px/2754.png");
					section.forEach(command => {
						if (!(command instanceof DDCommand)) return;
						if (command.getHidden()) return;
						if (!command.getPermissions(client, message.member)) return;
						const label = command.getLabel() ? `[${command.getLabel()}] ` : "";
						embed.addField(`${command.getName()}${command.getAliases().map(x => `, ${x}`).join("")}`, `${label}${command.getDescription()}`);
					});
					try {
						await message.author.send(embed);
					} catch (e) {
						return message.channel.send("<:no:501906738224562177> **I need to be able to send the list of commands to your DM.**");
					}
				});
			});*/
			await listCommands(client, message, { display: "A list of all of the commands that you have access to.", group: "permissions.name", show: "Commands", filter: () => true });
			await message.channel.send("<:yes:501906738119835649> **Check your DM's for my command list!**");
		});
