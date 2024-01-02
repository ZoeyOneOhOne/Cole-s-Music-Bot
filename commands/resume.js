const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the currently paused audio'),
    async execute(interaction) {
        await interaction.deferReply();

        const DisTube = interaction.client.DisTube;

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel || voiceChannel.type !== 2) {
            return interaction.followUp('You must be in a voice channel to use this command.');
        }

        const queue = DisTube.getQueue(interaction.guildId);

        if (!queue || !queue.paused) {
            return interaction.followUp('There is nothing paused to resume.');
        }

        DisTube.resume(interaction.guildId);
        interaction.followUp('Resumed the music!');
    },
};
