import { DataTypes, Model } from "sequelize";
import sequelize from "./db";

class Role extends Model{
    public id:number;
    public name:string;
}

Role.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    }
},{
    sequelize,
    modelName:'Role',
    tableName:'Roles'
});
export default Role;