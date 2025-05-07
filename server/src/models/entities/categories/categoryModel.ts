import { DataTypes, Model } from "sequelize";
import sequelize from "../../db";

class Category extends Model{
    public id:number;
    public name:string;
}

Category.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    }
},{
    sequelize,
    modelName:'Category',
    tableName:'categories'
});
export default Category;