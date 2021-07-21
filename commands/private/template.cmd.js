const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { EasyDelivers } = require("../../sequelize");
const { canCook } = require("../../permissions");

module.exports =
	new DDCommand()
		.setName("template")
		.addAlias("set-template")
		.addSyntax("action", "edit|help")
		.setDescription("Set the custom deliver template.")
		.setPermissions(canCook)
		.setFunction(async(message, args, client) => {
			const gendelmsg = "[user], here's your order, enjoy [url] ! If you enjoy using the bot and would like to take an extra step further to support it, you may donate via Patreon (**<https://patreon.com/discorddonuts>**). Enjoyed your donut? Give us feedback with **d!feedback <feedback>**.";
			const temp = (await EasyDelivers.findOrCreate({
				where: {
					id: message.author.id
				},
				defaults: {
					id: message.author.id,
					content: gendelmsg
				}
			}))[0];
			if (!args[0]) return message.channel.send(`Your current template:\n${temp.content}\nTo edit it, run d!template edit. To check a list of placeholders, run d!template help.`);
			if (args[0] === "help") {
				const list = "".convertTemplate.list;
				const mapped = Object.entries(list).map(x => `\`${x[0]}\`: ${x[1]}`
				);
				return message.channel.send(`**A list of placeholders.**\n${mapped.join("\n")}`);
			}
			if (args[0] !== "edit" && args[0] !== "help") return message.channel.send("That is not a valid option!");
			await message.channel.send("Please type in your template. Run `d!template help` for a list of placeholders.");
			const recieved = await message.channel.awaitMessages(m => m.author.id === message.author.id, {
				max: 1,
				time: 60000
			});
			if (recieved.size === 0) return message.channel.send("You did not provide me with any text so I cancelled this session.");
			const cont = recieved.first().content.replace(/(?<!<)((https?:\/\/(www\.)?))+patreon\.com\/discorddonuts(?!>)/g, "<$&>")
				.replace(/(?<!<)((https?:\/\/(www\.)?))+paypal\.me(?!>)/g, "<https://patreon.com/discorddonuts>");

			const example = cont.convertTemplate(`<@${message.author.id}>`, "https://cdn.discordapp.com/attachments/295652105400614922/514581470732484609/3c02175d0a7fb0a41ab8d8672faafe3a.jpg", "mystic donut", "mYs1tC", "Mystic#6969", message.author.tag);
			await message.channel.send(`**EXAMPLE:**\n${example}`);
			await message.channel.send("Are you satisfied with this message? Reply with `yes` or `no`.");
			const response = await message.channel.awaitMessages(
				m => m.author.id === message.author.id &&
				m.content.match(/(yes|no)/i), {
					max: 1,
					time: 20000
				});

			if (response.size && response.first().content.match(/yes/i)) {
				await temp.update({
					content: cont
				});
				return message.channel.send("Alright! I have updated your deliver message!");
			} else if (!response.size) {
				return message.channel.send("You did not answer so I cancelled this session.");
			} else {
				return message.channel.send("I have cancelled the session.");
			}
		});
