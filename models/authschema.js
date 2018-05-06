var mongoose = require('mongoose');
var schema = mongoose.Schema;

var auth = new schema({
	'firstname': String,
	'lastname': String,
    'email': String,
	'bloodgroup': String,
	'phone': Number,
	'address': String,
	'state': String,
	'password':String,
    'token':String
});

module.exports = mongoose.model('Auth',auth);