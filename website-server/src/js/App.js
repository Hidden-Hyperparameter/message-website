import '../css/App.css';
import React, {Component} from 'react';
import LoginPortal,{LoginPortalProps} from './login';
import Msg,{MsgConfig} from './my_msg';
import MsgPage from './MsgPage';
import NotificationService,{NotificationEnum} from "./notification";
import DataService from './dataservice';
import SmartInputBox from './smart_input';
import DashBoard from './DashBoard';
import Editor  from './Editor';

import { LOADING_PAGE,PromiseStatusEnum } from './common';

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

class App extends Component {
  constructor() {
    super();
    this.state = {
      at_page: AtPageEnum.MAIN, // DEBUG ONLY
      // login_portal_props: new LoginPortalProps(),
      login_portal_props: { // DEBUG ONLY
        username: "debug",
        password: "debug",
        login_ed: true,
      },
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
    this.getMyUnpublicMsg = this.getMyUnpublicMsg.bind(this);
  }

  componentDidMount = () => {
    ns.addObserver(NotificationEnum.NOTIFY_LOGIN, this, this.onNotifyLogin);
    ns.addObserver(NotificationEnum.EDIT_MSG, this, this.switchToEdit);
    ns.addObserver(NotificationEnum.VIEW_MSG,this,(msg_dict) => {
      this.setState({
        view_msg_details: {
          msg: msg_dict
        },
        promise_status:PromiseStatusEnum.NOT_BEGUN,
        at_page: AtPageEnum.MSG
      })
    });
    ns.addObserver(NotificationEnum.BACK_TO_MAIN,this,() => {this.switchPage(AtPageEnum.MAIN);});
    ns.addObserver(NotificationEnum.TO_UNPUBLISHED_PAGE,this,() => {this.switchPage(AtPageEnum.UNPUBISHED_MSG_PAGE);});
  }

  componentWillUnmount = () => {
    ns.removeObserver(this, NotificationEnum.NOTIFY_LOGIN);
    ns.removeObserver(this, NotificationEnum.EDIT_MSG);
    ns.removeObserver(this, NotificationEnum.VIEW_MSG);
    ns.removeObserver(this, NotificationEnum.CHANGE_PAGE);
    ns.removeObserver(this, NotificationEnum.TO_UNPUBLISHED_PAGE);
  }

// ############### LOGIN PAGE ################

  render_login = () => {
    return (
      <div className="container-fluid App-main">
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
          <h1> Welcome, <special>{this.state.login_portal_props.username}</special> </h1>
          <div className='row firstrow'>
            <div className='col-sm-6'>
              <a className="btn btn-primary" onClick={() => {this.switchPage(AtPageEnum.MYSENT)}}> My Sent Messages </a>
            </div>
            <div className='col-sm-6'>
              <a className="btn btn-primary" onClick={() => {this.switchPage(AtPageEnum.MYREPLY)}}> Replied Messeges </a>
            </div>
          </div>
          <div className='row secondrow'>
            <div className='col-sm-12'>
              <a className="btn btn-primary" onClick={() => {this.switchPage(AtPageEnum.EDIT)}}>Compose or Edit Message</a>
            </div>
          </div>
          <div className='row thirdrow d-flex align-items-center'>
            <div className='col-sm-8'>
              <div className='container'>
                <a className='btn btn-primary' onClick={() => {this.switchPage(AtPageEnum.MSG)}}>
                  <img src="./main-page.png" alt="bottle"/>
                </a><br/>
                <label> Click To Get New Messages </label>
              </div>
            </div>
          </div>
      </div>
    )
  }


// ############### MY SENT PAGE ################

  render_mysent_fetch =  () => {
    ds.getMyPublicDataFromDB(this.state.login_portal_props.username).then(((my_msges) => {
      ns.postNotification(NotificationEnum.DASHBOARD_LOADED,{messages: my_msges});
    }),(err) => {alert('Sorry, our database server encounters some errors:' + err + '. Please report it to admin.'); this.setState({at_page:AtPageEnum.MAIN})})  
  }

  render_mysent = () => {
      this.render_mysent_fetch();
      return <DashBoard header="My Sent Messages" msg_btn_type="View"/>
  }

// ############### MY REPLY PAGE ################

  render_myreply_fetch = () => {
    ds.getMyRepliesFromDB(this.state.login_portal_props.username).then((my_msges) => {
      ns.postNotification(NotificationEnum.DASHBOARD_LOADED,{messages: my_msges});
    }).catch((err) => {alert('Sorry, our database server encounters some errors:' + err + '. Please report it to admin.'); this.setState({at_page:AtPageEnum.MAIN})})
  }

  render_myreply =  () => {
    this.render_myreply_fetch()
    return <DashBoard header="My Replied Messages" msg_btn_type="View"/>
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
      ns.postNotification(NotificationEnum.MSG_PAGE_LOADED,msg);
    }).catch((err) => {alert('Sorry, our database server encounters some errors:' + err + '. Please report it to admin.'); this.setState({at_page:AtPageEnum.MAIN})})
  }

  render_msg_page = () => {
    this.selectMsgToView();
    return <MsgPage/>;
  }

// ############### EDIT PAGE ################

  switchToEdit = (data) => {
    this.switchPage(AtPageEnum.EDIT);
    if(data)
      this.setState({
        page_edit_details: {
          saved: true,
          embed_msg: data,
        }
      });
  }

  render_edit = () => {
    // a editer for the user to create a new message
    return <Editor />
  }

// ############### MY UNPUBLISHED MSG PAGE ################

  getMyUnpublicMsg =  () => {
    ds.getMyUnpublicDataFromDB(this.state.login_portal_props.username).then((msges) => {
      ns.postNotification(NotificationEnum.DASHBOARD_LOADED,{messages: msges});
    }).catch((err) => {alert('Sorry, our database server encounters some errors:' + err + '. Please report it to admin.'); this.setState({at_page:AtPageEnum.MAIN})})
  }

  render_edit_unpublished = () => {
    this.getMyUnpublicMsg();
    return <DashBoard msg_btn_type="edit" header="Your Unsent Messages"/>
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
          <div className='row d-flex align-items-center'>
            <div className='col-sm-4'>
              <div className="container icon">
               <img className='icon' src="main.png" alt="icon" />
              </div>
            </div>
            <div className='col-sm-8'>
              <div className='container'>
                  <h1> Whisper Bottles </h1>
              </div>
            </div>
          </div>
          <div className='container'>
            <a className="btn btn-primary" onClick={() => this.switchPage(AtPageEnum.MAIN)}>Go Home</a>
          </div>
        </header>
        {content}
      </div>
    )
  }
}

export default App;
