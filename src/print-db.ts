import { PersonXP } from "./models/PersonXP.js";
import { LevelRole } from "./models/LevelRole.js";
import { Sequelize } from "sequelize-typescript";
import fs from "fs";
new Sequelize({
    dialect: "sqlite",
    storage: "database.sqlite",
    logging: false,
    models: [LevelRole, PersonXP]
}).afterInit("confirm_hook", () => {
    PersonXP.findAll().then((person_xp) => {
        fs.writeFileSync("./person_xp_data.json", JSON.stringify(person_xp));
    });
    LevelRole.findAll().then((level_role) => {
        fs.writeFileSync("./level_role_data.json", JSON.stringify(level_role));
    });
});
