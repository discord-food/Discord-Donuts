const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");
const { awayRole, mainServer } = require("../../auth");
const { WorkerInfo, MonthlyInfo, Op } = require("../../sequelize");
const { isBotAdmin } = require("../../permissions");
const moment = require("moment");
const { getTime } = require("../../helpers");
const { AdvancedArray } = require("multipurpose-utils");
const pms = ms => require("pretty-ms")(ms, { verbose: true, unitCount: 3 });
module.exports = new DDCommand()
	.setName("inactive")
	.setDescription("Lists all the inactive workers.")
	.addSyntax("selection", "worker|month|week", true)
	.setPermissions(isBotAdmin)
	.setFunction(async(message, args, client) => {
		const n = args[0] || 1;
		const m = args[1] || "w";
		const absent = client.main.roles.get(awayRole).members.map(x => x.id);
		const inactive = await WorkerInfo.findAll({ where: { lastWork: { [Op.lt]: Date.now() - getTime(n, m) } }, order: [["lastWork", "DESC"]] });
		const inactivearr = AdvancedArray.from(inactive.map(x => x))
			.filter(x => client.users.get(x.id))
			.filter(x => Number(x.lastCook) > 10000)
			.sort((x, y) => absent.includes(x.id) - absent.includes(y.id));
		const tosend = `__**Inactive Workers**__ *Users in spoiler format are __Absent__*
${inactivearr.map(x => `${absent.includes(x.id) ? "||" : ""} **${client.users.get(x.id).tag}**: Last time they worked was ${pms(Date.now() - x.lastWork)} ago.${absent.includes(x.id) ? "||" : ""}`).join("\n")}`;
		for (const str of tosend.match(/[\s\S]{1,1999}/g)) {
			await message.channel.send(str);
		}
	});
