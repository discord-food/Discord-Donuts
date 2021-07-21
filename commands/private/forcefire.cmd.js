const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { isBotOwner } = require("../../permissions");
const { WorkerInfo, MonthlyInfo } = require("../../sequelize");
module.exports =
new DDCommand()
	.setName("forcefire")
	.addAliases("ffire", "forcef", "forestfire", "adminfire")
	.setDescription("Forcefully fire somebody.")
	.setPermissions(isBotOwner)
	.setFunction(async(message, args, client) => {
		const user = args[0];
		if (!args[0]) return message.channel.send("Please include a user id.");
		const statuses = [];
		const muser = await WorkerInfo.findById(user);
		if (!muser) { statuses.push("Entry Not Found."); } else {
			statuses.push("Deleted.");
			await muser.destroy();
		}
		const wuser = await MonthlyInfo.findById(user);
		if (!wuser) { statuses.push("Entry Not Found."); } else {
			statuses.push("Deleted.");
			await wuser.destroy();
		}
		return message.channel.send(`
\`\`\`ini
DONE!
[ WorkerInfo ] ${statuses[0]}
[ MonthlyInfo ] ${statuses[1]}
\`\`\`
			`);
	});

// **** MADE BY william.js ****
