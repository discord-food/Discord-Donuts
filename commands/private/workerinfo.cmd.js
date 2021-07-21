const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { canCook } = require("../../permissions");
const { WorkerInfo, MonthlyInfo, sequelize } = require("../../sequelize");
const { mainServer } = require("../../auth");
const { findUser } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("workerinfo")
		.setDescription("Checks a user's or your own stats.")
		.addShortcuts("wi")
		.addSyntax("monthly", "text(skippable)")
		.addSyntax("user", "id|mention")
		.setPermissions(canCook)
		.setFunction(async(message, args, client) => {
			let data = WorkerInfo;
			let isMonthly = false;
			if (args[0] && args[0].includes("month")) {
				data = MonthlyInfo;
				args.shift();
				isMonthly = true;
			}


			const wordered = await sequelize.query(`SELECT id FROM workerinfos ORDER BY cooks + delivers DESC`, { type: sequelize.QueryTypes.SELECT, model: WorkerInfo });
			const mordered = await sequelize.query(`SELECT id FROM monthlyinfos ORDER BY cooks + delivers DESC`, { type: sequelize.QueryTypes.SELECT, model: MonthlyInfo });
			const wmap = wordered.map(x => x.id);
			const mmap = mordered.map(x => x.id);
			const user = await findUser(client, message, args, 0, true, false);
			if (!user) return message.channel.send(`<:no:501906738224562177> **Something went wrong.**`);
			const member = client.guilds.get(mainServer).members.get(user.id);
			if (!member) message.channel.send("<:no:501906738224562177> **The person seems to not be in this server.**");
			if (!await data.findById(user.id) && member ? !canCook(client, member) : !await data.findById(user.id)) return message.channel.send("They are not a worker!");
			const workerraw = isMonthly ? await data.findOrCreate({ where: { id: user.id }, defaults: { id: user.id, cooks: 0, delivers: 0, lastCook: 0, lastDeliver: 0, username: user.tag } }) : await data.findOrCreate({ where: { id: user.id }, defaults: { id: user.id, cooks: 0, delivers: 0, lastCook: 0, lastDeliver: 0, username: user.tag } });
			const worker = workerraw[0];
			const embed =
				new DDEmbed(client)
					.setStyle("blank")
					.setTitle(`${user.tag}'s ${isMonthly ? "Monthly " : ""}Worker Stats`)
					.setDescription(`${user.tag}'s stats.`)
					.addField("Cooks", `${worker.cooks} cook${worker.cooks !== 1 ? "s" : ""}`)
					.addField("Delivers", `${worker.delivers} deliver${worker.delivers !== 1 ? "s" : ""}`)
					.addField("Total", `${worker.delivers + worker.cooks} cooks and delivers in total.`)
					.addField("Overall Leaderboard Rank", `#${wmap.indexOf(user.id) + 1} on the overall leaderboard.`)
					.addField("Monthly Leaderboard Rank", `#${mmap.indexOf(user.id) + 1} on the monthly leaderboard.`)
					.setThumbnail("https://images.emojiterra.com/twitter/512px/1f4ca.png");
			message.channel.send(embed);
		});
