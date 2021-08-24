/*
  A Toggle implemented in React
  pass onChange={functionName} for Lifting State up
*/

import React from 'react';
import Colors from "./style/Colors";
import "./style/Toggle.css";

export default class Toggle extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isToggleOn: true,
      text: ["On", "Off"],
      lang: "EN"
    };
  }
  
  handleClick = () => {
    this.setState(prevState => ({
      isToggleOn:!prevState.isToggleOn
    }), this.props.onChange(this.state));
  }

  render() {
    return (
      <button 
      className="fdButton"
      style={{"backgroundColor":Colors.G.lo}}
      onClick={this.handleClick}
      onMouseLeave={(t)=>{t.target.style.backgroundColor = Colors.G.lo}}
      onMouseEnter={(t)=>{t.target.style.backgroundColor = Colors.G.mid}}
      onMouseDown={(t)=>{t.target.style.backgroundColor = Colors.R.lo}}
      onMouseUp={(t)=>{t.target.style.backgroundColor = Colors.R.mid}} >
        {"Toggle " + this.props.name + " " + (this.state.isToggleOn ? this.state.text[0] : this.state.text[1])}
      </button>
    );
  }
}