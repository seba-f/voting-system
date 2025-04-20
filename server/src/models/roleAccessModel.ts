import { DataTypes, Model } from "sequelize";
import sequelize from "./db";

class RoleAccess extends Model{
    public role_id:number;
    public category_id:number;
}

RoleAccess.init({
    role_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    category_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
    }
},{
    sequelize,
    modelName:'RoleAccess',
    tableName:'role_access'
});

export default RoleAccess;