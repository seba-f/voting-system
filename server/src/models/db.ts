import {Sequelize} from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize=new Sequelize({
    dialect:'mysql',
    host:process.env.DB_HOST || 'localhost',
    username:process.env.DB_USER || 'root',
    password:process.env.DB_PASSWORD || 'pass',
    database:process.env.DB_NAME || 'voting_system',
    logging: console.log
});

export default sequelize;