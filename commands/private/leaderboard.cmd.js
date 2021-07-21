const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { canCook } = require("../../permissions");
const { WorkerInfo, MonthlyInfo, sequelize } = require("../../sequelize");

module.exports =
	new DDCommand()
		.setName("leaderboard")
		.addAliases("leaderboards", "top")
		.setDescription("Checks the overall leaderboard..")
		.addSyntax("monthly", "text(skippable)")
		.addSyntax("start", "number")
		.addSyntax("end", "number")
		.addSyntax("filter", "cook|deliver|all")
		.addShortcuts("lb")
		.setPermissions(canCook)
		.setFunction(async(message, args, client) => {
			let type = "workerinfos";
			let isMonthly = false;
			let mod = WorkerInfo;
			if (args[0] && args[0].toLowerCase().includes("m")) {
				type = "monthlyinfos";
				isMonthly = true;
				mod = MonthlyInfo;
				args.shift();
			}
			let sel = args[2] ? args[2] : "all";
			if (args[2] && !["all", "cooks", "delivers"].includes(sel)) return message.channel.send("The filter must be 'cooks', 'delivers' or 'all'.");
			// let order = {"all": [[sequelize.fn('SUM', sequelize.col('cooks'), sequelize.col('delivers')), "DESC"]], "cooks": [["cooks", "DESC"]], "delivers": [["delivers", "DESC"]]}[sel]
			let order = { all: "cooks + delivers", cooks: "cooks", delivers: "delivers" }[sel];
			let start = !isNaN(args[0]) ? Number(args[0]) - 1 : 0;
			// const ordered = await WorkerInfo.findAll({order: order});
			const ordered = await sequelize.query(`SELECT * FROM ${type} ORDER BY ${order} DESC`, { type: sequelize.QueryTypes.SELECT, model: mod });
			const mapped = ordered.map(x => [x.cooks, x.delivers, client.users.get(x.id) ? client.users.get(x.id).tag : x.username, x.id]);
			let end = !isNaN(args[1]) ? Number(args[1]) : ordered.length < 10 ? ordered.length : 10;
			if (start - 1 > end || start > ordered.length || end > ordered.length) {
				return message.channel.send("Selection not in range.");
			}
			if (end - start > 19) return message.channel.send("Please make the number of results less than 20.");
			const sliced = mapped.slice(start, end);
			const embed =
				new DDEmbed(client)
					.setStyle("blank")
					.setTitle(`The ${isMonthly ? "monthly" : "overall"} worker leaderboard.`)
					.setDescription(`Showing ${start + 1} to ${end}. ${ordered.length} total. Filter: ${sel}.`)
					.setThumbnail("https://images.emojiterra.com/twitter/512px/1f3c6.png");
			sliced.forEach(v => {
				const i = mapped.indexOf(v);
				const places = { 0: "🥇", 1: "🥈", 2: "🥉" };
				const pre = places[i] ? places[i] : "";
				const isAuthor = v[3] === message.author.id;
				embed.addField(`${isAuthor ? "YOU >" : ""}${pre} #${i + 1}: ${v[2]}`, `${v[0]} cooks and ${v[1]} delivers. ${v[0] + v[1]} total.`);
			});
			message.channel.send(embed);
		});
