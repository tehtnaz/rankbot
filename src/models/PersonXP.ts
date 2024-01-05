import { InferAttributes, InferCreationAttributes } from "sequelize";
import { Model, DataType, Table, Column, AllowNull, Default } from "sequelize-typescript";
import { logInfo } from "../helpers/logging-helpers.js";

@Table({ freezeTableName: false, paranoid: false, timestamps: false })
export class PersonXP extends Model<InferAttributes<PersonXP>, InferCreationAttributes<PersonXP>> {
    @AllowNull(false)
    @Column(DataType.STRING(64))
    declare user_id: string;

    @AllowNull(false)
    @Column(DataType.STRING(64))
    declare server_id: string;

    @AllowNull(false)
    @Default(0)
    @Column(DataType.INTEGER)
    declare xp: number;

    @AllowNull(false)
    @Default(0)
    @Column(DataType.INTEGER)
    declare counted_msg: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare date: number; // UNIX timestamp of last sent msg

    @AllowNull(false)
    @Default(0)
    @Column(DataType.INTEGER)
    declare lvl: number;

    @AllowNull(false)
    @Default(0)
    @Column(DataType.INTEGER)
    declare lvlxp: number;

    public messageUpdate_And_GainXp(min_xp: number, max_xp: number) {
        const xpGain = Math.ceil(Math.random() * (max_xp - min_xp) + min_xp);
        this.xp += xpGain;
        this.lvlxp += xpGain;
        this.counted_msg++;
        this.date = Date.now();
    }
    public checkLevelUp(logOutput: boolean): boolean {
        const calc = 5 * Math.pow(this.lvl, 2) + 50 * this.lvl + 100;
        if (this.lvlxp > calc) {
            if (logOutput) logInfo("PersonXP.js", "previous xp: " + this.lvlxp);
            this.lvlxp -= calc;
            if (logOutput)
                logInfo(
                    "PersonXP.js",
                    `removed ${calc} xp during level up
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
    public addXP(xp: number, dontLogOutput?: boolean) {
        this.xp += xp;
        this.lvlxp += xp;
        let levelUpCount = 0;
        while (this.checkLevelUp(false)) {
            levelUpCount++;
        }
        if (!dontLogOutput)
            logInfo("PersonXP.js", `Added ${levelUpCount} level(s) to ${this.user_id} on server ${this.server_id}`);
    }
    public removeXP(remove_xp: number) {
        this.lvlxp = this.xp;
        this.xp -= remove_xp;
        this.lvlxp -= remove_xp;

        if (this.lvlxp < 0) this.lvlxp = 0;

        this.lvl = 0;
        while (this.checkLevelUp(false)) {
            /**/
        }
    }
}
export default PersonXP;
