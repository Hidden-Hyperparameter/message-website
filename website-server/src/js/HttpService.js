import BASE_URI from './env'

class HttpService {
    constructor() {
        this.base_uri = BASE_URI;

        // Define unary GET methods
        var get_unary_methods = {
            'getOthersMessages':"usr", 
            'getMyUnpublicMessages':"usr",
            'getMyPublicMessages':'usr', 
            'getById':"id", 
            'getUserInfo':"usr",
        }

        for (let key in get_unary_methods){ // "let" is block scoped, "var" is function scoped, so must use "let" here, or the value of key will be undefined when the function is called
            this[key] = ((param) => {
                var promise = new Promise((resolve,reject) => {
                    // console.log('In function',key)
                    // console.log('Gonna GET',this.base_uri + key + '?' +  get_unary_methods[key] + '=' + param)
                    fetch(this.base_uri + key + '?' +  get_unary_methods[key] + '=' + param,{
                        method: 'GET',
                    }).then(response => {
                        var json_obj = response.json()
                        resolve(json_obj);
                    }).catch(err => {
                        reject(err);
                    });
                });
                return promise;
            }).bind(this);
        }
        
        // Define no-arg POST methods

        var post_noarg_methods = ["UpdateMsg", "addNewSenderMsg", "addNewReplyMsg", "addNewUser"]
        for (let i = 0; i < post_noarg_methods.length; i++){
            this[post_noarg_methods[i]] = ((param) => {
                // console.log('argument:',param)
                var promise = new Promise((resolve,reject) => {
                    // console.log('In function',post_noarg_methods[i])
                    // console.log('Gonna POST',this.base_uri + post_noarg_methods[i])
                    // console.log('arg:',JSON.stringify(param))
                    fetch(this.base_uri + post_noarg_methods[i],{
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(param)
                    }).then(response => {
                        var json_obj = response.json()
                        resolve(json_obj);
                    }).catch(err => {
                        reject(err);
                    });
                });
                return promise
            }).bind(this);
        }

        // remain methods for definition:
        // - getByIds (actually implemented as POST method)
        // - updateUserInfo
        // - deleteMsg
        // - addNewMsg
        // this.updateUserInfo = this.updateUserInfo.bind(this);
        // this.deleteMsg = this.deleteMsg.bind(this);
        this.addNewMsg = this.addNewMsg.bind(this);
    }

    getByIds =  (ids) => {
        // console.log('In function getByIds of httpservice',ids)
        var promise = new Promise((resolve,reject) => {
            fetch(this.base_uri + 'getByIds',{
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ids:ids})
            }).then(response => {
                resolve(response.json());
            }).catch(err => {
                reject(err);
            })
        })
        return promise;
    }

    addNewMsg =  (msg) => {
        if(msg.msg_type === "sender"){
            return this.addNewSenderMsg(msg)
        }else if(msg.msg_type === "reply"){
            return this.addNewReplyMsg(msg)
        }else {
            throw new Error("Invalid message type: " + msg.msg_type);
        }
    }

    updateUserInfo =  (usr,msg_id) => {
        var promise = new Promise((resolve,reject) => {
            fetch(this.base_uri + 'UpdateUserInfo' + '?usr=' + usr + '&msg_id=' + msg_id,{
                method: 'PUT',
            }).then(response => {
                resolve(response.json());
            }).catch(err => {
                reject(err);
            })
        })
        return promise;
    }

    updateUserRead = (usr,msg_id,index) => {
        var promise = new Promise((resolve,reject) => {
            fetch(this.base_uri + 'UpdateUserRead' + '?usr=' + usr + '&msg_id=' + msg_id + '&index=' + index,{
                method: 'PUT',
            }).then(response => {
                resolve(response.json());
            }).catch(err => {
                reject(err);
            })
        })
        return promise;
    }

    addReplyToMsg = (msg_id,reply_id) => {
        var promise = new Promise((resolve,reject) => {
            fetch(this.base_uri + 'AddReplyToMsg' + '?msg_id=' + msg_id + '&reply_id=' + reply_id,{
                method: 'PUT',
            }).then(response => {
                resolve(response.json());
            }).catch(err => {
                reject(err);
            })
        })
        return promise;
    }
    
    deleteMsg =  (id) => {
        var promise = new Promise((resolve,reject) => {
            fetch(this.base_uri + 'deleteMsg' + '?id=' + id,{
                method: 'DELETE',
            }).then(response => {
                // console.log('response:',response)
                // console.log('json',response.json())
                resolve(response.json());
            }).catch(err => {
                reject(err);
            })
        })
        return promise;
    }
}

export default HttpService;