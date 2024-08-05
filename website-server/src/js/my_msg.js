import React, {Component} from "react";
import NotificationService,{NotificationEnum} from "./notification";

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


    render = () => {
        if(!this.state.display){
            return null
        }
        var common = (
            <div className="row">
                    <div className="col-2">
                    {this.btn}
                    </div>
                    <div className="col-2">
                        <label>Content:</label>
                    </div>
                    <div className="col-4">
                        <label>{this.state.content}</label>
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
                    <div className="col-2">
                        <label>From:</label>
                    </div>
                    <div className="col-4">
                        <label>{this.state.usr}</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-2">
                        <label>Sent Date:</label>
                    </div>
                    <div className="col-4">
                        <label>{this.state.last_modified.toString()}</label>
                    </div> 
                </div>
                {this.noreply ? null :(<div className="row">
                    <div className="col-2">
                        <label>Reply num:</label>
                    </div>
                    <div className="col-4">
                        <label>{this.state.reply_list.length}</label>
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