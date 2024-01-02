const { SlashCommandBuilder } = require('discord.js');
const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('../config.json');
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
});

client.login(token);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Begin playing an audio clip')
        .addStringOption(option =>
            option.setName('audio-track')
                .setDescription('Audio track you want to play')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply(); // Acknowledge the command

        const audioTrack = interaction.options.getString('audio-track');
        const voiceChannel = interaction.member.voice.channel;

        // if (!voiceChannel || voiceChannel.type !== 'GUILD_VOICE') {
        //     console.log('Member is not in a voice channel or voice channel type is incorrect.');
        //     return interaction.followUp('You must be in a voice channel to use this command.');
        // }

        console.log('Attempting to play:', audioTrack);
        
        client.DisTube.play(voiceChannel, audioTrack, {
            member: interaction.member,
            textChannel: interaction.channel,
            // Remove the 'message' property from options
        });

        // Event listener for successful playback
        client.DisTube.on('playSong', (queue, song) => {
            interaction.followUp(`Now playing: ${song.name}`);
        });

        // Event listener for playback errors
        client.DisTube.on('error', (channel, error) => {
            console.error(`Error in voice channel ${channel.id}:`, error);
            interaction.followUp('There was an issue, please try again.');
        });
    },
};

