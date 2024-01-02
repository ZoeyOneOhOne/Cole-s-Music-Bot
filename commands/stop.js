const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the currently playing audio and clear the queue'),
    async execute(interaction) {
        await interaction.deferReply();

        const DisTube = interaction.client.DisTube;

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel || voiceChannel.type !== 2) {
            return interaction.followUp('You must be in a voice channel to use this command.');
        }

        const queue = DisTube.getQueue(interaction.guildId);

        if (!queue || !queue.playing) {
            return interaction.followUp('There is nothing playing to stop.');
        }

        DisTube.stop(interaction.guildId);
        interaction.followUp('Stopped the music and cleared the queue!');
    },
};
