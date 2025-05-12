import User from './user/userModel';
import Role from './user/roleModel';
import UserRoles from './intermediary/userRolesModel';
import Category from './categories/categoryModel';
import CategoryRoles from './intermediary/categoryRolesModel';
import Ballot from './voting/ballotModel';
import VotingOption from './voting/votingOptionsModel';
import Vote from './voting/voteModel';
import Session from './user/sessionModel';

//user-role
//user has many roles
//role belongs to many users
User.belongsToMany(Role, {through: UserRoles, foreignKey: 'userId'});
Role.belongsToMany(User, {through: UserRoles, foreignKey: 'roleId'});

//category-role
//category has many roles
//role belongs to many categories
Category.belongsToMany(Role, {through: CategoryRoles, foreignKey: 'categoryId'});
Role.belongsToMany(Category, {through: CategoryRoles, foreignKey: 'roleId'});

//ballot-category
//ballot belongs to a category
//category has many ballots
Ballot.belongsTo(Category, {foreignKey: 'categoryId'});
Category.hasMany(Ballot, {foreignKey: 'categoryId'});

//ballot-user (admin)
//ballot belongs to one admin
//one admin has many ballots
Ballot.belongsTo(User, {foreignKey: 'adminId', as: 'admin'});
User.hasMany(Ballot, {foreignKey: 'adminId', as: 'admin'});

//ballot-options
//ballot has many options
//one option belongs to one ballot
Ballot.hasMany(VotingOption, {foreignKey: 'ballotId'});
VotingOption.belongsTo(Ballot, {foreignKey: 'ballotId'});

//vote-user
//one vote belongs to one user
//one user has many votes
Vote.belongsTo(User, {foreignKey: 'userId'});
User.hasMany(Vote, {foreignKey: 'userId'});

//vote-ballot
//one vot belongs to one ballot
//one ballot has many votes
Vote.belongsTo(Ballot, {foreignKey: 'ballotId'});
Ballot.hasMany(Vote, {foreignKey: 'ballotId'});

//vote-options
//one vote belongs to one option
//one voting option has many votes
Vote.belongsTo(VotingOption, {foreignKey: 'optionId'});
VotingOption.hasMany(Vote, {foreignKey: 'optionId'});

//user-session
//one user has many sessions
//one session belongs to one user
User.hasMany(Session, {foreignKey: 'userId', as: 'sessions'});
Session.belongsTo(User, {foreignKey: 'userId', as: 'user'});

export{
    User,Role,UserRoles,Category,CategoryRoles,Ballot,VotingOption,Vote,Session
};