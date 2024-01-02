const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Add a song to the queue')
        .addStringOption(option =>
            option.setName('audio-track')
                .setDescription('Audio track you want to add to the queue')
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

        // Add the song to the queue
        DisTube.play(voiceChannel, audioTrack, {
            member: interaction.member,
            textChannel: interaction.channel,
        });

        // Event listener for successful playback
        DisTube.on('addSong', (queue, song) => {
            interaction.followUp(`Added to the queue: ${song.name}`);
        });

          // Event listener for successful playback
          DisTube.on('playSong', (queue, song) => {
            interaction.followUp(`Now playing: ${song.name}`);
        });

        // Event listener for playback errors
        DisTube.on('error', (channel, error) => {
            console.error(`Error in voice channel ${channel.id}:`, error);
            interaction.followUp('There was an issue, please try again.');
        });
    },
};
