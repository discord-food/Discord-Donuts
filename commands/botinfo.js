const Discord = require('discord.js');
const client = new Discord.Client();

exports.run = async (client, msg , args) =>  {
    String.prototype.toHHMMSS = function () {
        var sec_num = parseInt(this, 10);
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        var time    = hours+':'+minutes+':'+seconds;
        return time;
    }


var ping = msg.createdAt
    var time = process.uptime();
       var uptime = (time + "").toHHMMSS();

      let inline = true
      let bicon = client.user.displayAvatarURL;
      let usersize = client.users.size
      let chansize = client.channels.size
      let uptimxd = client.uptime
      let servsize = client.guilds.size
      let st00pid = new Discord.MessageEmbed()
      .setColor("#00ff00")
      .setThumbnail(bicon)
      .addField("Bot Name", `💻 ${client.user.username}`, inline)
      .addField("Bot Owner", "<@256392197648154624>", inline )
      .addField("Servers", `🛡 ${servsize}`, inline)
      .addField("Channels", `📁 ${chansize}`, inline)
      .addField("Users", `👥 ${usersize}`, inline)
      .addField("Bot Library", "Discord.js", inline)
      .addField("Created On", client.user.createdAt, true)
      .addField('Pong! `' + Math.floor(Math.round(ping)) + '`ms', 'Bot uptime bellow')
      .addField(`my uptime is: 🕑 ${uptime}`, 'Thanks for checking out the botinfo', true)
      .setTimestamp()
      .setFooter(`Information about: ${client.user.username}. Developed by: gagi12 & Floof`)

      msg.channel.send(st00pid);
}