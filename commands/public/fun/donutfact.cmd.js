const DDCommand = require("../../../structures/DDCommand.struct");
const DDEmbed = require("../../../structures/DDEmbed.struct");
const { everyone } = require("../../../permissions");
const { randomArray } = require("../../../helpers");
module.exports =
	new DDCommand()
		.setName("donutfact")
		.addAlias("donutfacts")
		.setDescription("Get a random donut fact!")
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			const facts = [
				"Adolph Levitt invented the first automated doughnut machine. He called it the \"Wonderful Almost Human Automatic Donut Machine.\"",
				"Over 10 billion doughnuts are made in the U.S. each year",
				"Shamus Petherick set the record for the most powdered doughnuts eaten in 3 minutes when he ate six.",
				"Ten people in United States have the last name Doughnut or Donut.",
				"A glazed doughnut has about 240 calories, of which 120 are from fat.",
				"If a person added a doughnut a day, they would gain one pound every 10 days.",
				"National Donut Day is on the first Friday of every June.",
				"National Doughnut Appreciation Day is on November 5th each year.",
				"Donuts will kill you if you try to breathe them.",
				"Donuts will sometimes not give you facts.",
				"A chocolate glazed donut has 5 tsp of sugar."
			];
			const fact = facts[Math.floor(Math.random() * facts.length)];
			const embed =
				new DDEmbed(client)
					.setStyle("blank")
					.setTitle("Here's your donut fact!")
					.setDescription(fact)
					.setFooter(message.author.tag, message.author.displayAvatarURL());
			await message.channel.send(embed);
		});
