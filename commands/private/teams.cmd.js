const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Teams } = require("../../sequelize");
const { everyone } = require("../../permissions");
const { findUser } = require("../../helpers");
const { employeeRole, mainServer } = require("../../auth.json");
module.exports =
	new DDCommand()
		.setName("teams")
		.setDescription("Lists all the teams.")
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			const all = await Teams.findAll();
			const workers = client.guilds.get(mainServer).roles.get(employeeRole).members.map(x => x.user)
			const notin = workers.filter(x => !(all.flatMap(x => x.members).includes(x.id)))
			const verbose = args[0];
			const embed = new DDEmbed(client)
				.setTitle("Teams")
				.setDescription("A list of teams.");
			for (const team of all) {
				team.stats = await team.getStats();
				team.monthly = await team.getMonthlyStats();
			}
			const sorted = all.sort((a, b) => (b.monthly.cooks + b.monthly.delivers) - (a.monthly.cooks + a.monthly.delivers))
			for (const [index, team] of sorted.entries()) {
				embed.addField(`#${index + 1}: [${team.monthly.cooks + team.monthly.delivers} TOTAL] ${team.name} (${team.members.length} members)`, verbose ? `**ID**: ${team.id}\n**Monthly Stats**
${team.monthly.cooks} cooks, and ${team.monthly.delivers} delivers.
${team.monthly.cooks + team.monthly.delivers} in total.
**Global Stats**
${team.stats.cooks} cooks, and ${team.stats.delivers} delivers.
${team.stats.cooks + team.stats.delivers} in total.
` : `ID: ${team.id}\n${team.monthly.cooks} cooks and ${team.monthly.delivers} delivers. ${team.monthly.cooks + team.monthly.delivers} total.`)
			}
			embed.addField(`${notin.length} workers are not in a team.`, verbose ? `The following are not in a team:
${notin.map(x => `${x.tag} (ID:${x.id})`).join("\n")}` : notin.map(x => `**${x.tag}**`).join(", "))
			await message.channel.send(embed)
		});
