import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { sb_LogError } from "../helpers/logging-helpers.js";
import { getClosestRoleID } from "../models/LevelRole.js";
import { PersonXP } from "../models/PersonXP.js";
import { CommandFile } from "../types.js";

export default {
    data: new SlashCommandBuilder()
        .setName("remove_xp")
        .setDescription("Remove xp from someone")
        .addIntegerOption((option) =>
            option.setName("xp").setDescription("The number of XP to remove").setRequired(true)
        )
        .addUserOption((option) =>
            option.setName("user").setDescription("The user to remove the XP from").setRequired(true)
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async chatInputCommand(interaction: ChatInputCommandInteraction) {
        const xp = interaction.options.getInteger("xp", true);
        const user = interaction.options.getUser("user", true);

        if (interaction.guildId === null || interaction.guild === null || interaction.member === null) return;
        const person = await PersonXP.findOne({
            where: { server_id: interaction.guildId, user_id: user.id }
        });
        if (person === null) {
            await interaction.reply({
                content: ":bangbang: No XP to remove... that user hasn't even been logged yet!",
                ephemeral: true
            });
            return;
        } else {
            person.removeXP(xp);
            await person.save();
            const roleID = await getClosestRoleID(person.lvl, interaction.guildId);

            if (roleID) {
                interaction.guild.members.fetch(user).then(async (guildMember) => {
                    try {
                        await guildMember.roles.add(roleID);
                    } catch (err) {
                        sb_LogError(interaction, err);
                    }
                });
            }
        }
        await interaction.reply(`Successfully removed ${xp} xp from ${user.username}`);
    }
} as CommandFile;
