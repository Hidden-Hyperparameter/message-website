import React,{Component} from "react";
import NotificationService,{NotificationEnum} from "./Notification";
import { LOADING_PAGE } from "./Common";

let ns = new NotificationService();

class Notice extends Component{
    constructor(props){
        super(props)
        this.tp = props.tp
        this.msg = props.msg
    }

    componentDidMount = () => {}
    componentWillUnmount = () => {}

    static abbrev = (text) => {
        if(text.length > 10) {
            return text.slice(0, 10) + '...'
        }
        return text
    }

    render_unread_msg = () => {
        return (
            <div>
                <h4>Unread Message</h4>
                <p>Your message <i>{Notice.abbrev(this.msg.content)}</i> got new replies!</p>
                <a className="btn btn-primary" onClick={() => {ns.postNotification(NotificationEnum.VIEW_MSG, this.msg)}}>View</a>
            </div>
        )
    }

    render = () => {
        var content = null
        switch(this.tp){
            case 'unread_msg':
                content = this.render_unread_msg()
                break;
            default:
                content = <h4>Invalid Notice Type</h4>
        }
        return (
            <div className="container-fluid card">
                {content}
            </div>
        )
    }
}

export default Notice;