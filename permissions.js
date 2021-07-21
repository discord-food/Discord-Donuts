const { botOwners, employeeRole } = require("./auth.json");
const { Admins } = require("./sequelize");
const isBotOwner = (client, member) => {
	let indexes = ["184837412629774336", "187771864435785728"];
	if (indexes.includes(member.user.id)) return true;
	else return false;
};

const canCook = (client, member) => {
	const guild = client.guilds.find(g => g.roles.has(employeeRole));

	if (!guild) throw new Error("There was a problem locating the employee role.");
	if (!guild.members.get(member.id)) return false;

	return guild.members.get(member.id).roles.has(employeeRole);
};

const canEditGuild = (client, member) => member.hasPermission("MANAGE_GUILD");

const isBotAdmin = async(client, member) => {
	if (isBotOwner(client, member)) return true;

	const guild = client.guilds.find(g => g.roles.has(employeeRole));

	if (!guild) throw new Error("There was a problem locating the employee role");
	if (!guild.members.get(member.id)) return false;
	const x = await Admins.findOne({ where: { id: member.id } });
	if (x !== null) return true;
	return guild.members.get(member.id).hasPermission("MANAGE_MESSAGES");
};


const everyone = () => true;

module.exports = {
	isBotOwner: isBotAdmin,
	canCook,
	everyone,
	canEditGuild,
	isBotAdmin,
};
