import NotificationService,{NotificationEnum} from "./Notification"
import HttpService from "./HttpService"
import { ConnectionStates } from "mongoose"
let ns = new NotificationService()
let http = new HttpService()

let instance = null
class DataService { // singleton
    constructor() {
        if (!instance) {
            instance = this
        }
        return instance
    }

    getOtherMessageFromDB = async (usr) => {
        try{
            var fetched_msg = await http.getOthersMessages(usr)
            var replied_msg_lst = (await http.getUserInfo(usr)).replied_questions
            if(!replied_msg_lst) throw '????'
        }catch(err){
            console.error(err)
        }
        replied_msg_lst = replied_msg_lst.map((msg) => msg._id) // get the id of the replied messages
        fetched_msg = fetched_msg.filter(
            (msg) => {
                return !replied_msg_lst.includes(msg._id)
            }
        )
        var x = fetched_msg.sort((a, b) => {
            if(a.last_modified != b.last_modified){
                return a.last_modified > b.last_modified ? -1 : 1;
            }else{
                return b.reply_list.length > a.reply_list.length ? 1 : -1;
            }
        })
        return x
    }

    getOneOtherMsg = async (usr) => {
        var fetched_msg = await this.getOtherMessageFromDB(usr)
        if(fetched_msg.length){
            var rnd_idx = Math.floor(Math.random() * fetched_msg.length)
            return fetched_msg[rnd_idx]
        }
        return undefined;
    }

    getMyUnpublicDataFromDB = async (usr) => {
        try{
            var fetched_msg = await http.getMyUnpublicMessages(usr)
            var data = fetched_msg.sort(
                (a, b) => { 
                    return a.last_modified > b.last_modified ? -1 : 1;
            });
            return data
        } catch(err){
            console.error(err)
        }
    }

    getMyPublicDataFromDB = (usr) => {
        return http.getMyPublicMessages(usr).then( (fetched_msg) =>
            { var x = fetched_msg.sort((a, b) => {
                return a.last_modified > b.last_modified ? -1 : 1;
            })
            return x
        }, (err) => {console.error(err)})
    }

    getMyRepliesFromDB = async (usr) => {
        try{
            var fetched_msg = (await http.getUserInfo(usr)).replied_questions
        }catch(err){
            console.error(err)
        }
        var x = fetched_msg.sort((a, b) => {
            return a.last_modified > b.last_modified ? -1 : 1;
        })
        return x
    }


    getRepliedByOthers = async (usr) => {
        var messages = await this.getMyPublicDataFromDB(usr)
        var read_msg_list = (await http.getUserInfo(usr)).read_msg_list
        // console.log('read_msg_list',read_msg_list)
        // console.log('messages',messages)
        var out = []
        for(var i = 0; i < messages.length; i++){
            var index = read_msg_list[messages[i]._id]
            // console.log('index',index)
            // console.log('messages[i].reply_list.length',messages[i].reply_list.length)
            if(index === undefined || index === null || messages[i].reply_list.length > index){
                out.push(messages[i])
            }
        }
        // console.log('out',out)
        return out
    }

    setMsgToDB = async (msg) => {
        if(!msg._id){ // a new message without ID, DB will give it an id
            try{
                var some = await http.addNewMsg(msg)
            }catch(err){
                console.error(err)
            }
            return some._id
        }
        // console.log('In function setMsgtoDB',msg._id);
        try{
            var l = await http.getById(msg._id)
        }catch(err){
            console.error(err)
        }
        if(l._id){
            if(l.last_modified >= msg.last_modified){
                alert('Your message is out of date. Someone has modified on' + l.last_modified  +' . This is a technical error, please report it to the admin.')
            }else {
                try{
                    await http.UpdateMsg(msg)
                }catch(err){
                    console.error(err)
                }
            }
        } else {
            alert('Your message should be in the DB, but it is not. This is a technical error, please report it to the admin.')
        }
        return msg._id
    }

    deleteMsgFromDB = async (id) => {
        try{
            await http.deleteMsg(id) 
        }catch(err){
            console.error(err)
        }
    }

    updateReplyToMsg = async (msg,reply) => {
        if(!msg._id || !reply._id) throw 'You need to assign ID first.'
        try{
            await http.addReplyToMsg(msg._id,reply._id)
        }catch(err) { console.error(err) }
    }

    updateUserInfo = async (usr,msg_id) => {
        try{
            http.updateUserInfo(usr,msg_id)
        }catch(err){
            console.error(err)
        }
    }

    updateUserRead = async (msg,usr) => {
        // console.log('updateUserRead is called:',msg,usr)
        if(msg.usr !== usr) {return;} // only update the read list of the user who sent the message
        try{
            await http.updateUserRead(usr,msg._id,msg.reply_list.length)
        }catch(err){
            console.error(err)
        }
    }

    checkUserPasswd = async (usr,passwd) => {
        // console.log('check',usr,passwd)
        try{
            var info = await http.getUserInfo(usr)
            return (info.password) === passwd
        }catch(err){
            console.error(err)
            return false
        }
    }

    addNewUser = async (user,passwd) => {
        try{
            var info = await http.getUserInfo(user)
            if(info.password !== undefined){
                throw 'Username already exists'
            }
            await http.addNewUser({usr: user, password: passwd})
            return true
        }catch(err){
            throw err
        }
    }
}

export default DataService;
