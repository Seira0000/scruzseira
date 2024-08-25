const Discord = require('discord.js');

const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async(client, msg, args) => {

    if(!args[0]) return msg.channel.send("Bir nick gir!")
     db.set("botnicki", `${msg.content.split(" ")[1]}`)
 let sunucu = await new Discord.EmbedBuilder()
.setAuthor({ name: 'Nick değiştirildi!', iconURL: `https://mineskin.eu/armor/body/${await db.get('botnicki')}/100.png`})
.setDescription(`**Oyuncu Bilgileri** \nOyuncu İsmi: **${await db.get('botnicki')}** \nSunucu ID: **${msg.guild.id}** \n`)
.setColor('#D2EE07')  
.setThumbnail(`https://mineskin.eu/armor/body/${await db.get('botnicki')}/100.png`)
.setFooter({ text: `Bu komutu kullanan kullanıcı ${msg.author.tag}` , iconURL: `${msg.author.displayAvatarURL()}` });
   await  msg.channel.send({embeds : [sunucu]});

}; 

module.exports.conf = {
aliases: ['nickdegistir','nd','nickayarla'],
permLevel: 0, 
kategori: 'Sunucu'
};

module.exports.help = {
    name: 'nick-degistir',
    description: 'Sunucu hakkında bilgi verir.',
    usage: 'sunucu-bilgi'
};

/*
############################################################################
#                           Discord Bot Altyapı v14                         #
#               https://github.com/EmirhanSarac/discord-altyapi-bot         #
############################################################################
*/
