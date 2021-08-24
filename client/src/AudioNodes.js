export default function Destination(context) {
  // console.log(context);
  return({
    type: "context",
    source: context.destination,
    target: null
  });
}

export function GainNode(context, target,
  {
    controls = true,
    change = 'gain',
    type = 'slider',
    min = 0,
    max = 1,
    value = 0,
    step = 0.01,
    line = 'linear'
  } = {} ) {

  if (context === undefined) {
    console.warn("GainNode", context);
    return null;
  } else {
    const node = context.createGain();
    node.gain.setValueAtTime(value, context.currentTime);
    return {
      type: "gain",
      source: node,
      target: target,
      controls: controls
      ? [{ 
          change: change,
          type: type,
          min : min,
          max : max,
          value : value,
          step : step,
          line: line
        }]
      : null
    }
  }
}

export function OscillatorNode(context, target,
  {
    // surface = false,
    freqcontrols = false,
    freqchange = 'frequency',
    freqmin = 40,
    freqmax = 5000,
    freqvalue = 100,
    freqstep = 1,
    freqline = 'linear',
    
    detunecontrols = false,
    detunechange = 'detune',
    detunemin = -100,
    detunemax = 100,
    detunevalue = 0,
    detunestep = 1,
    detuneline = 'linear',
    
    typecontrols = false,
    typechange = 'type',
    typedefault = 'sine',
    typeoptions = [ "sine", "square", "sawtooth", "triangle", "random" ]
  } = {} ) {

  if (context === undefined) {
    console.warn("OscillatorNode", context);
    return null;
  } else {
    // const gainNode = context.createGain();
    const node = context.createOscillator();
    // node.connect(gainNode);
    node.type = typedefault;
    node.frequency.setValueAtTime(freqvalue, context.currentTime);
    node.detune.setValueAtTime(detunevalue, context.currentTime);

    return {
        type: "oscillator",
        source: node,
        target: target,
        autostart: true,
        controls: 
        [
          freqcontrols
          ? {
              change: freqchange,
              type  : 'slider',
              min   : freqmin,
              max   : freqmax,
              value : node.frequency,
              step  : freqstep,
              line  : freqline
            }
          : null,
          detunecontrols
          ? {
              change: detunechange,
              type  : 'slider',
              min   : detunemin,
              max   : detunemax,
              step  : detunestep,
              line  : detuneline,
              value : node.detune,
            }
          : null,
          typecontrols
          ? {
              type    : 'selector',
              change  : typechange,
              default : node.type,
              options : typeoptions
            }
          : null
        ]
    }
  }
}

export function Envelope(context, target,
  {
    controls = true,
    change = 'gain',
    type = 'button',
    min = 0,
    max = 1,
    value = -0.1,
    step = 0.01,
    line = 'linear'
  } = {} ) {

  if (context === undefined) {
    console.warn("Envelope", context);
    return null;
  } else {
    const node = context.createGain();
    const filter = context.createBiquadFilter();
    const osc = context.createOscillator();
    osc.connect(filter);
    filter.connect(node);
    osc.frequency.setValueAtTime(value, context.currentTime);
    osc.type="square";
    osc.start();
    filter.type = "lowshelf";
    filter.frequency.setValueAtTime(80, context.currentTime);
    filter.gain.setValueAtTime(-10, context.currentTime);
    node.gain.setValueAtTime(1, context.currentTime);
    return {
      type: "gain",
      source: node,
      target: target,
      controls: controls
      ? [{ 
          change: change,
          type: type,
          min : min,
          max : max,
          value : value,
          step : step,
          line: line
        }]
      : null
    }
  }
}