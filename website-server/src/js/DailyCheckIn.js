import React,{Component} from "react";
import NotificationService,{NotificationEnum} from "./Notification";
import DataService from "./DataService";
import "../css/DailyCheckIn.css";

let ns = new NotificationService()
let ds = new DataService()

class DailyCheckIn extends Component {

    constructor(props) {
        super(props);
        this.state = {
            last_check_in_date : new Date('2000-01-01'),
            streak_check_in : 0,
            chicken_soup_num : 0
        }
        this.ChickenSoups = [
            "Success is not final, failure is not fatal: It is the courage to continue that counts.",
            "Believe you can and you're halfway there.",
            "The only way to do great work is to love what you do.",
            "Don't watch the clock; do what it does. Keep going.",
            "The future belongs to those who believe in the beauty of their dreams."
        ];
        this.checkIn = this.checkIn.bind(this)
        this.checkInButton = this.checkInButton.bind(this)
        this.Today = this.Today.bind(this)
        this.randomChickenSoup = this.randomChickenSoup.bind(this)
    }

    componentDidMount = async () => {
        var usr = this.props.usr
        console.log(usr, "have created DailyCheckIn");
        var data = await ds.getUserDate(usr)
        this.setState({last_check_in_date: data[0], streak_check_in: data[1], chicken_soup_num: data[2]})
    }

    checkIn = async () => {
        var usr = this.props.usr
        console.log(usr, "have checked in");
        const id = Math.floor(Math.random() * this.ChickenSoups.length);
        await ds.updateUserCheckIn(usr, id);
        var data = await ds.getUserDate(usr)
        this.setState({last_check_in_date: data[0], streak_check_in: data[1], chicken_soup_num: data[2]})
    }

    randomChickenSoup = () => {
        var { chicken_soup_num } = this.state;
        console.log("chicken number:", chicken_soup_num);
        if (chicken_soup_num < 0 || chicken_soup_num >= this.ChickenSoups.length) {
            chicken_soup_num = this.state.chicken_soup_num = 0;
        }
        return this.ChickenSoups[chicken_soup_num];
    }

    checkInButton = () => {
        var { last_check_in_date, streak_check_in } = this.state;
        last_check_in_date = new Date(last_check_in_date.toString())
        console.log("last_check_in_date", last_check_in_date)
        if (!(last_check_in_date instanceof Date)) {
            alert("Invalid Date Format. Please contact the administrator.")
            return <label>Invalid Date Format</label>;
        }
        var now_date = new Date()
        var date_dif = now_date.getDate() - last_check_in_date.getDate()
        var month_dif = now_date.getMonth() - last_check_in_date.getMonth()
        var year_dif = now_date.getFullYear() - last_check_in_date.getFullYear()
        if (year_dif > 0 || month_dif > 0 || date_dif > 0) {
            return (<button className="button-check-in" onClick={() => this.checkIn()}>Check In</button>);
        } else if (streak_check_in >= 2) {
            return (
                <div className='col-sm-12'>
                    <label>A streak of {streak_check_in} consecutive check-ins!</label>
                    <h6>{this.randomChickenSoup()}</h6>
                </div>
            )
        } else if (streak_check_in <= 1) {
            return(
                <div className='col-sm-12'>
                    <label>You have checked-in.</label>
                    <h6>{this.randomChickenSoup()}</h6>
                </div>
            )
        }
    }

    Today = () => {
        var now_date = new Date()
        return now_date.getFullYear() + "-" + (now_date.getMonth()+1) + "-" + now_date.getDate()
    }

    render = () => {
        const { last_check_in_date } = this.state;
        return (
            <div className="DailyCheckIn">
                <div className="container card">
                    <div className='col-sm-12'>
                        <h5>Today is: {this.Today()}.</h5>
                        <label>Wish you a happy day!</label>
                    </div>
                    {this.checkInButton()}
                </div>
            </div>
        )
    }
}

export default DailyCheckIn;