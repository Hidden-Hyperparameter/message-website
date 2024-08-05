import React,{Component} from "react";
import Msg from "./my_msg";
import SmartInputBox from "./smart_input";
import DataService from "./dataservice";
import NotificationService,{NotificationEnum} from "./notification";

let ds = new DataService();
let ns = new NotificationService();

class Editor extends Component{
    constructor(props){
        super(props)

        this.setDetailsAndSend = this.setDetailsAndSend.bind(this);
        this.onClickPublish = this.onClickPublish.bind(this);
        this.onClickSave = this.onClickSave.bind(this);
        this.onClickDiscard = this.onClickDiscard.bind(this);
        this.onClickDelete = this.onClickDelete.bind(this);
    }

    render = () => {
        return (
            <div className="container-fluid App-main">
                <h1> Compose Message </h1>
                <a className="btn btn-primary" onClick={() => ns.postNotification(NotificationEnum.TO_UNPUBLISHED_PAGE)}>Edit Old Messages</a>
                <div className='row'>
                  <div className='col-sm-2'>
                    <label>Content:</label>
                  </div>
                  <div className='col-sm-4'>
                    <SmartInputBox  type="text" id="content" name="content" value={this.state.page_edit_details.embed_msg.content}/>
                  </div>
                </div>
                <div className='row'>
                  <div className='col-sm-2'>
                    <button onClick={() => this.onClickPublish()}>Publish as bottle</button>
                  </div>
                  <div className='col-sm-2'>
                    <button onClick={() => this.onClickSave()}>Save</button>
                  </div>
                  <div className='col-sm-2'>
                    <button onClick={() => this.onClickDiscard()}>Discard Change</button>
                  </div>
                  <div className='col-sm-2'>
                    <button onClick={() => this.onClickDelete()}>Delete</button>
                  </div>
                </div>
            </div>
        )
    }

    setDetailsAndSend = async (sent) => {
        this.state.page_edit_details.embed_msg.content = document.getElementById('content').value;
        this.state.page_edit_details.embed_msg.usr = this.state.login_portal_props.username;
        this.state.page_edit_details.embed_msg.last_modified = new Date();
        this.state.page_edit_details.embed_msg.msg_type = "sender";
        this.state.page_edit_details.embed_msg.sent = sent;
        try{
        if(!this.state.page_edit_details.saved){
          this.state.page_edit_details.embed_msg._id =  await ds.setMsgToDB(this.state.page_edit_details.embed_msg);
          this.state.page_edit_details.saved = true;
        }else{
           await ds.setMsgToDB(this.state.page_edit_details.embed_msg);
        }
        }catch(err){console.error(err)} 
      }
    
      onClickPublish = () => {
        this.setDetailsAndSend(true)
        alert('Your message is published. Redirecting to main page...')
        ns.postNotification(NotificationEnum.BACK_TO_MAIN);
      }
    
      onClickSave = () => {
        this.setDetailsAndSend(false)
        alert('saved')
      }
    
      onClickDiscard = () => {
        ns.postNotification(NotificationEnum.BACK_TO_MAIN);
      }

      onClickDelete =  async () => {
        if(this.state.page_edit_details.saved){
          try{
           await ds.deleteMsgFromDB(this.state.page_edit_details.embed_msg._id);
          }catch(err){console.error(err)}
        }
        alert('Successfully deleted')
        ns.postNotification(NotificationEnum.BACK_TO_MAIN);
      }
}

export default Editor