const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");
const moment = require("moment");
const { canCook } = require("../../permissions");
const { Orders, Op } = require("../../sequelize");
module.exports =
	new DDCommand()
		.setName("ticketstats")
		.addShortcuts("ts")
		.setDescription("The global ticket statistics.")
		.addSyntax("time", "number")
		.addSyntax("measurement", "ms|s|m|h|d|w|mo|y")
		.setPermissions(canCook)
		.setFunction(async(message, args, client) => {
			let times = ".";
			let after = false;
			if (args[0] && args[1]) {
				const measures = { ms: 1, s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000, mo: 2592000000, y: 31556952000 };
				if (!measures[args[1]]) {
					return message.channel.send(`"${args[1]}" is not a valid time selector. Options: ms, s, m, h, d, w, mo, y`);
				}
				after = Number(args[0]) * measures[args[1]];
				times = ` that was made ${moment(Date.now() - after).fromNow().replace(" ago", "")} and later.`;
			}
			const getFrom = async(status, time) => {
				if (time && status != undefined) {
					return await Orders.findAll({ where: { status, updatedAt: { [Op.gt]: Date.now() - time } } });
				} else if (!time && status) {
					return await Orders.findAll({ where: { status } });
				} else if (time && status == undefined) {
					return await Orders.findAll({ where: { updatedAt: { [Op.gt]: Date.now() - time } } });
				} else {
					return await Orders.all();
				}
			};
			const delivered = await getFrom(4, after);
			const deleted = await getFrom(5, after);
			const expired = await getFrom(6, after);
			const cancelled = await getFrom(7, after);
			const total = await getFrom(undefined, after);
			const percent = dat => {
				const p = Math.floor((dat.length / total.length) * 10000) / 100;
				return isNaN(p) ? 0 : p;
			};
			const embed = new DDEmbed(client)
				.setStyle("blank")
				.setTitle("Ticket Statistics")
				.setDescription(`ALL THE STATS!! Statistics of orders${times}`)
				.addField("Total Orders", `${total.length} orders`)
				.addField("Delivered Orders", `${delivered.length} orders (${percent(delivered)}%)`)
				.addField("Deleted Orders", `${deleted.length} orders (${percent(deleted)}%)`)
				.addField("Expired Orders", `${expired.length} orders (${percent(expired)}%)`)
				.addField("Cancelled Orders", `${cancelled.length} orders (${percent(cancelled)}%)`);
			message.channel.send(embed);
		});

