const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete a specific song from the queue')
        .addIntegerOption(option =>
            option.setName('position')
                .setDescription('Position of the song in the queue')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();

        const DisTube = interaction.client.DisTube;

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel || voiceChannel.type !== 2) {
            return interaction.followUp('You must be in a voice channel to use this command.');
        }

        const queue = DisTube.getQueue(interaction.guildId);

        if (!queue || !queue.songs || queue.songs.length === 0) {
            return interaction.followUp('The queue is empty.');
        }

        const position = interaction.options.getInteger('position');

        if (position < 1 || position > queue.songs.length) {
            return interaction.followUp('Invalid position. Please provide a valid position in the queue.');
        }

        const deletedSong = queue.songs.splice(position - 1, 1)[0];
        interaction.followUp(`Deleted song at position ${position}: ${deletedSong.name}`);
    },
};
