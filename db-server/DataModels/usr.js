var mongoose = require('mongoose')
var Schema = mongoose.Schema

var message = new Schema({
    usr:String,
    password:String,
    replied_questions: {type:Array,default:[]},
    read_msg_list: {type:Map,of:Number,default:{}},
})

module.exports = mongoose.model('UserSchema', message)