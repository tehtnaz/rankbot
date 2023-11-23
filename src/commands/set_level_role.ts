import { SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandRoleOption } from "@discordjs/builders";
import { ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { LevelRole } from "../models/LevelRole.js";
import { CommandFile } from "../types.js";

export default {
    data: new SlashCommandBuilder()
        .setName("set_level_role")
        .setDescription("Set the role for each level")
        .addIntegerOption((option: SlashCommandIntegerOption) =>
            option.setName("level").setDescription("The number for the level").setRequired(true)
        )
        .addRoleOption((option: SlashCommandRoleOption) =>
            option.setName("role").setDescription("The role to assign the level to").setRequired(true)
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async chatInputCommand(interaction: ChatInputCommandInteraction) {
        const level = interaction.options.getInteger("level", true);
        const role = interaction.options.getRole("role", true);

        if (interaction.guildId === null) return;

        await LevelRole.destroy({
            where: { server_id: interaction.guildId, role_id: role.id }
        });

        await LevelRole.create({ server_id: interaction.guildId, role_id: role.id, level: level });

        await interaction.reply(`Set ${role.name} to level ${level}`);
    }
} as CommandFile;
