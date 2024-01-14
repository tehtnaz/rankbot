import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord.js";
import { sb_LogError } from "../helpers/logging-helpers.js";
import { getClosestRoleID } from "../models/LevelRole.js";
import { PersonXP } from "../models/PersonXP.js";
import { CommandFile } from "../types.js";

const command: CommandFile = {
    data: new SlashCommandBuilder()
        .setName("add_xp")
        .setDescription("Add xp to someone")
        .addIntegerOption((option) => option.setName("xp").setDescription("The number of XP to add").setRequired(true))
        .addUserOption((option) => option.setName("user").setDescription("The user to add the XP to").setRequired(true))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async chatInputCommand(interaction) {
        const xp = interaction.options.getInteger("xp", true);
        const user = interaction.options.getUser("user", true);

        if (interaction.guildId === null || interaction.guild === null || interaction.member === null) return;
        const person = await PersonXP.findOne({
            where: { server_id: interaction.guildId, user_id: user.id }
        });
        if (person === null) {
            const new_person = PersonXP.newPerson(interaction.guildId, user.id);
            new_person.addXP(xp);
            await new_person.save();

            const roleID = await getClosestRoleID(new_person.lvl, interaction.guildId);

            if (roleID) {
                interaction.guild.members.fetch(user).then(async (guildMember) => {
                    try {
                        await guildMember.roles.add(roleID);
                    } catch (err) {
                        sb_LogError(interaction, err);
                    }
                });
            }
        } else {
            person.addXP(xp);
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
        await interaction.reply(`Successfully added ${xp} xp to ${user.username}`);
    }
};
export default command;
