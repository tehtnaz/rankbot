import { PersonXP } from "./models/PersonXP.js";
import { LevelRole } from "./models/LevelRole.js";
import { Sequelize } from "sequelize";
import fs from "fs";
const sequelize = new Sequelize("database", "user", "password", {
    host: "localhost",
    dialect: "sqlite",
    logging: false,
    storage: "database.sqlite"
});

PersonXP.m_init(sequelize);
LevelRole.m_init(sequelize);

PersonXP.findAll().then((person_xp) => {
    fs.writeFileSync("./person_xp_data.json", JSON.stringify(person_xp));
});
LevelRole.findAll().then((level_role) => {
    fs.writeFileSync("./level_role_data.json", JSON.stringify(level_role));
});
