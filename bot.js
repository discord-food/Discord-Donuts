const Discord = require ("discord.js");
const client = new Discord.Client();
const Tokenfile = require("./auth.json")
const config = require ("./auth.json");

client.commands = new Discord.Collection();

//command handler

client.on("message", message => {
	if (message.author.bot) return;
	if(message.content.indexOf(config.prefix) !== 0) return
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
  
	try {
	  let commandFile = require(`./commands/${command}.js`);
  
	  commandFile.run(client, message, args);
	} catch (err) {
	  console.error(err);
	}
	});
  
  //end of command handler

client.on("ready", () => {
	console.log("The bot is ready.");
	client.user.setActivity("LOOK IT BE GAGI!", { type: "PLAYING" });
});
    client.login(Tokenfile.token)
