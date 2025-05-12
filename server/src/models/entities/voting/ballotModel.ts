import { DataTypes, Model } from "sequelize";
import sequelize from "../../db";

export enum BallotType {
    SINGLE_CHOICE = 'SINGLE_CHOICE',     // One option only
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE', // Multiple options allowed
    RANKED_CHOICE = 'RANKED_CHOICE',  // Rank options by preference
    LINEAR_CHOICE = 'LINEAR_CHOICE',   //
    TEXT_INPUT = 'TEXT_INPUT',          // Free text response
    YES_NO = 'YES_NO'                   // Simple yes/no vote 
}

class Ballot extends Model{
    public id:number;
    public description:string;
    public title:string;
    public categoryId:number;
    public limitDate:Date;
    public isSuspended:boolean;
    public suspensionDuration:number;
    public adminId:number;
    public ballotType: BallotType;
}

Ballot.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    description:{
        type:DataTypes.STRING,
        allowNull:false
    },
    title:{
        type:DataTypes.STRING,
        allowNull:false
    },
    categoryId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    limitDate:{
        type:DataTypes.DATE,
        allowNull:false
    },
    isSuspended:{
        type:DataTypes.BOOLEAN,
        allowNull:false
    },
    suspensionDuration:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    adminId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    ballotType: {
        type: DataTypes.ENUM(...Object.values(BallotType)),
        allowNull: false
    }
},{
    sequelize,
    modelName:'Ballot',
    tableName:'ballots'
});

export default Ballot;