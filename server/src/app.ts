import express, { json } from 'express';
import dotenv from 'dotenv';
import sequelize from './models/db';
import './models/entities'
import fs from 'fs';
import path from 'path';
import authRouter from './routes/authRouter';

const app = express();

app.use(express.json());
app.use('/api',authRouter);

//init db
sequelize.sync({alter:true})
.then(()=>{
	console.log('Database connected successfully');
	console.log('Registered models: ', Object.keys(sequelize.models));
})
.then(result=>{
	const PORT = process.env.PORT || 5000;
	app.listen(PORT,()=>{
		console.log(`Server running on port ${PORT}`);
		
	})
})
.catch((err)=>{
	console.error('Unable to connect to database: ',err);
});
