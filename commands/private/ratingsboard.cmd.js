const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Orders } = require("../../sequelize");
const { getOrder, status } = require("../../helpers");
const { canCook } = require("../../permissions");

module.exports =
	new DDCommand()
		.setName("ratingsboard")
		.setDescription("Lists the top rated workers.")
		.addShortcuts("rb")
		.setPermissions(canCook)
		.setFunction(async(message, args, client) => {

		});
