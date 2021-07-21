const { db: { dbUsername, dbPassword, dbName, dbHostname } } = require("./auth.json");

const Sequelize = require("sequelize");

const Op = Sequelize.Op;

const sequelize = new Sequelize(dbName, dbUsername, dbPassword, {
	host: dbHostname,
	dialect: "postgresql",
	logging: false,
	operatorsAliases: false,

	define: {
		charset: "utf32",
		dialectOptions: {
			collate: "utf32_unicode_ci"
		}
	}
});
const Tracking = sequelize.define("tracking", {
	id: {
		type: Sequelize.STRING,
		unique: true,
		primaryKey: true,
		allowNull: false,
	},
	reset: {
		type: Sequelize.BOOLEAN,
		defaultValue: false
	},
	paycheck: {
		type: Sequelize.BOOLEAN,
		defaultValue: false
	},
});
const Achievements = sequelize.define("achievements", {
	id: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	awardId: {
		type: Sequelize.INTEGER
	},
	internalId: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		allowNull: false,
		autoIncrement: true,
	}

});
const Items = sequelize.define("items", {
	id: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	itemId: {
		type: Sequelize.INTEGER
	},
	count: {
		type: Sequelize.INTEGER
	},
	internalId: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		allowNull: false,
		autoIncrement: true,
	}

});
const Orders = sequelize.define("orders", {
	id: {
		type: Sequelize.STRING(1234),
		unique: true,
		primaryKey: true,
		allowNull: false,
	},
	user: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	usertag: {
		type: Sequelize.TEXT,
		allowNull: false,
		validate: {
			not: /^\s*$/,
		},
	},
	description: {
		type: Sequelize.TEXT,
		validate: {
			not: /^\s*$/,
		},
	},
	channel: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	status: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
	claimer: Sequelize.STRING,
	deliverer: Sequelize.STRING,
	url: {
		type: Sequelize.TEXT,
	},
	ticketMessageID: Sequelize.TEXT,
	cookTimeout: {
		type: Sequelize.DATE
	},
	deliverTimeout: {
		type: Sequelize.DATE
	},
	expireTimeout: {
		type: Sequelize.DATE,
	},
	cookTotal: {
		type: Sequelize.INTEGER
	},
	deliverTotal: {
		type: Sequelize.INTEGER
	},
	expireTotal: {
		type: Sequelize.INTEGER
	},
	cookRated: {
		type: Sequelize.BOOLEAN,
		defaultValue: false
	},
	deliverRated: {
		type: Sequelize.BOOLEAN,
		defaultValue: false
	},
	tipped: {
		type: Sequelize.BOOLEAN,
		defaultValue: false
	},
	reported: {
		type: Sequelize.BOOLEAN,
		defaultValue: false
	},
	tempStatus: {
		type: Sequelize.INTEGER
	},
	deliverTime: {
		type: Sequelize.DATE
	},
	waitTime: {
		type: Sequelize.BIGINT
	}
});
const Info = sequelize.define("info", {
	id: {
		type: Sequelize.STRING,
		unique: true,
		primaryKey: true,
		allowNull: false,
	},
	data: {
		type: Sequelize.JSON
	}
});

const Warning = sequelize.define("warning", {
	reason: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	executor: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	GuildID: {
		type: Sequelize.STRING,
		allowNull: false
	}
})


const EventInfo = sequelize.define("eventinfo", {
	id: {
		type: Sequelize.STRING,
		unique: true,
		primaryKey: true,
		allowNull: false,
	},
	username: {
		type: Sequelize.TEXT,
		allowNull: false,
	},
	points: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
}, {
	charset: "utf32",
	collate: "utf32_unicode_ci"
});
const WorkerInfo = sequelize.define("workerinfo", {
	id: {
		type: Sequelize.STRING,
		unique: true,
		primaryKey: true,
		allowNull: false,
	},
	username: {
		type: Sequelize.TEXT,
		allowNull: false,
	},
	cooks: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
	delivers: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
	lastCook: {
		type: Sequelize.TEXT,
		allowNull: false,
	},
	lastDeliver: {
		type: Sequelize.TEXT,
		allowNull: false,
	},
	lastWork: {
		type: Sequelize.DATE,
		defaultValue: new Date()
	}
}, {
	charset: "utf32",
	collate: "utf32_unicode_ci"
});
const MonthlyInfo = sequelize.define("monthlyinfo", {
	id: {
		type: Sequelize.STRING,
		unique: true,
		primaryKey: true,
		allowNull: false,
	},
	username: {
		type: Sequelize.TEXT,
		allowNull: false,
	},
	cooks: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
	delivers: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
}, {
	charset: "utf32",
	collate: "utf32_unicode_ci"
});

const Donuts = sequelize.define("donuts", {
	id: {
		type: Sequelize.STRING,
		unique: true,
		primaryKey: true,
		allowNull: false,
	},
	donuts: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	deposited: {
		type: Sequelize.INTEGER,
		defaultValue: 0
	}
});

const Cooldowns = sequelize.define("cooldowns", {
	id: {
		type: Sequelize.STRING,
		unique: true,
		primaryKey: true,
		allowNull: false,
	},
	chat: {
		type: Sequelize.STRING,
		defaultValue: 0
	},
	daily: {
		type: Sequelize.STRING,
		defaultValue: 0
	},
	order: {
		type: Sequelize.STRING,
		defaultValue: 0
	},
	steal: {
		type: Sequelize.TEXT,
		defaultValue: 0
	},
	work: {
		type: Sequelize.TEXT,
		defaultValue: 0
	},
	crime: {
		type: Sequelize.DATE,
		defaultValue: new Date()
	},
});

const Trees = sequelize.define("trees", {
	id: {
		type: Sequelize.STRING,
		unique: true,
		primaryKey: true,
		allowNull: false,
	},
	age: {
		type: Sequelize.INTEGER
	},
	water: {
		type: Sequelize.DATE
	},
	maxAge: {
		type: Sequelize.INTEGER,
		defaultValue: 10
	},

});
const Applications = sequelize.define("applications", {
	id: {
		type: Sequelize.STRING,
		unique: true,
		primaryKey: true,
		allowNull: false,
	},
	application: {
		type: Sequelize.TEXT,
		allowNull: false,
	},
	code: {
		type: Sequelize.TEXT,
		allowNull: false,
	}
});
const Ratings = sequelize.define("ratings", {
	id: {
		type: Sequelize.STRING,
		unique: true,
		primaryKey: true,
		allowNull: false,
	},
	rate1: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	rate2: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	rate3: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	rate4: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	rate5: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	average: {
		type: Sequelize.DECIMAL(65, 30),
		defaultValue: 0
	}
});
const Blacklist = sequelize.define("blacklist", {
	id: {
		type: Sequelize.STRING,
		unique: true,
		primaryKey: true,
		allowNull: false,
		validate: {
			not: /^\s*$/,
		},
	},
	reason: {
		type: Sequelize.TEXT,
		allowNull: false,
	},
	end: {
		type: Sequelize.TEXT,
	}
});
const Admins = sequelize.define("admins", {
	id: {
		type: Sequelize.STRING,
		unique: true,
		primaryKey: true,
		allowNull: false,
		validate: {
			not: /^\s*$/,
		},
	},
});
const Prefixes = sequelize.define("prefixes", {
	id: {
		type: Sequelize.STRING,
		unique: true,
		primaryKey: true,
		allowNull: false,
	},
	prefix: {
		type: Sequelize.TEXT,
		allowNull: false,
	},
});
const Dishes = sequelize.define("dishes", {
	id: {
		type: Sequelize.STRING(1234),
		unique: true,
		primaryKey: true,
		allowNull: false,
	},
	statusID: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		unique: true
	}
});
const Absences = sequelize.define("absences", {
	id: {
		type: Sequelize.STRING,
		unique: true,
		primaryKey: true,
		allowNull: false,
	},
	reason: {
		type: Sequelize.TEXT
	},
	startTime: {
		type: Sequelize.DATE,
		allowNull: false,
		defaultValue: new Date()
	},
	endTime: {
		type: Sequelize.DATE,
		allowNull: false,
		defaultValue: new Date("Dec 31 3000")
	},
	startFormat: {
		type: Sequelize.TEXT
	},
	endFormat: {
		type: Sequelize.TEXT
	},
	started: {
		type: Sequelize.BOOLEAN,
		defaultValue: false
	},
	awayMessage: {
		type: Sequelize.TEXT
	}
});
const PrecookedDonuts = sequelize.define("precookedDonuts", {
	name: {
		type: Sequelize.TEXT,
		allowNull: false
	},
	url: {
		type: Sequelize.TEXT,
		allowNull: false
	},
	height: {
		type: Sequelize.INTEGER,
	},
	width: {
		type: Sequelize.INTEGER,
	},
});
const Event = sequelize.define("event", {
	id: {
		type: Sequelize.INTEGER,
		unique: true,
		primaryKey: true,
		allowNull: false,
	},
	name: {
		type: Sequelize.TEXT
	},
	description: {
		type: Sequelize.TEXT
	},
	filter: {
		type: Sequelize.TEXT,
		defaultValue: "return true"
	},
	end: {
		type: Sequelize.DATE,
		defaultValue: new Date(Date.now() + 100000)
	}
});
const EasyDelivers = sequelize.define("easydelivers", {
	id: {
		type: Sequelize.STRING,
		unique: true,
		primaryKey: true,
		allowNull: false,
	},
	content: {
		type: Sequelize.TEXT,
		allowNull: false
	}
}, {
	charset: "utf32",
	collate: "utf32_unicode_ci"
});
const Teams = sequelize.define("teams", {
	id: {
		type: Sequelize.INTEGER,
		unique: true,
		primaryKey: true,
		allowNull: false,
	},
	members: {
		type: Sequelize.JSON,
		defaultValue: []
	},
	name: {
		type: Sequelize.TEXT,
		defaultValue: "None?"
	}
}, {
	charset: "utf32",
	collate: "utf32_unicode_ci"
});

module.exports = {
	Sequelize,
	Op,
	sequelize,
	Orders,
	Blacklist,
	Prefixes,
	PrecookedDonuts,
	WorkerInfo,
	Applications,
	MonthlyInfo,
	Ratings,
	EasyDelivers,
	Donuts,
	Cooldowns,
	Tracking,
	Admins,
	Absences,
	Achievements,
	Trees,
	Items,
	EventInfo,
	Info,
	Event,
	Dishes,
	Teams,
};
