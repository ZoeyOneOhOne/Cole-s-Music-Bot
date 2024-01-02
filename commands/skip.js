const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the currently playing song and move to the next one'),
    async execute(interaction) {
        await interaction.deferReply();

        const DisTube = interaction.client.DisTube;

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel || voiceChannel.type !== 2) {
            return interaction.followUp('You must be in a voice channel to use this command.');
        }

        const queue = DisTube.getQueue(interaction.guildId);

        if (!queue || !queue.playing) {
            return interaction.followUp('There is nothing playing to skip.');
        }

        DisTube.skip(interaction.guildId);
        interaction.followUp('Skipped the currently playing song and moved to the next one!');
    },
};
