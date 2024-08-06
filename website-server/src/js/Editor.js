import "../css/Editor.css"
import React,{Component} from "react";
import Msg, {MsgConfig} from "./Msg";
import SmartInputBox from "./SmartImput";
import DataService from "./DataService";
import NotificationService,{NotificationEnum} from "./Notification";
import { LOADING_PAGE } from "./Common";

let ds = new DataService();
let ns = new NotificationService();

class Editor extends Component{
    constructor(props){
        super(props)
        this.state = {
          embed_msg: props.msg,
          saved: props.saved
        }
        //bind
        this.setDetailsAndSend = this.setDetailsAndSend.bind(this);
        this.onClickPublish = this.onClickPublish.bind(this);
        this.onClickSave = this.onClickSave.bind(this);
        this.onClickDiscard = this.onClickDiscard.bind(this);
        this.onClickDelete = this.onClickDelete.bind(this);

    }

    componentDidMount = () => {
        ns.addObserver(NotificationEnum.EDITOR_LOAD_MSG, this, (data) => {
          this.setState({
            embed_msg: data.msg,
            saved: data.saved
          })});
    }

    componentWillUnmount = () => {
        ns.removeObserver(this, NotificationEnum.EDITOR_LOAD_MSG);
    }

    render = () => {
        // if(!this.state.embed_msg){
        //   ns.postNotification(NotificationEnum.LOAD_GENERAL);
        //   return LOADING_PAGE;
        // }
        return (
            <div className="container-fluid App-main Editor">
                <h1> Compose Message </h1>
                <a className="btn btn-primary header-btn" onClick={() => ns.postNotification(NotificationEnum.TO_UNPUBLISHED_PAGE)}>Edit Old Messages</a>
                <div className='row'>
                  <div className='col-sm-10'>
                    <h2>Content:</h2>
                    <SmartInputBox  type="text" id="content" name="content" value={this.state.embed_msg.content}/>
                  </div>
                </div>
                <div className='row'>
                  <div className='col-sm-3'>
                    <button onClick={() => this.onClickPublish()}>Publish as bottle</button>
                  </div>
                  <div className='col-sm-3'>
                    <button onClick={() => this.onClickSave()}>Save</button>
                  </div>
                  <div className='col-sm-3'>
                    <button onClick={() => this.onClickDiscard()}>Discard Change</button>
                  </div>
                  <div className='col-sm-3'>
                    <button onClick={() => this.onClickDelete()}>Delete</button>
                  </div>
                </div>
            </div>
        )
    }

    setDetailsAndSend = async (sent) => {
        var result = {
          last_modified: new Date(),
          msg_type: "sender",
          sent: sent,
          content: document.getElementById('content').value,
          reply_list: []
        }
        if(this.state.embed_msg._id) result._id = this.state.embed_msg._id;
        ns.postNotification(NotificationEnum.SAVE_MSG_TO_DB, {
          saved: this.state.saved,
          msg: result
        });
        this.setState({
          embed_msg: result,
          saved: true
        })
        // console.log('The new embed message is', result)
      }
    
      onClickPublish = async () => {
        await this.setDetailsAndSend(true)
        alert('Your message is published. Redirecting to your message page...')
        ns.postNotification(NotificationEnum.VIEW_MSG,this.state.embed_msg)
      }
    
      onClickSave = () => {
        this.setDetailsAndSend(false)
        alert('Your message is saved (but not published).')
      }
    
      onClickDiscard = () => {
        ns.postNotification(NotificationEnum.BACK_TO_MAIN);
      }

      onClickDelete =  async () => {
        if(this.state.saved){
          try{
           await ds.deleteMsgFromDB(this.state.embed_msg._id);
          }catch(err){console.error(err)}
        }
        alert('Successfully deleted')
        ns.postNotification(NotificationEnum.TO_UNPUBLISHED_PAGE);
      }
}

export default Editor