import React from 'react';
import Toggle from './Toggle'
import Button from './Button'
import Graph from './Graph';
import createGraph from './Instruments'

export default class AudioCtx extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      graph: {}
    }
  }

  toggleAudio = (v) => {
    // console.log('Toggle Audio',v.isToggleOn);
    
    if(this.props.context.state === 'running' && !v.isToggleOn) {
      this.props.context.suspend()
      .then(() => { 
        // console.log('Suspended Audio Context', 
        // this.props.context.getOutputTimestamp());
      });
    } else if(this.props.context.state === 'suspended') {
      this.props.context.resume()
      .then(() => {
        // console.log('Resumed Audio Context', 
        // this.props.context.getOutputTimestamp())
      });
    } 
  }

  printInfo = (v) => {
    console.log(v.count,this.props.context)
  };

  componentDidMount() {

    this.setState({
      graph: createGraph(this.props.context)
    }, 
    // once done loading the audio graph,
    // suspend the audio context
    this.toggleAudio(false))
}
  
  render() {
    return(
        <div className="AudioContext">
          
          <Toggle name="Play" 
                  onChange={this.toggleAudio} />
          
          <Button name="Print"
                  onClick={this.printInfo} />
          
          <Graph name="Graph"
                 context={this.props.context}
                 graph={this.state.graph}
                 touch={this.props.touch} />
        </div>
      )
  }
}