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
    public category_id:number;
    public limit_date:Date;
    public is_suspended:boolean;
    public suspension_duration:number;
    public admin_id:number;
    public ballot_type: BallotType;
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
    },
    ballot_type: {
        type: DataTypes.ENUM(...Object.values(BallotType)),
        allowNull: false
    }
},{
    sequelize,
    modelName:'Ballot',
    tableName:'ballots'
});

export default Ballot;