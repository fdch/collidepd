import React from 'react';

export default class Selector extends React.Component {

  handleChange = (v) => {
    this.setState({
      value: v
    }, this.props.handleInteraction(v.target.value, this.props.target));
  }

  render() {
    return(
      <div className="fdSelector">
        <label 
          className="fdSelectorLabel"
          htmlFor={this.props.name} > 
          {this.props.name} 
        </label>
        <select 
           name={this.props.name} 
           id={this.props.name}
           onChange={this.handleChange} >
          {
            this.props.options.map(x => <option key={x} value={x}>{x}</option>)
          }
          
        </select>
      </div>
    );
  }
}