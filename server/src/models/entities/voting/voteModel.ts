import { DataTypes, Model } from "sequelize";
import sequelize from "../../db";
import { BallotType } from "./ballotModel";

class Vote extends Model {
    public id: number;
    public userId: number;
    public ballotId: number;
    public optionId: number;
    public textResponse: string;
    public timestamp: Date;
    public rank: number;
}

Vote.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ballotId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    optionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    textResponse: {
        type: DataTypes.TEXT,
        allowNull: true
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