var mongoose = require('mongoose')
var Schema = mongoose.Schema

var message = new Schema({
    usr: String,
    password: String,
    replied_questions: { type: Array, default: [] },
    read_msg_list: { type: Map, of: Number, default: {} },
    last_check_in_date: { type: Date, default: new Date('2000-01-01') },
    streak_check_in: { type: Number, default: 0 },
    chicken_soup_num: { type: Number, default: 0 }
})

module.exports = mongoose.model('UserSchema', message)