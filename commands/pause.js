const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the currently playing audio'),
    async execute(interaction) {
        await interaction.deferReply();

        const DisTube = interaction.client.DisTube;

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel || voiceChannel.type !== 2) {
            return interaction.followUp('You must be in a voice channel to use this command.');
        }

        const queue = DisTube.getQueue(interaction.guildId);

        console.log(queue);

        if (!queue || !queue.playing) {
            return interaction.followUp('There is nothing playing to pause.');
        }

        DisTube.pause(interaction.guildId);
        interaction.followUp('Paused the music!');
    },
};
