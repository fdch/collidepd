import React from 'react'
import Controller from './Controller'

export default class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialized : false
    }
  }
  componentDidUpdate() {
    if(!this.state.initialized) {
      this.setState({initialized: true}, this.initialize)
    }
  }
  initialize = () => {
    // console.log("Initialize Graph", this.props.graph);
    // this.createNodes(this.props.graph);
    this.updateNodes(this.props.graph, 'connect');
    this.startNodes(this.props.graph, 'start');
    
  }
  // Todo: Leave this for later
  // createNodes = (graph) => {
  //   Object.values(graph).forEach(n => {
  //     console.log(n);
  //     if (n.source == null && n.target != null) {
  //       let createIt = 'create' + n.type[0].toUpperCase() + n.type.substr(1);
  //       n.source = this.props.context[createIt]()
  //     }
  //   });
  // }
  updateNodes = (graph, action) => {
    // console.log("updateNodes", action+"ing");
    Object.values(graph).forEach(n => {
      let target = n.target;
      if (target != null) {
        if (typeof target === 'object') {
          target = graph[target.node].source[target.param]
        } else {
          target = graph[target].source;
        }
        try {
          n.source[action](target);
        } catch (e) {
          console.warn("Problem connecting or disconnecting nodes")
          console.error(e);
          console.error("See",n);
        }
        if(n.source.gain !== undefined) {
          n.source.gain.setValueAtTime(0, this.props.context.currentTime)
        }
      }
    });
  }
  startNodes = (graph, action) => {
    // console.log("startNodes", action+"ing");
    Object.values(graph).forEach(n => {
      if (n.target != null && n.source['start'] !== undefined) {
        if(n.autostart) {
          n.source[action]();
          // console.log(n);
          if(!n.controls.type === 'surface') {
            // ignore surface initialization for now
            n.source.frequency.setValueAtTime(n.controls[n.controls.findIndex(x => x.change === 'frequency')].value, this.props.context.currentTime)
            n.source.detune.setValueAtTime(n.controls[n.controls.findIndex(x => x.change === 'detune')].value, this.props.context.currentTime)
          }
        }
      }
    });
  }
  componentWillUnmount() {
    // console.log("Graph", "Unmounting");
    this.updateNodes(this.props.graph, 'disconnect');
    this.setState({initialized: false})
  }
  render () {
    return(
      <div className="Graph-main">
        {
          Object.entries(this.props.graph).map(([k,v],i) => {
            // console.log("Controller",v);
            return(
              v.target != null
              ? <Controller 
                  key={`${k}-${i}`}
                  touch={this.props.touch}
                  name={k}
                  node={v.source}
                  context={this.props.context}
                  controls={v.controls}
                  />
              : null
            )
          })
        }
      </div>
    )
  }
}