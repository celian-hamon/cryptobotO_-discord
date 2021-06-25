//importe les modules
const Discord = require("discord.js");
const keys = require("./keys.json");
const fs = require("fs");
const util = require('util');
const superagent = require("superagent");
const { url } = require("inspector");

//crée un client discord
const client = new Discord.Client();

//se connecte a discord avec le token du bot
client.login(keys.BOT_TOKEN);

//établi le préfixe
const prefix = "$";

//log un message une fois pret et met un status
client.on("ready", () => {
    console.log("CryptobotO_ : I am ready!");
    client.user.setActivity("les autres vendre des bigmac car il est riche", { type: "WATCHING" });
});

//traitement lors de la receptions d'un message
client.on('message', async message => {
    //Exclus les messages ne commencant pas par le préfix ou provenant d'un bot 
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    //split le messages en differentes parties afin de le traiter
    let commandBody = message.content.slice(prefix.length);
    let args = commandBody.split(" ");
    let command = args.shift().toLowerCase();

    //propriétés du message
    let fetchUser = message.mentions.users.first() || message.author;
    let member = message.guild.members.cache.get(fetchUser.id);
    let nickname = member.nickname;
    let author = message.author.username;

    //commande qui renvoi le leaderboard de la crypto calcule a partir du market cap de chaque crypto
    if (command === "lead") {
        //requete a l'api 
        superagent
            .get(
                "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false"
            )
            // .query({})
            .end((err, res) => {
                if (err) {
                    return console.log(err);
                }
                let response = res.body;
                let embed = new Discord.MessageEmbed() //cree un message embed 
                    .setAuthor(`Leaderboard des cryptos 🤑`)
                    .setThumbnail(
                        "https://www.lesaffaires.com/uploads/images/normal/f9d2c4729d0beec32aff0867d06ccd81.jpg"
                    )
                    .addFields({
                        name: `1er. ${response[0].id}`,
                        value: ` ${response[0].market_cap}$`,
                    }, {
                        name: `2eme. ${response[1].id}`,
                        value: `${response[1].market_cap}$`,
                    }, {
                        name: `3eme. ${response[2].id}`,
                        value: `${response[2].market_cap}$`,
                    }, {
                        name: `4eme. ${response[3].id}`,
                        value: `${response[3].market_cap}$`,
                    }, {
                        name: `5eme. ${response[4].id}`,
                        value: `${response[4].market_cap}$`,
                    })
                    .setFooter(`tapez '$?' pour les commandes`)
                    .setColor(0x118c4f);
                message.channel.send(embed); //envois le message
                end();
            });
    }

    //Commande PING, ping sois l'api sois le bot
    if (command === "ping") {
        //commande ping pour l'api
        if (args == "api") {
            //requete a l'api concernant son status
            superagent
                .get("https://api.coingecko.com/api/v3/ping")
                // .query({})
                .end((err, res) => {
                    if (err) {
                        message.reply('api bug');
                        return console.log(err);

                    }
                    let timeTaken = Date.now() - message.createdTimestamp; //calcule le temps pris pour repondre au message
                    message.reply("l'api dit : '" + res.body.gecko_says + `' et ce message a une latence de ${timeTaken}ms`); //repond
                    end();
                });
        }

        //commande ping pour le bot
        if (args == "bot" || args == "") {
            let timeTaken = Date.now() - message.createdTimestamp;
            message.reply(`Pong! Ce message a une latence de ${timeTaken}ms.`);
            end();
        }
    }

    //commande qui affiche toutes les commandes
    if (command === "?") {
        const embed = new Discord.MessageEmbed()
            .setAuthor(`Liste de commandes de CryptobotO_ 🤖`)
            .setThumbnail("https://img.icons8.com/nolan/50/question-mark.png")
            .addFields({
                name: "$ping",
                value: "Renvois le status de l'api ou du bot en fonction de l'argument\n *Exemple : $ping bot*",
            }, {
                name: "$lead",
                value: "Renvoi un leaderboard des cyptomonnaies en fonction de leurs market cap\n *Exemple : $lead*",
            }, {
                name: "$crypto",
                value: "Renvoi la valeur d'un token donné en argument - options : tts et tts + bio\n *Exemple : $crypto bitcoin*",
            }, {
                name: "$list",
                value: "Renvoi une liste de crypto\n *Exemple : $list page 1*",
            }, {
                name: "$bot",
                value: "renvois des infos sur le bot"
            })
            .setFooter(`tapez '$?' pour les commandes`)
            .setColor(0x118c4f);

        message.channel.send(embed);
        end();
    }

    //commande qui affiche la valeur d'un token d'une crypto
    if (command === "crypto") {
        let url = "https://api.coingecko.com/api/v3/coins/" + args[0]; //requete api
        superagent
            .get(url)
            // .query({})
            .end((err, res) => {
                if (err) {
                    return message.reply('not found') //en cas d'erreur renvois "non trouvé"
                }
                if (args[1] == "tts") {
                    if (args[2] == "bio") {
                        var gtts = require('node-gtts')('en');
                        gtts.save("temp.mp3", `${res.body.description.en}`, function() {})
                        read();
                    } else {
                        var gtts = require('node-gtts')('fr');
                        gtts.save("temp.mp3", `la valeur actuel d'un token de ${res.body.name} est de ${res.body.market_data.current_price.usd} dollars`, function() {})
                        read();
                    }
                } else if (args[1] == "evol") {
                    let response = res.body;
                    let embed = new Discord.MessageEmbed() //cree le message embed 
                        .setAuthor(response.name)
                        .setThumbnail(response.image.large)
                        .addField({ name: ``, value: "" })
                        .setFooter(
                            `tapez '$?' pour les commandes et '$list' pour la liste des cryptos`
                        )
                        .setColor(0x118c4f);
                    message.channel.send(embed);
                } else {
                    let response = res.body;
                    let embed = new Discord.MessageEmbed() //cree le message embed 
                        .setAuthor(response.name)
                        .setThumbnail(response.image.large)
                        .addFields({
                            name: "**Current price :**",
                            value: `${response.market_data.current_price.usd} **$**`
                        }, {
                            name: "**Site :**",
                            value: `[${response.name} site](${response.links.homepage[0]})`
                        }, {
                            name: "**Platform :**",
                            value: `${response.asset_platform_id}`
                        }, {
                            name: "**Categories :**",
                            value: `${response.categories}`
                        })
                        .setFooter(
                            `tapez '$?' pour les commandes et '$list' pour la liste des cryptos`
                        )
                        .setColor(0x118c4f);
                    message.channel.send(embed);
                }

                end();
            });
    }

    //commande qui renvois une list des coins 
    if (command === "list") {
        if (args[1] <= 1614) {
            superagent
                .get(
                    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=" + args[1] + "&sparkline=false"
                )
                // .query({})
                .end((err, res) => {
                    if (err) {
                        return console.log(err);
                    }
                    let response = res.body;
                    let embed = new Discord.MessageEmbed()
                        .setAuthor(`Liste des cryptos 📜`)
                        .setThumbnail(
                            "https://www.lesaffaires.com/uploads/images/normal/f9d2c4729d0beec32aff0867d06ccd81.jpg"
                        )
                        .addFields({
                            name: `${(5*args[1])-4}- ${response[0].id}`,
                            value: ` ${response[0].current_price}$`,
                        }, {
                            name: `${(5*args[1])-3}- ${response[1].id}`,
                            value: `${response[1].current_price}$`,
                        }, {
                            name: `${(5*args[1])-2}- ${response[2].id}`,
                            value: `${response[2].current_price}$`,
                        }, {
                            name: `${(5*args[1])-1}- ${response[3].id}`,
                            value: `${response[3].current_price}$`,
                        }, {
                            name: `${(5*args[1])}- ${response[4].id}`,
                            value: `${response[4].current_price}$`,
                        })
                        .setFooter(`Page ${args[1]} sur ${Math.floor(8074 / 5)} - tapez '$?' pour les commandes`)
                        .setColor(0x118c4f);
                    message.channel.send(embed);
                });
        } else { message.reply("page inexistante page maximale : 1614") }
        end();
    };

    //renvois des infos sur le bot
    if (command === "bot") {
        let embed = new Discord.MessageEmbed()
            .setAuthor(`v ${keys.version}`)
            .setThumbnail(`https://i.redd.it/0wmmlexz0a771.png`)
            .setTitle("bot développe avec amour par Cessou")
            .setDescription(`repo github : [ici](https://github.com/skelletondude/cryptobotO_-discord)`)


        message.channel.send(embed);
        end();
    };

    //lis le message tts
    async function read() {
        const connection = await message.member.voice.channel.join();
        const dispatcher = connection.play("temp.mp3");
        await resolveAfterSeconds(getDuration());
        connection.disconnect();
    }

    //recupere la durée du message tts
    function getDuration() {
        const getMP3Duration = require("get-mp3-duration");
        const buffer = fs.readFileSync('temp.mp3')
        const duration = getMP3Duration(buffer)
        return duration
    }

    //fonction supprimant le message et logs la commande avec les arguments et l'auteur 
    function end() {
        console.log(`Commande : ${command} \nArgs : ${args}\nAuteur : ${author}\n`);
        message.delete();
    }

    //timer pour la fontion async qui fonctionne avec la durée du message
    function resolveAfterSeconds(mSeconds) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve('resolved');
            }, mSeconds);
        });
    }
});