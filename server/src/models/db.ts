import {Sequelize} from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize=new Sequelize({
    dialect:'mysql',
    host:process.env.DB_HOST || 'localhost',
    username:process.env.DB_USER || 'root',
    password:process.env.DB_PASSWORD || 'pass',
    database:process.env.DB_NAME || 'voting_system',
    logging: false, // Disable logging in production
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        // Disable automatic pluralization and timestamps
        freezeTableName: true,
        timestamps: false
    }
});

export default sequelize;