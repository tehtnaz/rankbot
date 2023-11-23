import { Model, InferAttributes, InferCreationAttributes, Sequelize, DataTypes } from "sequelize";
export class LevelRole extends Model<InferAttributes<LevelRole>, InferCreationAttributes<LevelRole>> {
    declare server_id: string;
    //role id
    declare role_id: string;
    //level
    declare level: number;

    public static m_init(sequelize: Sequelize) {
        LevelRole.init(
            {
                server_id: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                role_id: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                level: {
                    type: DataTypes.NUMBER,
                    allowNull: false,
                    defaultValue: 0
                }
            },
            { sequelize, timestamps: false }
        );
    }
}

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
