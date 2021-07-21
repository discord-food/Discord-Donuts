const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");
const { AdvancedArray } = require("multipurpose-utils");
const { Orders, Op } = require("../../sequelize");
const { everyone } = require("../../permissions");
const { messageAlert } = require("../../helpers");
const { channels: { ticketChannel }, employeeRole, mainServer, dutyRole, awayRole } = require("../../auth.json");
const pms = require("pretty-ms");
const pb = require("pretty-bytes");
const { version } = require("discord.js");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const pmsb = n => pms(Number(n) / 1000000, { formatSubMs: true });
module.exports =
	new DDCommand()
		.setName("botinfo")
		.addAlias("info")
		.addShortcuts("inf")
		.setDescription("Some information.")
		.setPermissions(everyone)
		.setFunction(async(message, args, client, account) => {
			const { stdout: v } = await exec("git rev-list --no-merges --count HEAD");
			const memory = process.memoryUsage();
			const online = client.guilds.get(mainServer).roles.get(employeeRole).members.filter(x => x.user.presence.status === "online").map(x => x.id);
			const onduty = client.guilds.get(mainServer).roles.get(dutyRole).members.map(x => x.id);
			const avaliable = AdvancedArray.from(onduty)
				// .union(online)
				.subtract(client.guilds.get(mainServer).roles.get(awayRole).members.map(x => x.id))
				.filter(x => client.users.get(x).presence.status !== "offline");
			await message.channel.send(`__**ℹ Information ℹ**__
**Startup Time**: \`${pmsb(client.pinging.e - client.start)}\`
**Uptime**: \`${pms(client.uptime)}\`
**Server Count**: \`${client.guilds.size}\`
**Memory Usage**: \`${pb(memory.heapUsed)}\`
**External Memory Usage**: \`${pb(memory.external)}\`
**Node.js Version**: \`${process.version}\`
**Discord.js Version**: \`${version}\`
**Bot Version**: \`v${(v / 100).toFixed(2)}\`
**Avaliable Workers**: 
\`\`\`ini
[[ ${avaliable.length} workers avaliable. ]]
${avaliable.map(x => `[${client.users.get(x).tag}], ID: ${x}`).join(",\n")}
\`\`\`
**[Disclaimer]**:  Discord Donuts is allowed to collect all Command Usage and Direct Messages sent to the bot.

`);
		});
