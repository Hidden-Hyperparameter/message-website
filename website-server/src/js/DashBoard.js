import React,{Component} from "react";
import Msg from "./my_msg";
import NotificationService,{NotificationEnum} from "./notification";
import { LOADING_PAGE } from "./common";

let ns = new NotificationService();
class DashBoard extends Component {
    constructor(props){
        super(props)
        this.state = {
            header: props.header,
            messages: undefined,
            msg_btn_type: props.msg_btn_type
        }
    }

    componentDidMount = () => {
        ns.addObserver(NotificationEnum.DASHBOARD_LOADED, this, this.onDashBoardLoaded);
    }

    componentWillUnmount = () => {
        ns.removeObserver(this, NotificationEnum.DASHBOARD_LOADED);
    }

    onDashBoardLoaded = (props) => {
        this.setState(props)
    }

    render = () => {
        var my_msges = this.state.messages;
        if(!my_msges){
            return LOADING_PAGE
        }
        var out = []
        for(var i = 0; i < my_msges.length; i++){
        out.push(
            <li>
                <Msg embed_msg={my_msges[i]} havebtn={true} key={my_msges[i]._id} buttonType={this.state.msg_btn_type}></Msg>
            </li>
        )
        }
        return (
        <div className="container-fluid App-main">
            <h1> {this.state.header} </h1>
            <a className="btn btn-primary" onClick={() => ns.postNotification(NotificationEnum.EDIT_MSG,null)}>Compose a New Message</a>
            <ul>
                {out}
            </ul>
        </div>
        )
    }
}

export default DashBoard;