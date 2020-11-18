const Discord = require('discord.js')

exports.run = async (client, msg, args) => {
    let invite = new Discord.MessageEmbed()
        .addField('Here is our invite page!', [
            "[**Click here to invite our bot**](https://discord.com/api/oauth2/authorize?client_id=733713255024951388&permissions=314561&scope=bot 'Bot invite')",
            `[**Click here to join our support server!**](https://discord.gg/edBRFGp 'Discord Server')`
        ])
    msg.channel.send(invite);
}