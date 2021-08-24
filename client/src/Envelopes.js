import React from 'react';
import Button from './Button';

export default class Envelope extends React.Component {
  constructor(props) {
    super(props);
    this.start = undefined;
    this.previousTimeStamp = undefined;
  }

  // componentDidMount() {}
  // componentWillUnmount() {}

  resetTimes = () => {
      this.start = undefined;
      this.previousTimeStamp = undefined;
  }
  _onClick = e => {
    console.log("Click", e);
  }
  render () {
    return(<Button
    name="Envelope"
    onClick={this._onClick} />)
  }
}