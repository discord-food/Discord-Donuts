const Discord = require ("discord.js");
const client = new Discord.Client();
const Tokenfile = require("./auth.json")
const config = require ("./auth.json");


client.on("ready", () => {
	console.log("The bot is ready.");
	client.user.setActivity("LOOK IT BE GAGI!", { type: "PLAYING" });
});
    client.login(Tokenfile.token)
