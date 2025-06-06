/**
 * Session Model
 * 
 * Represents a user session in the system. Sessions are used to track user authentication
 * state and manage auto-logout functionality. Each session has a fixed duration of 1 hour
 * from creation or last extension.
 */

import { Model, DataTypes } from "sequelize";
import sequelize from "../../db";
import { SESSION_DURATION_MS } from "../../../config/sessionConfig";

class Session extends Model {
    public id: number;
    public userId: number;
    public token: string;
    public expiresAt: Date;
    public isActive: boolean;
    public ipAddress: string;
    public userAgent: string;
}

Session.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Unique identifier for the session'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Reference to the user who owns this session'
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'JWT token used for authentication'
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => {
            const date = new Date();
            date.setTime(date.getTime() + SESSION_DURATION_MS);
            return date;
        },
        comment: 'Timestamp when this session expires'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        comment: 'Indicates if the session is currently active'
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'IP address of the client that created the session'
    },
    userAgent: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'N/A',
        comment: 'Browser/client information'
    }
}, {
    sequelize,
    modelName: 'Session',
    tableName: 'sessions',
    indexes: [
        {
            // Index for faster lookup of active sessions
            fields: ['userId', 'isActive']
        },
        {
            // Index for token-based session lookup
            fields: ['token']
        }
    ]
});

export default Session;