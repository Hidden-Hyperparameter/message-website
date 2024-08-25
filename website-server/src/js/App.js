import '../css/App.css';
import React, {Component} from 'react';
import LoginPortal,{LoginPortalProps} from './Login';
import Msg,{MsgConfig} from './Msg';
import MsgPage from './MsgPage';
import NotificationService,{NotificationEnum} from "./Notification";
import DataService from './DataService';
import DashBoard from './DashBoard';
import Editor  from './Editor';
import SHORT_INTRO, {DOCS,FAQ} from './Docs';

import { LOADING_PAGE,PromiseStatusEnum } from './Common';
import {ls} from './LanguageSwitcher.js';

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
  static DOCS = "docs";
  static FAQ = "faq";
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      at_page: AtPageEnum.LOGIN,
      // at_page: AtPageEnum.MAIN, // DEBUG ONLY
      login_portal_props: new LoginPortalProps(),
      // login_portal_props: { // DEBUG ONLY
      //   username: "debug",
      //   password: "debug",
      //   login_ed: true,
      // },
      msg_page_msg:undefined,
      editor_page_msg: new MsgConfig(),
    }
    this.render_methods = {
      [AtPageEnum.LOGIN]: this.render_login,
      [AtPageEnum.MAIN]: this.render_main,
      [AtPageEnum.EDIT]: this.render_edit,
      [AtPageEnum.UNPUBISHED_MSG_PAGE]: this.render_edit_unpublished,
      [AtPageEnum.MSG]: this.render_msg_page,
      [AtPageEnum.MYSENT]: this.render_mysent,
      [AtPageEnum.MYREPLY]: this.render_myreply,
      [AtPageEnum.DOCS]: () => {return DOCS},
      [AtPageEnum.FAQ]: () => {return FAQ}
    }
    //bind
    for(var key in this.render_methods){
      this.render_methods[key] = this.render_methods[key].bind(this);
    }
    this.switchPage = this.switchPage.bind(this);
    this.send_msg = this.send_msg.bind(this);
    this.send_reply = this.send_reply.bind(this);
    this.switchToEdit = this.switchToEdit.bind(this);
    this.load = this.load.bind(this);
    this.getMyUnpublicMsg = this.getMyUnpublicMsg.bind(this);
    this.selectMsgToView = this.selectMsgToView.bind(this);
    this.onNotifyLogin = this.onNotifyLogin.bind(this);    
  }

  componentDidMount = () => {
    ns.addObserver(NotificationEnum.NOTIFY_LOGIN, this, this.onNotifyLogin);
    ns.addObserver(NotificationEnum.EDIT_MSG, this, this.switchToEdit);
    ns.addObserver(NotificationEnum.VIEW_MSG,this,(msg_dict) => {
      this.switchPage(AtPageEnum.MSG);
      this.setState({msg_page_msg:msg_dict});
      // console.log('view message msg_dict',msg_dict)
    });
    ns.addObserver(NotificationEnum.BACK_TO_MAIN,this,this.goHome);
    ns.addObserver(NotificationEnum.TO_UNPUBLISHED_PAGE,this,() => {this.switchPage(AtPageEnum.UNPUBISHED_MSG_PAGE);});
    ns.addObserver(NotificationEnum.SAVE_MSG_TO_DB,this,this.send_msg);
    ns.addObserver(NotificationEnum.SAVE_REPLY_TO_DB,this,this.send_reply);

    ns.addObserver(NotificationEnum.LOAD_GENERAL,this,this.load)
  }

  load = () => {
      switch(this.state.at_page){
        case AtPageEnum.MYSENT:
          this.render_mysent_fetch();
          break;
        case AtPageEnum.MYREPLY:
          this.render_myreply_fetch();
          break;
        case AtPageEnum.UNPUBISHED_MSG_PAGE:
          this.getMyUnpublicMsg();
          break;
        case AtPageEnum.MSG:
          this.selectMsgToView();
          break;
        case AtPageEnum.EDIT:
          ns.postNotification(NotificationEnum.EDITOR_LOAD_MSG,{msg: new MsgConfig(), saved: false});
          break;
        default:
          throw "Shouldn't call this!"
      }
    }

  componentWillUnmount = () => {
    ns.removeObserver(this, NotificationEnum.NOTIFY_LOGIN);
    ns.removeObserver(this, NotificationEnum.EDIT_MSG);
    ns.removeObserver(this, NotificationEnum.VIEW_MSG);
    ns.removeObserver(this, NotificationEnum.CHANGE_PAGE);
    ns.removeObserver(this, NotificationEnum.TO_UNPUBLISHED_PAGE);
    ns.removeObserver(this, NotificationEnum.SAVE_MSG_TO_DB);
    ns.removeObserver(this, NotificationEnum.SAVE_REPLY_TO_DB);
    ns.removeObserver(this, NotificationEnum.LOAD_GENERAL);
  }

  switchPage = (page) => {
    this.setState({at_page: page});
  }

  goHome = () => {
    this.switchPage(AtPageEnum.MAIN);
    // clean cache
    this.setState({msg_page_msg:undefined,editor_page_msg:new MsgConfig()});
  }

// ############### LOGIN PAGE ################

  render_login = () => {
    return <LoginPortal props={this.state.login_portal_props.props}></LoginPortal>
  }

  onNotifyLogin = (data) => {
    this.setState({
      at_page: AtPageEnum.MAIN,
      login_portal_props: {
        login_ed: true,
        username: data.username,
        password: data.password
      }
    });
  }

// ############### MAIN PAGE ################

  render_main = () => {
    if(!this.state.login_portal_props.login_ed){
      this.switchPage(AtPageEnum.LOGIN);
      return;
    }
    var ans = []
    ans.push (
      <h1 className='welcome-msg'> Welcome, <special>{this.state.login_portal_props.username}</special> !</h1>
    ) // title
    ans.push(
      <div className='container row'>
        <div className='col-sm-4'> {/* Left side bar, three buttons*/}
          <div className='container main-page-btns'>
            <a className="btn btn-primary" onClick={() => {this.switchPage(AtPageEnum.MYSENT)}}> My Sent Messages </a>
            <a className="btn btn-primary" onClick={() => {this.switchPage(AtPageEnum.MYREPLY)}}> Replied Messeges </a>
            <a className="btn btn-primary" onClick={() => {this.switchToEdit(new MsgConfig())}}>Compose or Edit Message</a>
          </div>
        </div>
        <div className='col-sm-8'>
          <div className='container bottle'>
            <a className='btn btn-primary' onClick={() => {this.switchPage(AtPageEnum.MSG)}}>
              <img src="./main-page.png" alt="bottle"/>
              <label> Click To Get New Messages </label>
            </a>
          </div>
        </div>
      </div>
      
    )
    return ans
  }


// ############### MY SENT PAGE ################

  render_mysent_fetch =  () => {
    ds.getMyPublicDataFromDB(this.state.login_portal_props.username).then(((my_msges) => {
      ns.postNotification(NotificationEnum.DASHBOARD_LOADED,{messages: my_msges});
    }),(err) => {alert('Sorry, our database server encounters some errors:' + err + '. Please report it to admin.'); this.goHome()})  
  }

  render_mysent = () => {
      return <DashBoard header="My Sent Messages" msg_btn_type="View" show_reply_num={true}/>
  }

// ############### MY REPLY PAGE ################

  render_myreply_fetch = () => {
    ds.getMyRepliesFromDB(this.state.login_portal_props.username).then((my_msges) => {
      ns.postNotification(NotificationEnum.DASHBOARD_LOADED,{messages: my_msges});
    }).catch((err) => {alert('Sorry, our database server encounters some errors:' + err + '. Please report it to admin.'); this.goHome()})
  }

  render_myreply =  () => {
    return <DashBoard header="My Replied Messages" msg_btn_type="View" show_reply_num={true}/>
  }

// ############### MSG PAGE ################

  selectMsgToView =  () => {
    ds.getOneOtherMsg(this.state.login_portal_props.username).then((msg) => {
      if(!msg){
        alert('There is no new message for you to view now. Redirecting to main page...');
        this.goHome();
        return;
      }
      ns.postNotification(NotificationEnum.MSG_PAGE_LOADED,msg);
    }).catch((err) => {alert('Sorry, our database server encounters some errors:' + err + '. Please report it to admin.'); this.goHome()})
  }

  render_msg_page = () => {
    return <MsgPage msg={this.state.msg_page_msg}/>;
  }

  send_reply = async (props) => {
    var rep = props.rep;
    var msg = props.msg;
    rep.usr = this.state.login_portal_props.username
    try{
        rep._id =  await ds.setMsgToDB(rep);
        await ds.updateReplyToMsg(msg, rep);
        await ds.updateUserInfo(this.state.login_portal_props.username, msg._id);
    }catch(err){console.error(err)}
    alert('Reply sent. Redirecting to your message page...')
    // Update the message
    msg.reply_list.push(rep);
    ns.postNotification(NotificationEnum.VIEW_MSG,msg);
  }

// ############### EDIT PAGE ################

  switchToEdit = (data) => {
    this.switchPage(AtPageEnum.EDIT);
    this.setState({editor_page_msg:data});
  }

  render_edit = () => {
    // a editer for the user to create a new message
    return <Editor msg={this.state.editor_page_msg} saved={true}/>
  }

  send_msg = async (props) => {
    var msg = props.msg;
    msg.usr = this.state.login_portal_props.username;
    try{
      if(!msg._id){
        msg._id =  await ds.setMsgToDB(msg);
        ns.postNotification(NotificationEnum.EDITOR_LOAD_MSG,{msg:msg,saved:true});
      }else{
        await ds.setMsgToDB(msg);
      }
    }catch(err){console.error(err)} 
  }

// ############### MY UNPUBLISHED MSG PAGE ################

  getMyUnpublicMsg =  () => {
    ds.getMyUnpublicDataFromDB(this.state.login_portal_props.username).then((msges) => {
      ns.postNotification(NotificationEnum.DASHBOARD_LOADED,{messages: msges});
    }).catch((err) => {alert('Sorry, our database server encounters some errors:' + err + '. Please report it to admin.'); this.goHome()})
  }

  render_edit_unpublished = () => {
    return <DashBoard msg_btn_type="edit" header="Your Unsent Messages" show_reply_num={false}/>
  }

// ############### FINAL RENDER ################

  render = () => {
    // console.log('---------- RENDER ----------')
    // console.log('Method',this.state.at_page)
    var content = (
        <div className='container'>
          <h1> This page is not implemented. </h1>
          <h2> You shouldn't see this page, if you do, please contact the admin.</h2>
        </div>
    )
    if(this.state.at_page in this.render_methods){
      content = this.render_methods[this.state.at_page]();
    }
    return (
      <div className="App">
        <header className="App-header">
          <div className='row d-flex align-items-center'>
            <div className='col-sm-6'>
              <div className="container icon-container">
                <a href="#docs" onClick={() => this.switchPage(AtPageEnum.DOCS)}>
                  <img className='icon' href="#docs" src="main.png" alt="icon" />
                </a>
                <div className="language-switcher-container">
                  <h1 className="website-title">{ls.Trans('mb')}</h1>
                  <div className="button-group">
                      <button className="btn btn-primary" onClick={() => { ls.switchLanguage('en'); alert("Switched to English."); this.switchPage(this.state.at_page); }}>
                          English
                      </button>
                      <button className="btn btn-primary" onClick={() => { ls.switchLanguage('zh'); alert("变成中文啦！"); this.switchPage(this.state.at_page); }}>
                          中文
                      </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className='container'>
          { this.state.at_page === AtPageEnum.LOGIN? null :(<a className="btn btn-primary HomeBtn" onClick={() => this.goHome()}>Go Home</a>)}
        </div>
        <div className="container-fluid App-main">
          {content}
        </div>
        <div className='container only-for-phone'>
          <div className='col-sm-12'>
            {SHORT_INTRO()}
          </div>
        </div>
        <footer className="App-footer">
            <div className='container nav'>
              <div className='col-sm-4'>
                <div className='container txt'>
                  <a href="#docs" onClick={() => (this.switchPage(AtPageEnum.DOCS))}> How to use the website </a>
                </div>
              </div>
              <div className='col-sm-4'>
                <div className='container txt'>
                  <a href="#faq" onClick={() => (this.switchPage(AtPageEnum.FAQ))}> FAQ </a>
                </div>
              </div>
              <div className='col-sm-4'>
                <div className='container github'>
                  <a href="https://github.com/Hidden-Hyperparameter/message-website"> Connect Us at Github </a>
                  <img src="https://github.com/favicon.ico" alt="github" /> 
                </div>
              </div>
            </div>
            <div className='container ack'>
              <p className='ack-react'>
                The website is powered by React.
              </p>
            </div>
        </footer>
      </div>
    )
  }
}

export default App;
