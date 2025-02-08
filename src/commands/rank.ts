import { SlashCommandBuilder } from "@discordjs/builders";
import { EmbedBuilder, InteractionContextType } from "discord.js";
import { DefaultEmbedColour } from "../helpers/embed-colour.js";
import { sb_LogError, sb_LogInfo } from "../helpers/logging-helpers.js";
import { getLeaderboardEmoji } from "../helpers/leaderboard-emoji.js";
import { PersonXP } from "../models/PersonXP.js";
import { CommandFile } from "../types.js";

const command: CommandFile = {
    data: new SlashCommandBuilder()
        .setName("rank")
        .setDescription("Fetch your own rank")
        .setContexts(InteractionContextType.Guild)
        .addUserOption((option) => option.setName("user").setDescription("The user's rank to get").setRequired(false)),
    async chatInputCommand(interaction) {
        if (!interaction.inGuild() || interaction.guild === null) return;
        try {
            const userList = await PersonXP.findAll({
                where: { server_id: interaction.guildId }
            });
            const membersList = await interaction.guild.members.fetch({
                user: userList.map((val) => {
                    return val.user_id;
                })
            });
            const sortedList = userList
                .filter((val) => {
                    return membersList.has(val.user_id);
                })
                .sort(function (a: PersonXP, b: PersonXP) {
                    return b.xp - a.xp;
                });

            const user = interaction.options.getUser("user");
            const requested_user = user ?? interaction.user;

            const returnedEmbed = new EmbedBuilder().setColor(DefaultEmbedColour);

            const itemIndex = sortedList.findIndex((val) => {
                return val.user_id === requested_user.id;
            });
            if (itemIndex !== -1) {
                const item = sortedList[itemIndex];
                sb_LogInfo(interaction, "u: " + itemIndex);
                sb_LogInfo(interaction, "user lvlxp: " + item.lvlxp);
                returnedEmbed
                    .setAuthor({
                        name: requested_user.username + "'s rank",
                        iconURL: `https://cdn.discordapp.com/avatars/${requested_user.id}/${requested_user.avatar}.png`
                    })
                    .addFields(
                        {
                            name: "Rank",
                            value: getLeaderboardEmoji(itemIndex),
                            inline: true
                        },
                        { name: "Level", value: item.lvl.toString(), inline: true },
                        { name: "XP", value: item.xp.toString(), inline: true },
                        {
                            name: "Messages (Counted | Total)",
                            value: `${item.counted_msg} | ${item.msg}`,
                            inline: true
                        },
                        {
                            name: "XP until Next Level",
                            value: item.xpUntilLevelUp().toString(),
                            inline: true
                        }
                    );
                await interaction.reply({ embeds: [returnedEmbed] });
            } else {
                if (user === null)
                    await interaction.reply({
                        content: ":bangbang: You haven't sent any messages in this server yet!",
                        ephemeral: true
                    });
                else
                    await interaction.reply({
                        content: ":bangbang: That user hasn't sent any messages in this server yet!",
                        ephemeral: true
                    });
            }
        } catch (err) {
            sb_LogError(interaction, err);
            await interaction.reply(
                ":interrobang: Oops! An error occured. Please create a ticket containing a description of what you were doing"
            );
        }
    }
};
export default command;
