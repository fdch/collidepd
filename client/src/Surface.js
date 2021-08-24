import React from 'react';
import Shape from './Shape'

function copyTouch({ identifier, pageX, pageY}) {
  return({ identifier, pageX, pageY });
}

export default class Surface extends React.Component {

    constructor(props) {
      super(props);
      this.ref = React.createRef();
      this.state = {
        focus: false
      };
      this.touches = [];
      this.range = {
        x : Math.abs(this.props.max[0] - this.props.min[0]),
        y : Math.abs(this.props.max[1] - this.props.min[1])
      }
    }

    componentDidMount() {

      this.el = this.ref.current;

      if (this.props.touch) {
        this.el.addEventListener("touchstart", this._onTouchStart, false);
        this.el.addEventListener("touchend", this._onTouchEnd, false);
        this.el.addEventListener("touchmove", this._onTouchMove, false);
        this.el.addEventListener("touchcancel", this._onTouchCancel, false);
      } else {
        this.el.addEventListener("mousemove", this._onMouseMove, false);
        this.el.addEventListener("mousedown", this._onMouseDown, false);
        this.el.addEventListener("mouseup", this._onMouseUp, false);
        // this.el.addEventListener("mouseleave", this._onMouseLeave, false);
      }
    }

    componentWillUnmount() {
      if (this.props.touch) {
        this.el.removeEventListener("touchstart", this._onTouchStart, false);
        this.el.removeEventListener("touchend", this._onTouchEnd, false);
        this.el.removeEventListener("touchmove", this._onTouchMove, false);
        this.el.removeEventListener("touchcancel", this._onTouchCancel, false);
      } else {
        this.el.removeEventListener("mousemove", this._onMouseMove, false);
        this.el.removeEventListener("mousedown", this._onMouseDown, false);
        this.el.removeEventListener("mouseup", this._onMouseUp, false);
        // this.el.removeEventListener("mouseleave", this._onMouseLeave, false);
      }
    }

    getBounds = () => {
      // get offsets from bounding box 
      const bounds = this.el.getBoundingClientRect();

      this.setState({
        offset: {
          left: bounds.left + window.scrollX,
          top: bounds.top + window.scrollY
        },
        moving: true,
        width: bounds.width,
        height: bounds.height,
        midx: bounds.width * 0.5,
        midy: bounds.height * 0.5
      });
    }

    getCoords = e => {
      // returnes page x and y coordinates (normalized) from event

      switch(this.props.axis) {
        case 'x':
        return {
            x: (e.pageX - this.state.offset.left) / this.state.width,
            y: 0.5
          }
        case 'y':
          return {
            x: 0.5,
            y: (e.pageY - this.state.offset.top) / this.state.height
          }
        case undefined:
        default:
          return {
            x: (e.pageX - this.state.offset.left) / this.state.width,
            y: (e.pageY - this.state.offset.top) / this.state.height
          };
      }

    }


    // handleChange = (v) => {
    //   this.setState({
    //     value: v
    //   },this.props.handleInteraction(v.target.value, this.props.target, this.props.line));
    // }

    reportMotion = (status) => {
      if (this.props.moving != null) {
        this.props.moving(status)
      }
    }

    /*
     *
     * Handle Mouse interaction
     *
     */

    _onMouseDown = event => {
      event.preventDefault();
      this.getBounds();
      // console.log("Mouse Down");
      // report to parent we will be moving
      this.reportMotion(true)
      // perform first click
      this.setState({
        click: true,
        moving: false,
        mouseout: false,
        focus: true,
        count: 0
      });
      // handle mouse x and y movement
      this.touches[0] = copyTouch(event);
    }

    _onMouseUp = event => {
      event.preventDefault();

      // console.log("Mouse Up");
      // report we are done with interaction

      this.setState({
        click: false,
        moving: false,
        mouseout: false,
        count: 0
      }, this.reportMotion(false));
      // clear the touch event
      this.touches = [];
    }

    _onMouseMove = event => {
      event.preventDefault();

      if (!this.state.click) return;
      // console.log("moving");
      this.setState(prevState => ({
        count: prevState + 1,
        moving: true,
        mouseout: false
      }))
      // handle mouse x and y movement
      this.touches[0] = copyTouch(event);
      
    }

    _onMouseLeave = event => {
      event.preventDefault();

      // console.log("Mouse Leave");

      if (this.state.click) {
        // console.log("left with click Up, stop motion");
        // report we are done with interaction
        this.setState({
          moving: false,
          click: false,
          mouseout: true,
          count: 0
        }, this.reportMotion(false));
      }
    }

    _onMouseOver = event => {
      event.preventDefault();

      // console.log("Mouse Over");
      this.setState({
        mouseout: false
      })
    }

    /*
     *
     * Handle Touch interaction
     *
     */


    _onTouchStart = event => {
      event.preventDefault();

      this.getBounds();
      const touches = event.targetTouches;

      // console.log("Touch Start", touches);
      if (!this.props.multitouch ||
        (touches.length === 1 && this.touches.length === 1)) {
        // console.log("one touch");
        this.touches[0] = copyTouch(touches[0]);
      } else {
        if (touches.length > 5) {
          console.warn("More than 5 touches not implemented");
        } else if (touches.length === 5) {
          console.log("Max touches");
        }
        // assign touches
        for (let i = 0; i < touches.length; i++) {
          let idx = this.touches.findIndex(x => x.identifier === touches[i].identifier);
          if (idx < 0) {
            // index does not exist, touch is new, push it
            this.touches.push(copyTouch(touches[i]));
            // console.log("pushed touch",this.touches);
          } else {
            // index exists, touch is old, update it
            // console.log("Touch Exists", idx);
            this.touches[idx] = copyTouch(touches[i]);
          }
        }
      }
      this.setState({
        count: 0,
        focus: true,
        click: this.touches.length ? true : false
      }, this.reportMotion(true));

      // console.log("Start",this.touches.map(t=>t.identifier));

    }
    _onTouchEnd = event => {
      event.preventDefault();

      const touches = event.targetTouches;
      // console.log("END", touches);
      if (touches !== undefined) {
        if (!this.props.multitouch ||
          (!touches.length && this.touches.length === 1)) {
          // this.touches = [];
        } else {
          const tch = Array.from(touches);
          // console.log("End",tch.map(t=>t.identifier));
          // look for stored touches and remove the one just lifted
          for (let i = 0; i < this.touches.length; i++) {
            let prev_idx = this.touches[i].identifier;
            // if the previous index is not in the present touches
            if (tch.findIndex(x => x.identifier === prev_idx) < 0) {
              // touch was lifted, remove it
              this.touches.splice(i, 1);
            }
            // else {
            // touch was not lifted, still there
            // console.log("Ongoing touch", this.touches[i]);
            // }
          }
        }
        if (touches.length === 0 && this.touches.length === 0) {
          this.setState({
            count: 0,
            click: this.touches.length ? true : false
          }, this.reportMotion(false))
        }
      }
    }
    _onTouchMove = event => {
      // if(!this.state.moving) return
      event.preventDefault();

      let touches = event.targetTouches;
      if (this.props.multitouch) {
        for (let i = 0; i < touches.length; i++) {
          let idx = this.touches.findIndex(x => x.identifier === touches[i].identifier);
          if (idx >= 0) {
            this.touches.splice(idx, 1, copyTouch(touches[i]))
          }
        }
      } else {
        this.touches[0] = copyTouch(touches[0]);
      }
      this.setState(prevState => ({
        count: prevState + 1,
        click: this.touches.length ? true : false
      }))
    }
    _onTouchCancel = event => {
      event.preventDefault();

      // const touches = event.targetTouches;
      // console.log("Cancelled Touch", this.touches);
      this.touches = [];

      this.setState({
        click: this.touches.length ? false : true
      });

    }

    mapCoords = coords => {
      // multiply by range
      // apply offset
      switch(this.props.axis) {
        case 'x':
          return coords.x * this.range.x + this.props.min[0];
        case 'y':
          return coords.y * this.range.y + this.props.min[0];
        case undefined:
        default:
          return {
            x : coords.x * this.range.x + this.props.min[0],
            y : coords.y * this.range.y + this.props.min[1]
          }
      }
    }

    render() {
      const {
        margin = "2vmin",
        border = this.state.click ? "1vmin solid black" : "2vmin solid black",
        backgroundColor = this.state.click ? this.props.color.lo : this.props.color.hi,
      } = this.props.style;

        // console.log(this.props);
        // const xpos = this.props.coords.x 
        // ? clip(this.props.coords.x * this.props.width, this.props.width, 0)
        // : this.props.width / 2 ;
    
        // const ypos = this.props.coords.y 
        // ? clip(this.props.coords.y * this.props.height, this.props.height, 0)
        //   : this.props.height / 2;

    return(
      <div>
        <label 
          className="fdSurfaceLabel"
          htmlFor={this.props.name} >
            {this.props.name}
        </label>
        <svg 
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          ref={this.ref}
          style={{
            margin:margin,
            border:border,
            backgroundColor:backgroundColor
          }}
          viewBox={`0 0 ${this.props.width} ${this.props.height}`} 
          name={this.props.name} 
          key={this.props.name} >
          {
          this.state.focus
          ? this.touches.map((touch, i) => {
              const coords = this.getCoords(touch);
              this.props.handleInteraction(this.mapCoords(coords), {target:this.props.target,line: this.props.line});
              return (Shape(coords, {
                  width : this.props.width,
                  height : this.props.height,
                  size : this.state.click ? this.props.size * 1.5 : this.props.size,
                  color : this.state.click ? this.props.color.hi : this.props.color.lo,
                  strokeColor : "black",
                  strokeWidth : "0.05",
                  shape : this.props.shape?this.props.shape:"circle",
                  key : touch.identifier,
                  id : touch.identifier,
                  text : i,
                }));
            })
          : null
          }
        </svg>
      </div>
    );
  }
}