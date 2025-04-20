import { DataTypes, Model } from "sequelize";
import sequelize from "./db";

class VotingOption extends Model{
    public id:number;
    public ballot_id:number;
    public text:string;
}

VotingOption.init({
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    ballot_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    text:{
        type:DataTypes.STRING,
        allowNull:false
    }
},{
    sequelize,
    modelName:'VotingOption',
    tableName:'voting_options'
});
export default VotingOption;