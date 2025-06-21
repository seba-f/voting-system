import User from "./user/userModel";
import Role from "./user/roleModel";
import UserRoles from "./intermediary/userRolesModel";
import Category from "./categories/categoryModel";
import CategoryRoles from "./intermediary/categoryRolesModel";
import Ballot from "./voting/ballotModel";
import VotingOption from "./voting/votingOptionsModel";
import Vote from "./voting/voteModel";
import Session from "./user/sessionModel";

//user-session
//user has many sessions
//session belongs to one user
User.hasMany(Session, {
	foreignKey: "userId",
	onDelete: "CASCADE",
});
Session.belongsTo(User, {
	foreignKey: "userId",
	onDelete: "CASCADE",
});

//user-role
//user has many roles
//role belongs to many users
User.belongsToMany(Role, {
	through: UserRoles,
	foreignKey: "userId",
	onDelete: "CASCADE",
});
Role.belongsToMany(User, {
	through: UserRoles,
	foreignKey: "roleId",
	onDelete: "CASCADE",
});

//category-role
//category has many roles
//role belongs to many categories
Category.belongsToMany(Role, {
	through: CategoryRoles,
	foreignKey: "categoryId",
	onDelete: "CASCADE",
});
Role.belongsToMany(Category, {
	through: CategoryRoles,
	foreignKey: "roleId",
	onDelete: "CASCADE",
});

//ballot-category
//ballot belongs to a category
//category has many ballots
Ballot.belongsTo(Category, {
	foreignKey: "categoryId",
	onDelete: "CASCADE",
});
Category.hasMany(Ballot, {
	foreignKey: "categoryId",
	onDelete: "CASCADE",
});

//ballot-user (admin)
//ballot belongs to one admin
//one admin has many ballots
//ballots are reassigned before admin deletion
Ballot.belongsTo(User, {
	foreignKey: "adminId",
	as: "admin",
});
User.hasMany(Ballot, {
	foreignKey: "adminId",
	as: "admin",
});

//ballot-options
//ballot has many options
//one option belongs to one ballot
Ballot.hasMany(VotingOption, {
	foreignKey: "ballotId",
	onDelete: "CASCADE",
});
VotingOption.belongsTo(Ballot, {
	foreignKey: "ballotId",
	onDelete: "CASCADE",
});

//vote-user
//one vote belongs to one user
//one user has many votes
Vote.belongsTo(User, {
	foreignKey: "userId",
	onDelete: "CASCADE",
});
User.hasMany(Vote, {
	foreignKey: "userId",
	onDelete: "CASCADE",
});

//vote-ballot
//one vote belongs to one ballot
//one ballot has many votes
Vote.belongsTo(Ballot, {
	foreignKey: "ballotId",
	onDelete: "CASCADE",
});
Ballot.hasMany(Vote, {
	foreignKey: "ballotId",
	onDelete: "CASCADE",
});

//vote-options
//one vote belongs to one option
//one voting option has many votes
Vote.belongsTo(VotingOption, { foreignKey: "optionId" });
VotingOption.hasMany(Vote, { foreignKey: "optionId" });

//user-session
//one user has many sessions
//one session belongs to one user
User.hasMany(Session, { foreignKey: "userId", as: "sessions" });
Session.belongsTo(User, { foreignKey: "userId", as: "user" });

export {
	User,
	Role,
	UserRoles,
	Category,
	CategoryRoles,
	Ballot,
	VotingOption,
	Vote,
	Session,
};
