import React, {Component} from "react";
import NotificationService,{NotificationEnum} from "./notification";
import "../css/my_msg.css"

let ns = new NotificationService();

class MsgConfig {
    usr = undefined;
    _id = undefined;
    sent = false;
    reply_list = [];
    content = undefined;
    last_modified = undefined;
    msg_type = undefined;
}

class Msg extends Component {
    constructor(props) {
        super(props);
        var msg_prop = props.embed_msg
        this.state = {
            display: true,
            usr: msg_prop.usr,
            _id: msg_prop._id,
            sent: msg_prop.sent,
            reply_list: msg_prop.reply_list,
            last_modified: msg_prop.last_modified,
            content: msg_prop.content
        }
        // set up properties
        this.havebtn = true
        if(!props.havebtn){this.havebtn = false}
        this.noreply = false
        if(props.noreply){this.noreply = true}

        this.btn = null
        if(this.havebtn){
            if(props.buttonType === "edit"){
                this.btn = (
                <div className="col-2">
                    <a className='btn' onClick={this.anounceEdit}>
                    {props.buttonName ? props.buttonName :(<img src="https://img.icons8.com/ios/452/pencil.png" alt="edit" width="20" height="20"/>)}
                    </a>
                </div>
                )
            }else if(props.buttonType === "View"){
                this.btn = (
                <div className="col-2">
                    <a className='btn btn-secondary' onClick={this.anounceView}>View</a>
                </div>
                )
            }else{
                throw new Error('Invalid button added for the message:' + props.buttonType)
            }
        }

        // bind
        this.render = this.render.bind(this);
    }

    static DateToString = (date) => {
        // Input: Date(2021,1,1,10,3,1)
        // Output: 2021-02-01 10:03:01 (notice that month is 0-indexed)
        date = new Date(date)
        return date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, '0') + "-" + date.getDate().toString().padStart(2, '0') + " " + date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0') + ":" + date.getSeconds().toString().padStart(2, '0')
    }

    render = () => {
        if(!this.state.display){
            return null
        }
        var common = (
            <div className="row">
                    {this.btn}
                    <div className="col-3">
                        <label>Content:</label>
                    </div>
                    <div className="col-7">
                        <p>{this.state.content}</p>
                    </div>
            </div>
        )
        if(this.havebtn){ // these are small cards
            return (
            <div className="container card">
                {common}
            </div>
            )
        }
        return ( // these are big cards
            <div className="container card">
                {common}
                <div className="row">
                    <div className="col-3">
                        <label>Sent Date:</label>
                    </div>
                    <div className="col-9">
                        <p>{Msg.DateToString(this.state.last_modified)}</p>
                    </div> 
                </div>
                {this.noreply ? null :(<div className="row">
                    <div className="col-3">
                        <label>Reply num:</label>
                    </div>
                    <div className="col-9">
                        <p>{this.state.reply_list.length}</p>
                    </div> 
                </div>)}
            </div>
        )
    }

    anounceEdit = () => {
        ns.postNotification(NotificationEnum.EDIT_MSG, this.state)
    }

    anounceView = () => {
        // console.log('announce View')
        ns.postNotification(NotificationEnum.VIEW_MSG, this.state)
    }
}

export default Msg;
export {MsgConfig};