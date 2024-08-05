import React,{Component} from "react";

class SmartInputBox extends Component {
    constructor(props){
        super(props);
        this.state = props
        this.onChange = this.onChange.bind(this);
    }

    onChange = (e) => {
        this.setState({value: e.target.value});
    }

    render = () => {
        return (
            <textarea type={this.state.type} name={this.state.name} id={this.state.id} value={this.state.value} onChange={this.onChange}/>
        )
    }
}

export default SmartInputBox