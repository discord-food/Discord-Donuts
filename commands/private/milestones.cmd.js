const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { canCook } = require("../../permissions");
const { WorkerInfo, MonthlyInfo, sequelize } = require("../../sequelize");
const { mainServer } = require("../../auth");
const { findUser, mainMember } = require("../../helpers");
const milestones = require("../../milestones");
module.exports =
	new DDCommand()
		.setName("milestones")
		.addAliases("goals")
		.setDescription("Checks your progress to you next and current milestones!")
		.addShortcuts("wi")
		.addSyntax("user", "id|mention")
		.setPermissions(canCook)
		.setFunction(async(message, args, client) => {
			const user = await findUser(client, message, args, 0, true, false);
			if (!user) return message.channel.send(`<:no:501906738224562177> **Something went wrong.**`);
			const member = await mainMember(client, user.id);
			if (!member) message.channel.send("<:no:501906738224562177> **The person seems to not be in this server.**");
			if (!await WorkerInfo.findById(user.id) && member ? !canCook(client, member) : !await WorkerInfo.findById(user.id)) return message.channel.send("They are not a worker!");
			const workerraw = await WorkerInfo.findOrCreate({ where: { id: user.id }, defaults: { id: user.id, cooks: 0, delivers: 0, lastCook: 0, lastDeliver: 0, username: user.tag } });
			const worker = workerraw[0];
			const embed =
				new DDEmbed(client)
					.setStyle("blank")
					.setTitle(`${user.tag}'s Milestones`);
			function calc(n) {
				return Math.floor(n * 1000) / 10;
			}
			for (m in milestones) {
				const mile = milestones[m];
				const total = worker.cooks + worker.delivers;
				let f = `<:no:501906738224562177> In progress. ${total}/${m} (${calc(total / m)}%)`;
				if (total >= m) f = "<:yes:501906738119835649> Completed!";
				embed.addField(`${mile.shortname} => ${m} cooks and delivers`, f, true);
			}
			message.channel.send(embed);
		});
