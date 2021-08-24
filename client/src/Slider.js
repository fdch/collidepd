/*
  A Slider implemented in React
*/
import React from 'react';
import "./style/Slider.css";

// const datalistItems = [0,10,20,30,40,50,60,70,80,90,100,120];

export default class Slider extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      value: this.props.value || 0,
      min: this.props.min || 0,
      max: this.props.max || 1,
      step: this.props.step || 0.01,
      lang: this.props.lang || "EN"
    };
    // console.log("Slider",this.props);
  }

  handleChange = (v) => {
    this.setState({
      value: v
    },this.props.handleInteraction(v.target.value, this.props.target, this.props.line));
  }

  render() {
    return (
      <div className="fdSliderWrapper">
{/*         
        <datalist id={this.props.name + "-datalist"}>{
          datalistItems.map( (v, i) => <option key={"opt"+i} value={v}/>)}
        </datalist> 
*/}
        <label 
          className="fdSliderLabel"
          htmlFor={this.props.name} >
            {this.props.name}
        </label>
        <input type="range" 
          id={this.props.name} 
          name={this.props.name}
          min={this.state.min} 
          max={this.state.max} 
          step={this.state.step}
          className='fdSlider'
          list={this.props.name + "-datalist"}
          onChange={this.handleChange}>
        </input>
      </div>
    );
  }
}