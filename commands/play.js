const { SlashCommandBuilder } = require('discord.js');

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
            console.log('Member is not in a voice channel or voice channel type is incorrect.');
            return interaction.followUp('You must be in a voice channel to use this command.');
        }

        console.log('Attempting to play:', audioTrack);
        
        DisTube.play(voiceChannel, audioTrack, {
            member: interaction.member,
            textChannel: interaction.channel,
        });

        // Event listener for successful playback
        DisTube.on('playSong', (queue, song) => {
            interaction.followUp(`Now playing: ${song.name}`);
            console.log(DisTube.getQueue(interaction.guildId));
        });

        // Event listener for playback errors
        DisTube.on('error', (channel, error) => {
            console.error(`Error in voice channel ${channel.id}:`, error);
            interaction.followUp('There was an issue, please try again.');
        });
    },
};

