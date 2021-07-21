const DDEmbed = require("../../../structures/DDEmbed.struct");
const DDCommand = require("../../../structures/DDCommand.struct");

const { everyone } = require("../../../permissions");
const { getText } = require("../../../helpers");
const { Donuts, Items } = require("../../../sequelize");

module.exports =
	new DDCommand()
		.setName("tictactoe")
		.addAlias("ttt")
		.setDescription("Play Tictactoe and bet your money.")
		.setPermissions(everyone)
		.setFunction(async(message, args, client, account) => {
		return "nub";
			const id = [" ", "X", "O"];
			const board = [[0, 1, 0], [0, 1, 0], [0, 0, 0]];
			let win = false;
			Object.defineProperty(board, "playing", { get() {
				return board.map(x => x.map(y => id[y]));
			} });
			Object.defineProperty(board, "columns", { get() {
				return board.map((x, i) => board.map(y => y[i]));
			} });
			Object.defineProperty(board, "diagonals", { get() {
				return [board.map((x, i) => board[i][board.length - i - 1]), board.map((x, i) => board[i][i])];
			} });
			const checkWin = () => [...board, ...board.columns, ...board.diagonals].map(x => x[0] && x.every((val, i, arr) => val === arr[0]) ? x[0] : false);
			const getWin = () => {
				const won = checkWin().filter(x => x);
				return won[0] || false;
			};
			const autoplay = async() => {
				let toPlay = [];
				do {
					toPlay = [Math.randint(2), Math.randint(2)];
					if (isDraw()) return;
				} while (board[toPlay[0]][toPlay[1]]);
				board[toPlay[0]][toPlay[1]] = 2;
				await message.channel.send(`I played at (${toPlay.join(", ")})`);
			};
			const isDraw = () => !getWin() && !board.flat().includes(0);
			const play = async() => {
				await message.channel.send(`Current Game:
\`\`\`
| ${board.playing[0].join(` | `)} |
| ${board.playing[1].join(` | `)} |
| ${board.playing[2].join(` | `)} |
\`\`\`
`);
				const field = await getText(message, `Please respond with the field you want to play with the format \`ROW, COLUMN\`
| 0,0 | 0,1 | 0,2 |
| 1,0 | 1,1 | 1,2 |
| 2,0 | 2,1 | 2,2 |`, 50000, r => r.content.split(",").length === 2 && r.content.split(",").map(x => Number(x.trim())).every(x => x >= 0 && x <= 2)
				);
				if (!field) return false;
				const ff = field.split(",").map(x => Number(x.trim()));
				const toPlay = board[ff[0]][ff[1]];
				if (toPlay) {
					await message.channel.send("That field is already taken.");
					await play();
					return false;
				}
				board[ff[0]][ff[1]] = 1;
				return true;
			};
			let bet = args[0];
			if (!bet) return message.channel.send("Please include a bet.");
			if (isNaN(bet)) return message.channel.send("Please ensure that the bet is a number.");
			if (bet > account.donuts) return message.channel.send("You don't have that much donuts.");
			if (bet < 10) return message.channel.send("The bet is too little.");
			bet = Number(bet);
			if (Math.random() > 0.49) await autoplay();
			while (!getWin() && !isDraw()) {
				await play();
				await autoplay();
				console.log(board);
			}
			console.log(getWin());
			console.log(isDraw());
			return message.channel.send(`${id[getWin()]} wins.`);
		});
