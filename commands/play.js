const { SlashCommandBuilder } = require('discord.js');

let lastPlayedSong = null;
let isPlaying = null;

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
        await interaction.deferReply();

        const DisTube = interaction.client.DisTube;

        const audioTrack = interaction.options.getString('audio-track');
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel || voiceChannel.type !== 2) {
            return interaction.followUp('You must be in a voice channel to use this command.');
        }

         // Check if there is a song currently playing
         const queue = DisTube.getQueue(interaction.guildId);
         isPlaying = queue && queue.songs.length > 0;
        
        
        DisTube.play(voiceChannel, audioTrack, {
            member: interaction.member,
            textChannel: interaction.channel,
        });

        if (isPlaying) {
            DisTube.on('addSong', (queue, song) => {
                if (song.name != lastPlayedSong) {
                    interaction.followUp(`Added to the queue: ${song.name}`);
                }
            });
        } else {
            DisTube.on('playSong', (queue, song) => {
                if (song.name != lastPlayedSong) {
                    interaction.followUp(`Now playing: ${song.name} : ${song.url}`);
                    lastPlayedSong = song.name; // Update the last played song
                }
            });
        }

        // Event listener for playback errors
        DisTube.on('error', (channel, error) => {
            console.error(`Error in voice channel ${channel.id}:`, error);
            interaction.followUp('There was an issue, please try again.');
        });
    },
};

