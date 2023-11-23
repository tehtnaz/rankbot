import { Sequelize } from "sequelize";
import { PersonXP } from "./models/PersonXP.js";
import { LevelRole } from "./models/LevelRole.js";
import readLine from "readline-sync";

const force = process.argv.includes("--force");

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

const sequelize = new Sequelize("database", "user", "password", {
    host: "localhost",
    dialect: "sqlite",
    logging: false,
    storage: "database.sqlite"
});
PersonXP.m_init(sequelize);
LevelRole.m_init(sequelize);

sequelize
    .sync({ force })
    .then(async () => {
        console.log("Database synced...");
        sequelize.close();
    })
    .catch(console.error);
