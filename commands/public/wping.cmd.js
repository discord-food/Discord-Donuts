const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { everyone } = require("../../permissions");

module.exports =
	new DDCommand()
		.setName("wping")
		.setDescription("The websocket ping.")
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			message.channel.send(`Ping to websocket is \`${Math.round(client.ws.ping)}ms\``);
		});
