const { sequelize } = require("../../sequelize");
const { isBotOwner } = require("../../permissions");

const DDCommand = require("../../structures/DDCommand.struct");

module.exports =
	new DDCommand()
		.setName("sql")
		.addSyntax("sql", "text", true)
		.setDescription("Runs an sql command.")
		.setPermissions(isBotOwner)
		.setFunction(async(message, args, client) => {
			try {
				const result = await sequelize.query(args.join(" "));
				await message.channel.send(JSON.stringify(result[0]), { code: "json" });
			} catch (e) {
				await message.channel.send(e.message, { code: "js" });
			}
		});
