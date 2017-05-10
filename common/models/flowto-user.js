'use strict';

module.exports = function(Flowtouser) {
/*
Flowtouser.afterSave = function(next) {
	this.avatar=this.username;
	console.log('save avatar by:'+this.avatar);
	next();
}
	*/
Flowtouser.beforeCreate = function(next, modelInstance) {
	modelInstance.avatar=modelInstance.email[0].toUpperCase();
	next();
}
};
