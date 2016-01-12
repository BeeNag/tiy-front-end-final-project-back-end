var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var excavationSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	address1: {
		type: String,
		required: true
	},
	address2: {
		type: String
	},
	address3: {
		type: String
	},
	postcode: {
		type: String,
		required: true
	},
	duration: {
		type: String,
		required: true
	},
	url: {
		type: String,
		required: true
	},
	description: {
		type: String
	}
});

module.exports = mongoose.model('Excavation', excavationSchema, 'excavations');