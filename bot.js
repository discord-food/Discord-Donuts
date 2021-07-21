"use strict";
Object.defineProperty(global, "_true", {
	get() {
		return Math.random() < 0.96
	},
});
const readline_1 = require("readline");
const reader = readline_1.createInterface({
	input: process.stdin,
	output: process.stdout,
});
reader.on("line", async (input) => {
	if (!input)
		return;
	let response = "??";

	try {
		response = await eval(input);
	}
	catch (error) {
		response = error.message;
	}
	console.log(response);
});

const util = require("util");
const exec = util.promisify(require("child_process").exec);

const Discord = require("discord.js");
Object.defineProperty(Discord.GuildMember.prototype, "tag", {
	get() {
		if (this.nickname) return `${this.nickname}#${this.user.discriminator}`;
		return this.user.tag;
	},
});

const glob = require("glob");
const pms = require("pretty-ms");
const prettyms = n =>
	pms(n, {
		unitCount: 3,
		verbose: true,
	});
const DDClient = require("./structures/DDClient.struct");
const auth = require("./auth.json");
const {
	sequelize,
	Op,
	Orders,
	Blacklist,
	Prefixes,
	Absences,
	Achievements,
	Donuts,
	Cooldowns,
	WorkerInfo,
	MonthlyInfo,
	Admins,
	Ratings,
	EasyDelivers,
	PrecookedDonuts,
	Sequelize,
	Tracking,
	Event,
	EventInfo,
	Dishes,
	Trees,
	Teams,
} = require("./sequelize");
const s = require("./sequelize");
const sqlize = require("./sequelize");
const fs = require("fs-extra");
const { promisify } = require("util");
const appendFile = promisify(fs.appendFile);
const writeFile = promisify(fs.writeFile);
const {
	mainServer,
	employeeRole,
	awayRole,
	token,
	prefix,
	channels: {
		suggestionChannel,
		kitchenChannel,
		ticketChannel,
		guildLogChannel,
		testChannel,
		absenceChannel,
		eventChannel,
		hireLogChannel,
		botDMChannel,
		errorLogChannel,
		commandLogChannel,
		updatesChannel,
	},
} = require("./auth.json");
const { post } = require("r2");
const moment = require("moment-timezone");
const {
	mainMember,
	awardIds,
	addAchievement,
	updateDB,
	rounding,
	generateTicket,
	timeout,
	updateWebsites,
	messageAlert,
	applicationAlert,
	checkOrders,
	calculateRating,
	_require,
} = require("./helpers");
for (const a of [Blacklist,
	Prefixes,
	Absences,
	Achievements,
	Donuts,
	Cooldowns,
	WorkerInfo,
	MonthlyInfo,
	Admins,
	Ratings,
	EasyDelivers,
	PrecookedDonuts,
	Tracking,
	Event,
	EventInfo,
	Dishes, Orders,
	Trees]) { a.sync() }
const { canCook, isBotOwner } = require("./permissions");
const DDEmbed = require("./structures/DDEmbed.struct");
const client = new DDClient({
	shardCount: 5,
});
Orders.beforeCreate(async order => {
	const orderMsg = await client.channels
		.get(ticketChannel)
		.send(generateTicket(client, order));
	order.ticketMessageID = orderMsg.id;
});
Orders.beforeDestroy(async order => {
	(await client.channels
		.get(ticketChannel)
		.messages.fetch(order.ticketMessageID)).delete();
	await client.channels
		.get(order.channel)
		.send(
			"<:no:501906738224562177> **Your order has been deleted due to an error. Please try again.**"
		);
});
Orders.afterUpdate(async (order, options) => {
	if (order.status === 4 && options.fields.includes("status")) {
		await Dishes.create({ id: order.id });
	}
	try {
		if (!order.ticketMessageID) return;

		if (order.status > 3) return;

		(await client.channels
			.get(ticketChannel)
			.messages.fetch(order.ticketMessageID)).edit(
				generateTicket(client, order)
			);
	} catch (err) {
		console.error(err);
	}
});
Ratings.beforeUpdate(async (rating, options) => {
	const calculated = calculateRating(
		rating.rate1,
		rating.rate2,
		rating.rate3,
		rating.rate4,
		rating.rate5
	);
	rating.average = calculated;
	// await rating.save();
});

const methods = require("./methods");
client.setMaxListeners(Infinity);
client.on("guildMemberUpdate", async (oldMember, member) => {
	if (member.guild.id !== client.channels.get(ticketChannel).guild.id) return;
	if (!oldMember.roles.has(employeeRole) && member.roles.has(employeeRole)) {
		const embed = new DDEmbed(client)
			.setStyle("blank")
			.setTitle("New worker!")
			.setAuthor(
				member.user.tag,
				member.user.avatarURL({
					size: 2048,
					format: "png",
				})
			)
			.setDescription(
				`Welcome, ${member.user.tag
				}! Congratulations on becoming a worker! Check <#718259938064990259> for the basic commands and do d!help for other commands!`
			);
		await client.channels.get(kitchenChannel).send(embed);
		await client.channels
			.get(hireLogChannel)
			.send(`${member.user.tag} (${member.id}) is now a worker.`);
	}
	if (oldMember.roles.has(employeeRole) && !member.roles.has(employeeRole)) {
		const embed = new DDEmbed(client)
			.setStyle("blank")
			.setTitle("A worker has left...")
			.setAuthor(
				oldMember.user.tag,
				oldMember.user.avatarURL({
					size: 2048,
					format: "png",
				})
			)
			.setDescription(
				`Goodbye, ${oldMember.user.tag}. They are no longer a worker.`
			);
		await client.channels.get(kitchenChannel).send(embed);
		await client.channels
			.get(hireLogChannel)
			.send(
				`${oldMember.user.tag} (${oldMember.id}) is no longer a worker.`
			);
		await WorkerInfo.destroy({
			where: {
				id: oldMember.id,
			},
			truncate: false,
		});
	}
});

client.once("ready", async () => {
	client.started = true;
	await Cooldowns.sync({ alter: true });
	for (const [n, Model] in Object.entries(s)) {
		if (!s || !s.sync) continue;
		await Model.sync({ alter: true });
		console.log(n);
	}
	Teams.prototype.getStats = async function getStats() {
		const all = (await WorkerInfo.findAll({ where: { id: { [Op.in]: this.members } } })) || [{ delivers: 0, cooks: 0 }];
		return { cooks: all.reduce((x, y) => x + y.cooks, 0), delivers: all.reduce((x, y) => x + y.delivers, 0) }
	}
	Teams.prototype.getMonthlyStats = async function getStats() {
		const all = (await MonthlyInfo.findAll({ where: { id: { [Op.in]: this.members } } })) || [{ delivers: 0, cooks: 0 }];
		return { cooks: all.reduce((x, y) => x + y.cooks, 0), delivers: all.reduce((x, y) => x + y.delivers, 0) }
	}

	client.orders = await Orders.findAll();
	client.main = client.guilds.get(mainServer);
	client.pinging = {};
	client.pinging.s = process.hrtime.bigint();
	if (!client.counting) client.counting = 0;
	const { status } = _require("./auth");
	if (!status) client.user.setActivity("Just started! d!order");

	util.log(`[Discord] Connected! (ID: ${client.user.id})`);
	if (status) {
		client.user.setActivity(auth.status);
		util.log(`[Discord] Status: ${auth.status}`);
		client.status = status;
	}
	updateWebsites(client);
	setInterval(() => {
		const { status: _status } = _require("./auth");
		if (!_status) return;
		if (client.status !== _status) client.user.setActivity(_status);
		client.status = _status;
	}, 10000);
	// Activities
	const activitiesList = [
		"Cooking Donuts...",
		"Donuts!",
		"Cookin' Donuts",
		"d!order Donuts",
		"<3 Donuts",
		"with Donuts",
	];
	setInterval(async () => {
		const evt = await Event.findOne({ where: { id: 0 } });
		const evtlb = await EventInfo.findAll({
			order: [["points", "DESC"]],
			limit: 3,
		});
		const def = { points: "NAN" };
		const fir = evtlb[0] || def;
		const sec = evtlb[1] || def;
		const thr = evtlb[2] || def;
		if (!evt || evt.end > Date.now()) return;
		if (Date.now() > evt.end) {
			await client.channels.get(eventChannel).bulkDelete(100);
			await client.channels.get(eventChannel)
				.send(`The event has ended! Winners:
?? First: ${client.users.get(fir.id) || "??"} (${fir.points} points)
?? Second: ${client.users.get(sec.id) || "??"} (${sec.points} points)
?? Third: ${client.users.get(thr.id) || "??"} (${thr.points} points)
			`);
			await EventInfo.destroy({ where: {} });
			return evt.destroy();
		}
	}, 2000);
	setInterval(async () => {
		if (_require("./auth").status) return;
		let index = Math.floor((Math.random() * (activitiesList.length - 1)) + 1);
		client.user.setActivity(activitiesList[index]);

		if (
			await Orders.count({
				where: {
					status: {
						[Op.lt]: 1,
					},
				},
			}) > 1
		) {
			messageAlert(
				client,
				"There are [orderCount] order(s) left to claim"
			);
		}
	}, 300000);
	client.updateAbsences = async function updateAbsences() {
		const all = await Absences.findAll({
			where: {
				started: true,
			},
		});
		all.forEach(async a => {
			const m = await client.channels
				.get(absenceChannel)
				.messages.fetch(a.awayMessage);
			const et = a.endTime - Date.now();
			const n = m.content.replace(
				/\nEnds in .+/,
				`\nEnds in ${prettyms(et, { verbose: true })}.`
			);
			m.edit(n);
		});
	};
	setInterval(client.updateAbsences, 300000);
	setInterval(async () => {
		const all = await Absences.all();
		all.forEach(async a => {
			if (!client.guilds.get(mainServer).members.get(a.id)) return a.destroy();
			if (a.endTime <= Date.now()) {
				const member = client.guilds.get(mainServer).members.get(a.id);
				if (!member) return a.destroy();
				await member.send("You are no longer away.");
				const amess = await client.channels
					.get(absenceChannel)
					.messages.fetch(a.awayMessage);
				await amess.delete();
				await client.guilds
					.get(mainServer)
					.members.get(a.id)
					.roles.remove([awayRole]);
				do {
					await sequelize.query(
						`DELETE FROM absences WHERE id = "${a.id}"`
					);
					await a.destroy();
				} while (await Absences.findById(a.id));
			} else if (
				a.started &&
				!client.guilds
					.get(mainServer)
					.members.get(a.id)
					.roles.has(awayRole)
			) {
				await client.guilds
					.get(mainServer)
					.members.get(a.id)
					.roles.add([awayRole]);
			} else if (!a.started && a.startTime <= Date.now()) {
				const member = client.guilds.get(mainServer).members.get(a.id);
				await member.roles.add([awayRole]);
				await member.send("You are now away.");
				const am = await client.channels.get(absenceChannel).send(`**${member.user.tag
					}** is now absent.
Reason: \`${a.reason}\`
Their absence will start at **${a.startFormat}**,
and their absence will end at **${a.endFormat}**.
*This message will be automatically deleted when their absence ends.*
Ends in ${prettyms(a.endTime - Date.now())}.
React with ? to update the countdown.
`);
				am.react("?");
				const mc = await am.createReactionCollector(
					reaction => reaction.emoji.name === "?"
				);
				mc.on("collect", async (r, u) => {
					client.updateAbsences();
					if (r.me) return;
					am.reactions.removeAll();
					am.react("?");
				});
				await a.update({
					awayMessage: am.id,
					started: true,
				});
			}
		});
	}, 10000);
	setInterval(async () => {
		await post("http://discord-donuts.glitch.me/insert", {
			json: {
				orders: JSON.stringify(client.orders, null, 4),
				members: client.guilds.get(mainServer).memberCount,
				guilds: client.guilds.size,
				password:
					"EswYBKrdFZCcfz8XX3vfOsyIUBCWAeje4bRhlVx1wn7ZlpL0o0MYH498mYaPQchfDjyPxOcdZAh6uTWGoujuX7YQcrt2zSmby2gNTWdhFbgb2tc",
			},
		});
	}, 3600000);
	setInterval(async () => {
		let list = await Blacklist.all();
		list.forEach(async bl => {
			if (bl.end === "-1") return;
			if (Number(bl.end) <= Date.now()) {
				util.log(`Destroyed ${bl.id} in bot`);
				bl.destroy({
					where: {},
					truncate: true,
				});
				list = await Blacklist.all();
			}
		});
	}, 3000);
	setInterval(checkOrders, 12000, client);

	const { stdout: commit } = await exec("git log --oneline | head -1");

	messageAlert(
		client,
		`Bot restarted, current commit is \`\`\`git
${commit}\`\`\`
`,
		testChannel
	);
	client.pinging.e = process.hrtime.bigint();
});

client.on("messageReactionAdd", async (reaction, user) => {
	const message = reaction.message;
	if (message.channel.id !== suggestionChannel) return;
	if (reaction.emoji.id !== "501906738119835649") return;
	// if (message.author.id === user.id) return
	if (reaction.count === 11) {
		await client.channels
			.get("512488324150329344")
			.send(
				`**New popular suggestion from ${message.author.tag}!**\n${message.content
				}`
			);
	}
});
/*
	  ___            __     ___       ___  __   ___   /     __
|__| |__  |    |    /  \     |  |__| |__  |__) |__   /    .|  \
|  | |___ |___ |___ \__/     |  |  | |___ |  \ |___ .     .|__/

*/
/* BLOCKED */
const blockedChannels = [
	"294620092455583767",
	"511711743265865742",
	"573028010077323264",
	"516140564870070282",
	"294655481736069130"
];
client.on("message", async message => {
	if (!client.started) return process.exit(1);
	const commandDelay = process.hrtime.bigint();
	await awardIds.forEach(async x => {
		if (await x.percent(client, message.author) >= 1) await addAchievement(message.author.id, x.id);
	});

	function UWU(x) {
		return String.UWUFX(String.UWU(x));
	}

	function owo(c) {
		if (!auth.owo) return c;
		let content = c;
		if (
			content instanceof Discord.MessageEmbed ||
			content instanceof DDEmbed
		) {
			if (content.fields.length) {
				content.fields = content.fields.map(field => ({
					name: UWU(field.name),
					value: UWU(field.value),
					inline: field.inline,
				}));
			}
			if (content.title) content.title = UWU(content.title);
			if (content.description) content.description = UWU(content.description);
			if (content.author) content.author.name = UWU(content.author.name);
		} else if (typeof content === "string") {
			content = UWU(content);
		}
		return content;
	}

	message.constructor.prototype.edit = function edit(content, options) {
		content = owo(content);
		const { data } =
			content instanceof Discord.APIMessage ?
				content.resolveData() :
				Discord.APIMessage.create(
					this,
					content,
					options
				).resolveData();
		return this.client.api.channels[this.channel.id].messages[this.id]
			.patch({
				data,
			})
			.then(d => {
				const clone = this._clone();
				clone._patch(d);
				return clone;
			});
	};
	message.channel.constructor.prototype.send = async function send(
		content,
		options
	) {
		content = owo(content);
		const User = Discord.User;
		const GuildMember = Discord.GuildMember;

		if (this instanceof User || this instanceof GuildMember) {
			return this.createDM().then(dm => dm.send(content, options));
		}

		let apiMessage;

		if (content instanceof Discord.APIMessage) {
			apiMessage = content.resolveData();
		} else {
			apiMessage = Discord.APIMessage.create(
				this,
				content,
				options
			).resolveData();
			if (apiMessage.data.content instanceof Array) {
				return Promise.all(
					apiMessage.split().map(this.send.bind(this))
				);
			}
		}

		const { data, files } = await apiMessage.resolveFiles();
		return this.client.api.channels[this.id].messages
			.post({
				data,
				files,
			})
			.then(d => this.client.actions.MessageCreate.handle(d).message);
	};
	if (client.user.id === "482667303146881046") {
		const wl = require("./auth.json");
		const wlst = wl.whitelist;
		if (message.guild && !wlst.includes(message.guild.id)) return;
	}
	const tracking = await Tracking.findOrCreate({
		where: {
			id: '1',
		},
		defaults: {
			id: '1',
		},
	});
	if (new Date().getDate() !== 1) {
		await tracking[0].update({
			reset: false,
		});
	} else if (!tracking[0].reset) {
		await tracking[0].update({
			reset: true,
		});
		await MonthlyInfo.destroy({
			where: {},
			truncate: true,
		});
		await updateDB(MonthlyInfo);
		await messageAlert(
			"The monthly reset has happened! The monthly leaderboard and stats has been reset."
		);
	} (
		async scope => {

			if (message.channel.id === suggestionChannel) {
				await message.react("501906738119835649");
				await message.react("501906738224562177");
			}
			if (message.channel.type === "dm") {
				if (client.user.id === message.author.id) return;
				if (await Blacklist.findById(message.author.id)) return;
				const dmembed = new DDEmbed(client)
					.setStyle("blank")
					.setAuthor(
						message.author.tag,
						message.author.displayAvatarURL()
					)
					.setTitle(
						`${message.author.tag} (ID: ${message.author.id
						}) sent me this:`
					)
					.setDescription(await message.content.replaceAsync(/(https?:\/\/)?discord\.gg\/[a-zA-Z0-9]+/g, async x => `[Invite ${(await client.fetchInvite(x)).guild.name}]`))
					.setFooter(
						`Want to reply? Run \`d!replydm ${message.author.id
						} <content>\`!`
					);

				await client.channels.get(botDMChannel).send(dmembed);
				if (message.attachments.size) {
					await client.channels
						.get(botDMChannel)
						.send(message.attachments.first());
				}
			}
			if (message.author.bot) {
				if (message.author.id !== "302050872383242240") return;
				if (!message.guild || message.guild.id !== "294619824842080257") return;
				const messages = await message.channel.messages.fetch({
					limit: 10,
				});
				const embed = message.embeds ? message.embeds[0] : false;
				if (!embed) return;
				if (
					embed.description ===
					"Bump done :thumbsup:\nCheck it on DISBOARD: https://disboard.org/" &&
					embed.image.url ===
					"https://disboard.org/images/bot-command-image-bump.png"
				) {
					const bumpmessage =
						messages.find(x =>
							x.content.toLowerCase().includes("!disboard bump")
						) || messages[1];
					const user = bumpmessage.author;
					await message.channel.send(
						`Thank you for bumping the bot, ${user}! You have earned 100 appreciation donuts.`
					);
					const useracc = (await Donuts.findOrCreate({
						where: {
							id: user.id,
						},
						defaults: {
							id: user.id,
							donuts: 0,
						},
					}))[0];
					await useracc.update({ donuts: useracc.donuts + 100 });
				}
				return;
			}
			const account = (await Donuts.findOrCreate({
				where: {
					id: message.author.id,
				},
				defaults: {
					id: message.author.id,
					donuts: 0,
				},
			}))[0];
			const cooldown = (await Cooldowns.findOrCreate({
				where: {
					id: message.author.id,
				},
				defaults: {
					id: message.author.id,
					daily: 0,
					chat: 0,
				},
			}))[0];
			if (Number(cooldown.chat) + 300000 <= Date.now()) {
				let add = 0;
				await account.update({
					donuts: account.donuts + add,
				});
				await cooldown.update({
					chat: Date.now(),
				});
			}
			let gprefix;
			if (message.guild) gprefix = await Prefixes.findById(message.guild.id);
			else gprefix = "d!";
			let messagePrefix;
			let gprefixstr;
			if (!gprefix) {
				gprefixstr = prefix;
			} else {
				gprefixstr = gprefix.prefix;
			}
			const prefixList = [
				`<@${client.user.id}> `,
				gprefixstr,
				`${gprefixstr} `,
			];
			if (
				!prefixList.some(x => message.content.startsWith(x)) ||
				message.author.bot
			) return;
			prefixList.map(x => {
				if (message.content.startsWith(x)) {
					messagePrefix = x;
				}
			});
			if (await Blacklist.findById(message.author.id)) {
				return message.channel.send(
					"I apologize, but you've been blacklisted from this bot!"
				);
			}
			if (message.guild && await Blacklist.findById(message.guild.id)) {
				await message.channel.send(
					"I apologize, but your server has been blacklisted from Discord Donuts."
				);
				return message.guild.leave();
			}

			const args = message.content.slice(messagePrefix.length).split(/ +/);
			const command = args.shift().toLowerCase();

			if (!client.commands.has(command)) return;
			if (
				!await client
					.getCommand(command)
					.getPermissions(client, message.member)
			) {
				return message.reply(
					"You do not have permission to run this command"
				);
			}
			if (
				!await client.getCommand(command).getDMSupport() &&
				message.channel.type === "dm"
			) {
				return message.channel.send(
					"That command is not available in DMs."
				);
			}
			if (blockedChannels.includes(message.channel.id)) return message.channel.send("Bot commands are disabled in this channel.");
			try {
				if (Math.random() > 0.5 || isBotOwner(client, message.member)) message.member.user.status;
				if ((BigInt(message.author.id) % 3n) === 0n) message.member.guild.status;
				await client
					.getCommand(command)
					.runFunction(message, args, client, account, cooldown, {
						commandDelay,
					});
			} catch (e) {
				util.log(e);
				message.reply(
					`An error occurred! This has been reported to our developers\n\`\`\`\n${e.message
					}\n\`\`\``
				);
				await client.channels
					.get(errorLogChannel)
					.send(
						`Error at \`${message.content.split(" ")[0]}\`!\n\`\`\`js\n${e.stack
						}\n\`\`\``
					);
			}


			const cntnt = `(${messagePrefix})${command} ${args.join(" ")}`;
			const now = moment().tz("Canada/Pacific");
			if (!message.content.includes("nolog")) {
				await client.channels
					.get(commandLogChannel)
					.send(
						`**${message.author.tag}** {${message.author.id
						}} \`${cntnt}\` - ${now.format("DD-MM-YYYY")}`
					);

				const dirname = `${__dirname}/log/${now.format("MM_YYYY")}/`;
				const pathname = `${dirname}${now.format("DD_MM_YYYY")}.txt`;
				fs.ensureDir(dirname);
				if (!fs.existsSync(pathname)) {
					await writeFile(
						pathname,
						`==== ${now.format("DD-MM-YYYY")} ====
NOTE: Times are in Pacific Standard Time (UTC-8)!
Open with a monospace font.
----- Example -----
{ID} [hh:mm:ss] Username#Tag: (prefix)command ...args
-------------------
\n
`
					);
				}
				await appendFile(
					pathname,
					`{${message.author.id}} [${now.format("hh:mm:ss")}] ${message.author.tag
					}: ${cntnt}\n`
				);
			}
		})()
		;
});

client.on("guildCreate", async guild => {
	if (await Blacklist.findById(guild.id)) {
		await guild.owner.send(
			"I apologize, but your server has been blacklisted from Discord Donuts."
		);
		return guild.leave();
	}
	let systemChannel = guild.channels.get(guild.systemChannelID);
	if (
		systemChannel &&
		systemChannel.permissionsFor(guild.me.id).has("SEND_MESSAGES")
	) {
		await systemChannel.send(`Hello there, I was invited by a guild admin! <:donut:335630416914677771> To start ordering donuts, run the command \`d!help\` or \`d!order <donut-item>\`\
 		to get started! If you are facing any issues with the bot, please join our support server: **https://discord.gg/WJgamKm**.`);
	}
	guild.owner.send("Hi! Thank you for adding the bot the default prefix is `d!` get help with the commands run `d!help` want to change the prefix? run `d!prefix <prefix>`")
	const embed = new DDEmbed(client)
		.setColor(0xffff00)
		.setTitle("New Guild")
		.setDescription("New Guild Added!")
		.addField("Guild Name", `${guild.name} (${guild.id})`)
		.addField("Total", `[${client.guilds.size}]`);
	await client.channels.get(guildLogChannel).send(embed);
	if (!(client.guilds.size % 100)) {
		await client.channels
			.get(guildLogChannel)
			.send(`The bot is now in ${client.guild.size} guilds!`);
	}
	updateWebsites(client);
});

client.on("guildDelete", async guild => {
	const embed = new DDEmbed(client)
		.setColor(0xff0000)
		.setTitle("Left Guild")
		.setDescription("Left a Guild!")
		.addField("Guild Name", `${guild.name} (${guild.id})`)
		.addField("Total", `[${client.guilds.size}]`);

	await client.channels.get(guildLogChannel).send(embed);
	updateWebsites(client);
});

client.on("disconnect", () => {
	console.error(`[Discord] Disconnected! Attempting to reconnect...`);
	process.exit();
});

client.on("error", err => {
	util.log(`[Discord] ${err}`);
});

client.login(``);
util.log("[Discord] Connecting...");
