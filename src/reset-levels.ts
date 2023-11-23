import { PersonXP } from "./models/PersonXP.js";
import { Sequelize } from "sequelize";
const sequelize = new Sequelize("database", "user", "password", {
    host: "localhost",
    dialect: "sqlite",
    logging: false,
    storage: "database.sqlite"
});

PersonXP.m_init(sequelize);

PersonXP.findAll().then((person_xp) => {
    person_xp.forEach(async (item) => {
        console.log(`id: ${item.user_id} lvl: ${item.lvl}`);
        item.lvlxp = item.xp;
        item.lvl = 0;
        item.addXP(1);
        console.log(`id: ${item.user_id} lvl: ${item.lvl}`);
        await item.save();
    });
});
