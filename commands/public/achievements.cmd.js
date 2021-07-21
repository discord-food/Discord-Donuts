const DDEmbed = require("../../structures/DDEmbed.struct");
const DDCommand = require("../../structures/DDCommand.struct");

const { Orders, Op, Achievements } = require("../../sequelize");
const { everyone } = require("../../permissions");
const { messageAlert, findUser, awardIds, chunk, addAchievement } = require("../../helpers");
const { channels: { ticketChannel } } = require("../../auth.json");

module.exports =
	new DDCommand()
		.setName("achievements")
		.addAlias("awards")
		.addShortcuts("acv")
		.setDescription("Check yours or someone else's achievements.")
		.addSyntax("user", "user")
		.addSyntax("pagenum", "number")
		.setPermissions(everyone)
		.setFunction(async(message, args, client, account) => {
			let page = 0;
			if (!isNaN(args[1]) && awardIds.chunk(10).length > args[1] && args[1] > 0) page = Number(args[1]) - 1;
			const yes = "<:yes:501906738119835649>";
			const no = "<:no:501906738224562177>";
			const user = await findUser(client, message, args, 0, true);
			if (!user) return;
			for (const x of awardIds) {
				if (await x.percent(client, user) >= 1) await addAchievement(user.id, x.id);
			}
			const achievements = await Achievements.findAll({ where: { id: user.id } });
			const amapped = await Promise.all(achievements.map(a => a.awardId));
			const embed = new DDEmbed(client)
				.setTitle(`${user.tag}'s Achievements`)
				.setDescription(`They have unlocked ${amapped.length} achievement(s). Page ${page + 1} of ${Math.ceil(awardIds.length / 10)}`)
				.setStyle("blank");
			const groupedAwardIds = awardIds.partition(x => amapped.includes(x.id));
			const fields = [];
			for (const ach of groupedAwardIds[0]) {
				fields.push({ name: `${yes} ${ach.name} [DONE]`, value: `${ach.description}` });
			}
			for (const ach of groupedAwardIds[1]) {
				fields.push({ name: `${no} ${ach.name} [${Number((await ach.percent(client, user) * 100).toFixed(2))}%]`, value: `${ach.hint}` });
			}
			const chunkedAwardFields = fields.chunk(10);
			let current = chunkedAwardFields[page];
			for (const f of current) {
				embed.addField(f.name, f.value);
			}
			await message.channel.send(embed);
		});
