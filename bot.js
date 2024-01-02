
const { Client , GatewayIntentBits  } = require('discord.js');
const { token } = require('./config.json');
const { DisTube } = require("distube");

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.MessageContent
    ],
  });

client.DisTube = new DisTube(client, {
    leaveOnStop: false,
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: false,
})

client.on("messageCreate", message => {
    if (message.author.bot || !message.guild) return;
    const prefix = "?";
    const args = message.content.slice(prefix.length).trim().split(/ +/g);

    if (!message.content.toLowerCase().startsWith(prefix)) return;

    if (args[0].toLowerCase() === "play") {
        client.DisTube.play(message.member.voice.channel, args.slice(1).join(" "), {
            member: message.member,
            textChannel: message.channel,
            message
        });
    } else if (args[0].toLowerCase() === "pause") {
        const queue = client.DisTube.getQueue(message.guildId);
        if (queue) {
            client.DisTube.pause(message.guildId);
            message.channel.send("Paused the music!");
        } else {
            message.channel.send("There is nothing playing.");
        }
    } else if (args[0].toLowerCase() === "resume") {
        const queue = client.DisTube.getQueue(message.guildId);
        if (queue) {
            client.DisTube.resume(message.guildId);
            message.channel.send("Resumed the music!");
        } else {
            message.channel.send("There is nothing to resume.");
        }
    } else if (args[0].toLowerCase() === "stop") {
        const queue = client.DisTube.getQueue(message.guildId);
        if (queue) {
            client.DisTube.stop(message.guildId);
            message.channel.send("Stopped the music and cleared the queue!");
        } else {
            message.channel.send("There is nothing to stop.");
        }
    }
});

client.DisTube.on("playSong", (queue, song) => {
    queue.textChannel.send("NOW PLAYING " + song.name)
})

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    if (message.content === 'ping') {
        message.reply('pong');
    }
});

client.login(token);