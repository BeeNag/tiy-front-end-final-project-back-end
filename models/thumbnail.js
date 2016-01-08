var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var thumbnailSchema = new Schema({
	filename: String
});

module.exports = mongoose.model('Thumbnail', thumbnailSchema, 'thumbnails');