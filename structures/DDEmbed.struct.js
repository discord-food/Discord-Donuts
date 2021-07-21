const Discord = require("discord.js");

/**
 * Class representing a Discord Donuts embed.
 * This type of embed has the Discord Donuts style in it.
 * @extends Discord.MessageEmbed
 */
class DDEmbed extends Discord.MessageEmbed {
	/**
	* Create a DDEmbed
	* @param { Discord.Client } client The bot client. Used for getting the bots username/avatar
	* @param { Discord.MessageEmbed | Discord.MessageEmbedOptions } [data] Any extra data, required by Discord.MessageEmbed
	*/
	constructor(client, data) {
		if (!client) throw new TypeError("Please provide a valid client instance");

		super(data);

		this.client = client;

		this.setTimestamp();
	}

	/**
	* Sets the style of the embed.
	* @param { String } style The style of embed. Either "colorful" or "blank" or "white".
	* @returns { DDEmbed } The embed after being modified
	* @throws { TypeError } If you provide an unrecognised style
	*/
	setStyle(style) {
		if (style === "colorful") {
			this.setColor(Math.floor(Math.random() * 16777216));
			this.setFooter(this.client.user.username, this.client.user.avatarURL());
		} else if (style === "white") {
			this.setColor(0xFFFFFF);
		} else if (style === "blank") {
			this.setColor(0x36393E);
		} else {
			return new TypeError(`Unrecognised style: ${style}`);
		}
		return this;
	}
}

module.exports = DDEmbed;
