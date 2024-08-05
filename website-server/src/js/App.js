import '../css/App.css';
import React, {Component} from 'react';
import LoginPortal,{LoginPortalProps} from './login';
import Msg,{MsgConfig} from './my_msg';
import NotificationService,{NotificationEnum} from "./notification";
import DataService from './dataservice';
import SmartInputBox from './smart_input';

var ds = new DataService();
var ns = new NotificationService();

class AtPageEnum {
  static LOGIN = "login";
  static MAIN = "main";
  static EDIT = "edit";
  static MYSENT = "mysent";
  static MYREPLY = "myreply";
  static MSG = "msg";
  static UNPUBISHED_MSG_PAGE = "unpublished_msg_page";
}

class PromiseStatusEnum {
  static NOT_BEGUN = "not_begun";
  static LOADING = "loading";
  static LOADED = "loaded";
}

const LOADING_PAGE = (
  <div className="container-fluid App-main">
    <h1> Loading data, please hang on... </h1>
  </div>
)

class App extends Component {
  constructor() {
    super();
    this.state = {
      at_page: AtPageEnum.LOGIN,
      login_portal_props: new LoginPortalProps(),
      promise_status: undefined,
      page_edit_details : {
        saved: false,
        embed_msg: new MsgConfig(),
      },
      view_msg_details : {
        msg: undefined
      },
      render_required_params : undefined
    }
    this.render_methods = {
      [AtPageEnum.LOGIN]: this.render_login,
      [AtPageEnum.MAIN]: this.render_main,
      [AtPageEnum.EDIT]: this.render_edit,
      [AtPageEnum.UNPUBISHED_MSG_PAGE]: this.render_edit_unpublished,
      [AtPageEnum.MSG]: this.render_msg_page,
      [AtPageEnum.MYSENT]: this.render_mysent,
      [AtPageEnum.MYREPLY]: this.render_myreply
    }
    //bind
    for(var key in this.render_methods){
      this.render_methods[key] = this.render_methods[key].bind(this);
    }
    this.render = this.render.bind(this);
    this.onNotifyLogin = this.onNotifyLogin.bind(this);
    this.switchPage = this.switchPage.bind(this);

    this.switchToEdit = this.switchToEdit.bind(this);
    this.setDetailsAndSend = this.setDetailsAndSend.bind(this);
    this.onClickPublish = this.onClickPublish.bind(this);
    this.onClickSave = this.onClickSave.bind(this);
    this.onClickDiscard = this.onClickDiscard.bind(this);
    this.onClickDelete = this.onClickDelete.bind(this);

    this.getMyUnpublicMsg = this.getMyUnpublicMsg.bind(this);
  }

  componentDidMount = () => {
    ns.addObserver(NotificationEnum.NOTIFY_LOGIN, this, this.onNotifyLogin);
    ns.addObserver(NotificationEnum.EDIT_MSG, this, this.switchToEdit);
    ns.addObserver(NotificationEnum.VIEW_MSG,this,(msg_dict) => {
      // console.log('Going to view message msg',msg_dict)
      this.setState({
        view_msg_details: {
          msg: msg_dict
        },
        promise_status:PromiseStatusEnum.NOT_BEGUN,
        at_page: AtPageEnum.MSG
      })
    });
  }

  componentWillUnmount = () => {
    ns.removeObserver(this, NotificationEnum.NOTIFY_LOGIN);
    ns.removeObserver(this, NotificationEnum.EDIT_MSG);
    ns.removeObserver(this, NotificationEnum.VIEW_MSG);
  }

// ############### LOGIN PAGE ################

  render_login = () => {
    return (
      <div className="container-fluid App-main">
          <h1> Login </h1>
          <LoginPortal props={this.state.login_portal_props.props}></LoginPortal>
      </div>
    )
  }

  onNotifyLogin = (data) => {
    this.state.login_portal_props.login_ed = true;
    this.state.login_portal_props.username = data.username;
    this.state.login_portal_props.password = data.password;
    this.setState({at_page: AtPageEnum.MAIN});
  }

  switchPage = (page) => {
    // do some cleanup
    this.setState({
      page_edit_details: {
        saved: false,
        embed_msg: new MsgConfig(),
      },promise_status:PromiseStatusEnum.NOT_BEGUN,at_page: page});
  }

// ############### MAIN PAGE ################

  render_main = () => {
    if(!this.state.login_portal_props.login_ed){
      alert('Please login first');
      this.switchPage(AtPageEnum.LOGIN);
      return;
    }
    return (
      <div className="container-fluid App-main">
          <h1> Welcome, {this.state.login_portal_props.username} </h1>
          <div className='row'>
            <div className='col-sm-12'>
              <a className="btn btn-primary" onClick={() => {this.switchPage(AtPageEnum.EDIT)}}>Compose or Edit Message</a>
            </div>
          </div>
          <div className='row'>
            <div className='col-sm-6'>
              <a className="btn btn-primary" onClick={() => {this.switchPage(AtPageEnum.MYSENT)}}> My Sent Messages </a>
            </div>
            <div className='col-sm-6'>
              <a className="btn btn-primary" onClick={() => {this.switchPage(AtPageEnum.MYREPLY)}}> Replied Messeges </a>
            </div>
          </div>
          {/* a image of bottle (漂流瓶) */}
          <div className='row'>
            <div className='col-sm-12'>
              <a className='btn btn-primary' onClick={() => {this.switchPage(AtPageEnum.MSG)}}>
                <img src="https://github.com/fluidicon.png" alt="bottle" width="600" height="600"/>
              </a>
            </div>
          </div>
      </div>
    )
  }


// ############### MY SENT PAGE ################

  render_mysent_fetch =  () => {
    ds.getMyPublicDataFromDB(this.state.login_portal_props.username).then(((my_msges) => {
      this.setState({render_required_params: {
        render_mysent: {
          my_msges: my_msges
        }
      },promise_status:PromiseStatusEnum.LOADED});
    }),(err) => {alert('Sorry, our database server encounters some errors:' + err + '. Please report it to admin.'); this.setState({at_page:AtPageEnum.MAIN})})  
  }

  render_mysent = () => {
    /*
    I don't know how this function works. But It indeed works. And I (hope that I) know how to copy it to other functions and make them work. 
    */
      if(this.state.promise_status === PromiseStatusEnum.NOT_BEGUN){
        this.setState({promise_status:PromiseStatusEnum.LOADING});
        this.render_mysent_fetch();
      }
      if(this.state.promise_status !== PromiseStatusEnum.LOADED){
        return LOADING_PAGE;
      }
      if(!this.state.render_required_params.render_mysent.my_msges){
        throw new Error('This should not happen.');
      }
      var out = []
      var my_msges = this.state.render_required_params.render_mysent.my_msges;
      for(var i = 0; i < my_msges.length; i++){
        out.push(
          <li>
              <Msg embed_msg={my_msges[i]} havebtn={true} key={my_msges[i]._id} buttonType="View"></Msg>
          </li>
        )
      }
      // console.log('out',out)
      // this.setState({promise_status:false});
      return (
        <div className="container-fluid App-main">
            <h1> My Sent Messages </h1>
            <ul>
              {out}
            </ul>
        </div>
      )
  }

// ############### MY REPLY PAGE ################

  render_myreply_fetch = () => {
    ds.getMyRepliesFromDB(this.state.login_portal_props.username).then((my_msges) => {
      this.setState({render_required_params: {
        render_myreply: {
          my_msges: my_msges
        }
      },promise_status:PromiseStatusEnum.LOADED});
    }).catch((err) => {alert('Sorry, our database server encounters some errors:' + err + '. Please report it to admin.'); this.setState({at_page:AtPageEnum.MAIN})})
  }

  render_myreply =  () => {
    if(this.state.promise_status === PromiseStatusEnum.NOT_BEGUN){
      this.setState({promise_status:PromiseStatusEnum.LOADING});
      this.render_myreply_fetch();
    }
    if(this.state.promise_status !== PromiseStatusEnum.LOADED){
      return LOADING_PAGE;
    }
    var my_msges = this.state.render_required_params.render_myreply.my_msges;
    if(!my_msges){
      throw('This should not happen.')
    }
    // console.log('my reply messages',my_msges)
    var out = []
    for(var i = 0; i < my_msges.length; i++){
      out.push(
        <li>
            <Msg embed_msg={my_msges[i]} havebtn={true} key={my_msges[i]._id} buttonType="View"></Msg>
        </li>
      )
    }
    return (
      <div className="container-fluid App-main">
          <h1> My Replied Messages </h1>
          <ul>
            {out}
          </ul>
      </div>
    )
  }

// ############### MSG PAGE ################
// The message may either be random chosen, or chosen by the user

  selectMsgToView =  () => {
    ds.getOneOtherMsg(this.state.login_portal_props.username).then((msg) => {
      if(!msg){
        alert('There is no new message for you to view now. Redirecting to main page...');
        this.switchPage(AtPageEnum.MAIN);
        return;
      }
      this.setState({view_msg_details: {
          msg: msg
      },promise_status:PromiseStatusEnum.LOADED});
    }).catch((err) => {alert('Sorry, our database server encounters some errors:' + err + '. Please report it to admin.'); this.setState({at_page:AtPageEnum.MAIN})})
  }

  render_msg_page = () => {
    if(!this.state.view_msg_details.msg){ // if there is no message to view, get one
      if(this.state.promise_status === PromiseStatusEnum.NOT_BEGUN){
        this.setState({promise_status:PromiseStatusEnum.LOADING});
        this.selectMsgToView();
      }
      if(this.state.promise_status !== PromiseStatusEnum.LOADED){
        return LOADING_PAGE;
      }
    }
    var msg = this.state.view_msg_details.msg;
    if(!msg) {
      alert('Error: you shouldn\'t be here without a message to view. This is a technical error, please report it to the admin.');
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
            <SmartInputBox  type="text" id="reply-content" name="content" value={this.state.page_edit_details.embed_msg.content}/>
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>
            <button onClick={async () => {await this.onSendReply(msg)}}>Send Reply</button>
          </div>
          <div className='col-sm-2'>
            <button onClick={() => this.onLeaveReplyCenter()}>Leave</button>
          </div>
        </div>
      </div>
    )
    return out;
  }

  onSendReply = async(msg) => {
    var rep = {
        usr: this.state.login_portal_props.username,
        msg_type: "reply",
        content: document.getElementById('reply-content').value,
        reply_list: [],
        sent: true,
        last_modified: new Date(),
    }
    try{
    rep._id =  await ds.setMsgToDB(rep);
     await ds.updateReplyToMsg(msg, rep);
     await ds.updateUserInfo(this.state.login_portal_props.username, msg._id);
    }catch(err){console.error(err)}
    alert('Reply sent. Redirecting to main page...')
    this.switchPage(AtPageEnum.MAIN)
  }

  onLeaveReplyCenter = () => {
    if(document.getElementById('reply-content').value !== ''){
      alert('You have not sent your reply. Are you sure to leave?')
    }
    this.switchPage(AtPageEnum.MAIN);
  }


// ############### EDIT PAGE ################

  switchToEdit = (data) => {
    this.switchPage(AtPageEnum.EDIT);
    this.setState({
      page_edit_details: {
        saved: true,
        embed_msg: data,
      }
    })
  }

  render_edit = () => {
    // a editer for the user to create a new message
    return (
      <div className="container-fluid App-main">
          <h1> Compose Message </h1>
          <a className="btn btn-primary" onClick={() => this.switchPage(AtPageEnum.UNPUBISHED_MSG_PAGE)}>Edit Old Messages</a>
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
    this.switchPage(AtPageEnum.MAIN);
  }

  onClickSave = () => {
    this.setDetailsAndSend(false)
    alert('saved')
  }

  onClickDiscard = () => {
    this.switchPage(AtPageEnum.MAIN);
  }

  onClickDelete =  async () => {
    if(this.state.page_edit_details.saved){
      try{
       await ds.deleteMsgFromDB(this.state.page_edit_details.embed_msg._id);
      }catch(err){console.error(err)}
    }
    alert('Successfully deleted')
    this.switchPage(AtPageEnum.MAIN);
  }

// ############### MY UNPUBLISHED MSG PAGE ################

  getMyUnpublicMsg =  () => {
    ds.getMyUnpublicDataFromDB(this.state.login_portal_props.username).then((msges) => {
      this.setState({
        promise_status: PromiseStatusEnum.LOADED,
        render_required_params: {
          render_my_unpublished: {
            msges: msges
          }
        }
      });
    }).catch((err) => {alert('Sorry, our database server encounters some errors:' + err + '. Please report it to admin.'); this.setState({at_page:AtPageEnum.MAIN})})
  }

  render_edit_unpublished = () => {
    if(this.state.promise_status === PromiseStatusEnum.NOT_BEGUN){
      this.setState({promise_status:PromiseStatusEnum.LOADING});
      this.getMyUnpublicMsg();
    }
    if(this.state.promise_status !== PromiseStatusEnum.LOADED){
      return LOADING_PAGE;
    }
    var msges = this.state.render_required_params.render_my_unpublished.msges;
    if(!msges){
      throw new Error('This should not happen.');
    }
    var ans = []
    for(var i = 0; i < msges.length; i++){
      ans.push(
        <li >
          <Msg embed_msg={msges[i]} havebtn={true} key={msges[i]._id} buttonType="edit"></Msg>
        </li>
      )
    }
    return (
      <div className="container-fluid App-main">
          <h1> Your unsent messages </h1>
          <a className="btn btn-primary" onClick={() => this.switchPage(AtPageEnum.EDIT)}>Compose a New Message</a>
          <ul className='list-group'>
          {ans}
          </ul>
      </div>
    )
  }

// ############### FINAL RENDER ################

  render = () => {
    // console.log('---------- RENDER ----------')
    // console.log('Method',this.state.at_page)
    // console.log('promise loading?',this.state.promise_status)
    var content = (
        <div className="container-fluid App-main">
          <h1> This page is not implemented. </h1>
        </div>
    )
    if(this.state.at_page in this.render_methods){
      content = this.render_methods[this.state.at_page]();
    }
    return (
      <div className="App">
        <header className="App-header">
          <p>
            Title
          </p>
          <a className="btn btn-primary" onClick={() => this.switchPage(AtPageEnum.MAIN)}>Go Home</a>
        </header>
        {content}
      </div>
    )
  }
}

export default App;
