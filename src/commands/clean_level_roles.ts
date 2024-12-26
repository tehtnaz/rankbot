import { SlashCommandBuilder } from "@discordjs/builders";
import { InteractionContextType, PermissionFlagsBits } from "discord.js";
import { LevelRole } from "../models/LevelRole.js";
import { CommandFile } from "../types.js";

const command: CommandFile = {
    data: new SlashCommandBuilder()
        .setName("clean_level_roles")
        .setDescription("Cleans up any deleted roles from the role list")
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async chatInputCommand(interaction) {
        if (interaction.guild === null || interaction.guildId === null) return;

        const roleList = await LevelRole.findAll({
            where: { server_id: interaction.guildId }
        });
        let deleted_num = 0;
        for (const item of roleList) {
            await interaction.guild.roles.fetch(item.role_id).then(async (role) => {
                if (role === null) {
                    item.destroy();
                    deleted_num++;
                }
            });
        }
        await interaction.reply(`Removed ${deleted_num} role${deleted_num == 1 ? "" : "s"} from the list`);
    }
};
export default command;
