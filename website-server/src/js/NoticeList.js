import React,{Component} from "react";
import NotificationService,{NotificationEnum} from "./Notification";
import Notice from "./Notice";
import { LOADING_PAGE } from "./Common";
let ns = new NotificationService();

class NoticeList extends Component{
    constructor(props){
        super(props)
        this.state = {
            unread_messages: undefined,
        }
    }

    componentDidMount = () => {
        ns.addObserver(NotificationEnum.NOTICE_LOADED, this, this.onNoticeLoaded);
    }
    componentWillUnmount = () => {
        ns.removeObserver(this, NotificationEnum.NOTICE_LOADED);
    }

    onNoticeLoaded = (data) => {
        // console.log('NoticeList: onNoticeLoaded is called with data', data)
        if(!data){
            this.setState({
                unread_messages: undefined,
            })
            return 
        }
        this.setState({
            unread_messages: data.messages,
        })
    }

    render = () => {
        // console.log('NoticeList: render is called',this.state)
        if (!this.state.unread_messages){
            ns.postNotification(NotificationEnum.LOAD_GENERAL,null)
            // throw 'NoticeList: No messages loaded'
            return LOADING_PAGE
        }
        var my_msges = this.state.unread_messages;
        var out = []
        for(var i = 0; i < my_msges.length; i++){
            out.push(
                <li key={my_msges[i]._id} className="Msg">
                    <Notice tp='unread_msg' msg={my_msges[i]}/>
                </li>
            )
        }
        if(my_msges.length === 0){
            out.push(
                <li key="no-notice" className="no-notice">
                    <h2> You have no notifications. </h2>
                </li>
            )
        }
        return (
            <div className="container-fluid card">
                <h1>Notice List</h1>
                {out}
            </div>
        )
    }
}

export default NoticeList;