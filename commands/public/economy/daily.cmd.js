const DDEmbed = require("../../../structures/DDEmbed.struct");
const DDCommand = require("../../../structures/DDCommand.struct");
const { DDProgress } = require("../../../structures/DDExtras.struct");
const { everyone } = require("../../../permissions");
const prettyms = require("pretty-ms");
const { Donuts } = require("../../../sequelize");
module.exports =
	new DDCommand()
		.setName("daily")
		.addShortcuts("dly")
		.setDescription("Get your daily donuts!")
		.setPermissions(everyone)
		.setHidden(true)
		.setFunction(async(message, args, client, account, cooldown) => {
			return;
			if (Number(cooldown.daily) + 86400000 >= Date.now()) {
				const left = (Number(cooldown.daily) + 86400000) - Date.now();
				const bar = new DDProgress(0, 86400000);
				return message.channel.send(`You have recieved your daily today already! You can recieve another in ${prettyms(left, { verbose: true })}.
\`\`\`
${bar.generate(left, { percent: true, decimals: 2 })}
\`\`\`
`);
			}
			let add = Math.floor(1 + Math.random() * 2) * 100;
			await cooldown.update({ daily: Date.now() });
			await account.update({ donuts: account.donuts + add });
			message.channel.send(`You have recieved your daily prize of ${add} donuts!`);
	});
