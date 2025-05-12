import { DataTypes, Model } from "sequelize";
import sequelize from "../../db";

class CategoryRoles extends Model{
    public roleId:number;
    public categoryId:number;
}

CategoryRoles.init({
    roleId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    categoryId:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
},{
    sequelize,
    modelName:'CategoryRoles',
    tableName:'category_roles'
});

export default CategoryRoles;
