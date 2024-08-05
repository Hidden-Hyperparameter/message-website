var mongoose = require('mongoose')
var Schema = mongoose.Schema

var message = new Schema({
    usr:String,
    content:String,
    last_modified: Date,
    sent: {type:Boolean, default: false},
    reply_list: {type:Array,default:[]},
})

module.exports = mongoose.model('MessageSchema', message)