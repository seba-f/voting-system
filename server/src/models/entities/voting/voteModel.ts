import { DataTypes, Model } from "sequelize";
import sequelize from "../../db";
import { BallotType } from "./ballotModel";

class Vote extends Model {
    public id: number;
    public user_id: number;
    public ballot_id: number;
    public option_id: number;
    public text_response: string;
    public timestamp: Date;
    public rank: number;
}

Vote.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ballot_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    option_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    text_response: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    rank: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    sequelize,
    modelName: 'Vote',
    tableName: 'Votes'
});

export default Vote;