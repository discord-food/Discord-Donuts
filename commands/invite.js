const Discord = require('discord.js')

exports.run = async (client, msg, args) => {
    let invite = new Discord.MessageEmbed()
        .addField('Here is our invite page!', [
            "[**Click here to invite our bot**](https://discord.com/oauth2/authorize?client_id=778401540133879809&scope=bot&permissions=0 'Bot invite')",
            `[**Click here to join our support server!**](https://discord.gg/G96bzbY 'Discord Server')`
        ])
    msg.channel.send(invite);
}