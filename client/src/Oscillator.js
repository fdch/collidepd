import React from 'react';
import { Slider } from './Gui';

class Oscillator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      node: null
    }
  }
  
  gainNodeValue = (v) => {
    this.setState({
      value:v
    });

    // console.log("gainNodeValue", this.state.value);
  }
  
  componentDidUpdate() {
    if(this.state.node != null ) {
      return;
    } else {
      this.setState({
        node: this.props.context.createOscillator()
      },  this.nodeCreated)
    }
  }
  componentWillUnmount() {
    // if(this.state.node != null ) {
      // this.state.node.disconnect(this.props.context.destination)
    // }
  }

  nodeCreated = () => {
    this.state.node.connect(this.props.parent);
    console.log("Test Context",this.state.node);
  }

  render() {
    return(
      <div className={this.props.name}>
          <Slider name="oscillatorFrequency"
                  onChange={this.gainNodeValue}/>
      </div>
    )
  }
}

export default Oscillator;