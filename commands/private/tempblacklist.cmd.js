const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Blacklist } = require("../../sequelize");
const { isBotAdmin } = require("../../permissions");
const { findUser } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("tempblacklist")
		.setDescription("Blacklist a user or a guild, with a reason for a limited time.")
		.setPermissions(isBotAdmin)
		.addSyntax("userId", "snowflake", true)
		.addSyntax("time", "number", true)
		.addSyntax("measurement", "ms|s|m|h|d|w|mo|y", true)
		.setFunction(async(message, args, client) => {
			const user = await findUser(client, message, args, 0);
			if (!user) return;
			if (await Blacklist.findById(user.id)) return message.reply("<:no:501906738224562177> **That guild or user is already blacklisted!**");
			if (!args[1]) return message.reply("<:no:501906738224562177> **Please provide a reason.**");
			if (!args[2]) return message.reply("<:no:501906738224562177> **Please provide how long.**");
			if (!args[3]) return message.reply("<:no:501906738224562177> **Please provide a measurement. `ex: s for seconds, m for minute, etc.`**");
			const measures = { ms: 1, s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000, mo: 2592000000, y: 31556952000 };
			const measuretext = ["Milliseconds", "Seconds", "Minutes", "Hours", "Days", "Weeks", "Months", "Years"];
			const measure = measures[args[3]];
			const mtext = Object.keys(measures).map((x, i) => `${x} - ${measuretext[i]}`).join(", ");
			if (!measure) return message.reply(`<:no:501906738224562177> **"${args[3]}" is not a valid measurement.\n**Measurements**\n${mtext}`);
			if (isNaN(args[2])) return message.reply("<:no:501906738224562177> **That doesn't seems to be a number!**");
			const endtime = String(Date.now() + (Number(args[2]) * measure));
			const newbl = await Blacklist.create({ id: args.shift(), reason: args.shift(), end: endtime });

			await message.react("501906738119835649");
		});
