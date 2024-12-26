import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    SlashCommandOptionsOnlyBuilder,
    StringSelectMenuInteraction
} from "discord.js";

interface CommandFileData {
    data: SlashCommandOptionsOnlyBuilder;
    chatInputCommand: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
interface ExtraCommandFileData extends Required<CommandFileData> {
    stringSelectMenuCommand?: (interaction: StringSelectMenuInteraction) => Promise<void>;
    buttonCommand?: (interaction: ButtonInteraction) => Promise<void>;
}
export type CommandFile = ExtraCommandFileData;
