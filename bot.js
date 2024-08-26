const { Client, GatewayIntentBits, Partials } = require("discord.js");
const ayarlar = require("./ayarlar.json");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const mineflayer = require("mineflayer");

const client = new Client({
  intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction]
});

module.exports = client;

require("./events/message.js")
require("./events/ready.js")

const express = require("express");
const app = express();
const http = require("http");
app.get("/", (request, response) => {
  response.sendStatus(200);
});
app.listen(process.env.PORT);


client.on("messageCreate", async (msg) => {
  if (msg.content.startsWith("!takip")) {
    let ip = msg.content.split(" ")[1];
    let port = msg.content.split(" ")[2];
    let version = msg.content.split(" ")[3];
    if(!msg.content.split(" ")[1]) return msg.channel.send("Bir ip gir!")
        if(!msg.content.split(" ")[2]) return msg.channel.send("Bir port gir!")
            if(!msg.content.split(" ")[3]) return msg.channel.send("Sunucu versionunu gir!")

    if (
        msg.content.split(" ")[1] !== undefined &&
        msg.content.split(" ")[2] !== undefined &&
        msg.content.split(" ")[3] !== undefined
    ) {
          let bot = mineflayer.createBot({
              host: msg.content.split(" ")[1],
              port: msg.content.split(" ")[2],
              username: `${await db.get("botnicki")}`,
              version: msg.content.split(" ")[3],
          });

          msg.reply(`Takip ediliyor ${ip}:${port} ${version}`);

          bot.on("error", (err) => console.log("Error:", err));
          bot.on("kicked", (reason) =>
              client.channels.cache
                  .get("1275122103326347314")
                  .send("I got kicked for", reason, "lol"),
          );
          bot.on("end", () => console.log("Disconnected"));

          bot.on("spawn", () => {
              console.log(`Bot ${bot.username} sunucuya bağlandı!`);
              console.log("Mesaj göndermek için bir şeyler yazın:");

             
          });

          

          console.log("Logged in as " + bot.username);

          
          bot.on("chat", (username, message) => {
              if (username === bot.username) return;
              client.channels.cache
                  .get("1275122103326347314")
                  .send(`${username}: ${message}`);
          });

          client.on("messageCreate", (msg) => {
              if (msg.author.id == "1276235789126078575") {
              } else if (msg.channel.id == "1275122103326347314") {
                  bot.chat(msg.content);
              }
          });
      }
  }
});


client.login(process.env.TOKEN || ayarlar.token)
