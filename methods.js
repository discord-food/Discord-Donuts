global.sameArray = (arr1, arr2) => {
	[arr1, arr2] = [arr1, arr2].sort((a, b) => b.length - a.length);
	return !arr1.filter(x => !arr2.includes(x)).length;
};
String.prototype.replaceAsync = async function replaceAsync(replacer, cb) {
    const promises = [];
    this.replace(replacer, (match, ...args) => {
        const promise = cb(match, ...args);
        promises.push(promise);
    });
    const data = await Promise.all(promises);
    return this.replace(replacer, () => data.shift());
};
global.uneval = function uneval(val) {
	switch (typeof val) {
		case "undefined":
			return "undefined";
		case "boolean":
			return String(val);
		case "number":
			return String(val);
		case "string":
			return `"${val.replace(/[^a-z]/gi, s => `\\u${(0x10000 + s.charCodeAt(0)).toString(16).slice(1)}`
			)}"`;
		case "function":
			return val.toString();
		case "object":
			if (val == null) return "null";
			var type = val.constructor.name || Object.prototype.toString.call(val).match(/\[object (.+)\]/)[1];
			if (!type) throw TypeError(`Unknown type: ${val}`);
			switch (type) {
				case "Array":
					return `[${val.join(", ")}]`;
				case "Object":
					var ret = Object.getOwnPropertyNames(val).map(x => `${x}: ${val[x]}`);
					return `{${ret.join(", ")}}`;
				case "Number":
					return `new Number( ${val} )`;
				case "String":
					return `new String( ${uneval(val)} )`;
				case "Date":
					return `new String( ${val.getTime()} )`;
				default:
					if (val.toSource) return val.toSource();
					return `${type}( ${val.length || val.size || val.count || 0} ) { ${Object.getOwnPropertyNames(val).map(x => `${x}: ${val[x]}`)} }`;
			}
	}
	return "";
};
Math.mean = (...n) => n.reduce((p, c) => p + c) / n.length;
String.prototype.convertTemplate = function convertTemplate(user, url, description, id, cook, username) {
	return this.bulkReplace({
		"[user]": user,
		"[description]": description,
		"[id]": id,
		"[cook]": cook,
		"[username]": username,
		"[url]": url,
	});
};
String.prototype.convertTemplate.list = {
	"[user]": "Mentions the orderer.",
	"[url]": "The donut image url.",
	"[username]": "The orderer's username.",
	"[id]": "The order id.",
	"[cook]": "The claimer's username.",
	"[description]": "The donut description."
};
Object.fromArrays = (keys, values) => {
	var result = {};
	keys.forEach((key, i) => {
		result[key] = values[i];
	});
	return result;
};
const {
	findBestMatch
} = require("string-similarity");
String.UWUTable = {
	y: "wy",
	l: "w",
	r: "w",
	ss: "zs",
	n: "nw",
	ove: "uv",
	ome: "um",
	x: "ks",
	com: "cum",
	stu: "stew",
	au: "auy"
};
String.prototype.escapeRegex = function escapeRegex() {
	return this.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
String.UWU = toUWU => String(toUWU).bulkReplace(String.UWUTable);
String.prototype.replaceLast = function replaceLast(search, replacement) {
	const n = this.lastIndexOf(search);
	if (!(n + 1)) return this;
	return `${this.substring(0, n)}${replacement}${this.substring(n + search.length, this.length)}`;
};
String.prototype.replaceLast = function replaceLast(search, replacement) {
	const n = this.lastIndexOf(search);
	if (!(n + 1)) return this.valueOf();
	return `${this.substring(0, n)}${replacement}${this.substring(n + search.length, this.length)}`;
};
String.prototype.replaceAll = function replaceAll(search, replacement) {
	return this.replace(new RegExp(search.toString().escapeRegex(), "gi"), m => replacement);
};
Object.reverse = obj => Object.fromArrays(Object.values(obj), Object.keys(obj));
String.prototype.bulkReplace = function bulkReplace(replacer) {
	let res = this; // eslint-disable-line consistent-this
	for (const x in replacer) {
		res = res.replaceAll(x, replacer[x]);
	}
	return res;
};
Array.prototype.random = function random() {
	return this[Math.floor(Math.random() * this.length)];
};
Array.prototype.unique = function unique() {
	return [...new Set(this)];
};
Array.prototype.partition = function partition(testFunction) {
	return this.reduce((result, element, index, array) => {
		result[testFunction(element, index, array) ? 0 : 1].push(element);
		return result;
	},
	[
		[],
		[]
	]);
};
Array.prototype.chunk = function chunk(size) {
	return this.reduceRight((acc, x, index) => {
		if ((index + 1) % size === 0) acc.unshift([]);
		acc[0].push(x);
		return acc;
	}, [
		[]
	]).filter(x => x.length);
};
Array.prototype.findBy = function findBy(search, value) {
	return this.find(x => x[search] === value);
};
Array.prototype.filterBy = function filterBy(search, value) {
	return this.filter(x => x[search] === value);
};
String.prototype.matchCase = function matchCase(pattern) {
	var result = "";

	for (var i = 0; i < this.length; i++) {
		var c = this.charAt(i);
		var p = pattern.charCodeAt(i);

		if (p >= 65 && p < 65 + 26) {
			result += c.toUpperCase();
		} else {
			result += c.toLowerCase();
		}
	}

	return result;
};
Math.randint = (high, low = 0) => Math.floor((Math.random() * high) - low) + low;
Object.chance = obj => {
	let a = {};
	let last = 0;
	for (const x of Object.keys(obj).sort((y, b) => a[y] - a[b])) {
		a[x] = [];
		a[x][0] = last + 1;
		a[x][1] = obj[x] + last;
		last = obj[x] + last;
	}
	return a;
};
Object.random = chanceObj => {
	let chanceArray = Object.values(chanceObj);
	let max = chanceArray[chanceArray.length - 1][1];
	let r = Math.randint(max);
	return Object.reverse(chanceObj)[chanceArray.find(x => r >= x[0] && r <= x[1])];
};
Array.prototype.random = function random() {
	return this[Math.randint(this.length)];
};
Object.findMatch = (objArr, matchBy, matchStr) => {
	const m = findBestMatch(matchStr, objArr.map(x => x[matchBy])).bestMatch.target;
	return objArr.find(x => x[matchBy] === m);
};

Array.prototype.join = function join(seperator = ",") {
	if (typeof seperator === "string") return this.reduce((c, t, i, a) => c + (i < this.length - 1 ? t + seperator : t), "");
	else if (seperator instanceof Function) return this.reduce((c, t, i, a) => c + (i < this.length - 1 ? t + seperator(a[i], i, a) : t), "");
};
Array.prototype.leftJoin = function leftJoin(seperator = ",") {
	if (typeof seperator === "string") return this.reduce((c, t, i) => c + (i ? seperator + t : t), "");
	else if (seperator instanceof Function) return this.reduce((c, t, i, a) => c + (i ? seperator(a[i], i, a) + t : t), "");
};
String.UWUFX = text => {
	const faces = Object.chance({
		"owo :3": 20,
		"✧w✧": 20,
		"UwU": 20,
		"OwO": 10,
		"rawr": 10,
		"uwu :3": 5,
		":3 meow": 15,
		":3": 15,
		"X3": 15,
		"*purrs*": 15,
		owo: 15,
		uwu: 15,
		"^w^": 15,
		"x3 rawr": 15,
		owowowowo: 15,
	});	return text.split(" ").leftJoin((x, i) => Math.floor(Math.random() * 6) === 0 && /[A-Za-z]/.test(x[0]) ? ` ${x[0]}-` : " ")
		.split(" ")
		.join((x, i) => Math.floor(Math.random() * 5) === 0 ? ` ${Object.random(faces)} ` : " ");
};
module.exports = ":D";
