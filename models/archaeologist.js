var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var archaeologistSchema = new Schema({
	first_name: {
		type: String,
		required: true
	},
	last_name: {
		type: String,
		required: true
	},
	date_of_birth: {
		type: Date,
		required: true
	},
	address: {
		type: String,
		required: true
	},
	city: {
		type: String,
		required: true
	},
	postcode: {
		type: String,
		required: true
	},
	home_phone_number: {
		type: String,
		required: true
	},
	mobile_phone_number: {
		type: String,
		required: true
	},
	experience: {
		type: String,
		required: true
	},
	specialism: {
		type: String,
		required: true
	},
	cscs_card: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	created_at: {
		type: Date.now
	}
});

module.exports = mongoose.model('Archaeologist', archaeologistSchema, 'archaeologists');