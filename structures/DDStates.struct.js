const Discord = require("discord.js");

class DDStates {
	static status(state) {
		return this.states.get(state) || new TypeError("That is not a recognised state");
	}
}

DDStates.states = new Discord.Collection([
	[0, "Not claimed"],
	[1, "Claimed"],
	[2, "Cooking"],
	[3, "Cooked"],
	[4, "Delivered"],
	[5, "Deleted"],
	[6, "Expired"],
	[7, "Cancelled"],
]);

DDStates.NOT_CLAIMED = 0;
DDStates.CLAIMED = 1;
DDStates.COOKING = 2;
DDStates.COOKED = 3;
DDStates.DELIVERED = 4;
DDStates.DELETED = 5;
DDStates.EXPIRED = 6;
DDStates.CANCELLED = 7;

module.exports = DDStates;
