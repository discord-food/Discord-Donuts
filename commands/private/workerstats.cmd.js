const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { canCook } = require("../../permissions");
const { sequelize, WorkerInfo, MonthlyInfo } = require("../../sequelize");

module.exports =
	new DDCommand()
		.setName("workerstats")
		.setDescription("Checks the global worker stats.")
		.addSyntax("monthly", "text")
		.setPermissions(canCook)
		.addShortcuts("ws")
		.setFunction(async(message, args, client) => {
			let data = WorkerInfo;
			let isMonthly = false;
			if (args[0] && args[0].includes("m")) {
				data = MonthlyInfo;
				args.shift();
				isMonthly = true;
			}
			let sumc = await data.sum("cooks");
			let sumd = await data.sum("delivers");
			let sum = sumc + sumd;
			let avgc = (await WorkerInfo.findAll({ attributes: [[sequelize.fn('AVG', sequelize.col('cooks')), 'average']] }))[0].get("average");
			let avgd = (await WorkerInfo.findAll({ attributes: [[sequelize.fn('AVG', sequelize.col('delivers')), 'average']] }))[0].get("average");
			let avg = Number(avgc) + Number(avgd);
			const li = [sumc, sumd, sum, avgc, avgd, avg].map(item => {
				if (isNaN(item)) return 0;
				return item;
			});
			sumc = li[0];
			sumd = li[1];
			sum = li[2];
			avgc = li[3];
			avgd = li[4];
			const embed =
				new DDEmbed(client)
					.setStyle("blank")
					.setTitle(`The Global ${isMonthly ? "Monthly " : ""}Worker Stats`)
					.setDescription(`The global stats.`)
					.addField("Total Cooks", `${sumc} cooks`)
					.addField("Average Cooks", `${avgc} cooks`)
					.addField("Total Delivers", `${sumd} delivers`)
					.addField("Average Delivers", `${avgd} delivers`)
					.addField("Total", `${sum} cooks and delivers`)
					.addField("Average", `${avg} cooks and delivers`)
					.setThumbnail("https://images.emojiterra.com/twitter/512px/1f4ca.png");
			message.channel.send(embed);
		});
