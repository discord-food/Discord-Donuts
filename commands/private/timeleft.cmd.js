const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");
const { DDProgress } = require("../../structures/DDExtras.struct");
const moment = require("moment");
const { canCook } = require("../../permissions");
const { Orders, Op } = require("../../sequelize");
const { getOrder } = require("../../helpers");
const prettyms = require("pretty-ms");
module.exports =
	new DDCommand()
		.setName("timeleft")
		.addShortcuts("tl")
		.setDescription("The global ticket statistics.")
		.addSyntax("order", "orderid")
		.setPermissions(canCook)
		.setFunction(async(message, args, client) => {
			const order = await getOrder("check", message, args, [0, 3]);
			if (!order) return;
			let sel = 0;
			if (order.status === 2) sel = 0;
			else if (order.status === 0) sel = 1;
			else if (order.status === 3) sel = 2;
			else return message.channel.send("That order doesn't have a progress.");
			const prop = ["cook", "expire", "deliver"][sel];
			const bar = new DDProgress(1, 100);
			const p = 100 - (((order[`${prop}Timeout`] - Date.now()) / order[`${prop}Total`]) * 100);
			const dis = ["finishes cooking", "expires", "automatically delivers"][sel];
			const t = prettyms(order[`${prop}Timeout`] - Date.now(), { verbose: true });
			const generated = bar.generate(p, { percent: true, decimals: 2, total: 30 });
			message.channel.send(`
\`\`\`
Time left until order ${order.id} ${dis}.
${"=".repeat(generated.length)}

${generated}

${t} left.
\`\`\`
			`);
		});
