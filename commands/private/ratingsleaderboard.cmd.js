const DDCommand = require("../../structures/DDCommand.struct");
const DDEmbed = require("../../structures/DDEmbed.struct");
const { everyone } = require("../../permissions");
const { mainServer } = require("../../auth");
const { Ratings, Orders } = require("../../sequelize");
module.exports =
	new DDCommand()
		.setName("ratingsleaderboard")
		.addAliases("ratingslb", "ratingstop")
		.addShortcuts("rlb")
		.addSyntax("start", "number")
		.addSyntax("size", "number")
		.setDescription("Lists the top 10 workers with the highest ratings!")
		.setPermissions(everyone)
		.setFunction(async(message, args, client, account) => {
			let start = +args[0] - 1 || 0;
			let size = +args[1] || 10;
			const embed = new DDEmbed(client)
				.setStyle("blank")
				.setTitle("Ratings Leaderboard")
				.setDescription("The ratings leaderboard.");
			const allRatings = await Ratings.findAll({ order: [["average", "DESC"]] });
			if (size - start > allRatings.length) return message.channel.send("INDEX OUT OF BOUNDS");
			const ratings = await Ratings.findAll({ order: [["average", "DESC"]], limit: start + size });
			ratings.splice(0, start);
			for (const rating of ratings) {
				const all = [rating.rate1, rating.rate2, rating.rate3, rating.rate4, rating.rate5];
				const allm = [rating.rate1, rating.rate2 * 2, rating.rate3 * 3, rating.rate4 * 4, rating.rate5 * 5];
				const i = ratings.indexOf(rating) + start;
				if (!client.users.get(rating.id)) return rating.destroy();
				embed.addField(`[${i + 1}] ${client.users.get(rating.id).tag}`, `Average: ${allm.reduce((a, b) => a + b) / all.reduce((a,b) => a + b)} stars. | ${all.reduce((a,b) => a + b)} ratings.`);
			}
			await message.channel.send(embed);
		});
