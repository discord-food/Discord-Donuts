const Discord = require("discord.js");

const DDCommand = require("../../structures/DDCommand.struct");
const DDEmbed = require("../../structures/DDEmbed.struct");
const { chunk, findUser } = require("../../helpers");
const { everyone } = require("../../permissions");
const botperm = require("../../permissions");
module.exports =
	new DDCommand()
		.setName("permissions")
		.addAliases("perms", "perm")
		.setDescription("Checks your own permissions.")
		.addSyntax("user", "id|mention")
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			function pretty(t) {
				let h = t.toLowerCase().split("_").join(" ");
				return [...h].map((x, i) => !i ? x.toUpperCase() : x).join("");
			}
			const perm = Object.keys(Discord.Permissions.FLAGS);
			const user = await findUser(client, message, args);
			if (!user) return message.channel.send("You did not input an user.");
			const member = message.guild.members.get(user.id);
			if (!member) return message.channel.send("I could not find a member that you specified.");
			chunk(25)(perm).forEach(async(section, index, arr) => {
				const embed =
					new DDEmbed(client)
						.setStyle("blank")
						.setTitle("Permissions")
						.setDescription(`${user.tag}'s permissions.`);
				section.map(p => {
					const lg = member.permissions.has(p) ? "<:yes:501906738119835649>" : "<:no:501906738224562177>";
					const txt = pretty(p);
					embed.addField(txt, lg, true);
				});
				message.author.send(embed);
			});
			chunk(25)(Object.keys(botperm)).forEach(async(section, index, arr) => {
				const embed =
					new DDEmbed(client)
						.setStyle("blank")
						.setTitle("Permissions")
						.setDescription(`${user.tag}'s bot permissions.`);
				for (bp of section) {
					const fun = botperm[bp];
					const lg = await fun(client, member) ? "<:yes:501906738119835649>" : "<:no:501906738224562177>";
					const txt = pretty(bp.replace(/([A-Z])/g, " $1").toLowerCase());
					embed.addField(txt, lg, true);
				}
				message.author.send(embed);
			});
			message.channel.send(`I have sent ${user.tag}'s permissions to you!`);
		});
