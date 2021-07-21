const { Orders, Op } = require("../../sequelize");

const { canCook } = require("../../permissions");

const { status } = require("../../helpers");

const DDCommand = require("../../structures/DDCommand.struct");

module.exports =
	new DDCommand()
		.setName("list")
		.setPermissions(canCook)
		.setDescription("Lists all available donuts.")
		.addShortcuts("li")
		.setFunction(async(message, args, client) => {
			const ordersList = await Orders.findAll({ where: { status: { [Op.lt]: 4 } }, order: [["createdAt", "DESC"]] });
			const ordersFormatted = ordersList.map(t => `\n\`${t.id}\` - ${status(t.status)} ${t.status === 1 ? `by ${client.users.get(t.claimer).tag}` : ""}`).join("") || "";

			message.channel.send(`Current orders: ${ordersList.length === 0 ? "\nNone." : ordersFormatted}`);
		});
