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

// const sequelize = new Sequelize("database", "username", "password", {
//     host: "localhost",
//     dialect: "sqlite",
//     logging: false,
//     storage: "database.sqlite"
// });
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
if (config.debug) client.login(config.token_beta);
else client.login(config.token);

// import all the command files
const commandCollection = new Collection<string, CommandFile>();
const commandFiles: Array<string> = fs.readdirSync("./package/commands");
for (const file of commandFiles) {
    import(`./commands/${file}`).then((command) => {
        commandCollection.set(command.default.data.name, command.default);
        logInfo("index.js", `registered: ${command.default.data.name}`);
    });
}
/*const ServerXpCollection = new Collection<string, Collection<string, PersonXP>>();
//  ServerXpCollection = (server_id, XpUntilLevelUp)
//  XpUntilLevelUp = 

async function SaveXpData(){
    console.log("Saving data...");
    ServerXpCollection.forEach((ServerXp, server_id) =>{
        ServerXp.forEach((personXp, user_id) =>{
            PersonXP.update(personXp, {where: {server_id: server_id, user_id: user_id}});
            console.log(server_id + " : " + user_id);
        })
    })
}

function SetMemUserXp(personXp: PersonXP){
    const ServerXp = ServerXpCollection.get(personXp.server_id);
    if(ServerXp === undefined){
        const newCollection = new Collection<string, PersonXP>();
        newCollection.set(personXp.user_id, personXp);
        ServerXpCollection.set(personXp.server_id, newCollection);
    }else{
        ServerXp.set(personXp.user_id, personXp)
    }
    console.log(personXp.server_id);
}*/

export const rb_version = "v0.3.0";

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
    } else {
        logInfo("index.js", `Started RankBot ${rb_version} in ${chalk.bgBlueBright("OFFICIAL mode")}`);
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

    // Get user
    // Cached collection
    //     const user = ServerXpCollection?.get(message.guildId)?.get(message.author.id);
    // Directly from database
    const user = await PersonXP.findOne({
        where: { server_id: message.guildId, user_id: message.author.id }
    });

    //instead of returning make new row for new user ***TODO***
    /*if (user === undefined) {
        const server = ServerXpCollection.get(message.guildId);
        if(server === undefined){
            ServerXpCollection.set(message.guildId, new Collection());
            ServerXpCollection.get(message.guildId)?.set(message.author.id,
        }
        return;
    }*/
    /*
    user_id:, server_id, xp, msg, counted_msg, date, lvl, lvlxp
    */
    if (user === null) {
        const new_user = await PersonXP.create({
            server_id: message.guildId,
            user_id: message.author.id,
            xp: 0,
            counted_msg: 1,
            date: Date.now(),
            lvl: 0,
            lvlxp: 0
        });
        new_user.messageUpdate_And_GainXp(7, 12);
        new_user.save();
        return;
    }

    //log amount of ms since last msg
    logDebug("index.js", `${message.author.id} (${message.author.username}): ${Date.now() - user.date}`);

    user.counted_msg++;

    //allow xp gain only every minute
    if (Date.now() - user.date > 60000 || config.disable_cooldown) {
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
