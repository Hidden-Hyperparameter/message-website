var mongoose = require('mongoose')
var Schema = mongoose.Schema

var reply = new Schema({
    usr:String,
    content:String,
    last_modified: Date,
    sent: {type:Boolean, default: false},
})

module.exports = mongoose.model('ReplySchema', reply)