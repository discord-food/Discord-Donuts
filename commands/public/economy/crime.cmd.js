const DDEmbed = require("../../../structures/DDEmbed.struct");
const DDCommand = require("../../../structures/DDCommand.struct");

const { everyone } = require("../../../permissions");
const { getText } = require("../../../helpers");
const { Donuts } = require("../../../sequelize");
const prettyms = require("pretty-ms");
module.exports =
	new DDCommand()
		.setName("crime")
		.addAliases("felony")
		.setDescription("Commit a crime.")
		.setPermissions(everyone)
		.setFunction(async(message, args, client, account, cooldown) => {
			const successes = [
				"You robbed a bakery.",
				"You smuggled some illegal donuts across the country.",
				"You smoked in a no-smoking zone.",
				"Philly ████ed you some █████ ███████.",
				"You joined a rock band that tragically failed. To feed your children you pull off daring donut heists together.",
				"You hit an old lady over the head for her donuts, I hope you're proud of yourself.",
				"Money laundering for a cartel leads you to the lucrative world of donut smuggling.",
				"Selling bootleg Dunkin Donuts on the street corner actually pays off. Who'da thunk it?!",
				"You pilfered that legendary diamond donut from DeBeers Headquarters.",
				"The man you kidnapped happens to be an master donut craftmen. Hours of torture pays off.",
				"You slip your local baker a mickey and run off giggling with his tasty wares.",
				"No one notices you stuff donuts in your pants, score!",
				"Pulling off an ole timey train robbery was a good plan, the caboose was stuffed with fresh donuts.",
				"That phishing scheme about orphans crying for donuts finally worked.",
				"You were busted during a botched bank robbery, but the cops had were bizarrely friendly.",
				"You stabbed the Pillsbury Dough Boy. Sane people around the world laud you as a hero and send gifts.",
				"All the animals at the zoo escape. In the ensuing chaos you snatch the panda's donut stash.",
				"You walk into a donut shop, ask for donuts, then just walk out without saying a word. Shockingly easy!",
				"You twerk in public. Pedestrians throw donuts at you.",
				"You orchestrate an elaborate identity theft ring just to claim people's unused donut shop rewards.",
				"You sell your soul to some dude in an ugly sweater that swears he's the devil.",
				"Cheating on a gameshow pays off in an unexpected way."
			];
			const failures = [
				"You tried to rob a bank but you activated the alarm.",
				"You dropped all your donuts.",
				"Mystic arrested you for spamming.",
				"Grass is not longer real.",
				"You wear a dog costume while working as a cat burglar.",
				"The Mafia finds out about your donut racket.",
				"In jail you're offered a donut. It's not what you think.",
				"Busted stealing a station wagon. Somehow you failed to notice the backseat was brimming with donuts.",
				"Caught hacking into Discord Donuts impenetrable network of automated donut kiosks.",
				"You smushed a donut belonging to Samuel L. Jackson. He is not amused.",
				"Trump declares all fried dough products illegal contraband.",
				"You streak across a local strip mall realizing too late it's not THAT kind of strip mall.",
				"You get caught in the theater attempting too smuggle in your favorite food.",
				"You fell down a stair of donuts.",
				"You fell into a donut portal."
			];
			if (cooldown.crime > Date.now()) return message.channel.send(`Please wait ${prettyms(cooldown.crime - Date.now(), { verbose: true })} before using this command again.`);
			await cooldown.update({ crime: new Date(Date.now() + 3600000) });
			const success = Math.random() > 0.56;
			const added = Math.floor(Math.random() * 600) + 500;
			if (success) {
				await message.channel.send(`${successes.random()} You got ${added} donuts.`);
				await account.update({ donuts: account.donuts + added });
			} else {
				const fine = Math.floor(added * 0.8);
				await message.channel.send(`${failures.random()} You lost ${fine} donuts.`);
				await account.update({ donuts: account.donuts - fine });
			}
		});
