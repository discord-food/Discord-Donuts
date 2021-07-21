const DDCommand = require("../../../structures/DDCommand.struct");
const DDEmbed = require("../../../structures/DDEmbed.struct");
const { everyone } = require("../../../permissions");
const { randomArray } = require("../../../helpers");
module.exports =
	new DDCommand()
		.setName("flip")
		.addAlias("upsidedown")
		.setDescription("Flip text upside down!")
		.setPermissions(everyone)
		.setFunction(async(message, args, client) => {
			const flip = text => {
				const alph = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890[]`!@(){},.'".split("");
				const hpla = "ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz∀qƆpƎℲפHIſʞ˥WNOԀQɹS┴∩ΛMX⅄ZƖᄅƐㄣϛ9ㄥ860][,¡@)(}{'˙,";
				const flipobj = Object.fromArrays(alph, hpla);
				return text
					.split("")
					.reverse().join("")
					.bulkReplace(flipobj);
			};
			const content = args.join(" ");
			if (!content) return message.channel.send("¡ʇxǝʇ ʎɟᴉɔǝԁs ǝsɐǝ˥Ԁ");
			return message.channel.send(`OUTPUT:
\`\`\`flip
${flip(content)}
\`\`\`
`);
		});
