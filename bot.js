
const { Client , GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
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

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}



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

// Handling slash commands
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(token);