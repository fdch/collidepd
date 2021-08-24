/*
  A Button implemented in React
*/

import React from 'react';
import Colors from "./style/Colors";
import "./style/Button.css";

export default class Button extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      count: this.props.count || 0,
      increment: this.props.increment || 1,
      lang: this.props.lang || "EN"
    };
  }
  handleClick = () => {
    this.setState(prevState => ({
      count: prevState.count + this.state.increment
    }));
    this.props.onClick(this.state)
  }
  render() {
    return (
      <button className='fdButton'
      style={{"backgroundColor":Colors.G.lo}}
      onClick={this.handleClick}
      onMouseLeave={(t)=>{t.target.style.backgroundColor = Colors.G.lo}}
      onMouseEnter={(t)=>{t.target.style.backgroundColor = Colors.G.mid}}
      onMouseDown={(t)=>{t.target.style.backgroundColor = Colors.R.lo}}
      onMouseUp={(t)=>{t.target.style.backgroundColor = Colors.R.mid}}
              >
        {"Press " + this.props.name}
      </button>
    );
  }

}