import React from "react";
import Toggle from './Toggle';
import AudioCtx from './AudioContext';
import './App.css';
// import Surface from './Surface';
// import Colors from './style/Colors'

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      context : null,
      touch : 'ontouchstart' in document.documentElement,
      focus : false
      // nodes: []
    }
  }

  updateContext = (v) => {
    if(!v.isToggleOn) {
      this.destroyContext();
    } else {
      this.createContext();
    }
  }
  
  createContext = () => {
    this.setState({
      context : new (window.AudioContext || window.webkitAudioContext)()
    }, this.contextStarted)
  };

  contextStarted = () => {
    // this.updateNodeTree(this.state.context.destination, "Audio Destination");
    // console.log("Audio Context", this.state.context); 
  }

  destroyContext = () => {
    if (this.state.context != null) {
      // this.removeNode(this.state.context.destination);
      this.state.context.close();
      this.setState({context : null});
      // console.log("Audio Context Stopped");
    }
  }
  
  // updateNodeTree = (node, name) => {
  //   console.log(name, node);
  //   this.setState({
  //     nodes: [...this.state.nodes, node]
  //   }, this.doneUpdate);
  // }

  // removeNode = (node) => {
  //   let idx = this.state.nodes.indexOf(node);
  //   if (idx > -1) {
  //     let spliced = [...this.state.nodes]
  //     spliced.splice(idx,1);
  //     this.setState({
  //       nodes: spliced
  //     }, this.doneUpdate);
  //   }
  // }

  // doneUpdate = () => {
  //   console.log("Update Node Trees", this.state.nodes);
  // }

  // React.useEffect(() => {
  //     fetch('/api')
  //     .then((res) => res.json())
  //     .then((data) => setData(data.message))
  // }, []);


  componentWillUnmount() {
    this.destroyContext()
  }

  _onClick = (e) => {
    e.preventDefault();
    this.setState({
      focus : true
    });
  }
  handleMoving = status => {
    this.setState({
      focus: !status
    })
  }

  render() {
    return (
      <div className="App"
       onClick={this._onClick}
       >

        <header className="App-header">
          <Toggle name="Audio" onChange={this.updateContext} />
          {
            
            this.state.context != null 
            ? 
            <AudioCtx 
              name="AudioCtx"
              context={this.state.context}
              touch={this.state.touch} />
            : <div>Start audio context...</div> 
            
          }
          
        </header>
        {/*         
        <Surface 
          moving={this.handleMoving}
          focus={this.state.focus}
          color={Colors.G}
          touch={this.state.touch}
          multitouch={false}
          height={3}
          width={10}
          size={1}
          shape="rect"
        /> */}

      {/* <p>{!data ? "Loading..." : data}</p> */}
      </div>
    );
  }
}
