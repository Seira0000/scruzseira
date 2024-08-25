const Discord = require('discord.js');
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const { randomBytes } = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const Mineflayer = require('mineflayer');

// Ayarları yükle
const ayarlar = require('../ayarlar.json');

// Botu oluştur
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Veritabanı dosyasını belirle
const dbFile = 'ccdata.db';

// Veritabanını oluştur veya bağlan
let db = new sqlite3.Database(dbFile);

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, password TEXT)");
});

// Helper function to generate a random string
function generateRandomString(length) {
    return randomBytes(length).toString('hex').slice(0, length);
}

// Helper function to generate a username
function generateUsername() {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let username = '';
    for (let i = 0; i < 12; i++) {
        username += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return username;
}

// Helper function to check if a username exists in the database
function checkUsernameInDb(username, callback) {
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) {
            console.error(err);
        }
        callback(row);
    });
}

// Helper function to add or update a user in the database
function addOrUpdateUser(username, password, callback) {
    db.run("INSERT OR REPLACE INTO users (username, password) VALUES (?, ?)", [username, password], (err) => {
        if (err) {
            console.error(err);
        }
        callback();
    });
}

exports.run = async (message, args) => {
    const command = args[0]?.toLowerCase();
    const ip = args[1];
    const port = args[2] || 25565;

    if (!command || !ip) {
        return message.channel.send("Yanlış kullanım! Örnek kullanım: `!veri METHOD ip port`");
    }

    if (!['plugin'].includes(command)) {
        return message.channel.send("Yanlış kullanım! Geçerli metodlar: `plugin`.");
    }

    // Kullanıcı doğrulama
    const authorizedUsers = ['1170094801539055743', '665224186716880906'];
    if (!authorizedUsers.includes(message.author.id)) {
        return message.channel.send("Bu komutu kullanma yetkiniz yok.");
    }

    // Kullanıcı adı ve şifre oluştur
    let username = generateUsername();
    checkUsernameInDb(username, (row) => {
        if (row) {
            // Eğer kullanıcı adı veritabanında varsa, mevcut şifreyi kullan
            const password = row.password;
            loginToServer(username, password);
        } else {
            // Yeni kullanıcı adı ve şifre oluştur
            const password = generateRandomString(12);
            addOrUpdateUser(username, password, () => {
                registerOnServer(username, password);
            });
        }
    });

    function loginToServer(username, password) {
        const bot = Mineflayer.createBot({
            host: ip,
            port: port,
            username: username,
            password: password,
            version: false,
        });

        bot.once('spawn', () => {
            // Komutları çalıştır ve pluginleri al
            runPluginCommands(bot);
        });

        bot.once('end', () => {
            // Sunucudan çıkış yapıldığında
            message.channel.send({ embeds: [createEmbed("Pluginler başarıyla alındı.", "Yeşil")] });
        });

        bot.once('error', (err) => {
            message.channel.send({ embeds: [createEmbed("Pluginler alınamadı: " + err.message, "Kırmızı")] });
        });
    }

    function registerOnServer(username, password) {
        const bot = Mineflayer.createBot({
            host: ip,
            port: port,
            username: username,
            password: password,
            version: false,
        });

        bot.once('spawn', () => {
            bot.chat(`/register ${password} ${password}`);
            bot.once('message', (msg) => {
                if (msg.text.includes('Registered')) {
                    loginToServer(username, password);
                }
            });
        });

        bot.once('error', (err) => {
            message.channel.send({ embeds: [createEmbed("Kayıt yapılamadı: " + err.message, "Kırmızı")] });
        });
    }

    function runPluginCommands(bot) {
        const commands = [
            '/plugins',
            '/bukkit:plugins',
            '/version',
            '/bukkit:version'
        ];

        let currentCommandIndex = 0;

        function tryNextCommand() {
            if (currentCommandIndex >= commands.length) {
                return;
            }

            bot.chat(commands[currentCommandIndex]);
            currentCommandIndex++;
        }

        bot.once('message', (msg) => {
            if (msg.text.includes('Plugins (')) {
                // Plugin listesi bulundu
                const plugins = msg.text;
                message.channel.send({ embeds: [createEmbed(`Plugins:\n${plugins}`, "Yeşil")] });
            } else {
                tryNextCommand();
            }
        });

        tryNextCommand();
    }

    function createEmbed(description, color) {
        let embed = new Discord.EmbedBuilder()
            .setColor(color === 'Yeşil' ? '#00FF00' : '#FF0000')
            .setDescription(description);

        return embed;
    }
};
