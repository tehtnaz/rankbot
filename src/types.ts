import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    StringSelectMenuInteraction
} from "discord.js";

interface CommandFileData {
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    chatInputCommand: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
interface ExtraCommandFileData extends Required<CommandFileData> {
    stringSelectMenuCommand?: (interaction: StringSelectMenuInteraction) => Promise<void>;
    buttonCommand?: (interaction: ButtonInteraction) => Promise<void>;
}
export type CommandFile = ExtraCommandFileData;
