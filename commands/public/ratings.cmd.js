const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { canCook, everyone } = require("../../permissions");
const { Ratings } = require("../../sequelize");
const { mainServer, employeeRole } = require("../../auth");
const { findUser } = require("../../helpers");
module.exports =
	new DDCommand()
		.setName("ratings")
		.setDescription("Checks a user's or your own ratings.")
		.addShortcuts("rts")
		.addSyntax("user", "id|mention", true)
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			const dstar = "<:rateVoid:515972037529960519>";
			const star = "<:rateFill:515972612137025576>";
			const hstar = "<:rateHalf:515980025393184786>";
			const generateStars = (n, x) => star.repeat(n) + dstar.repeat(x - n);
			let data = Ratings;
			let user = await findUser(client, message, args);
			if (!user) return;
			if (!canCook(client, message.member) && user.id === message.author.id) return message.channel.send("You are not a worker! Try `d!ratings @WORKER#HERE` instead.");
			const member = client.guilds.get(mainServer).members.get(user.id);
			if (!member) message.channel.send("<:no:501906738224562177> **The person seems to not be in this server.**");
			if (!await data.findById(user.id) && member ? !canCook(client, member) : !await data.findById(user.id)) return message.channel.send("They are not a worker!");
			const workerraw = await data.findOrCreate({ where: { id: user.id }, defaults: { id: user.id, rate1: 0, rate2: 0, rate3: 0, rate4: 0, rate5: 0 } });
			const worker = workerraw[0];
			const final = [worker.rate1, worker.rate2 * 2, worker.rate3 * 3, worker.rate4 * 4, worker.rate5 * 5];
			const finalsum = [worker.rate1, worker.rate2, worker.rate3, worker.rate4, worker.rate5];
			const fsum = final.reduce((a, b) => a + b, 0);
			let fav = finalsum.reduce((a, b) => a + b, 0);
			if (isNaN(fav)) fav = 0;
			let average = fsum / fav;
			if (isNaN(average)) average = 0;
			const ravg = Math.round(average * 10 / 5) * 5 / 10;
			const displays = Math.round(average * 10 / 5) * 5 / 10;
			const embed =
				new DDEmbed(client)
					.setStyle("blank")
					.setTitle(`${user.tag}'s Ratings`)
					.setDescription(`A list of ${user.tag}'s ratings. They have been rated ${fav} times.`)
					.setThumbnail("https://images.emojiterra.com/twitter/512px/1f31f.png");
			let i = 0;
			for (x of new Array(5)) {
				i++;
				embed.addField(`${generateStars(i, 5)} - ${worker[`rate${i}`]}`, `${worker[`rate${i}`]} ${["zero", "one", "two", "three", "four", "five"][i]} star ratings.`);
			}
			embed.addField(`${generateStars(Math.floor(average), 5)} - Average`, `Average star rating: ${average} stars.`);
			message.channel.send(embed);
		});
