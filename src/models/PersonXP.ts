import { InferAttributes, InferCreationAttributes } from "sequelize";
import { Model, DataType, Table, Column, AllowNull, Default } from "sequelize-typescript";
import { logInfo } from "../helpers/logging-helpers.js";

@Table({ freezeTableName: true, paranoid: false, timestamps: false })
export class PersonXP extends Model<InferAttributes<PersonXP>, InferCreationAttributes<PersonXP>> {
    @AllowNull(false)
    @Column(DataType.STRING(64))
    declare user_id: string;

    @AllowNull(false)
    @Column(DataType.STRING(64))
    declare server_id: string;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    @Default(0)
    declare xp: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    @Default(0)
    declare msg: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    @Default(0)
    declare counted_msg: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare date: number; // UNIX timestamp of last sent msg

    @AllowNull(false)
    @Column(DataType.INTEGER)
    @Default(0)
    declare lvl: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    @Default(0)
    declare lvlxp: number;

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
export default PersonXP;
