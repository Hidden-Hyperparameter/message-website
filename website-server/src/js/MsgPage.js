import React,{Component} from "react";
import Msg from "./my_msg";
import SmartInputBox from "./smart_input";
import NotificationService,{NotificationEnum} from "./notification";
import DataService from "./dataservice";
import { LOADING_PAGE } from "./common";
let ns = new NotificationService();
let ds = new DataService();

class MsgPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            msg: props.msg
        }
    }

    componentDidMount = () => {
        ns.addObserver(NotificationEnum.MSG_PAGE_LOADED, this, this.onMsgPageLoaded);
    }

    componentWillUnmount = () => {
        ns.removeObserver(this, NotificationEnum.MSG_PAGE_LOADED);
    }

    onMsgPageLoaded = (data) => {
        this.setState({
            msg:data
        })
    }

    render = () => {
        var msg = this.state.msg;
        if(!msg) {
            ns.postNotification(NotificationEnum.LOAD_GENERAL);
            return LOADING_PAGE;
        }
        var out = []
        out.push(
            <Msg embed_msg={msg} key={msg}></Msg>
        )
        out.push(
            <h2> Replies </h2>
        )
        out.push (
        <ul>
            {msg.reply_list.map((rep) => {
            return (
                <li>
                <Msg embed_msg={rep} key={rep._id} noreply={true}></Msg>
                </li>
            )
            })}
        </ul>
        )
        out.push(
        <div className='container card'>
            <div className='row'>
            <div className='col-sm-2'>
                <label>Write your thoughts here...</label>
            </div>
            <div className='col-sm-4'>
                <SmartInputBox  type="text" id="reply-content" name="content"/>
            </div>
            </div>
            <div className='row'>
            <div className='col-sm-2'>
                <button onClick={this.onSendReply}>Send Reply</button>
            </div>
            <div className='col-sm-2'>
                <button onClick={() => this.onLeaveReplyCenter()}>Leave</button>
            </div>
            </div>
        </div>
        )
        return out;
    }

    onLeaveReplyCenter = () => {
        if(document.getElementById("reply-content").value !== ""){
            alert("You have unsent content in the reply box. Are you sure to leave? Your content will be lost.");
        }
        ns.postNotification(NotificationEnum.BACK_TO_MAIN)
    }

    onSendReply = () => {
        var rep = {
            msg_type: "reply",
            content: document.getElementById('reply-content').value,
            reply_list: [],
            sent: true,
            last_modified: new Date(),
        }
        var msg = this.state.msg;
        ns.postNotification(NotificationEnum.SAVE_REPLY_TO_DB, {msg: msg, rep: rep});
    }

}

export default MsgPage;