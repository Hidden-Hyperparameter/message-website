import "../css/DashBoard.css"
import React,{Component} from "react";
import Msg, { MsgConfig } from "./Msg";
import NotificationService,{NotificationEnum} from "./Notification";
import { LOADING_PAGE } from "./Common";
import {ls} from "./LanguageSwitcher";
let ns = new NotificationService();
class DashBoard extends Component {
    constructor(props){
        super(props)
        this.state = {
            header: props.header,
            messages: undefined,
            msg_btn_type: props.msg_btn_type,
        }
        this.show_reply_num = true;
        if(props.show_reply_num === false){
            this.show_reply_num = false; // default false
        }
        this.identity = 'DashBoard';
    }

    componentDidMount = () => {
        ns.addObserver(NotificationEnum.DASHBOARD_LOADED, this, this.onDashBoardLoaded,this.identity);
    }

    componentWillUnmount = () => {
        ns.removeObserver(this, NotificationEnum.DASHBOARD_LOADED,this.identity);
    }

    onDashBoardLoaded = (props) => {
        this.setState(props)
    }

    render = () => {
        var my_msges = this.state.messages;
        if(!my_msges){
            ns.postNotification(NotificationEnum.LOAD_GENERAL,null)
            return LOADING_PAGE()
        }
        var out = []
        for(var i = 0; i < my_msges.length; i++){
            out.push(
                <li key={my_msges[i]._id} className="Msg">
                    <Msg embed_msg={my_msges[i]} havebtn={true} key={my_msges[i]._id} buttonType={this.state.msg_btn_type} show_reply_num={this.show_reply_num}></Msg>
                </li>
            )
        }
        if(my_msges.length === 0){
            out.push(
                <li key="no-msg" className="no-msg">
                    <h2> You have no these kind of messages. </h2>
                </li>
            )
        }
        return (
        <div className="container-fluid App-main">
            <h1> {this.state.header} </h1>
            <a className="btn btn-primary header-btn" onClick={() => ns.postNotification(NotificationEnum.EDIT_MSG,new MsgConfig())}>{ls.Trans('compose')}</a>
            <ul className="dashboard-list">
                {out}
            </ul>
        </div>
        )
    }
}

export default DashBoard;