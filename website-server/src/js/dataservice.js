import NotificationService,{NotificationEnum} from "./notification"
import HttpService from "./httpservice"
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
        // not really implemented
        // console.log('Call getQuestionFromDB')
        try{
            var fetched_msg = await http.getOthersMessages(usr)
            var replied_msg_lst = await http.getUserInfo(usr).replied_questions
        }catch(err){
            console.error(err)
        }
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
        // console.log(x)
        return x
    }

    getOneOtherMsg = async (usr) => {
        var viewed_msg = (await http.getUserInfo(usr)).replied_questions
        // console.log('viewed_msg',viewed_msg)
        var fetched_msg = await http.getOthersMessages(usr)
        fetched_msg = fetched_msg.filter(
            (msg) => {
                return !viewed_msg.includes(msg._id)
            }
        )
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
            // console.log('getMyUnpublicDataFromDB returning',data)
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
            var fetched_msg = await http.getByIds( (await http.getUserInfo(usr)).replied_questions)
        }catch(err){
            console.error(err)
        }
        var x = fetched_msg.sort((a, b) => {
            return a.last_modified > b.last_modified ? -1 : 1;
        })
        return x
    }

    setMsgToDB = async (msg) => {
        // console.log('msg',msg)
        if(!msg._id){ // a new message without ID, DB will give it an id
            try{
                // console.log('in')
                var some = await http.addNewMsg(msg)
                // console.log('out')
            }catch(err){
                console.error(err)
            }
            return some._id
        }
        try{
            var l = await http.getById(msg._id)
        }catch(err){
            console.error(err)
        }
        if(l.length){
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
        if(!msg.reply_list){
            msg.reply_list = []
        }
        msg.reply_list.push(reply)
        try{
            http.UpdateMsg(msg)
        }catch(err){
            // console.log(err)
        }
    }

    updateUserInfo = async (usr,msg_id) => {
        try{
            http.updateUserInfo(usr,msg_id)
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
