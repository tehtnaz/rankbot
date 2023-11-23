import chalk from "chalk";
import { ChatInputCommandInteraction } from "discord.js";

//import pino from "pino"

//const logger = pino();

const info_header = chalk.green("INFO: ");
const debug_header = chalk.gray("DEBUG: ");
const error_header = chalk.redBright("ERROR: ");

function getConstantLengthNumber(num: number, length: number) {
    return `${"0".repeat(length - num.toString().length)}${num}`;
}

function getDateTnazFormat() {
    const date = new Date();
    return `[${date.getFullYear()}-${getConstantLengthNumber(date.getMonth(), 2)}-${getConstantLengthNumber(
        date.getDate(),
        2
    )} ${getConstantLengthNumber(date.getHours(), 2)}:${getConstantLengthNumber(
        date.getMinutes(),
        2
    )}:${getConstantLengthNumber(date.getSeconds(), 2)}.${getConstantLengthNumber(date.getMilliseconds(), 3)}]`;
}

export function sb_LogError(interaction: ChatInputCommandInteraction, err: unknown) {
    console.error(getDateTnazFormat(), interaction.guildId, "/" + interaction.commandName, error_header, err);
}
export function sb_LogDebug(interaction: ChatInputCommandInteraction, message: any) {
    console.log(getDateTnazFormat(), interaction.guildId, "/" + interaction.commandName, debug_header, message);
}

export function sb_LogInfo(interaction: ChatInputCommandInteraction, message: string) {
    console.log(getDateTnazFormat(), interaction.guildId, "/" + interaction.commandName, info_header, message);
}

export function logInfo(scriptName: string, message: string) {
    console.log(getDateTnazFormat(), `(${scriptName}):`, info_header, message);
}
export function logDebug(scriptName: string, message: any) {
    console.log(getDateTnazFormat(), `(${scriptName}):`, debug_header, message);
}
export function logError(scriptName: string, err: unknown) {
    console.error(getDateTnazFormat(), `(${scriptName}):`, error_header, err);
}
