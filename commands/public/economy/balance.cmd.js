const DDEmbed = require("../../../structures/DDEmbed.struct");
const DDCommand = require("../../../structures/DDCommand.struct");

const { everyone } = require("../../../permissions");
const { findUser } = require("../../../helpers");
const { Donuts } = require("../../../sequelize");
module.exports =
	new DDCommand()
		.setName("balance")
		.addAliases("bal", "donuts")
		.setDescription("Check your donut balance.")
		.addSyntax("user", "id|mention")
		.setPermissions(everyone)
		.setFunction(async(message, args, client, account) => {
			const user = await findUser(client, message, args, 0, true);
			if (!user) return;
			const useracc = (await Donuts.findOrCreate({ where: { id: user.id }, defaults: { id: user.id, donuts: 0 } }))[0];
			const embed =
				new DDEmbed(client)
					.setStyle("blank")
					.setTitle(`${user.tag}'s donut balance!`)
					.setDescription("Get more donuts by ordering donuts and working though d!work!")
					.addField("Donuts", useracc.donuts)
					.setThumbnail("https://images.emojiterra.com/twitter/512px/1f369.png");
			message.channel.send(embed);
		});
