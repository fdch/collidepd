const controlsup = '#controlsuperior';
const controlinf = '#controlinferior';
const controlpos = '#controlposition';
const options = [
  'sine',
  'sawtooth',
  'square',
  'triangle',
  'pwm',
  'pulse',
];
const filterOptions = [
  'lowpass',
  'highpass',
  'bandpass',
  'lowshelf',
  'highshelf',
  'notch',
  'allpass',
  'peaking'
];

class Control {

  constructor() {

    this.slidervol = new Nexus.Add.Slider(controlsup, {
      'size': [displayW - pad * 2, nxB],
      'min': -100,
      'max': 0,
      'step': 1,
      'value': -100
    });

    this.selectF = doc.getElementById('filterSelect');

    this.selectS = new Nexus.RadioButton(controlsup, {
      'size': [nxB * 6, nxB * 0.75],
      'numberOfButtons': 6,
      'active': 0
    });

    //Start Loop
    this.posSize = displayW <= displayH ? displayW : displayH;

    this.position = new Nexus.Add.Position(controlpos, {
      'size': [this.posSize - pad, this.posSize - pad],
      'mode': 'absolute', // absolute or relative
      'x': 60, // initial x value
      'minX': 60,
      'maxX': 5000,
      'stepX': 1,
      'y': 60, // initial y value
      'minY': 60,
      'maxY': 5000,
      'stepY': 0
    });

    this.onoff = new Nexus.Add.Button(controlinf, {
      'size': [nxB, nxB],
      'mode': 'toggle',
      'state': false,
    });

    //Randomizer all
    this.set = new Nexus.Add.Button(controlinf, { ////Random todo
      'size': [nxB, nxB],
      'mode': 'button',
      'state': false
    });

    this.bpm = new Nexus.Add.Dial(controlinf, {
      'size': [nxB, nxB],
      'min': 0.1,
      'max': 1,
      'step': 0,
      'value': 1
    });

    this.delay = new Nexus.Add.Dial(controlinf, {
      'size': [nxB, nxB],
      'min': 0,
      'max': 1,
      'step': 0,
      'value': 0.125
    });

    this.verb = new Nexus.Add.Dial(controlinf, {
      'size': [nxB, nxB],
      'min': 0,
      'max': 1,
      'step': 0,
      'value': 0.125
    });

    this.tilt = new Nexus.Add.Tilt(controlinf, {
      'size': [nxB, nxB]
    });

    // this.minx = Number.POSITIVE_INFINITY;
    // this.miny = Number.POSITIVE_INFINITY;
    // this.minz = Number.POSITIVE_INFINITY;
    // this.maxx = Number.NEGATIVE_INFINITY;
    // this.maxy = Number.NEGATIVE_INFINITY;
    // this.maxz = Number.NEGATIVE_INFINITY;

    this.tilt.active = false;

    //
    // // create a meter on the destination node
    // this.meter = new Nexus.Add.Meter(control).connect(dac);
  }
  getTilt(v) {
    // let nv = v;
    // if (deviceIsAndroid) {
    // } else {
    // }
    return v;
  }
}
