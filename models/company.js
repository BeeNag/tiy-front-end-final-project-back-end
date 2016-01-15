var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var companySchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true
	},
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
	city: {
		type: String,
		required: true
	},
	postcode: {
		type: String,
		required: true
	},
	phone_number: {
		type: String,
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