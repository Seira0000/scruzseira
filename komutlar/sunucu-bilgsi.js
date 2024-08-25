const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

exports.run = async(client, message, args) => {
        const ip = args[0];
        const port = args[1] || '25565'; // Eğer port girilmemişse 25565 portu kullanılacak
        const serverUrl = `http://status.mclive.eu/${ip}/${ip}/${port}/banner.png`;
        const apiUrl = `https://api.mcsrvstat.us/2/${ip}:${port}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (!data.online) {
                throw new Error('Server offline veya bilgiler yanlış!');
            }

            const embed = new EmbedBuilder()
                .setTitle(`Sunucu Bilgileri ${ip}:${port}`)
                .setImage(serverUrl)
                .addFields(
                    { name: 'IP', value: data.ip, inline: true },
                    { name: 'Port', value: data.port.toString(), inline: true },
                    { name: 'Oyuncular', value: `${data.players.online}/${data.players.max}`, inline: true },
                    { name: 'Version', value: data.version, inline: true },
                    { name: 'MOTD', value: data.motd.clean.join(' '), inline: false },
                    { name: 'Ping', value: `${data.debug.ping} ms`, inline: true }
                )
                .setColor('#00FF00'); // Başarılıysa yeşil

            message.channel.send({ embeds: [embed] });

        } catch (error) {
            let embedColor = '#FF0000'; // Varsayılan olarak kırmızı
            let errorMessage = error.message;

            if (error.message.includes('offline') || error.message.includes('invalid')) {
                embedColor = '#FF0000'; // IP veya port ile ilgili hata varsa kırmızı
            } else if (error.message.includes('Error')) {
                embedColor = '#FFA500'; // Genel bir hata varsa turuncu
                errorMessage = 'Bir hata oluştu.';
            }

            const errorEmbed = new EmbedBuilder()
                .setTitle('Hata')
                .setDescription(`**Hata Kodu:** ${error.message}\n**Detaylar:** ${errorMessage}`)
                .setColor(embedColor);

            message.channel.send({ embeds: [errorEmbed] });
        }
    },

module.exports.conf = {
    aliases: ['server-info','sb','sunucu-bilgi'],
    permLevel: 0, 
    kategori: 'Sunuscu'
    };
    
    module.exports.help = {
        name: 'sunucu-bislgi',
        description: 'Sunucsu hakkında bilgi verir.',
        usage: 'sunucu-bsilgi'
    };
    