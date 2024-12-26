import { Client, GatewayIntentBits, Message, Collection } from "discord.js";
import "reflect-metadata";
import { Sequelize } from "sequelize-typescript";
import { PersonXP } from "./models/PersonXP.js";
import { findJoinRoleID, getClosestRoleID, LevelRole } from "./models/LevelRole.js";
import fs from "fs";
import { getRandomLevelUpMessage } from "./helpers/responses.js";
import chalk from "chalk";
import { logDebug, logError, logInfo, sqlLogger } from "./helpers/logging-helpers.js";
import { CommandFile } from "./types.js";
import { sendHeartbeat } from "./helpers/heartbeat.js";

new Sequelize({
    dialect: "sqlite",
    storage: "database.sqlite",
    logging: sqlLogger,
    models: [LevelRole, PersonXP]
}).afterInit("confirm_hook", () => {
    logInfo(__filename, "Database successfully started.");
});

const config = JSON.parse(fs.readFileSync("./config.json").toString());

// intents + login
const intents_array = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers];
const client = new Client({ intents: intents_array });
if (config.debug) client.login(config.token_debug);
else client.login(config.token);

// import all the command files
const commandCollection = new Collection<string, CommandFile>();
const commandFiles: string[] = fs.readdirSync("./package/commands");
for (const file of commandFiles) {
    import(`./commands/${file}`).then((command) => {
        commandCollection.set(command.default.data.name, command.default);
        logInfo("index.js", `registered: ${command.default.data.name}`);
    });
}

export const rb_version = "v0.5.0";

client.once("ready", async () => {
    const guild_list: string[] = [];
    client.guilds.cache.mapValues((value) => {
        guild_list.push(value.name);
    });
    logInfo("index.js", "Servers using this bot: " + guild_list);
    if (config.debug) {
        logInfo(
            "index.js",
            `Started RankBot ${rb_version}${chalk.redBright("-DEV")} in ${chalk.bgYellowBright("DEBUG MODE")}`
        );
        console.log(`Started RankBot ${rb_version}${chalk.redBright("-DEV")} in ${chalk.bgYellowBright("DEBUG MODE")}`);
    } else {
        logInfo("index.js", `Started RankBot ${rb_version} in ${chalk.bgBlueBright("OFFICIAL mode")}`);
        console.log(`Started RankBot ${rb_version} in ${chalk.bgBlueBright("OFFICIAL mode")}`);
        const d = new Date();
        const printStr = `-------------------------\n    @@@@ Bot went online at: ${d.toDateString()}, ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}\n`;
        fs.appendFile("./activity.txt", printStr, (err) => {
            if (err) logError("index.js", err);
        });
    }
    //const StoredXp = await PersonXP.findAll();
    //StoredXp.forEach(item => SetMemUserXp(item));

    //setInterval(SaveXpData, 5000)

    sendHeartbeat();
});

client.on("messageCreate", async (message: Message) => {
    if (message.author.bot === true) return;
    if (!message.inGuild() || message.member === null) return;

    // Get user directly from database
    const user = await PersonXP.findOne({
        where: { server_id: message.guildId, user_id: message.author.id }
    });
    if (user === null) {
        const new_user = PersonXP.newPerson(message.guild.id, message.member.id);
        new_user.messageUpdate_And_GainXp(7, 12);
        await new_user.save();
        return;
    }

    //log amount of ms since last msg
    logDebug(
        "index.js",
        `${message.author.id} (${message.author.username}): ${Date.now() - new Date(user.date).getTime()}. ${user.date}`
    );

    user.msg += 1;

    //allow xp gain only every minute
    if (Date.now() - new Date(user.date).getTime() > 60000 || config.disable_cooldown) {
        user.messageUpdate_And_GainXp(7, 12);
    }

    if (user.checkLevelUp(true)) {
        let levelUp = "";
        const role_id = await getClosestRoleID(user.lvl, message.guildId);
        if (role_id !== undefined && !message.member.roles.cache.has(role_id)) {
            try {
                await message.member.roles.add(role_id);
                levelUp = "\n...ᵃⁿᵈ ʸᵒᵘ'ᵛᵉ ᵍᵒᵗ ᵃ ⁿᵉʷ ʳᵒˡᵉ!";
            } catch (err) {
                logError("index.js", err);
            }
        }
        await message.reply(getRandomLevelUpMessage(user.lvl) + levelUp);
    }

    await user.save();
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) {
        logError("index.js", "is not command");
        return;
    }
    logInfo("index.js", "received: " + interaction.commandName);
    const { commandName } = interaction;

    const commandData = commandCollection.get(commandName);

    if (!commandData) return;
    if (interaction.guild === null) {
        await interaction.reply({ content: ":bangbang: You must be in a guild to use commands!", ephemeral: true });
        return;
    }
    if (interaction.guild.available === false) {
        await interaction.reply(
            ":interrobang: The Discord API has marked this server as being part of an outage. This could cause the bot to have problems therefore commands have been disabled for this server"
        );
        return;
    }
    try {
        await commandData.chatInputCommand(interaction);
    } catch (err) {
        logError("index.js", err);
        try {
            if (!interaction.replied)
                await interaction.reply({
                    content: ":interrobang: There was an error while executing this command!",
                    ephemeral: true
                });
            else if (!interaction.deferred)
                await interaction.followUp({
                    content: ":interrobang: There was an error while executing this command!",
                    ephemeral: true
                });
            else
                await interaction.editReply({
                    content: ":interrobang: There was an error while executing this command!"
                });
        } catch (err) {
            logError("index.js", err);
        }
    }
});

client.on("guildMemberAdd", async (member) => {
    logInfo("index.js", `Getting joinRole for ${member.user.username}`);
    const joinRole = await findJoinRoleID(member.guild.id);
    if (joinRole) {
        try {
            await member.roles.add(joinRole);
            logInfo("index.js", `Successfully gave ${member.user.username} the server's joinRole`);
        } catch (err) {
            logError("index.js", err);
        }
    } else {
        logError("index.js", "Error adding role: Does the role exist? Are the permissions out of scope? Skipping...");
    }
});

client.on("error", (error) => {
    logError("index.js", "Uncaught exception.");
    logError("index.js", error);
    if (config.releaseMode === "release") {
        const d = new Date();
        const printStr = `    ???? Bot had an error at: ${d.toDateString()}, ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}\n`;
        fs.appendFileSync("./activity.txt", printStr);
    }
    //sendErrorWebhook(":exclamation: Client exception", error);
});

process.on("uncaughtException", (error, source) => {
    logError("index.js", "Uncaught exception.");
    logError("index.js", error);
    logError("index.js", source);
    if (!config.debug) {
        const d = new Date();
        const printStr = `    !!!! Bot had an uncaught exception at: ${d.toDateString()}, ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}\n`;
        fs.appendFileSync("./activity.txt", printStr);
    }
});
process.on("SIGINT", () => {
    if (!config.debug) {
        const d = new Date();
        const printStr = `    %%%% Bot went offline at: ${d.toDateString()}, ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}\n`;
        fs.appendFileSync("./activity.txt", printStr);
    }
    client.destroy();
    process.exit(0);
});
