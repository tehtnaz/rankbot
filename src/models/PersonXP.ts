import { Model, InferAttributes, InferCreationAttributes, Sequelize, DataTypes } from "sequelize";
import { logInfo } from "../helpers/logging-helpers.js";
export class PersonXP extends Model<InferAttributes<PersonXP>, InferCreationAttributes<PersonXP>> {
    //user id
    declare user_id: string;
    //server Id
    declare server_id: string;
    //xp amount
    declare xp: number;
    //msg count
    declare msg: number;
    //counted msg
    declare counted_msg: number;
    //last msg
    declare date: number;
    //level
    declare lvl: number;
    //xp until next level
    declare lvlxp: number;

    public static m_init(sequelize: Sequelize) {
        PersonXP.init(
            {
                user_id: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                server_id: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                xp: {
                    type: DataTypes.NUMBER,
                    defaultValue: 0
                },
                msg: {
                    type: DataTypes.NUMBER,
                    defaultValue: 0
                },
                counted_msg: {
                    type: DataTypes.NUMBER,
                    defaultValue: 0
                },
                lvl: {
                    type: DataTypes.NUMBER,
                    defaultValue: 0
                },
                lvlxp: {
                    type: DataTypes.NUMBER,
                    defaultValue: 0
                },
                date: {
                    type: DataTypes.DATE,
                    defaultValue: 0
                }
            },
            { sequelize, timestamps: false }
        );
    }
    public messageUpdate_And_GainXp(min_xp: number, max_xp: number) {
        const xpGain = Math.ceil(Math.random() * (max_xp - min_xp) + min_xp);
        this.xp += xpGain;
        this.lvlxp += xpGain;
        this.msg++;
        this.date = Date.now();
    }
    public checkLevelUp(): boolean {
        if (this.lvlxp > 5 * Math.pow(this.lvl, 2) + 50 * this.lvl + 100) {
            logInfo("PersonXP.js", "previous xp: " + this.lvlxp);
            this.lvlxp -= 5 * Math.pow(this.lvl, 2) + 50 * this.lvl + 100;
            logInfo(
                "PersonXP.js",
                `removed ${5 * Math.pow(this.lvl, 2) + 50 * this.lvl + 100} xp during level up
                        current xp: ${this.lvlxp}`
            );
            this.lvl++;
            return true;
        } else {
            return false;
        }
    }
    public xpUntilLevelUp(): number {
        return 5 * Math.pow(this.lvl, 2) + 50 * this.lvl + 100 - this.lvlxp;
    }
    public addXP(xp: number) {
        this.xp += xp;
        this.lvlxp += xp;
        while (this.checkLevelUp()) {
            /**/
        }
    }
    public removeXP(remove_xp: number) {
        this.lvlxp = this.xp;
        this.xp -= remove_xp;
        this.lvlxp -= remove_xp;

        if (this.lvlxp < 0) this.lvlxp = 0;

        this.lvl = 0;
        while (this.checkLevelUp()) {
            /**/
        }
    }
}
