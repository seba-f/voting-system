import { Model,DataTypes } from "sequelize";
import sequelize from "../../db";

class Session extends Model{
    public id:number;
    public userId:number;
    public token:string;
    public expiresAt:Date;
    public isActive:boolean;
    public ipAddress:string;
    public userAgent:string;
}

Session.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    userId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    token:{
        type:DataTypes.STRING,
        allowNull:false
    },
    expiresAt:{
        type:DataTypes.DATE,
        allowNull:false,
        defaultValue: ()=>{
            const date=new Date();
            date.setHours(date.getHours()+1);
            return date;
        }
    },
    isActive:{
        type:DataTypes.BOOLEAN,
        allowNull:false
    },
    ipAddress:{
        type:DataTypes.STRING,
        allowNull:false
    },
    userAgent:{
        type:DataTypes.STRING,
        allowNull:false,
        defaultValue:'N/A'
    }
},{
    sequelize,
    modelName:'Session',
    tableName:'sessions'
});

export default Session;