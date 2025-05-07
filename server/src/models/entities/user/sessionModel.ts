import { Model,DataTypes } from "sequelize";
import sequelize from "../../db";

class Session extends Model{
    public id:number;
    public user_id:number;
    public token:string;
    public expires_at:Date;
    public is_active:boolean;
    public ip_address:string;
    public user_agent:string;
}

Session.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    user_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    token:{
        type:DataTypes.STRING,
        allowNull:false
    },
    expires_at:{
        type:DataTypes.DATE,
        allowNull:false,
        defaultValue: ()=>{
            const date=new Date();
            date.setHours(date.getHours()+1);
            return date;
        } //1h token
    },
    is_active:{
        type:DataTypes.BOOLEAN,
        allowNull:false
    },
    ip_address:{
        type:DataTypes.STRING,
        allowNull:false
    },
    user_agent:{
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