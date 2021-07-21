const DDCommand = require("../../structures/DDCommand.struct");
const DDEmbed = require("../../structures/DDEmbed.struct");
const { everyone } = require("../../permissions.js");
const { chunk } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("syntax")
		.addShortcuts("syn", "sx")
		.addAliases("syntaxes")
		.addSyntax("command", "text")
		.setDescription("Shows all the syntaxes.")
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			if (args[0]) {
				const cmd = client.commands.get(args[0]);
				if (!cmd) return message.channel.send("That is not a valid command.");
				let syntax = [];
				for (syn of cmd.getSyntax()) {
					let ret = "";
					ret += syn.name;
					ret += `:${syn.type}`;
					if (syn.require) {
						ret = `{${ret}}`;
					} else {
						ret = `[${ret}]`;
					}
					syntax.push(ret);
				}
				return message.channel.send(`**${cmd.getName()}**: ${cmd.getName()} ${syntax.join(" ")}\n*${cmd.getDescription()}*`);
			}
			const uniqueCommands = client.commands.array()
				.filter((val, index, arr) => arr.indexOf(val) === index)
				.filter((val, index, arr) => val.syntax.length > 0);
			chunk(25)(uniqueCommands).forEach(async(section, index, arr) => {
				const embed = new DDEmbed(client)
					.setStyle("blank")
					.setTitle(`Discord Donuts Commands Syntaxes (Page ${index + 1} of ${arr.length})`)
					.setDescription("[] - Optional Parameter, {} - Required Parameter [value:type]")
					.setThumbnail("https://images.emojiterra.com/twitter/512px/2754.png");
				section.forEach(command => {
					if (!(command instanceof DDCommand)) return;
					if (command.getHidden()) return;
					if (!command.getPermissions(client, message.member)) return;
					if (command.getSyntax().length === 0) return;
					const label = command.getLabel() ? `[${command.getLabel()}] ` : "";
					let syntax = [];
					for (syn of command.getSyntax()) {
						let ret = "";
						ret += syn.name;
						ret += `:${syn.type}`;
						if (syn.require) {
							ret = `{${ret}}`;
						} else {
							ret = `[${ret}]`;
						}
						syntax.push(ret);
					}
					embed.addField(`${command.getName()} ${syntax.join(" ")}`, `${label}${command.getDescription()}`);
				});
				try {
					await message.author.send(embed);
				} catch (e) {
					return message.channel.send("<:no:501906738224562177> **I need to be able to send the list of commands to your DM.**");
				}
			});

			await message.channel.send("<:yes:501906738119835649> **Check your DM's for my syntax list!**");
		});
