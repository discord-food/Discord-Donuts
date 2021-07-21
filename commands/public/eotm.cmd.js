const DDCommand = require("../../structures/DDCommand.struct");
const { everyone } = require("../../permissions");
const { mainServer } = require("../../auth");
module.exports =
	new DDCommand()
		.setName("eotm")
		.setDescription("Checks the employee of the month!")
		.setPermissions(everyone)
		.setFunction((message, args, client) => {
			const eotm = client.guilds.get(mainServer).roles.get("723549968673275945").members.first().user;
			message.channel.send(`**${eotm.tag}** is currently the **Employee of the Month**!`);
		});
