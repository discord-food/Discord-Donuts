const DDCommand = require("../../structures/DDCommand.struct");
const DDEmbed = require("../../structures/DDEmbed.struct");

const { Orders } = require("../../sequelize");
const { canCook } = require("../../permissions");
const { messageAlert, getOrder } = require("../../helpers");
const { channels: { kitchenChannel } } = require("../../auth.json");
const search = require("image-search-google")
module.exports =
	new DDCommand()
		.setName("search")
		.setDescription("Search for donuts.")
		.addShortcuts("sc")
		.addSyntax("keyword", "str")
		.setPermissions(canCook)
		.setFunction(async(message, args, client) => {
			const term = args.join(" ");
if (!term.length) return message.channel.send("Please specify the search term.");
				const init = new search("017059629225955063876:s7mbo1nsq10", "AIzaSyDBFuv94txiwZGpyNnbETOOat-H6uGGpuM");
				const res = (await init.search(term, { page: 1 })).slice(0, 3);
				if (!res.length) return message.channel.send("No results.");
				const urls = res.map(x => x.url);
				let i = 0;
				for (const url of urls) {
					const embed = new DDEmbed(client)
						.setTitle(`Search Result ${++i}`)
						.setDescription(url)
						.setThumbnail(url);
					await message.channel.send(embed)
				}
				});

