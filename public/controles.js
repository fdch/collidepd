const controlsup = '#controlsuperior';
const controlinf = '#controlinferior';
const controlpos = '#controlposition';
const options = [
  'sine',
  'sawtooth',
  'square',
  'pwm',
  'pulse',
  'triangle'
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
      'x': 300, // initial x value
      'minX': 100,
      'maxX': 5000,
      'stepX': 1,
      'y': 300, // initial y value
      'minY': 100,
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
      'mode': 'toggle',
      'state': false
    });

    this.delay = new Nexus.Add.Dial(controlinf, {
      'size': [nxB, nxB],
      'min': 0,
      'max': 1,
      'step': 0,
      'value': 0.5
    });

    this.verb = new Nexus.Add.Dial(controlinf, {
      'size': [nxB, nxB],
      'min': 0,
      'max': 1,
      'step': 0,
      'value': 0.5
    });

    this.tilt = new Nexus.Add.Tilt(controlinf, {
      'size': [nxB, nxB]
    });

    if (orient === "Browser") {
      this.tilt.active = false;
    }
    //
    // // create a meter on the destination node
    // this.meter = new Nexus.Add.Meter(control).connect(dac);
  }
}