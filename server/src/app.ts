import express, { json } from 'express';
import dotenv from 'dotenv';
import sequelize from './models/db';
import fs from 'fs';
import path from 'path';

const app = express();

app.use(express.json());

//load all models dynamically
const modelsPath=path.join(__dirname,'models');
fs.readdirSync(modelsPath).forEach((file)=>{
	if(file.endsWith('.ts')) {
		import (`./models/${file}`);
	}
})

//init db
sequelize.sync({force:true})
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
