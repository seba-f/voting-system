import { DataTypes, Model } from "sequelize";
import sequelize from "../../db";

class UserRoles extends Model{
    public user_id:number;
    public role_id:number;
}

UserRoles.init({
    user_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    role_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
},{
    sequelize,
    modelName:'UserRoles',
    tableName:'user_roles'
});

export default UserRoles;