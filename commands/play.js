const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { logErrorToFile } = require('../log-error');

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
        
        // Build buttons
        const pauseButton = new ButtonBuilder()
        .setCustomId('pause')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⏸');

        const playButton = new ButtonBuilder()
        .setCustomId('play')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('▶️');

        const stopButton = new ButtonBuilder()
        .setCustomId('stop')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⏹️');

        const skipButton = new ButtonBuilder()
        .setCustomId('skip')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⏭️');

        const row = new ActionRowBuilder()
        .addComponents(pauseButton, playButton, stopButton, skipButton);

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
               interaction.followUp({ content: `Now playing: ${song.name} : ${song.url}`, components: [row] });
                    lastPlayedSong = song.name; // Update the last played song
                }
            });
        }

        // Event listener for playback errors
        DisTube.on('error', (channel, error) => {
            console.error(`Error in voice channel ${channel.id}:`, error);
            logErrorToFile(error, channel);
            interaction.followUp('There was an issue, please try again.');
        });


        // Directly handle interactions without using a collector
        interaction.client.on("interactionCreate", async (i) => {
            if (!i.isButton()) return;
            try {
                switch (i.customId) {
                    case 'pause':
                        DisTube.pause(interaction.guildId);
                        interaction.followUp('Paused the music!');
                        break;

                    case 'play':
                        DisTube.resume(interaction.guildId);
                        interaction.followUp('Resumed the music!');
                        break;

                    case 'stop':
                        DisTube.stop(interaction.guildId);
                        interaction.followUp('Stopped the music and cleared the queue!');
                        break;

                    case 'skip':
                        DisTube.skip(interaction.guildId);
                        interaction.followUp('Skipped the currently playing song and moved to the next one!');
                        break;

                }
            } catch (error) {
                console.error("Interaction handling error:", error);
                logErrorToFile(error, i)
            }
        });


    },
};

