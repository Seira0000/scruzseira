const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');
const fs = require('fs');

// Botun ne kadar süredir aktif olduğunu hesaplamak için başlangıç zamanını kaydediyoruz
const startTime = Date.now();
let commandCount = 0;

exports.run = async (client, message, args) => {
    // Komutun sadece belirtilen kullanıcılar tarafından kullanılabilmesi için ID kontrolü yapıyoruz
    const allowedUsers = ['1170094801539055743', '665224186716880906'];
    if (!allowedUsers.includes(message.author.id)) {
        return message.channel.send("Bu komutu kullanma yetkiniz yok.");
    }

    // Botun aktif olduğu süreyi hesaplama
    const currentTime = Date.now();
    const uptime = currentTime - startTime;

    // Aktif olduğu süreyi saat, dakika, saniye olarak formatlama
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);

    // Embed oluşturma
    let uptimeEmbed = new Discord.EmbedBuilder()
        .setAuthor({ name: 'Bot Uptime', iconURL: `${message.author.displayAvatarURL()}` })
        .setColor('#FFD700')
        .setDescription(`Botun aktif olduğu süre: **${hours} saat, ${minutes} dakika, ${seconds} saniye**`)
        .addFields(
            { name: 'Toplam Kullanılan Komut Sayısı', value: `${commandCount}` }
        )
        .setFooter({ text: `Bu komutu kullanan kullanıcı: ${message.author.tag}`, iconURL: `${message.author.displayAvatarURL()}` });

    return message.channel.send({embeds: [uptimeEmbed]});
}

// Her komut kullanımında commandCount'u artırıyoruz
client.on('messageCreate', () => {
    commandCount++;
});

exports.conf = {
    aliases: ['up', 'uptime'], // Komutun farklı yazılışlarla kullanımları
    permLevel: 0,
    kategori: "Genel"
};

exports.help = {
    name: 'uptime',  // Komutun adı
    description: 'Botun ne kadar süredir aktif olduğunu ve kaç komut kullanıldığını gösterir.', // Komutun açıklaması
    usage: 'uptime', // Komutun kullanım şekli
};
