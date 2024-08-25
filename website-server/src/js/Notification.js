class NotificationEnum {
    static NOTIFY_LOGIN = "NOTIFY_LOGIN";
    static EDIT_MSG = "EDIT_MSG";
    static VIEW_MSG = "VIEW_MSG";
    static BACK_TO_MAIN = "BACK_TO_MAIN";
    static TO_UNPUBLISHED_PAGE = "TO_UNPUBLISHED_PAGE";
    static DASHBOARD_LOADED = "DASHBOARD_LOADED";
    static MSG_PAGE_LOADED = "MSG_PAGE_LOADED";
    static EDITOR_LOAD_MSG = "EDITOR_IS_SAVED";
    static SAVE_MSG_TO_DB = "SAVE_MSG_TO_DB";
    static SAVE_REPLY_TO_DB = "SAVE_REPLY_TO_DB";
    static LOAD_GENERAL = "LOAD_GENERAL";
    static NOTICE_LOADED = "NOTICE_LOADED";
}

let instance = null
var observers = {}; // a dict to accelarate find process, "name" : [list of (observer, callback) pairs]

class NotificationService{
    constructor(){
        if(!instance){
            instance = this
        }
        return instance
    }

    postNotification = (notifyName, data) => {
        // console.log(notifyName,data)
        let obs = observers[notifyName];
        if(!obs){
            return;
        }
        for(var i = 0; i < obs.length; i++){
            var obj = obs[i];
            obj.callBack(data); 
        }
    }

    addObserver = (notifyName , observer, callBack) => {
        // console.log('addObserver:',notifyName,observer,callBack)
        let obs = observers[notifyName];
        if(!obs){
            observers[notifyName] = [];
        }
        observers[notifyName].push({observer: observer, callBack: callBack});
        // console.log('Finished. observers:',observers)
    }

    removeObserver = (observer, notifyName) => {
        let obs = observers[notifyName];
        if(obs){
            for(var i = 0; i < obs.length; i++){
                if(observer === obs[i].observer){
                    obs.splice(i, 1);
                    observers[notifyName] = obs;
                    break;
                }
            }
        }
    }

}

export default NotificationService
export { NotificationEnum }