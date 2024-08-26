import "../css/MsgPage.css"
import React,{Component} from "react";
import Msg from "./Msg";
import SmartInputBox from "./SmartImput";
import NotificationService,{NotificationEnum} from "./Notification";
import DataService from "./DataService";
import { LOADING_PAGE } from "./Common";
let ns = new NotificationService();
let ds = new DataService();

class MsgPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            msg: props.msg
        }

        // bind
        this.onSendReply = this.onSendReply.bind(this);
        this.onLeaveReplyCenter = this.onLeaveReplyCenter.bind(this);

    }

    componentDidMount = () => {
        ns.addObserver(NotificationEnum.MSG_PAGE_LOADED, this, this.onMsgPageLoaded);
    }

    componentWillUnmount = () => {
        ns.removeObserver(this, NotificationEnum.MSG_PAGE_LOADED);
    }

    onMsgPageLoaded = (data) => {
        // console.log('on reciving:',data)
        this.setState({
            msg:data
        })
    }

    render = () => {
        var msg = this.state.msg;
        console.log("rendered message page.", msg)
        if(!msg) {
            ns.postNotification(NotificationEnum.LOAD_GENERAL);
            return LOADING_PAGE();
        }
        var out = []
        out.push(
            <Msg embed_msg={msg} key={msg._id}></Msg>
        )
        out.push(
            <h2> Replies </h2>
        )
        out.push (
        <ul>
            {msg.reply_list.map((rep) => {
            return (
                <li key={rep._id}>
                <Msg embed_msg={rep} key={rep._id} noreply={true}></Msg>
                </li>
            )
            })}
        </ul>
        )
        out.push(
        <div className='container card'>
            <div className='row'>
                <div className='col-sm-4'>
                    <label>Write your thoughts here...</label>
                </div>
                <div className='col-sm-8'>
                    <textarea type="text" id="reply-content" name="content"> </textarea>
                </div>
                </div>
                <div className='row'>
                <div className='col-sm-6'>
                    <button onClick={this.onSendReply}>Send Reply</button>
                </div>
                <div className='col-sm-6'>
                    <button onClick={() => this.onLeaveReplyCenter()}>Leave</button>
                </div>
            </div>
        </div>
        )
        return out;
    }

    onLeaveReplyCenter = () => {
        var input_val = document.getElementById("reply-content").value
        if(input_val !== "" && input_val !== ' '){
            if (!window.confirm("You have unsent content in the reply box. Are you sure to leave? Your content will be lost.")) return;
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
        // then empty the input box
        document.getElementById('reply-content').value = ""
    }

}

export default MsgPage;