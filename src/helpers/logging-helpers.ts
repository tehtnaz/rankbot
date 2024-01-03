import { ChatInputCommandInteraction } from "discord.js";
import pino from "pino";
// import { LevelWithSilent } from "pino"
// import config from "../config.js";
import fs from "fs";
const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));
// import chalk from "chalk";

const logOutputInFile = config.debug === false;

// const info_header = chalk.green("INFO: ");
// const debug_header = chalk.gray("DEBUG: ");
// const error_header = chalk.redBright("ERROR: ");

const transport = logOutputInFile
    ? pino.transport({
          target: "pino/file",
          options: {
              destination: `./logs/${Date.now()}.log`,
              mkdir: true
          }
      })
    : pino.transport({
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l", ignore: "pid,hostname" }
      });

const logger = pino({ level: config.debug === true ? "debug" : "info" }, transport);

export function sb_LogInfo(interaction: ChatInputCommandInteraction, message: string) {
    logger.info(`${interaction.guildId} /${interaction.commandName} ${message}`);
}
export function sb_LogDebug(interaction: ChatInputCommandInteraction, message: any) {
    logger.debug(message, `${interaction.guildId} /${interaction.commandName}`);
}
export function sb_LogError(interaction: ChatInputCommandInteraction, err: any) {
    logger
        .child(err)
        .error(err instanceof Error ? err : new Error(err), `${interaction.guildId} /${interaction.commandName}`);
}

export function logInfo(scriptName: string, message: string) {
    logger.info(`(${scriptName}): ${message}`);
}
export function logDebug(scriptName: string, object: any) {
    logger.debug(object, `(${scriptName}):`);
}
export function logError(scriptName: string, err: any) {
    logger.child(err).error(err instanceof Error ? err : new Error(err), `(${scriptName}):`);
}
export function logWarn(scriptName: string, message: string) {
    logger.warn(`(${scriptName}): ${message}`);
}

export function sqlLogger(sql: string) {
    logDebug("SEQUELIZE", sql);
}
