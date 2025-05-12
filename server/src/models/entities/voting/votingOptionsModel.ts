import { DataTypes, Model } from "sequelize";
import sequelize from "../../db";

class VotingOption extends Model{
    public id:number;
    public ballotId:number;
    public title:string;
    public isText:boolean;
}

VotingOption.init({
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },
    ballotId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    title:{
        type:DataTypes.STRING,
        allowNull:false
    },
    isText:{
        type:DataTypes.BOOLEAN,
        allowNull:false
    }
},{
    sequelize,
    modelName:'VotingOption',
    tableName:'voting_options'
});
export default VotingOption;