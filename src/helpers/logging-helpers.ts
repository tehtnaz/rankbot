import { ChatInputCommandInteraction } from "discord.js";
import pino from "pino";
import fs from "fs";
const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));

const logOutputInFile = config.debug === false;

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

const logger = pino.pino({ level: config.debug === true ? "debug" : "info" }, transport);

export function sb_LogInfo(interaction: ChatInputCommandInteraction, message: string | object) {
    logger.info(
        typeof message === "object" ? message : undefined,
        `${interaction.guildId} /${interaction.commandName} ${typeof message !== "object" ? message : undefined}`
    );
}
export function sb_LogDebug(interaction: ChatInputCommandInteraction, message: any) {
    logger.debug(
        typeof message === "object" ? message : undefined,
        `${interaction.guildId} /${interaction.commandName} ${typeof message !== "object" ? message : undefined}`
    );
}
export function sb_LogError(interaction: ChatInputCommandInteraction, err: any) {
    logger.error(
        { err: err instanceof Error ? err : new Error(err), obj: typeof err === "object" ? err : undefined },
        `${interaction.guildId} /${interaction.commandName}`
    );
}

export function logInfo(scriptName: string, message: string | object) {
    logger.info(
        typeof message === "object" ? message : undefined,
        `(${scriptName}): ${typeof message !== "object" ? message : undefined}`
    );
}
export function logDebug(scriptName: string, message: any) {
    logger.debug(
        typeof message === "object" ? message : undefined,
        `(${scriptName}): ${typeof message !== "object" ? message : undefined}`
    );
}
export function logError(scriptName: string, err: any) {
    logger.error(
        { err: err instanceof Error ? err : new Error(err), obj: typeof err === "object" ? err : undefined },
        `(${scriptName}):`
    );
}
export function logWarn(scriptName: string, message: string) {
    logger.warn(`(${scriptName}): ${message}`);
}

export function sqlLogger(sql: string) {
    logDebug("SEQUELIZE", sql);
}
