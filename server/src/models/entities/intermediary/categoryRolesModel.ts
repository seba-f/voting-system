import { DataTypes, Model } from "sequelize";
import sequelize from "../../db";

class CategoryRoles extends Model{
    public role_id:number;
    public category_id:number;
}

CategoryRoles.init({
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
    modelName:'CategoryRoles',
    tableName:'category_roles'
});

export default CategoryRoles;
