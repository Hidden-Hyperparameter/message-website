const { MONGO_DB_PASSWORD,MONGO_DB_USER,MY_ADDR } = require('./env');

// connect to the database
const databaseUrl = MONGO_DB_USER;
const apiKey = MONGO_DB_PASSWORD;
if(!databaseUrl || !apiKey){
    throw new Error('Cannot find dotenv file!')
}
var mongoose = require('mongoose')
const uri = 'mongodb+srv://' + databaseUrl  +':'+ apiKey +'@cluster0.4z3rfsn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
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

// Debug Functions
app.get('/allMessages', async function(req, res) {
    try{
        var data = await MessageSchema.find({}).populate('reply_list');
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

// Main Functions
app.get('/getOthersMessages', async function(req, res) {
    try{
        const usr = req.query.usr
        var data = await MessageSchema.find({usr: {$ne: usr}, sent: true}).sort({last_modified: -1}).populate('reply_list');
        res.send(data)
    }catch (err) {
        res.status(400).send({error: 'Unable to getOthersMessages: ' + err})
    }
})

app.get('/getMyUnpublicMessages', async function(req, res) {
    try{
        const usr = req.query.usr
        var data = await MessageSchema.find({usr: usr, sent: false}).sort({last_modified: -1}).populate('reply_list');
        res.send(data)
    }catch (err) {
        res.status(400).send({error: 'Unable to getMyUnpublicMessages ' + err})
    }
})

app.get('/getMyPublicMessages', async function(req, res) {
    try{
        const usr = req.query.usr
        var data = await MessageSchema.find({usr: usr, sent: true}).sort({last_modified: -1}).populate('reply_list');
        res.send(data)
    }catch (err) {
        res.status(400).send({error: 'Unable to getMyPublicMessages ' + err})
    }
})

app.get('/getById', async function(req, res) {
    try{
        const id = req.query.id
        // console.log('id',id);
        var data = await MessageSchema.findById(id).populate('reply_list');
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
        console.log('getUserInfo, input',usr)
        console.log('getUserInfo, result',data)
        if(!data){data = []}
        res.send(data)
    }catch (err) {
        res.status(400).send({error: 'Unable to getUserInfo ' + err})
    }
})

app.post('/getByIds', async function(req, res) {
    try{
        var ids = req.body.ids
        console.log('getByIds, input ids:',ids)
        var data = await MessageSchema.find({_id: {$in: ids}}).populate('reply_list');
        console.log('getByIds',data)
        res.send(data)
    }catch (err) {
        res.status(400).send({error: 'Unable to getById ' + err})
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

app.put('/updateUserInfo', async function(req, res) {
    try{
        const usr = req.query.usr
        const msg_id = req.query.msg_id
        console.log('input param',usr,msg_id)
        var data = await UserSchema.updateOne({usr: usr}, {$addToSet: {replied_questions: msg_id}});
        console.log('result',data)
        res.send(data)
    }catch (err) {
        res.status(400).send({error: 'Unable to updateUserInfo: ' + err})
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