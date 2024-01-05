import { SlashCommandBuilder, SlashCommandRoleOption } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord.js";
import { LevelRole } from "../models/LevelRole.js";
import { CommandFile } from "../types.js";

const command: CommandFile =  {
    data: new SlashCommandBuilder()
        .setName("remove_level_role")
        .setDescription("Remove a role from the list")
        .addRoleOption((option: SlashCommandRoleOption) =>
            option.setName("role").setDescription("The role to remove").setRequired(true)
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async chatInputCommand(interaction) {
        if (interaction.guildId === null) return;

        const role = interaction.options.getRole("role", true);

        const deleted_num = await LevelRole.destroy({
            where: { server_id: interaction.guildId, role_id: role.id }
        });
        if (deleted_num > 0) {
            await interaction.reply(`Removed ${role.name} from the list`);
        } else {
            await interaction.reply({
                content: ":bangbang: No such role exists in the list!",
                ephemeral: true
            });
        }
    }
}
export default command;