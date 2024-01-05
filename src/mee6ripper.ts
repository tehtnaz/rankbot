import axios from "axios";
import fs from "node:fs";
import readLine from "readline-sync";
import { Sequelize } from "sequelize-typescript";
import PersonXP from "./models/PersonXP.js";
import LevelRole from "./models/LevelRole.js";
// import { json2csv } from 'json-2-csv'; //! optional import, in case you want the output as CSV

/*
    -- How to transfer --

    1. npx tsc
    2. npm run mee6ripper <max_page_num> <server_id>
    3. Make sure database.sqlite already exists, otherwise run: node ./package/dbInit.js --force
    4. npm run mee6ripper transfer

    -- How to output ranges --

    mee6ripper output_json <max_page_num> <server_id>
    OR
    mee6ripper output_csv <max_page_num> <server_id>
    OR
    mee6ripper output_json output_csv <max_page_num> <server_id>

*/

interface PersonLevel {
    id: string;
    xp: number;
    message_count: number;
    level: number;
    username: string;
}

interface RoleReward {
    role_id: string;
    level: number;
    name: string;
}

const output_json = process.argv.includes("output_json");
// const output_csv = process.argv.includes("output_csv");
const transfer = process.argv.includes("transfer");
const output_sql = !output_json && !transfer /* && !output_csv */;

const parsedNum = Number.parseInt(process.argv.slice(-2)[0]);
const maxPageNum = Number.isNaN(parsedNum) ? 5 : parsedNum;

const serverId = !transfer ? BigInt(process.argv.slice(-1)[0]).toString() : null;

if (!serverId && !transfer) throw new Error("Bad serverId. Make sure it's a Snowflake");

async function GetPageLevels(serverId: string, pageNum: number) {
    const levels: PersonLevel[] = [];
    const temp = await axios.get(
        `https://mee6.xyz/api/plugins/levels/leaderboard/${serverId}?limit=1000&page=${pageNum}`
    );
    for (const item of temp.data.players) {
        levels.push({
            id: item.id,
            xp: item.xp,
            message_count: item.message_count,
            level: item.level,
            username: item.username
        });
    }
    return levels;
}

async function GetRoleRewards(serverId: string): Promise<Required<RoleReward>[]> {
    const data = (await axios.get(`https://mee6.xyz/api/plugins/levels/leaderboard/${serverId}?limit=1`)).data;
    return (data.role_rewards as any[]).map((role_reward) => {
        return { role_id: role_reward.role.id, level: role_reward.rank, name: role_reward.role.name };
    });
}

async function GetAllLevels(serverId: string, maxPageNum: number): Promise<PersonLevel[]> {
    const levels: PersonLevel[] = [];
    for (let i = 0; i < maxPageNum; i++) {
        levels.push(...(await GetPageLevels(serverId, i)));
    }
    console.log(`Got data from ${levels.length} users`);
    return levels;
}

async function ParseLevelsIntoRanges(serverId: string, maxPageNum: number) {
    const peoplePerRange: { range: string; count: number; maxRange: number }[] = [];
    const levels: PersonLevel[] = await GetAllLevels(serverId, maxPageNum);
    fs.writeFileSync("levels.json", JSON.stringify(levels));

    let consumedAmount = 0;
    let consumed: PersonLevel[] = [];
    let xpMaxRange = 0;

    while (consumedAmount < levels.length) {
        //consumed = levels.filter((val) => {return (val.xp >= xpMaxRange - 10) && (val.xp < xpMaxRange)});
        consumed = levels.filter((val) => {
            return val.level === xpMaxRange;
        });
        consumedAmount += consumed.length;
        xpMaxRange += 1;
        //if(consumed.length !== 0)
        peoplePerRange.push({ maxRange: xpMaxRange, range: `Level ${xpMaxRange}`, count: consumed.length });
        //peoplePerRange.push({maxRange: xpMaxRange, range: `From ${xpMaxRange - 10} to ${xpMaxRange - 1}`, count: consumed.length});
    }

    if (output_json) fs.writeFileSync("ranges.json", JSON.stringify(peoplePerRange));
    // if(output_csv) fs.writeFileSync("ranges.csv", json2csv(peoplePerRange)) //! optional, in case you want the output as CSV
}

async function ParseLevelsIntoDatabase(serverId: string, maxPageNum: number) {
    await new Sequelize({
        dialect: "sqlite",
        storage: "mee6levels.sqlite",
        logging: false,
        models: [LevelRole, PersonXP]
    }).sync({ force: true });
    console.log("\n-- Getting and converting all levels... this may take a while! --");
    const levels = await GetAllLevels(serverId, maxPageNum);
    const dontOutput = process.argv.includes("silent");
    for (const personLevel of levels) {
        const personXp = await PersonXP.create({
            user_id: personLevel.id,
            xp: 0,
            counted_msg: personLevel.message_count,
            date: 0,
            lvl: 0,
            lvlxp: 0,
            server_id: serverId
        });
        personXp.addXP(personLevel.xp, true);
        personXp.save();
        if (dontOutput === false) process.stdout.write("\rCreated new PersonXP for " + personLevel.id);
    }
    process.stdout.write("\n");
}

async function TransferAllDataIntoDatabase() {
    const prodDb = new Sequelize({
        dialect: "sqlite",
        storage: "database.sqlite",
        logging: console.log, //(sql) => {process.stdout.write("\r" + sql)},
        models: [LevelRole, PersonXP],
        repositoryMode: true
    });
    const tempDb = new Sequelize({
        dialect: "sqlite",
        storage: "mee6levels.sqlite",
        logging: false,
        models: [PersonXP],
        repositoryMode: true
    });
    const prodPersonXp = prodDb.getRepository(PersonXP);
    const levelRole = prodDb.getRepository(LevelRole);

    const tempPersonXp = tempDb.getRepository(PersonXP);

    const allTempLevels = await tempPersonXp.findAll();
    const sameOrNewQuestion = readLine.question(
        "Would you like to transfer all the data to a new server or to the same server as before? (same/new): "
    );
    const server_id =
        sameOrNewQuestion === "same"
            ? allTempLevels[0].server_id
            : readLine.questionInt("What is the ID of the new server?: ").toString();

    if ((await prodPersonXp.findOne({ where: { server_id } })) !== null) {
        if (
            readLine.question("\nData already exists for the server! Would you like to clear it? (yes/no): ") === "yes"
        ) {
            await prodPersonXp.destroy({ where: { server_id } });
            await levelRole.destroy({ where: { server_id } });
        } else return;
    }

    const allRoleRewards = await GetRoleRewards(allTempLevels[0].server_id);
    for (const roleReward of allRoleRewards) {
        const newId =
            sameOrNewQuestion === "same"
                ? roleReward.role_id
                : readLine.questionInt(
                      `roleReward named "${roleReward.name}" with level requirement "${roleReward.level}" has a stored role id of "${roleReward.role_id}"\nWhat would you like the new ID of it to be?: `
                  );
        await levelRole.create({
            server_id,
            role_id: newId.toString(),
            level: roleReward.level
        });
    }
    const promiseArray: Promise<any>[] = [];
    for (const personXp of allTempLevels) {
        promiseArray.push(
            prodPersonXp.create({
                user_id: personXp.user_id,
                server_id: personXp.server_id,
                counted_msg: personXp.counted_msg,
                xp: personXp.xp,
                date: 0,
                lvl: personXp.lvl,
                lvlxp: personXp.lvlxp
            })
        );
    }
    Promise.all(promiseArray).then(() => {
        console.log("Finished all syncing. Enjoy your new levels!");
    });
}

if (serverId && output_json /* || output_csv*/) {
    ParseLevelsIntoRanges(serverId, maxPageNum);
}
if (serverId && output_sql) {
    ParseLevelsIntoDatabase(serverId, maxPageNum);
}
if (transfer) {
    TransferAllDataIntoDatabase();
}
// ParseLevelsIntoFile(15);
