import { PersonXP } from "./models/PersonXP.js";
import Old_PersonXP from "./models/old/PersonXP.js";
import { LevelRole } from "./models/LevelRole.js";
import Old_LevelRole from "./models/old/LevelRole.js";
import { Sequelize } from "sequelize-typescript";

// Migrate rankbot 0.4 to 0.5

await new Sequelize({
    dialect: "sqlite",
    storage: "database-new.sqlite",
    logging: console.log,
    models: [LevelRole, PersonXP]
}).sync({ force: true });
new Sequelize({
    dialect: "sqlite",
    storage: "database.sqlite",
    logging: console.log,
    models: [Old_PersonXP, Old_LevelRole]
});

await Old_LevelRole.findAll().then((oldRoles) => {
    // i know theres bulkCreate... this is easier lol
    oldRoles.forEach((oldRole) => {
        LevelRole.create({ server_id: oldRole.server_id, role_id: oldRole.role_id, level: oldRole.level });
    });
});
await Old_PersonXP.findAll().then((oldXPs) => {
    // i know theres bulkCreate... this is easier lol
    oldXPs.forEach((oldXP) => {
        PersonXP.create({
            user_id: oldXP.user_id,
            server_id: oldXP.server_id,
            xp: oldXP.xp,
            counted_msg: oldXP.counted_msg,
            msg: oldXP.counted_msg,
            date: new Date(oldXP.date),
            lvl: oldXP.lvl,
            lvlxp: oldXP.lvlxp
        });
    });
});

console.log(
    `Counts: Old_LevelRole: ${await Old_LevelRole.count()}, Old_PersonXP: ${await PersonXP.count()}, LevelRole: ${await LevelRole.count()}, PersonXP: ${await PersonXP.count()}`
);
console.log("Reached EOF");
