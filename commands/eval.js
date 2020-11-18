const Discord = require("discord.js");
const Client = new Discord.Client();
const config = require("../auth.json");
module.exports.run = async (client, msg, args) => {
	if (config.botOwners.includes(msg.author.id.toString())) {
		const command = msg.content.split(" ").slice(1).join(" ");
		try {
			msg.channel.send("```js\n" +  eval(command) + "```")
		}
		catch (err) {
			msg.channel.send(err.message);
		}
	}
	else {
		msg.channel.send(`User ${msg.author.id} is not authorized to run this command.`);
	}
};