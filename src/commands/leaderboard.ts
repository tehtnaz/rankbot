import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { DefaultEmbedColour } from "../helpers/embed-colour.js";
import { sb_LogError } from "../helpers/logging-helpers.js";
import { getLeaderboardEmoji } from "../helpers/leaderboard-emoji.js";
import { PersonXP } from "../models/PersonXP.js";
import { CommandFile } from "../types.js";

export default {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Fetch the leaderboard")
        .setDMPermission(false),
    async chatInputCommand(interaction: ChatInputCommandInteraction) {
        if (interaction.guild === null || interaction.guildId === null) return;
        try {
            const sortedList = await PersonXP.findAll({
                where: { server_id: interaction.guildId }
            });
            sortedList.sort(function (a: PersonXP, b: PersonXP) {
                return b.xp - a.xp;
            });
            const returnedEmbed = new EmbedBuilder()
                .setAuthor({
                    name: interaction.guild.name + "'s leaderboard",
                    iconURL: `https://cdn.discordapp.com/icons/${interaction.guild.id}/${interaction.guild.icon}.png`
                })
                .setColor(DefaultEmbedColour)
                .setDescription("The top 5 in the server are...");
            if (sortedList.length === 0) {
                returnedEmbed.addFields([
                    {
                        name: ":cry: Nobody's here yet!",
                        value: "Maybe try sending a message?"
                    }
                ]);
            }
            for (let i = 0; i < 5; i++) {
                const item = sortedList.shift();
                if (item === undefined) break;
                await interaction.guild.members
                    .fetch(item.user_id)
                    .then(async (user) => {
                        returnedEmbed.addFields([
                            {
                                name: `${getLeaderboardEmoji(i)} ${user.user.username} (${item.lvl.toString()})`,
                                value: `XP: ${item.xp.toString()} | Messages: ${item.msg.toString()}`
                            }
                        ]);
                    })
                    .catch(async (reason) => {
                        sb_LogError(interaction, reason);
                        i--;
                    });
            }
            await interaction.reply({ embeds: [returnedEmbed] });
        } catch (err) {
            sb_LogError(interaction, err);
            await interaction.reply(
                ":interrobang: Oops! An error occured. Please create a ticket containing a description of what you were doing"
            );
        }
    }
} as CommandFile;
