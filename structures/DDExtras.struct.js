class DDProgress {
	constructor(min = 0, max = 100, filled = "▓", unfilled = "░") {
		this.min = min;
		this.max = max;
		this.filled = filled;
		this.unfilled = unfilled;
	}
	generate(progress = this.max / 2, { percent = false, decimals = 0, prefix = "", total = this.max } = {}) {
		if (progress < 0) progress = 0;
		let s = progress * (total / this.max);
		if (s < 0) s = 0;
		let f = this.filled.repeat(s);
		let t = total - f.length;
		if (t < 0) t = 0;
		let u = this.unfilled.repeat(t);
		let e = "";
		let p = "";
		if (prefix) p = `${prefix} `;
		if (percent) e = ` ${((progress / this.max) * 100).toFixed(decimals)}%`;
		return `${p}${f}${u}${e}`;
	}
	setMin(m) {
		this.min = m;
		return this;
	}
	setMax(m) {
		this.max = m;
		return this;
	}
	setFilled(f) {
		this.filled = f;
		return this;
	}
	setUnfilled(u) {
		this.unfilled = u;
		return this;
	}
}
module.exports = {
	DDProgress
};
