import { DataTypes, Model } from "sequelize";
import sequelize from "../../db";

class UserRoles extends Model{
    public userId:number;
    public roleId:number;
}

UserRoles.init({
    userId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    roleId:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
},{
    sequelize,
    modelName:'UserRoles',
    tableName:'user_roles'
});

export default UserRoles;