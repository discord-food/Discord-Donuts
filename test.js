const Discord = require("discord.js");
const tap = require("tap");
const TSR = require("tap-mocha-reporter");

const { feedbackChannel, testChannel, prefix } = require("./auth.json");

tap.Test.prototype.addAssert("awaitMessage", 2, async function(channel, predicate, message, extra) { // eslint-disable-line func-names
	const msg = await channel.awaitMessages(predicate, { max: 1, time: 10000, errors: ["time"] });
	return this.ok(msg.size, message, extra);
});

module.exports = client => {
	tap.pipe(TSR("spec"));

	const tChannel = client.channels.get(testChannel);
	const fbChannel = client.channels.get(feedbackChannel);

	tap.type(client, Discord.Client, "the client is a valid client");

	tap.test("ping command", async test => {
		await tChannel.send(`${prefix}ping`);
		await test.awaitMessage(
			tChannel, message => message.embeds[0].title === "Ping",
			"the title should be ping"
		);
	});

	tap.test("feedback command", async test => {
		await tChannel.send(`${prefix}feedback`);
		await test.awaitMessage(
			tChannel, message => message.content === ":x: Make sure to include what you'd like to say!",
			"should reply knowing theres no feedback"
		);

		await tChannel.send(`${prefix}feedback `);
		await test.awaitMessage(
			tChannel, message => message.content === ":x: Make sure to include what you'd like to say!",
			"should also reply knowing theres no feedback"
		);

		await tChannel.send(`${prefix}feedback actual feedback`);
		await test.awaitMessage(
			fbChannel, message => message.embeds[0] && message.embeds[0].description === "actual feedback",
			"should send the feedback embed"
		);

		await test.awaitMessage(
			tChannel, message => message.content.includes("Thank you for giving us your feedback!"),
			"should reply knowing there is feedback"
		);

		test.end();
	});

	tap.test("order comand", async test => {
		await tChannel.send(`${prefix}order`);
		await test.awaitMessage(
			tChannel, message => message.content.includes("Please enter a description"),
			"should not allow an empty order"
		);

		await tChannel.send(`${prefix}order `);
		await test.awaitMessage(
			tChannel, message => message.content.includes("Please enter a description"),
			"should also not allow an empty order with a space"
		);

		await tChannel.send(`${prefix}order an order`);
		await test.awaitMessage(
			tChannel, message => message.embeds[0].title === "Ticket Created",
			"should respond with a confirmation"
		);

		await test.awaitMessage(
			tChannel, message => message.embeds[0].fields.some(field => field.value.match(/0\w{6}/)) && message.embeds[0].description.includes(client.user.id),
			"sends a valid ticket"
		);

		test.end();
	});

	tap.end();
};
