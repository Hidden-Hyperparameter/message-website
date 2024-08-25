const { URI,MY_ADDR } = require('./env');

// connect to the database
var mongoose = require('mongoose')
const uri = URI;
console.log('CONNECTING TO DATABASE')
var db = mongoose.connect(uri)
if(!db){
    throw new Error('Cannot connect to database!')
}
console.log('CONNECTED TO DATABASE')

// start the server
var express = require('express')
var app = express()
const cors = require('cors');
var bodyParser = require('body-parser')
// app.use(cors({
//     origin: 'http://localhost:3000'
// }));
app.use(cors({
    origin: MY_ADDR
}));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

var MessageSchema = require('./DataModels/msg')
var UserSchema = require('./DataModels/usr')
var ReplySchema = require('./DataModels/reply')
const ObjectId = require('mongoose').Types.ObjectId;

// ############# Debug Functions #############
app.get('/allMessages', async function(req, res) {
    try{
        var data = await MessageSchema.find({})
        await MessageSchema.populate(data, { path: 'reply_list', model: 'ReplySchema' });
        res.send(data)
    }catch (err) {
        res.status(400).send({error: 'Unable to allMessages: ' + err})
    }
})

app.get('/allReplies', async function(req, res) {
    try{
        var data = await ReplySchema.find({});
        res.send(data)
    }catch (err) {
        res.status(400).send({error: 'Unable to allReplies: ' + err})
    }
})

app.get('/allUsers', async function(req, res) {
    try{
        var data = await UserSchema.find({});
        res.send(data)
    }catch (err) {
        res.status(400).send({error: 'Unable to allUsers: ' + err})
    }
})

app.delete('/deleteMessageById', async function(req, res) {
    try{
        const id = req.query.id
        var log = ''
        // first, find the message
        var msg = await MessageSchema.findById(id)
        if(!msg) throw "Message is Not In Database!"
        // remove all replies in the reply_list
        var reply_list = msg.reply_list
        // find all users that do the reply
        var users = new Set()
        for(var i = 0; i < reply_list.length; i++){
            var reply = await ReplySchema.findById(reply_list[i])
            users.add(reply.usr)
        }
        // for these users, delete the message from their replied_questions
        for (let user of users){
            await UserSchema.updateOne({usr: user}, {$pull: {replied_questions: new ObjectId(id)}});
        }
        log += ('Remove reply from users: ' + Array.from(users) + '\n')
        // delete replies from reply_list
        await ReplySchema.deleteMany({_id: {$in: reply_list}})
        log += ('Remove replies: ' + reply_list + '\n')
        // delete the message
        await MessageSchema.findByIdAndDelete(id).exec() 
        log += ('Remove message: ' + id + '\n')
        res.send({'work done':log})
    }catch (err) {
        res.status(400).send({error: 'Unable to deleteAllMessages: ' + err})
    }
})

app.delete('/deleteReplyById', async function(req, res) {
    try{
        const id = req.query.id
        var log = ''
        // first, find the reply
        var reply = await ReplySchema.findById(id)
        if(!reply) throw "Reply is Not In Database!"
        // remove the reply from the message's reply_list
        // console.log('targeting',reply)
        // console.log(id)
        var parent_msg = await MessageSchema.findOne({reply_list: { $elemMatch: { $eq: new ObjectId(id) } } });
        if(!parent_msg) throw "This reply doesn't reply to a message!"
        // console.log('parent_msg',parent_msg)
        await MessageSchema.updateOne({_id: parent_msg._id}, {$pull: {reply_list: new ObjectId(id)}});
        log += ('Remove reply from message: ' + parent_msg)
        // remove the reply from the user's replied_questions
        await UserSchema.updateOne({usr: reply.usr}, {$pull: {replied_questions: new ObjectId(parent_msg._id)}});
        log += ('Remove reply from user: ' + reply.usr)
        // delete the reply
        await ReplySchema.findByIdAndDelete(id).exec()
        log += ('Remove reply: ' + id)
        res.send({'work done':log})
    }catch(err){
        res.status(400).send({error: 'Unable to deleteReplyById ' + err})
    }
})

// ############# Main Functions Begin #############

app.get('/getOthersMessages', async function(req, res) {
    try{
        const usr = req.query.usr
        var data = await MessageSchema.find({usr: {$ne: usr}, sent: true}).sort({last_modified: -1});
        await MessageSchema.populate(data, { path: 'reply_list', model: 'ReplySchema' });
        res.send(data)
    }catch (err) {
        res.status(400).send({error: 'Unable to getOthersMessages: ' + err})
    }
})

app.get('/getMyUnpublicMessages', async function(req, res) {
    try{
        const usr = req.query.usr
        var data = await MessageSchema.find({usr: usr, sent: false}).sort({last_modified: -1});
        await MessageSchema.populate(data, { path: 'reply_list', model: 'ReplySchema' });
        res.send(data)
    }catch (err) {
        res.status(400).send({error: 'Unable to getMyUnpublicMessages ' + err})
    }
})

app.get('/getMyPublicMessages', async function(req, res) {
    try{
        const usr = req.query.usr
        var data = await MessageSchema.find({usr: usr, sent: true}).sort({last_modified: -1});
        await MessageSchema.populate(data, { path: 'reply_list', model: 'ReplySchema' });
        res.send(data)
    }catch (err) {
        res.status(400).send({error: 'Unable to getMyPublicMessages ' + err})
    }
})

app.get('/getById', async function(req, res) {
    try{
        const id = req.query.id
        // console.log('id',id);
        var data = await MessageSchema.findById(id)
        await MessageSchema.populate(data, { path: 'reply_list', model: 'ReplySchema' });
        // console.log('Get',data)
        res.send(data)
    }catch (err) {
        res.status(400).send({error: 'Unable to getById ' + err})
    }
})

app.get('/getUserInfo', async function(req, res) {
    try{
        const usr = req.query.usr
        var data = await UserSchema.findOne({usr: usr});
        await UserSchema.populate(data, { path: 'replied_questions', model: 'MessageSchema' });
        await MessageSchema.populate(data.replied_questions, { path: 'reply_list', model: 'ReplySchema' });
        // console.log('getUserInfo, input',usr)
        // console.log('getUserInfo, result',data)
        if(!data)throw 'No User Found!'
        res.send(data)
    }catch (err) {
        res.status(400).send({error: 'Unable to getUserInfo ' + err})
    }
})

app.post('/UpdateMsg', async function(req, res) {
    try{
        var msg_item = new MessageSchema(req.body)
        var data = await MessageSchema.updateOne({_id: msg_item._id}, msg_item);
        res.send(data)
    }catch (err) {
        res.status(400).send({error: 'Unable to UpdateMsg: ' + err})
    }
})

app.post('/addNewSenderMsg', async function(req, res) {
    try{
        var data = new MessageSchema(req.body)
        result = await data.save()
        res.send(result)
    } catch (err) {
        res.status(400).send({error: 'Unable to addNewSenderMsg: ' + err})
    }
})

app.post('/addNewReplyMsg', async function(req, res) {
    try{
        var data = new ReplySchema(req.body)
        result = await data.save()
        res.send(result)
    } catch (err) {
        res.status(400).send({error: 'Unable to addNewReplyMsg: ' + err})
    }
})

app.post('/addNewUser', async function(req, res) {
    try{
        var data = new UserSchema(req.body)
        result = await data.save()
        res.send(result)
    } catch (err) {
        res.status(400).send({error: 'Unable to addNewUser: ' + err})
    }
})

// Note that HTTP is insensitive to cases
app.put('/updateUserInfo', async function(req, res) {
    try{
        const usr = req.query.usr
        const msg_id = req.query.msg_id
        // console.log('input param',usr,msg_id)
        var data = await UserSchema.updateOne({usr: usr}, {$addToSet: {replied_questions: new ObjectId(msg_id)}});
        // console.log('result',data)
        res.send(data)
    }catch (err) {
        res.status(400).send({error: 'Unable to updateUserInfo: ' + err})
    }
})

app.put('/UpdateUserRead',async function(req, res) {
    try{
        const usr = req.query.usr
        const msg_id = req.query.msg_id
        const index = req.query.index
        var data = await UserSchema.updateOne({usr: usr}, {$set: {["read_msg_list."+msg_id]: index}});
        res.send(data)
    }catch (err) {
        res.status(400).send({error: 'Unable to UpdateUserRead: ' + err})
    }
})

app.put('/addReplyToMsg', async function(req, res) {
    try{
        const msg_id = req.query.msg_id
        const reply_id = req.query.reply_id
        // Add reply_id to msg_id.reply_list
        var data = await MessageSchema.updateOne({_id: msg_id}, {$addToSet: {reply_list: new ObjectId(reply_id)}});
        res.send(data)
    }catch(err){
        res.status(400).send({error: 'Unable to AddReplyToMsg ' + err})
    }
})

app.delete('/deleteMsg', async function(req, res) {
    try{
        const id = req.query.id
        var data = await MessageSchema.findByIdAndDelete(id).exec()
        res.send(data)
    }catch (err) {
        res.status(400).send({error: 'Unable to deleteMsg ' + err})
    }
})

app.listen(3001,'0.0.0.0', () => {
    console.log('The Project Server is running on port 3001')
})