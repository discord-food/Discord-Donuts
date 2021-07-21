const DDEmbed = require("../../../structures/DDEmbed.struct");
const DDCommand = require("../../../structures/DDCommand.struct");

const { everyone } = require("../../../permissions");
const { findUser } = require("../../../helpers");
const { Donuts } = require("../../../sequelize");
const prettyms = require("pretty-ms");
module.exports =
	new DDCommand()
		.setName("steal")
		.addAliases("rob")
		.setDescription("Steal some donuts from a user.")
		.addSyntax("user", "id|mention", true)
		.setPermissions(everyone)
		.setFunction(async(message, args, client, account, cooldown) => {
			if (Number(cooldown.steal) + 43200000 > Date.now()) return message.channel.send(`Please wait ${prettyms((Number(cooldown.steal) + 43200000) - Date.now(), { verbose: true })} before using this command again.`);
			const user = await findUser(client, message, args, 0, false, true);
			if (!user) return;
			if (user.id === message.author.id) return message.channel.send("You can't steal from yourself!");
			const useracc = (await Donuts.findOrCreate({ where: { id: user.id }, defaults: { id: user.id, donuts: 0 } }))[0];
			const success = Math.randint(10) > 6;
			if (useracc.donuts < 10) return message.channel.send(`You can't steal from ${user.tag}, they only have ${useracc.donuts} donuts.`);
			await cooldown.update({ steal: Date.now() });
			if (success) {
				const robbed = Math.min(Math.floor(useracc.donuts * 0.4), 200 + Math.floor(Math.random() * 1000));
				await message.channel.send(`You successfully robbed their donuts! You have stolen ${robbed} donuts from ${user.tag}.`);
				await useracc.update({ donuts: useracc.donuts - robbed });
				await account.update({ donuts: account.donuts + robbed });
			} else {
				const fine = Math.min(Math.floor(account.donuts * 0.2131), 1000);
				await message.channel.send(`You got caught and were fined ${fine} donuts.`);
				await account.update({ donuts: account.donuts - fine });
			}
		});
