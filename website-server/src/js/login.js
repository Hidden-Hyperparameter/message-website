import React,{Component} from "react";
import NotificationService,{NotificationEnum} from "./notification";
import DataService from "./dataservice";
var ns = new NotificationService();
var ds = new DataService();

class LoginPortalProps {
    constructor() {
        this.username = undefined;
        this.password = undefined;
        this.login_ed = false;
    }
}

class LoginPortal extends Component {
    constructor(props) {
        super(props);
        this.state = {}
        for(var key in props){
            this.state[key] = props[key];
        }
    }
    
    render = () => {
        return (
        <div className="container">
            <div className='row'>
            <div className='col-2'>
              <label>Username:</label>
            </div>
            <div className='col-4'>
              <input type="text" id="username" name="username" />
            </div>
          </div>
          <div className='row'>
            <div className='col-2'>
              <label>Password:</label>
            </div>
            <div className='col-4'>
              <input type="password" id="password" name="password" />
            </div>
          </div>
          <div className='row'>
            <div className='col-2'>
              <button onClick={() => this.login()}>Login</button>
            </div>
            <div className='col-2'>
              <button onClick={() => this.signUp()}>Sign Up</button>
            </div>
        </div>
        </div>
        )
    }
    
    login = () => {
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        ds.checkUserPasswd(username, password).then((data) => {
            if(data){
                alert("Login Successful!");
                this.setState({login_ed: true, username: username, password: password});
                ns.postNotification(NotificationEnum.NOTIFY_LOGIN, {username: username, password: password});
            }else{
                alert("Login Failed!");
            }
        }, (err) => {alert("Login failed, probably due to a problem in our database: " + err + ". If you are sure that your password is correct, please contact the admin.");});
    }

    signUp = () => {
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        if(username === "" || password === ""){
            alert("Username and password cannot be empty!");
            return;
        }
        ds.addNewUser(username, password).then((data) => {
            alert("Sign Up Successful!");
            this.setState({login_ed: true, username: username, password: password});
            ns.postNotification(NotificationEnum.NOTIFY_LOGIN, {username: username, password: password});
        }, (err) => {alert("Sign Up failed: " + err + ". If you are sure that your password is correct, please contact the admin.");});
    }
}

export default LoginPortal;
export {LoginPortalProps}