import readLine from "readline-sync";
import { Sequelize } from "sequelize-typescript";
import LevelRole from "./models/LevelRole.js";
import PersonXP from "./models/PersonXP.js";

// If index.js is being run before this file, it's because it's used in one of the imports ^^^^

const force = process.argv.includes("--force");
const alter = process.argv.includes("--alter");
if (force) {
    console.log("Are you sure you want to force the tables? (THIS WILL WIPE THE ENTIRE DATABASE!!!)");
    console.log('To confirm this action, write "WIPE ALL DATA AND RECREATE DATABASE": ');
    if (readLine.question() === "WIPE ALL DATA AND RECREATE DATABASE") {
        console.log("Confirmed! Forcing tables to sync...");
    } else {
        console.log("Prompt doesnt match, prompt failed! Cancelling and quitting...");
        process.abort();
    }
}
if (alter) {
    console.log("Are you sure you want to alter the database?");
    console.log('Please write "I AM SURE": ');
    if (readLine.question() === "I AM SURE") {
        console.log("Confrimed! Altering tables...");
    } else {
        console.log("Prompt failed. Cancelling and quitting...");
        process.abort();
    }
}

new Sequelize({
    dialect: "sqlite",
    storage: "database.sqlite",
    logging: console.log,
    models: [LevelRole, PersonXP]
})
    .sync({ force, alter })
    .then(async () => {
        console.log("Database synced...");
    })
    .catch(console.error);
