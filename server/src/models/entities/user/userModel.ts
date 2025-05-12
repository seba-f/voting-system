import {Model,DataTypes} from 'sequelize';
import sequelize from '../../db';

class User extends Model{
    public id: number;
    public username:string;
    public email:string;
    public password:string;
    public isActive:boolean;
}

User.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    username:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false,
        get() {
            return undefined;
        }
    },
    isActive:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false
    }
},{
    sequelize,
    modelName:'User',
    tableName:'users'
});

export default User;