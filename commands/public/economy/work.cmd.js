const DDEmbed = require("../../../structures/DDEmbed.struct");
const DDCommand = require("../../../structures/DDCommand.struct");
const { DDProgress } = require("../../../structures/DDExtras.struct");

const { everyone } = require("../../../permissions");
const moment = require("moment");
const { Donuts } = require("../../../sequelize");
const prettyms = require("pretty-ms");
module.exports =
	new DDCommand()
		.setName("work")
		.addShortcuts("wk")
		.setDescription("Work for some donuts!")
		.setPermissions(everyone)
		.setFunction(async(message, args, client, account, cooldown) => {
			if (Number(cooldown.work) + 70000 >= Date.now()) {
				const left = (Number(cooldown.work) + 70000) - Date.now();
				const bar = new DDProgress(0, 70000);
				return message.channel.send(`Please wait ${prettyms(left, { verbose: true })} before working again.
\`\`\`
${bar.generate(70000 - left, { percent: true, decimals: 2, total: 30 })}
\`\`\`
`);
			}
			const responses = [
				"You got some free donuts at your local bakery.",
				"You became a cop.",
				"You dabbed at some 10 year olds. They threw donuts that were bought with their moms' credit card to you.",
				"You got hired at Discord Donuts.",
				"You found a box of donuts.",
				"Some donuts fell from the sky.",
				"You drew a donut on a piece of paper.",
				"Jason gave you some donuts.",
				"It's free donut day.",
				"Your shoe turned into a donut.",
				"You house became a donut.",
				"You took a shower.",
				"Grass isn't real.",
				"You made grass become real.",
				"You stopped global warming.",
				"It suddenly started to rain donuts.",
				"You watched the weather forecast.",
				"You won the donut game.",
				"Something happened.",
				"You grew a donut tree.",
				"You got an A+ on donuts.",
				"You cloned your donut stash.",
				"Your prayers to the donut gods were answered.",
				"You slayed a dragon and the village paid you in donuts",
				"A bakery made a mistake and they gave you free donuts.",
				"Time travelers from the future brought donuts to save their timeline.",
				"You saved the whales.",
				"Dumpster diving finally paid off.",
				"You finally proved that the universe is donut shaped.",
				"Bolshevik bakers seize the means of production.",
				"You passed go.",
				"You enter a donut eating contest.",
				"Citywide riot ensues. You loot donut shop.",
				"Citywide riot ensues. You defend donut shop.",
				"Citywide riot ensues. You order donuts from a bunker.",
				"You liquidate your assets and invest in Discord Donuts.",
				"You cleaned under the fryer.",
				"You identified a bug in Discord Donuts bot.",
				"You were polite.",
				"You sue Krispy Kreme.",
				"You act like you belong at the police station.",
				"You befriend the sheriff.",
				"You are deputized.",
				"You perform jury duty.",
				"You voted in your local election.",
				"Break room is magically blessed.",
				"You win a staring contest.",
				"You found the Orb of Zot and brought it to the surface.",
				"You saved the Princess.",
				"You ascended to Nirvana.",
				"You attempt to summon a demon, but all that appears are baked goods."
			];
			const r = responses.random();
			const d = (Math.randint(12, 5) + 1) * 10;
			await message.channel.send(`${r} You got ${d} donuts.`);
			await account.update({ donuts: account.donuts + d });
			await cooldown.update({ work: Date.now() });
		});
