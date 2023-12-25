import {InferAttributes, InferCreationAttributes} from "sequelize"
import { Model, DataType, Table, Column, AllowNull, Default } from "sequelize-typescript";

@Table({ freezeTableName: true, paranoid: false, timestamps: false })
export class LevelRole extends Model<InferAttributes<LevelRole>, InferCreationAttributes<LevelRole>> {
    @AllowNull(false)
    @Column(DataType.STRING(64))
    declare server_id: string;

    @AllowNull(false)
    @Column(DataType.STRING(64))
    declare role_id: string;

    @AllowNull(false)
    @Column(DataType.NUMBER)
    @Default(0)
    declare level: number;
}
export default LevelRole;

export async function getClosestRoleID(level: number, server_id: string): Promise<string | undefined> {
    const server_roles = await LevelRole.findAll({
        where: { server_id: server_id }
    });
    let temp_level = 0;
    let final_id: string | undefined;
    server_roles.forEach((value) => {
        if (value.level > temp_level && value.level <= level) {
            temp_level = value.level;
            final_id = value.role_id;
        }
    });
    return final_id;
}

export async function findJoinRoleID(server_id: string): Promise<string[] | undefined> {
    const result = await LevelRole.findAll({
        where: { server_id: server_id, level: 0 }
    });
    const return_array: string[] = [];
    if (result) {
        result.map((role) => {
            return_array.push(role.role_id);
        });
        return return_array;
    } else {
        return undefined;
    }
}
