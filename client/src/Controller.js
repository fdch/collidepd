import React from 'react';
import Selector from './Selector';
import Surface from './Surface';
import Colors from './style/Colors';
import Button from './Button';

export default class Controller extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time: this.props.time || 0.5,
      // value: this.props.controls.value || 0,
    }
    // console.log("Controller",this.props);
    
  }
  
  componentDidMount() {
    let controls = [];
    // console.log("touch?",this.props.touch);
    this.props.controls.forEach((v,i) => {
      // console.log("Controller Mounted",v);
      if (v !== null) {

        switch (v.type) {

          case "slider":
          default:
            // console.log("Slider");
            controls.push(
              <Surface
                key={`${this.props.name}:${v.change}:${v.type}-${i}`}
                name={`${this.props.name}: ${v.change} ${v.type}`}
                max={[v.max,v.max]}
                min={[v.min,v.min]}
                value={v.value}
                step={v.step}
                line={`${v.line}RampToValueAtTime`}
                // focus={this.state.focus}
                color={v.color?v.color:Colors.R}
                touch={this.props.touch}
                multitouch={false}
                axis='x'
                shape="rect"
                height={2}
                width={10}
                size={1}
                target={this.props.node[v.change]}
                handleInteraction={this.controllerValue}
                style={{margin:'none', border:'1px solid black', backgroundColor:'white'}} />)
            break;

          case "selector":
            // console.log("Selector",v);
            controls.push(
              <Selector 
                key={`${this.props.name}:${v.change}:${v.type}-${i}`}
                name={`${this.props.name}: ${v.change} ${v.type}`}
                handleInteraction={this.selectorValue}
                target={v.change}
                options={v.options} />)
            break;

          case "button":
            console.log("Button",v);
            controls.push(
              <Button 
                key={`${this.props.name}:${v.change}:${v.type}-${i}`}
                name={`${this.props.name}: ${v.change} ${v.type}`}
                onClick={e=>console.log("Click", e)}
                target={v.change}
                options={v.options} />)
            break;

          case "surface":
            // console.log(v);
            controls.push(
              <Surface
                key={`${this.props.name}:${v.change.join("-")}:${v.type}-${i}`}
                name={`${this.props.name}: ${v.change.join("-")} ${v.type}`}
                handleInteraction={this.controllerXY}
                target={v.change.map(c=>this.props.node[c])}
                min={v.min}
                max={v.max}
                value={v.value}
                step={v.step}
                line={v.line.map(c=>`${c}RampToValueAtTime`)}
                // focus={this.state.focus}
                color={v.color?v.color:Colors.R}
                touch={this.props.touch}
                multitouch={false}
                height={v.scale.x?v.scale.x:10}
                width={v.scale.y?v.scale.y:10}
                size={v.size?v.size:1} />)
            break;
        }

        this.setState({
          controls: controls
        });
      }
    
    });

    // console.log("Controller State", controls);

  }
  selectorValue = (value, target) => {
    // console.log("Selector", value, target);
    if (value === 'random') {
    
      let real = Float32Array.from({length:16},() => (Math.random()-0.5)*2);
      let imag = Float32Array.from({length:16},() => (Math.random()-0.5)*2);

      // console.table("Real", real);
      // console.table("Imag", imag);
      let wave = this.props.context.createPeriodicWave(real, imag, {
        disableNormalization: false
      });
    
      this.props.node.setPeriodicWave(wave);
    
    } else {
      this.props.node[target] = value;
    }
  }

  controllerValue = (value, node) => {
    // console.log("ControllerValue", coords, node.target, node.line);
    this.rampLine(value, node.target, node.line);
    // this.setState({
      // value: value
    // });
  }

  controllerXY = (coords, node) => {
    // console.log("ControllerXY", coords.x, coords.y);
    this.rampLine(coords.x, node.target[0], node.line[0]);
    this.rampLine(coords.y, node.target[1], node.line[1]);
  }

  rampLine = (value, target, line) => {
    // console.log("Ramp Line", value, target, line);
    let t = this.props.context.currentTime + this.state.time;
    target[line](value, t);
  }

  render() {
    return(
      <div className={this.props.name}>
        {this.state.controls} 
      </div>
    )
  }
}