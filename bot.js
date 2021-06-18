const Discord = require("discord.js");
const config = require("./config.json");
const fs = require('fs');
const client = new Discord.Client();
const superagent = require('superagent');

client.login(keys.BOT_TOKEN);

const prefix = "$";

client.on('ready', () => {
    console.log('CryptobotO_ : I am ready!');
    client.user.setActivity("à vendre des bigmacs car il a tout perdu");
});

client.on("message", function(message) {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    //Différentes parties de la commande
    let commandBody = message.content.slice(prefix.length);
    let args = commandBody.split(' ');
    let command = args.shift().toLowerCase();

    //propriétés du message
    let fetchUser = message.mentions.users.first() || message.author;
    let member = message.guild.members.cache.get(fetchUser.id);
    let nickname = member.nickname
    let author = message.author.username

    //commande qui renvoi le leaderboard de la crypto calcule a partir du market cap de chaque crypto
    if (command === "lead") {
        superagent.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false')
            // .query({})
            .end((err, res) => {
                if (err) { return console.log(err); }
                let response = res.body
                let embed = new Discord.MessageEmbed()
                    .setAuthor(
                        `Leaderboard des cryptos 🤑`
                    )
                    .setThumbnail('https://www.lesaffaires.com/uploads/images/normal/f9d2c4729d0beec32aff0867d06ccd81.jpg')
                    .addFields({ name: `1er. ${response[0].id}`, value: `2eme. ${response[0].market_cap}$` }, { name: `3eme. ${response[1].id}`, value: `${response[1].market_cap}$` }, { name: `4eme. ${response[2].id}`, value: `${response[2].market_cap}$` }, { name: `5eme. ${response[3].id}`, value: `${response[3].market_cap}$` }, { name: `${response[4].id}`, value: `${response[4].market_cap}$` })
                    .setFooter(`tapez '$?' pour les commandes`)
                    .setColor(0x118C4F)
                message.channel.send(embed);
                console.log(`commande $lead par ${author}`);
            });
    };

    //Commande PING, ping sois l'api sois le bot 
    if (command === "ping") {

        //commande ping pour l'api
        if (args == "api") {
            superagent.get('https://api.coingecko.com/api/v3/ping')
                // .query({})
                .end((err, res) => {
                    if (err) { return console.log(err); }
                    message.reply(res.body.gecko_says);
                    console.log(`commande $ping api par ${author}`);
                });
        }

        //commande ping pour le bot
        if (args == "bot" || args == "") {
            let timeTaken = Date.now() - message.createdTimestamp;
            message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
            console.log(`commande $ping bot par ${author}`);
        }
    }

    //commande qui affiche toutes les commandes
    if (command === "?") {
        const embed = new Discord.MessageEmbed()
            .setAuthor(
                `Liste de commandes de CryptobotO_ 🤖`
            )
            .setThumbnail('https://img.icons8.com/nolan/50/question-mark.png')
            .addFields({ name: 'ping', value: "Renvois le status de l'api ou du bot en fonction de l'argument" }, { name: 'lead', value: "Renvoi un leaderboard des cyptomonnaies en fonction de leurs market cap" })
            .setFooter(`tapez '$?' pour les commandes`)
            .setColor(0x118C4F)

        message.channel.send(embed);
        console.log(`commande $? par ${author}`);
    }
});