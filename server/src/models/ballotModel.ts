import { DataTypes, Model } from "sequelize";
import sequelize from "./db";

class Ballot extends Model{
    public id:number;
    public description:string;
    public title:string;
    public type_id:number;
    public category_id:number;
    public limit_date:Date;
    public is_suspended:boolean;
    public suspension_duration:number;
    public admin_id:number;
}

Ballot.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    description:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    title:{
        type:DataTypes.STRING,
        allowNull:false
    },
    type_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    category_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    limit_date:{
        type:DataTypes.DATE,
        allowNull:false
    },
    is_suspended:{
        type:DataTypes.BOOLEAN,
        allowNull:false
    },
    suspension_duration:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    admin_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
},{
    sequelize,
    modelName:'Ballot',
    tableName:'ballots'
});

export default Ballot;