const path = require("path");

const Discord = require("discord.js");

const glob = require("glob");

class DDClient extends Discord.Client {
	constructor(options) {
		super(options);

		this.commands = new Discord.Collection();
		this.start = process.hrtime.bigint();
		this.loadCommands();
	}

	loadCommands() {
		this.commands = new Discord.Collection();
		const commandFiles = glob.sync("./commands/**/*.cmd.js");

		commandFiles.forEach(file => {
			const command = require(`.${file}`);

			command.setCategory(path.basename(path.dirname(`.${file}`)));

			this.commands.set(command.name, command);

			command.aliases.forEach(alias => {
				this.commands.set(alias, command);
			});
			command.shortcuts.forEach(shortcut => {
				this.commands.set(shortcut, command);
			});
		});
	}

	getCommand(command) {
		return this.commands.get(command);
	}
}

module.exports = DDClient;
