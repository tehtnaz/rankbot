import { SlashCommandBuilder } from "@discordjs/builders";
import { EmbedBuilder } from "discord.js";
import { getRandomEmptyMessage } from "../helpers/responses.js";
import { LevelRole } from "../models/LevelRole.js";
import { CommandFile } from "../types.js";
import { DefaultEmbedColour } from "../helpers/embed-colour.js";

const command: CommandFile = {
    data: new SlashCommandBuilder()
        .setName("list_level_roles")
        .setDescription("Fetch the levels of each role")
        .setDMPermission(false),
    async chatInputCommand(interaction) {
        if (interaction.guild === null || interaction.guildId === null) return;

        const roleList = await LevelRole.findAll({
            where: { server_id: interaction.guildId }
        });
        roleList.sort(function (a: LevelRole, b: LevelRole) {
            return a.level - b.level;
        });
        const returnedEmbed = new EmbedBuilder().setColor(DefaultEmbedColour).setAuthor({
            name: `${interaction.guild.name}'s role list (${roleList.length} role${roleList.length == 1 ? "" : "s"})`,
            iconURL: `https://cdn.discordapp.com/icons/${interaction.guild.id}/${interaction.guild.icon}.png`
        });
        let description = "";

        for (const item of roleList) {
            await interaction.guild.roles.fetch(item.role_id).then(async (role) => {
                description += `\`Level ${item.level}\` - ${role === null ? `**deleted-role**` : `<@&${role.id}>`}\n`;
            });
        }
        if (roleList.length === 0) {
            description += `**${getRandomEmptyMessage()}**`;
        }
        returnedEmbed.setDescription(description);
        await interaction.reply({ embeds: [returnedEmbed] });
        return;
    }
};
export default command;
