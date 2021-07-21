const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Orders } = require("../../sequelize");
const { canCook } = require("../../permissions");
const { getOrder } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("unclaim")
		.setDescription("Use this to unclaim donut orders.")
		.addSyntax("orderId", "id")
		.addShortcuts("uc")
		.setPermissions(canCook)
		.setFunction(async(message, args, client) => {
			const order = await getOrder("unclaim", message, args, 1);
			if (!order) return;
			if (order.claimer !== message.author.id) return message.channel.send("<:no:501906738224562177> **This order was not claimed by you.**");

			await order.update({ status: 0, claimer: null });

			await client.users.get(order.user).send(`Sadly, **${message.author.username}** has unclaimed your order.`);

			message.channel.send(`<:yes:501906738119835649> **Request acknowledged.**`);
		});
