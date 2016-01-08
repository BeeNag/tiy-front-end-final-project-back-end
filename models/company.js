var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var companySchema = new Schema({
	name: {
		type: String,
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
	phone_number: {
		type:
		required: true
	},
	url: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('Company', companySchema, 'companies');