import { PersonXP } from "./models/PersonXP.js";
import { Sequelize } from "sequelize-typescript";

// ! C'mon, don't use this negligently sysadmins
new Sequelize({
    dialect: "sqlite",
    storage: "database.sqlite",
    logging: false,
    models: [PersonXP]
}).afterInit("confirm_hook", () => {
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
});
