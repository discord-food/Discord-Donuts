const { post } = require("node-superfetch");
const util = require("util");
const ss = require("string-similarity");
const DDEmbed = require("./structures/DDEmbed.struct");
const permissions = require("./permissions");
const DDCommand = require("./structures/DDCommand.struct");
const { Sequelize, Orders, Op, Applications, WorkerInfo, Achievements, Items, Trees, Donuts } = require("./sequelize");
const { Collection } = require("discord.js");
const empty = "​";
const { employeeRole, mainServer, dutyRole, awayRole, channels, botlists } = require("./auth.json");
const { findBestMatch } = require("string-similarity");
const methods = require("./methods");
const updateDB = async database => database.sync({ alter: true });
const timeout = delay => new Promise(resolve => setTimeout(resolve, delay));
const checkAllMilestones = async client => {
	const all = await WorkerInfo.all();
	for (let worker of all) {
		checkMilestones(client, worker);
	}
};
const { AdvancedArray } = require("multipurpose-utils");
const getActiveWorkers = client => {
	const onduty = client.guilds.get("294619824842080257").roles.get("718518940996861982").members.map(x => x.id);
	const avaliable = AdvancedArray.from(onduty)
		.subtract(client.guilds.get("294619824842080257").roles.get("844647594134601748").members.map(x => x.id))
		.filter(x => client.users.get(x).presence.status !== "offline");
	return avaliable;
};
const generateProgress = (fill, empt, n, x) => fill.repeat(n) + empt.repeat(x - n);
const checkMilestones = (client, worker) => {
	const milestones = require("./milestones");
	const member = client.guilds.get(mainServer).members.get(worker.id);
	if (!member) return worker.destroy();
	const user = member.user;
	const sorted = Object.values(milestones).sort((a, b) => b.int - a.int);
	const m = sorted.find(x => worker.cooks + worker.delivers >= x.int);
	if (!m) return;
	if (!member.roles.has(m.id)) {
		member.roles.add([m.id]);
		const embed = new DDEmbed(client)
			.setStyle("blank")
			.setTitle(`${user.tag} has reached a milestone!`)
			.setDescription(`${user}, you have reached ${m.int} cooks and delivers! You have recieved the role **${m.shortname}**!`)
			.setFooter(user.tag, user.displayAvatarURL());
		client.channels.get(channels.kitchenChannel).send(embed);
	}
	const others = sorted.filter(x => member.roles.has(x.id) && x.id !== m.id);	/*
	for (let m in milestones) {
		let ms = milestones[m].id;
		let mi = milestones[m];
		if (worker.cooks + worker.delivers >= m) {
			if (!member.roles.has(ms)) {
				member.roles.add([ms]);
				const embed = new DDEmbed(client)
					.setStyle("blank")
					.setTitle(`${user.tag} has hit a milestone!`)
					.setDescription(`${user}, you have reached ${m} cooks and delivers! You have recieved the role **${mi.shortname}**!`)
					.setFooter(user.tag, user.displayAvatarURL());
				client.channels.get(kitchenChannel).send(embed);
			} else if (Object.values(milestones).some(x=>member.roles.has()))
		} else if (member.roles.has(ms)) {
			member.roles.remove([ms]);
		}
	}
	*/
};
let rounding = {};
rounding.roundUp = (x, y) => (Math.round(x / y) + 1) * y;
rounding.round = (x, y) => Math.round(x / y) * y;
rounding.roundDown = (x, y) => (Math.round(x / y) - 1) * y;
const calcUptime = int => {
	let time = 0;
	let days = 0;
	let hrs = 0;
	let min = 0;
	let sec = 0;
	let temp = Math.floor(int / 1000);
	sec = temp % 60;
	temp = Math.floor(temp / 60);
	min = temp % 60;
	temp = Math.floor(temp / 60);
	hrs = temp % 24;
	temp = Math.floor(temp / 24);
	days = temp;
	const upText = `${days} days, ${hrs} hours, ${min} minutes, ${sec} seconds.`;
	return upText;
};

const generateID = length => {
	let pos = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890";
	let str = "0";
	for (let i = 0; i < length - 1; i++) {
		str += pos.charAt(Math.floor(Math.random() * pos.length));
	}
	return str;
};


const status = code => {
	const statuses = { [-1]: "Reported", 0: "Unclaimed", 1: "Claimed", 2: "Cooking", 3: "Cooked", 4: "Delivered", 5: "Deleted", 6: "Expired", 7: "Cancelled" };
	return statuses[code] || "Invalid";
};

const getOrder = async(display, message, args, filter, override, argn = 0) => {
	let sfilt;
	if (!filter) {
		sfilt = { [Op.lt]: 4 };
	} else if (filter === "all") {
		sfilt = { [Op.gt]: -1 };
	} else if (filter.length) {
		sfilt = { [Op.between]: filter };
	} else if (!isNaN(filter)) {
		sfilt = Number(filter);
	}
	if (!args[argn]) {
		if (!await Orders.count({ where: { status: sfilt } })) {
			await message.channel.send(`There are currently no orders to ${display}.`);
			return false;
		}
		await message.channel.send(`Which of the following orders do you want to ${display}?`);
		const o = await Orders.findAll({ where: { status: sfilt }, order: [["createdAt", "DESC"]] });
		let dis = o.map((x, i) => `[${i + 1}]: ${x.id} - ${x.description} (${status(x.status)})`);
		await message.channel.send(`Please respond with a number.\n\`\`\`ini\n${dis.join("\n")}\n\`\`\``);
		const coll = await message.channel.awaitMessages(m => !isNaN(m.content) && m.author.id === message.author.id, { max: 1, time: 17000 });
		if (!coll.size) {
			await message.channel.send("You did not respond.");
			return false;
		}
		const ind = Number(coll.first().content) - 1;
		if (!o[ind]) {
			await message.channel.send("Invalid response.");
			return false;
		}
		return o[ind];
	} else {
		const order = await Orders.findById(args[argn]);
		const torder = await Orders.findOne({ where: { id: args[argn], status: sfilt } });
		if (!order) {
			await message.channel.send("<:no:501906738224562177> **There was an issue fetching that order, please try again.**");
			return false;
		} else if (!torder && !override) {
			await message.channel.send("<:no:501906738224562177> **The fetched order did not meet the status requirements.**");
			return false;
		}
		return order;
	}
};
const generateTicket = (client, order) => {
	const user = client.users.get(order.get("user"));
	const channel = client.channels.get(order.get("channel"));
	return new DDEmbed(client)
		.setStyle("blank")
		.setTitle("New Ticket")
		.setDescription(`${user.tag} (ID:${user.id}) has placed an order!`)
		.addField("🎫 Ticket Description", order.description)
		.addField("🆔 Ticket ID", order.id)
		.addField("ℹ Guild Information", `Guild: **${channel.guild.name} (ID:${channel.guild.id})**\nChannel: **${channel.name} (ID:${channel.id})**`)
		.addField("<:yes:501906738119835649> Ticket Status", `${status(order.status)}${order.status === 1 ? ` by ${client.users.get(order.claimer).tag}` : ""}`)
		.setFooter(user.tag, user.displayAvatarURL());
};
const getText = async(message, display = "Respond with text.", time = 40000, filter = m => m.author.id === message.author.id) => {
	await message.channel.send(display);
	const res = await message.channel.awaitMessages(filter, { time, max: 1 });
	if (!res.size) return void message.channel.send("No response. Cancelled.");
	return res.first().content;
};
const getIndex = async(message, array = [], display = "item") => {
	const mapped = array.map((x, i) => `[${i + 1}] ${x}`);
	const index = await getText(message, `${message.author}, please reply with the index of the ${display}.
\`\`\`ini
${mapped.slice(0,10).join("\n").substr(0, 1500)}
\`\`\`
`, 40000, m => !isNaN(m.content) && m.content > 0 && m.content <= array.length);
	if (!index) return false;
	return { index: index - 1, item: array[index - 1] };
};
const findUser = async(client, message, args, argn, autoself = false, onlyargn = args !== undefined) => {
	const namelist = client.guilds.get(mainServer).members.map(x => x.user.tag).concat(
		message.guild.members.map(x => x.tag).filter(x => x)
	).concat(
		client.users.map(x => x.tag).filter(x => x)
	)
		.unique();
	if (!argn) argn = 0;
	let selecting = args.slice(argn, onlyargn ? argn + 1 : args.length).join(" ");
	let user;
	if (!args[argn] && autoself) {
		user = message.author;
	} else if (!args[argn] && !autoself) {
		message.channel.send("You did not provide a user.");
		return false;
	} else if (message.mentions.users.first()) {
		user = message.mentions.users.first();
	} else if (!isNaN(args[argn])) {
		user = client.users.get(args[argn]);
		if (!user) {
			message.channel.send("That is not a valid id.");
			return false;
		}
	} else {
		let match = ss.findBestMatch(selecting, namelist);
		let names = match.ratings.sort((a, b) => b.rating - a.rating).slice(0, 5).map(x => x.target);
		const nameDict = await getIndex(message, names);
		if (!nameDict) return;
		const name = nameDict.item;
		user = client.users.find(x => x.tag === name) || message.guild.members.find(x => x.tag === name).user;
	}
	if (!user) throw new Error("No user?");
	return user;
};
const wilsonRaw = require("wilson-score");
const wilson = (up, down) => wilsonRaw(up, up + down);
const calculateRating = (onestar, twostar, threestar, fourstar, fivestar) => wilson((0.25 * twostar) + (0.5 * threestar) + (0.75 * fourstar) + fivestar, (0.25 * fourstar) + (0.5 * threestar) + (0.75 * twostar) + onestar);
const messageAlert = async(client, text, channel = channels.kitchenChannel, ping = false) => {
	text = text.replace("[orderCount]", await Orders.count({ where: { status: { [Op.lt]: 1 } } }));
	let unclaimed = await Orders.count({ where: { status: { [Op.lt]: 1 } } });

	const embed =
		new DDEmbed(client)
			.setStyle("blank")
			.setTitle("Order Notification")
			.setDescription(text)
			.setTimestamp();
	if (ping) client.channels.get(channel).send(`<@&${dutyRole}>`);
	client.channels.get(channel).send(embed);
};
const getCustomReactions = async(display, reactions, message) => {
	const filter = (reaction, user) => reactions.includes(reaction.emoji.id) && user.id === message.author.id;
	let msg = await message.channel.send(display);
	for (let r of reactions) {
		msg.react(r);
	}
	const col = await msg.awaitReactions(filter, { time: 15000, max: 1 });
	if (!col.size) return false;
	return reactions.indexOf(col.first().emoji.id);
};
const autoDeliver = async(client, id) => {
	const finalOrder = await Orders.findOne({ where: { id: id, status: 3 } });
	if (!finalOrder) return;

	const channel = client.channels.get(finalOrder.channel);
	const user = channel.guild.members.get(finalOrder.user);
	const url = finalOrder.url;

	(await client.channels.get(channels.ticketChannel).messages.fetch(finalOrder.ticketMessageID)).delete();

	if (channel.permissionsFor(client.user.id).has("EMBED_LINKS")) {
		let embed = new DDEmbed(client)
			.setStyle("blank")
			.addField(`Support Us`, `To donate, run the command **D!donate**.`, true)
			.addField(`Our Discord`, `Click [here](https://discord.gg/WJgamKm) to join our Discord!`, true)
			.addField(`Rate your cook`, `To rate, run the command d!rate cook [1-5]!`, true)
			.setImage(url);

		channel.send(`**${user}, here's your order. Enjoy!**`, embed);
	} else {
		channel.send(`${user}, here's your order. Enjoy!\n**${url}**\n\nIf you are interested in supporting us, you may donate by running \`d!donate\`.\nIf you'd like to become an employee, be sure to join our Discord (**https://discord.gg/WJgamKm**) server! If you want to rate your cook, run \`d!rate cook [1-5]\`!`);
	}
	await finalOrder.update({ status: 4 });
	messageAlert(client, "An order was just automatically delivered. There are now [orderCount] orders left.");
};

const applicationAlert = async(client, text, channel = channels.applicationChannel) => {
	const apps = await Applications.findAll({ where: {} });
	text = text.replace("[applicationCount]", apps.length);
	const embed =
		new DDEmbed(client)
			.setStyle("blank")
			.setTitle("Application Alert")
			.setDescription(text)
			.setThumbnail("https://cdn.discordapp.com/attachments/491045091801300992/509907961272074270/news.png");
	if (await Applications.count({ where: {} }) !== 0) {
		embed.addField("LIST OF APPLICATIONS", empty);
		apps.forEach(app => {
			const i = apps.indexOf(app) + 1;
			const tag = client.users.get(app.id) ? client.users.get(app.id).tag : "Unknown User";
			embed.addField(`[${i}] ${tag}`, `Application Code: \`${app.code}\``);
		});
	}
	client.channels.get(channel).send(embed);
};
const updateWebsites = client => {
	if (client.user.id !== "335637950044045314") return;
	util.log("[Discord] Updating websites...");
	post(`https://discordbots.org/api/bots/335637950044045314/stats`)
		.set("Authorization", botlists.discordbotsToken)
		.send({ server_count: client.guilds.size })
		.then(util.log("[Discord] Updated discordbots.org stats."))
		.catch(e => util.log("[Discord] ", e.body));
	post(`https://bots.discord.pw/api/bots/335637950044045314/stats`)
		.set("Authorization", botlists.discordpwToken)
		.send({ server_count: client.guilds.sizet })
		.then(util.log("[Discord] Updated bots.discord.pw stats."))
		.catch(e => util.log("[Discord] ", e.body));
	post(`https://bots.discordlist.net/api`)
		.set("Authorization", botlists.discordlistToken)
		.send({ server_count: client.guilds.size })
		.then(util.log("[Discord] Updated bots.discordlist.net stats."))
		.catch(e => util.log("[Discord] ", e.body));
	post(`https://listcord.com/api/bot/335637950044045314/guilds`)
		.set("Content-Type", "application/json")
		.set("token", botlists.listcordToken)
		.send({ guilds: client.guilds.size })
		.then(util.log("[Discord] Updated Listcord stats."))
		.catch(e => util.log("[Discord] ", e.body));
};

class Item {
	constructor(id, name, description, hint, { price = 0, limit = Infinity, showInShop = true, canUse = true, disappearAfterUse = true } = {}) {
		this.id = id;
		this.name = name;
		this.description = description;
		this.hint = hint;
		this.show = showInShop;
		this.disappear = disappearAfterUse;
		this.canUse = canUse;
		this.useFunc = (client, user) => "None";
		this.limit = limit;
		this.price = price;
	}
	async use(client, user, message) {
		const item = await Items.findOne({ where: { id: user.id, itemId: this.id } });
		if (!this.canUse) return false;
		if (!item) return false;
		const success = await this.useFunc(client, user, message);
		if (!success) return;
		if (this.disappear) this.remove(user.id);
	}
	setUseFunc(func) {
		this.useFunc = func;
		return this;
	}
	async has(userId) {
		const inv = await Items.findAll({ where: { id: userId } });
		if (!inv) return false;
		if (!inv.some(async i => i.itemId === this.id)) return false;
		return true;
	}
	async add(userId, num = 1) {
		const item = await this.create(userId);
		if (item.limit <= item.count) return false;
		await item.update({ count: item.count + num });
		return item;
	}
	async create(userId) {
		const id = this.id;
		const count = await Items.count();
		return (await Items.findOrCreate({ where: { itemId: id, id: userId }, defaults: { itemId: id, id: userId, count: 0 } }))[0];
	}
	async remove(userId, num = 1) {
		const item = await this.create(userId);
		await item.update({ count: item.count - num });
		if (item.count < 1) await item.destroy();
		return item;
	}
	async count(userId) {
		return (await Items.findOne({ where: { id: userId, itemId: this.id } }) || { count: 0 }).count;
	}
}
class ItemList extends Array {
	get(itemSearch) {
		if (!isNaN(itemSearch)) return this.find(item => item.id === +itemSearch);
		return Object.findMatch(this, "name", itemSearch);
	}
}
const itemIds = new ItemList(
	new Item(0, "Tree Fertilizer", "Use this to instantly double your donut tree's age.", "Donut tree fertilizer.", { price: 1120 })
		.setUseFunc(async(client, user, message) => {
			const tree = await Trees.findById(user.id);
			if (!tree) {
				message.channel.send("You don't have a donut tree!");
				return false;
			}
			let add = tree.age * 2;
			if (tree.maxAge < add) add = tree.maxAge;
			await tree.update({ age: add });
			await message.channel.send(`You have used a tree fertilizer! Your tree is now at age ${add}/`);
			return true;
		}),
	new Item(1, "Gold Bar", "Shiny!", "It's made of gold.", { price: 1600, limit: 1, canUse: false })
);

class Award {
	constructor(id, name, description, hint, progressFunction = () => 0) {
		this.id = id;
		this.name = name;
		this.description = description;
		this.hint = hint;
		this.percent = progressFunction;
	}
	setFunction(func) {
		this.percent = func;
		return this;
	}
}
const awardIds = [
	new Award(0, "Customer", "You have ordered your first donut!", "Order a donut.")
		.setFunction(async(client, user) => {
			const uo = await Orders.findOne({ where: { user: user.id } });
			return uo ? 1 : 0;
		}),
	new Award(1, "Minimum Wage Worker", "You have been hired at Discord Donuts!", "Get hired and become a worker.")
		.setFunction(async(client, user) => await mainMember(client, user.id) ? (await mainMember(client, user.id)).roles.has("335631155770687488") ? 1 : 0 : 0),
	new Award(2, "Legally Rich", "You are now rich!", "Reach 2000 donuts.")
		.setFunction(async(client, user) => {
			const acc = await Donuts.findById(user.id) || { donuts: 0 };
			return acc.donuts >= 2000 ? 1 : acc.donuts / 2000;
		})

];
const checkOrders = async client => {
	const tc = await client.channels.get(channels.ticketChannel);
	const dc = await client.channels.get(channels.deliveryChannel);
	const unclaimed = await Orders.findAll({ where: { status: 0 } });
	const cooking = await Orders.findAll({ where: { status: 2 } });
	const cooked = await Orders.findAll({ where: { status: 3 } });
	unclaimed.forEach(async order => {
		if (order.expireTimeout <= new Date()) {
			(await tc.messages.fetch(order.ticketMessageID)).delete();
			await order.update({ status: 6 });
			await messageAlert(client, "<:no:501906738224562177> **An order has expired, there are now [orderCount] orders left**");
			await client.users.get(order.user).send("Your order has expired, sorry about that! Please order another.");
		}
	});
	cooking.forEach(async order => {
		if (order.cookTimeout <= new Date()) {
			const user = client.users.get(order.user);
			const channel = client.channels.get(order.channel);
			if (!channel) return order.destroy();
			const embed = new DDEmbed(client)
				.setStyle("white")
				.setTitle("An order has finished cooking!")
				.setDescription(`Ticket \`${order.id}\` has completed cooking and is ready to be delivered!`)
				.addField(":computer: Ticket Information", `This ticket came from ${channel.guild.name} (${channel.guild.id}) in ${channel.name} (${channel.id}).`);
			//await client.users.get(order.user).send("Great news! Your order has just finished cooking, it'll be delivered to your server shortly.");
			await dc.send(`${client.users.get(order.claimer)}`);
			await dc.send(embed);
			await order.update({ status: 3, deliverTimeout: new Date((60000 * 8) + Date.now()), deliverTotal: 60000 * 8 });
		}
	});

	cooked.forEach(async order => {
		if (order.deliverTimeout <= new Date()) {
			await autoDeliver(client, order.id);
			await order.update({ status: 4 });
		}
	});
};
/*
const checkOrders = client => {
	setInterval(async() => {
		const cookingOrders = await Orders.findAll({ where: { status: { [Op.lt]: 5 } } });
		cookingOrders.forEach(async order => {
			if (order.status < 1) {
				if (order.timeLeft < 1) {
					await order.update({ status: 6 });
					(await client.channels.get(ticketChannel).messages.fetch(order.ticketMessageID)).delete();
					await messageAlert(client, "<:no:501906738224562177> **An order has expired, there are now [orderCount] orders left**");
					return client.users.get(order.user).send("Your order has expired, please try again");
				}

				await order.decrement("timeLeft", { by: 1 });
			} else if (order.status === 2) {
				if (order.cookTimeLeft < 1) {
					const user = client.users.get(order.user);
					const channel = client.channels.get(order.channel);
					const embed = new DDEmbed(client)
						.setStyle("white")
						.setTitle("An order has finished cooking!")
						.setDescription(`Ticket \`${order.id}\` has completed cooking and is ready to be delivered!`)
						.addField(":computer: Ticket Information", `This ticket came from ${channel.guild.name} (${channel.guild.id}) in ${channel.name} (${channel.id}).`);
					await order.update({ status: 3 });
					await client.users.get(order.user).send("Great news! Your order has just finished cooking, it'll be delivered to your server shortly.");
					await client.channels.get(deliveryChannel).send(`${client.users.get(order.claimer)}`);
					return client.channels.get(deliveryChannel).send(embed);
				}

				await order.decrement("cookTimeLeft", { by: 1 });
			} else if (order.status === 3) {
				if (order.deliveryTimeLeft < 1) {
					await autoDeliver(client, order.id);
					return order.update({ status: 4 });
				}

				await order.decrement("deliveryTimeLeft", { by: 1 });
			}
		});
	}, 60000);
};*/
const generateSize = dimensions => {
	const sizes = { tiny: [0, 60000], small: [60000, 125000], medium: [125000, 270000], large: [270000, 360000], extralarge: [360000, 440000], massive: [440000, 560000] };
	const asize = dimensions;
	let res;
	for (let size in sizes) {
		if (asize >= sizes[size][0] && asize <= sizes[size][1]) {
			res = size;
		}
		if (asize >= sizes[Object.keys(sizes).reverse()[0]][0]) res = "gigantic";
		if (asize < 0) res = "somehow negative";
	}
	if (!res) res = "unknown";
	return res;
};
Array.prototype.groupBy = function groupBy(prop, moreprop) {
	return this.reduce((groups, item) => {
		const val = prop.split(".").reduce((o, i) => o[i], item);
		groups[val] = groups[val] || [];
		groups[val].push(item);
		return groups;
	}, {});
};
const listCommands = (client, message, { display, show, group, filter }) => {
	const sorted = Array.from(client.commands);
	const sortedmap = new Collection(sorted);
	const uniqueCommands = sortedmap.array()
		.filter((val, index, arr) => arr.indexOf(val) === index);
	Object.keys(uniqueCommands.groupBy(group)).forEach(async sectName => {
		const sectCommands = uniqueCommands.groupBy(group)[sectName];
		if (!permissions[sectName](client, message.member)) return;
		chunk(25)(sectCommands).forEach(async(section, index, arr) => {
			const embed = new DDEmbed(client)
				.setStyle("blank")
				.setFooter(display)
				.setTitle(`Discord Donuts ${show}, Category: [${sectName}], (Page ${index + 1} of ${arr.length})`)
				.setThumbnail("https://images.emojiterra.com/twitter/512px/2754.png");
			section.forEach(command => {
				if (!(command instanceof DDCommand)) return;
				if (command.getHidden()) return;
				if (!command.getPermissions(client, message.member)) return;
				if (!filter(command)) return;
				const label = command.getLabel() ? `[${command.getLabel()}] ` : "";
				embed.addField(`${command.getName()}${command.getAliases().map(x => `, ${x}`).join("")}`, `${label}${command.getDescription()}`);
			});
			try {
				await message.author.send(embed);
			} catch (e) {
				return message.channel.send("<:no:501906738224562177> **I need to be able to send the list of commands to your DM.**");
			}
		});
	});
};
const mainMember = (client, userId) => client.guilds.get(mainServer).members.get(userId);
const hasRole = (client, user, roleId) => client.guilds.get(mainServer).members.get(user.id) ? client.guilds.get(mainServer).members.get(user.id).roles.has(roleId) : false;
const chunk = size => arr =>
	arr.reduceRight((acc, x, index) => {
		if ((index + 1) % size === 0) acc.unshift([]);
		acc[0].push(x);
		return acc;
	}, [[]]);
const addAchievement = async(userId, id) => {
	const count = await Achievements.count();
	return Achievements.findOrCreate({ where: { awardId: id, id: userId }, defaults: { awardId: id, id: userId } });
};
const isurl = str => {
	try {
		new URL(str); // eslint-disable-line no-new, no-undef
		return true;
	} catch (err) {
		return false;
	}
};
const getTime = (n, m) => {
	const raw = { ms: 1, s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000, mo: 2592000000, y: 31556952000 };
	const named = { milliseconds: raw.ms };
	const measure = { ...raw, ...named };
	return Number(n) * measure[m];
};
const _require = path => {
	delete require.cache[require.resolve(path)];
	return require(path);
};
const clearRequireCache = path => delete require.cache[require.resolve(path)];
const createOrder = async(message, { user = message.author, description = "", parameters = new Map, account } = {}) => {
	const client = message.client;
	let generatedID;
	do generatedID = generateID(7);
	while (await Orders.findById(generatedID));
	if (parameters.get("id")) {
		let a = 0;
		// eslint-disable-next-line max-statements-per-line
		do { generatedID = parameters.get("id").split(" ")[0] + (a ? a : ""); a++; }
		while (await Orders.findById(generatedID));
	}
	let claimer = null;
	let st = 0;
	let m = "";
	let us;
	/*const cl = parameters.get("cook");
	if (client.guilds.get(mainServer).roles.get(employeeRole).members.map(member => member.id).includes(cl)) {
		claimer = cl;
		st = 1;
		m = ` You have set your cook to **${client.users.get(cl).tag}**. They will prepare your order.`;
		us = client.users.get(cl);
	} else if (cl) {
		message.channel.send("That is not a valid cook id.");
	}*/
	if (account) await account.update({ donuts: account.donuts + 25 + Math.floor(Math.random() * 50) });
	client.counting += 1;
	const order = await Orders.create({
		id: generatedID,
		user: user.id,
		usertag: user.tag,
		description: description,
		channel: message.channel.id,
		status: st,
		claimer: claimer,
		deliverer: null,
		url: null,
		ticketMessageID: null,
		timeLeft: 20,
		cookTimeLeft: 3,
		deliveryTimeLeft: 7,
		expireTimeout: new Date(Date.now() + (60000 * 20)),
		expireTotal: 60000 * 20,
		cookTimeout: new Date(Date.now() + (60000 * 3)),
		deliverTimeout: new Date(Date.now() + (60000 * 10)),
		tipped: false,
		cookRated: false,
		deliverRated: false
	});
	client.orders.push(order);
	await message.channel.send(`<:yes:501906738119835649> **Successfully placed your order for \`${description}\`. Your ticket ID is \`${generatedID}\`, please wait patiently for your order to be processed.**${m}`);
	await addAchievement(user.id, 0);
	await messageAlert(client, "An order has been placed, there are now [orderCount] order(s) to claim\n**Order Info**\n", channels.kitchenChannel, true);
	const embed = new DDEmbed(client)
		.setTitle(`Ticket Information for \`${order.id}\``)
		.setDescription(`Description: **\`${order.description}\`**`)
		.addField("ℹ Information", `Guild: **${message.channel.guild.name} (ID:${message.channel.guild.id})**\nChannel: **${message.channel.name} (ID:${message.channel.id})**\nUser: **${message.author.tag} (ID:${message.author.id})**`);
	if (st) embed.addField("Chosen Cook", ` **${us.tag} (ID:${us.id})**`);
	client.channels.get(channels.kitchenChannel).send(embed);
	if (st) client.channels.get(channels.kitchenChannel).send(`<@${us.id}>, \`${order.id}\`'s orderer wants you to prepare their order! If you do not want to, please do \`d!unclaim ${order.id}\`.`);
};
module.exports = {
	generateID,
	status,
	generateTicket,
	timeout,
	calcUptime,
	autoDeliver,
	updateWebsites,
	messageAlert,
	checkOrders,
	isurl,
	chunk,
	applicationAlert,
	checkMilestones,
	rounding,
	generateSize,
	hasRole,
	checkAllMilestones,
	mainMember,
	updateDB,
	generateProgress,
	getCustomReactions,
	findUser,
	getOrder,
	listCommands,
	awardIds,
	addAchievement,
	itemIds,
	getActiveWorkers,
	wilson,
	calculateRating,
	getTime,
	createOrder,
	_require,
	clearRequireCache,
	getText,
	getIndex
};
