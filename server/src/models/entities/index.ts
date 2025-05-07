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
User.belongsToMany(Role, {through: UserRoles, foreignKey: 'user_id'});
Role.belongsToMany(User, {through: UserRoles, foreignKey: 'role_id'});

//category-role
//category has many roles
//role belongs to many categories
Category.belongsToMany(Role, {through: CategoryRoles, foreignKey:'category_id'});
Role.belongsToMany(Category,{through:CategoryRoles, foreignKey:'role_id'});

//ballot-category
//ballot belongs to a category
//category has many ballots
Ballot.belongsTo(Category,{foreignKey:'category_id'});
Category.hasMany(Ballot, {foreignKey: 'category_id'});

//ballot-user (admin)
//ballot belongs to one admin
//one admin has many ballots
Ballot.belongsTo(User, {foreignKey: 'admin_id', as:'admin'});
User.hasMany(Ballot, {foreignKey:'admin_id', as:'admin'});

//ballot-options
//ballot has many options
//one option belongs to one ballot
Ballot.hasMany(VotingOption,{foreignKey:'ballot_id'});
VotingOption.belongsTo(Ballot,{foreignKey:'ballot_id'});

//vote-user
//one vote belongs to one user
//one user has many votes
Vote.belongsTo(User,{foreignKey:'user_id'});
User.hasMany(Vote,{foreignKey:'user_id'});

//vote-ballot
//one vot belongs to one ballot
//one ballot has many votes
Vote.belongsTo(Ballot,{foreignKey:'ballot_id'});
Ballot.hasMany(Vote,{foreignKey:'ballot_id'});

//vote-options
//one vote belongs to one option
//one voting option has many votes
Vote.belongsTo(VotingOption,{foreignKey:'option_id'});
VotingOption.hasMany(Vote,{foreignKey:'option_id'});

//user-session
//one user has many sessions
//one session belongs to one user
User.hasMany(Session,{foreignKey:'user_id', as:'sessions'});
Session.belongsTo(User,{foreignKey:'use_id',as:'user'});

export{
    User,Role,UserRoles,Category,CategoryRoles,Ballot,VotingOption,Vote,Session
};