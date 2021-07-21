const DDCommand = require("../../structures/DDCommand.struct");
const { channels: { ticketChannel }, employeeRole, mainServer, dutyRole, awayRole } = require("../../auth.json");
const { AdvancedArray } = require("multipurpose-utils");
const { everyone } = require("../../permissions");
module.exports =
	new DDCommand()
		.setName("onduty")
		.addAliases("on-duty")
		.setDescription("Returns all the workers that are currently on duty.")
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			const onduty = client.guilds.get(mainServer).roles.get(dutyRole).members.map(x => x.id);
			const avaliable = AdvancedArray.from(onduty)
			.subtract(client.guilds.get(mainServer).roles.get(awayRole).members.map(x => x.id))
			.filter(x => client.users.get(x).presence.status !== "offline");

			await message.channel.send(`
**__Avaliable Workers__** - ***CURRENTLY BROKEN:*** 
\`\`\`ini
[[ ${avaliable.length} workers avaliable. ]]
${avaliable.map(x => `[${client.users.get(x).tag}], ID: ${x}`).join(",\n")}
\`\`\`			`);
		});
