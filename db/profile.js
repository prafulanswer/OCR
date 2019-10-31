var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var profileSchema = new mongoose.Schema({
    username: String, 
    firstname : String,
    address : String, 
    gender : String,
    img : String 
});

profileSchema.plugin(timestamps);
module.exports = mongoose.model('profileList',profileSchema,'profileList');
