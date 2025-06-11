import {Model,DataTypes,Op} from 'sequelize';
import sequelize from '../../db';
import Role from './roleModel';
import Ballot from '../voting/ballotModel';

class User extends Model{
    public id: number;
    public username:string;
    public email:string;
    public password:string;
    public isActive:boolean;
}

User.init({    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },    
    email:{
        type:DataTypes.STRING(255),
        allowNull:false,
        unique: 'compositeIndex',
        validate: {
            isEmail: true
        }
    },
    username:{
        type:DataTypes.STRING,
        allowNull:false
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
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

// Hook to handle ballot reassignment before user deletion
User.beforeDestroy(async (user: User) => {
    try {
        // Find a valid admin to transfer ballots to
        const nextAdmin = await User.findOne({
            where: {
                id: { [Op.ne]: user.id } // Not the user being deleted
            },
            include: [{
                model: Role,
                where: {
                    name: { [Op.in]: ['admin', 'DefaultAdmin'] }
                }
            }]
        });

        if (!nextAdmin) {
            throw new Error('Cannot delete the last admin user');
        }

        // Reassign all ballots to the next admin
        await Ballot.update(
            { adminId: nextAdmin.id },
            { where: { adminId: user.id } }
        );

    } catch (error) {
        throw error;
    }
});

export default User;