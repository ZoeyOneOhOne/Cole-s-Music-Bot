const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { token, clientId } = require('./config.json');
const { DisTube } = require("distube");

const guildId = null;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
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
});

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
client.commands = new Collection();

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

let lastActivityTimestamp = Date.now();

// Execute the deploy-commands logic when the bot starts
(async () => {
    try {
        console.log('Deploying slash commands...');

        const { REST, Routes } = require('discord.js');
        const commands = [];

        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            commands.push(command.data.toJSON());
        }

        const rest = new REST({ version: '10' }).setToken(token);

        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`Successfully deployed ${data.length} slash commands.`);
    } catch (error) {
        console.error(`Error deploying slash commands: ${error.message}`);
    }
})();

client.login(token);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Handling slash commands
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
        lastActivityTimestamp = Date.now(); // Update last activity timestamp when a command is executed
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// Periodically check for idle timeout
setInterval(() => {
    const currentTime = Date.now();
    const idleDuration = currentTime - lastActivityTimestamp;
    const guild = client.guilds.cache.get(guildId);
    const me = guild.members.cache.get(client.user.id);

    if (!guild) {
        console.error(`Guild with ID ${guildId} not found.`);
        return;
    }

    if (!me) {
        console.error(`Bot not found in the guild with ID ${guildId}.`);
        return;
    }

    const botVoiceChannel = me.voice.channel;

    if (idleDuration >= 5 * 60 * 1000) { // 5 minutes (in milliseconds)
        if (botVoiceChannel) {
            const isQueueEmpty = client.DisTube.getQueue(guildId)?.songs.length > 0;
            
            if (!isQueueEmpty) {
                client.DisTube.voices.leave(guildId);
                console.log(`Bot left voice channel ${botVoiceChannel.name} due to inactivity.`);
            }
        }
    }
}, 5 * 60 * 1000); // Check every 5 minutes (in milliseconds)


