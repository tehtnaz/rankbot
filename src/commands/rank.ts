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
            userList.sort(function (a: PersonXP, b: PersonXP) {
                return b.xp - a.xp;
            });
            let userIncluded = false;

            const user = interaction.options.getUser("user");
            const requested_user = user !== null ? user : interaction.user;

            const returnedEmbed = new EmbedBuilder().setColor(DefaultEmbedColour);

            for (const item of userList) {
                if (item.user_id === requested_user.id) {
                    sb_LogInfo(interaction, "u: " + userList.indexOf(item));
                    sb_LogInfo(interaction, "user lvlxp: " + item.lvlxp);
                    returnedEmbed
                        .setAuthor({
                            name: requested_user.username + "'s rank",
                            iconURL: `https://cdn.discordapp.com/avatars/${requested_user.id}/${requested_user.avatar}.png`
                        })
                        .addFields(
                            {
                                name: "Rank",
                                value: getLeaderboardEmoji(userList.indexOf(item)),
                                inline: true
                            },
                            { name: "Level", value: item.lvl.toString(), inline: true }
                        )
                        .addFields(
                            { name: "XP", value: item.xp.toString(), inline: true },
                            { name: "Counted messages", value: item.counted_msg.toString(), inline: true }
                        )
                        .addFields([
                            {
                                name: "XP until Next Level",
                                value: item.xpUntilLevelUp().toString(),
                                inline: true
                            }
                        ]);
                    userIncluded = true;
                    break;
                }
            }
            if (userIncluded === false) {
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
            } else {
                await interaction.reply({ embeds: [returnedEmbed] });
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
