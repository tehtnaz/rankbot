import New_PersonXP from "./models/PersonXP.js";
import {PersonXP} from "./models/old/PersonXP-v3.js";
import New_LevelRole from "./models/LevelRole.js";
import {LevelRole} from "./models/old/LevelRole-v3.js";
import { Sequelize } from "sequelize-typescript";

// Migrate rankbot 0.3 to 0.5

await new Sequelize({
    dialect: "sqlite",
    storage: "database-new.sqlite",
    logging: console.log,
    models: [New_PersonXP, New_LevelRole]
}).sync({ force: true });
const sequelize = new Sequelize("database", "username", "password", {
    host: "localhost",
    dialect: "sqlite",
    logging: false,
    storage: "database.sqlite"
});
PersonXP.m_init(sequelize);
LevelRole.m_init(sequelize);

await LevelRole.findAll().then((oldRoles) => {
    // i know theres bulkCreate... this is easier lol
    oldRoles.forEach((oldRole) =>{
        New_LevelRole.create({server_id: oldRole.server_id, role_id: oldRole.server_id, level: oldRole.level})
    })
});
await PersonXP.findAll().then((oldXPs) => {
    // i know theres bulkCreate... this is easier lol
    oldXPs.forEach((oldXP) =>{
        New_PersonXP.create({user_id: oldXP.user_id, server_id: oldXP.server_id, xp: oldXP.xp, counted_msg: oldXP.msg, msg: oldXP.counted_msg, date: new Date(oldXP.date), lvl: oldXP.lvl, lvlxp: oldXP.lvlxp})
    })
});

console.log(`Counts: Old_LevelRole: ${await LevelRole.count()}, Old_PersonXP: ${await PersonXP.count()}, LevelRole: ${await New_LevelRole.count()}, PersonXP: ${await New_PersonXP.count()}`)
console.log("Reached EOF")