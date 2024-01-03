import { RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord.js";

//for debug
//import config from './config.json';

//for release
const config = JSON.parse(fs.readFileSync("./config.json").toString());

import fs from "fs";
const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const commandFiles_d: string[] = fs.readdirSync("./package/commands").filter((file: string) => file.endsWith(".js"));

const promises: Promise<void>[] = [];

for (const file of commandFiles_d) {
    promises.push(
        import(`./commands/${file}`).then((command) => {
            commands.push(command.default.data.toJSON());
        })
    );
}
const release_rest = new REST({ version: "10" }).setToken(config.token);
const debug_rest = new REST({ version: "10" }).setToken(config.token_debug);
console.log(config.app_id_beta + " " + config.dev_server_id);
console.log(await Promise.allSettled(promises));

Promise.all(promises).then(() => {
    console.log(commands);
    try {
        console.log(JSON.stringify(commands, null, 4));
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        if (config.debug === false) {
            release_rest
                .put(Routes.applicationGuildCommands(config.app_id, config.dev_server_id), {
                    body: commands
                })
                .then((data) =>
                    console.log(`Successfully registered ${(data as unknown[])?.length} commands to test server`)
                )
                .catch(console.error);

            release_rest
                .put(Routes.applicationCommands(config.app_id), { body: commands })
                .then((data) =>
                    console.log(`Successfully registered ${(data as unknown[])?.length} commands to ALL servers`)
                )
                .catch(console.error);
        }
        console.log(`Started refreshing DEBUG BOT commands`);

        debug_rest
            .put(Routes.applicationGuildCommands(config.app_id_debug, config.dev_server_id), { body: commands })
            .then((data) =>
                console.log(`Successfully registered ${(data as unknown[])?.length} commands to test server (DEBUG)`)
            )
            .catch(console.error);
        debug_rest
            .put(Routes.applicationCommands(config.app_id_debug), { body: commands })
            .then((data) =>
                console.log(`Successfully registered ${(data as unknown[])?.length} commands to ALL servers (DEBUG)`)
            )
            .catch(console.error);
    } catch (err) {
        console.error(err);
    }
});
