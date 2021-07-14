const controlsup  = '#controlsuperior';
const controlinf  = '#controlinferior';
const controlpos  = '#controlposition';
const options = ['sine', 'sawtooth', 'square', 'pwm', 'pulse', 'triangle'];
const nxB = 40;

dac = new Tone.Channel({
  volume:-Infinity,
  pan:0,
  channelCount:2
}).toDestination();


class Control {

  constructor() {
    
    this.slidervol = new Nexus.Add.Slider(controlsup,{
      'size': [displayW-pad*2, nxB],
      'min': -100,
      'max': 0,
      'step': 1,
      'value': -100
    });
    
    this.selectF = new Nexus.Add.Select(controlsup, {
      'size': [nxB*1.5,nxB*0.5],
      'options': ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'notch', 'allpass', 'peaking']
    });

    this.selectS = new Nexus.RadioButton(controlsup,{
      'size': [nxB*6,nxB*0.75],
      'numberOfButtons': 6,
      'active': 0
    });

    this.tilt = new Nexus.Add.Tilt(controlsup,{
      'size': [nxB,nxB]
    });
    
    if(orient === "Browser") {
      this.tilt.active = false;
    }
    
    //Start Loop
    this.posSize = displayW <= displayH ? displayW : displayH;
    
    this.position = new Nexus.Add.Position(controlpos,{
      'size': [this.posSize-pad, this.posSize-pad],
      'mode': 'absolute',  // absolute or relative
      'x': 0.5,  // initial x value
      'minX': 100,
      'maxX': 5000,
      'stepX': 1,
      'y': 0.5,  // initial y value
      'minY': 0,
      'maxY': 75,
      'stepY': 0
      // 'releaseEvent':
    });

    this.onoff = new Nexus.Add.Button(controlinf,{
      'size': [nxB,nxB],
      'mode': 'toggle',
      'state': false,
    });
    
    //Randomizer all
    this.set = new Nexus.Add.Button(controlinf,{ ////Random todo
      'size': [nxB,nxB],
      'mode': 'toggle',
      'state': false
    });

    this.delay = new Nexus.Add.Dial(controlinf,{
      'size': [nxB,nxB],
      'min': 0,
      'max': 1,
      'step': 0,
      'value': 0.5
    });

    this.verb = new Nexus.Add.Dial(controlinf,{
      'size': [nxB,nxB],
      'min': 0,
      'max': 1,
      'step': 0,
      'value': 0.5
    });
    //
    // // create a meter on the destination node
    // this.meter = new Nexus.Add.Meter(control).connect(dac);
  }
  destroyer() {
    this.slidervol.destroy();
    this.dialdelay.destroy();
    this.dialverb.destroy();
    this.position.destroy();
    this.tilt.destroy();
    this.meter.destroy();
  }
}


class Player {
  //
  // player receives a singlge userdata object (not the array userData)
  //
  constructor() {
    // The Player's UserData (from the server)
    // this.oscid = ud.oscid;
    // this.id    = ud.id;
    // this.name  = ud.name;
    // this.time  = ud.time;



    this.freq = Tone.Midi(Nexus.rf(40,50));
    // The Player's main Synth:

    this.synth = new Tone.MonoSynth({
      detune: 0, //cents
      portamento: 0,
      volume: 0,
      envelope: {
        attack: 0.01,
        attackCurve: "linear",
        decay: 0.3,
        decayCurve: "exponential",
        release: 1,
        releaseCurve: "exponential",
        sustain: 1
      },
      filter: {
        Q: 1,
        detune: 0,
        frequency: 0, //position2
        gain: 0,
        rolloff: -12,
        type: "bandpass"
      },
      filterEnvelope: {
        attack: 0.1,
        attackCurve: "linear",
        decay: 0.7,
        decayCurve: "exponential",
        release: 0.5,
        releaseCurve: "exponential",
        sustain: 0,
        baseFrequency: 100,
        exponent: 2,
        octaves: 4
      },
      oscillator:{
        frequency: 0,
        type: "sine" // Hz "fm", "am", or "fat" "pwm" or "pulse" //agregar text selector
      },
    });


    //Loop
    this.loop = new Tone.Loop((time) => {
      // channel.pan.rampTo(Nexus.rf(-1,1), vel * 0.1);
      // // vel = Nexus.rf(0.1, 1);
      this.pitch(this.freq);
      this.synth.triggerAttackRelease(this.freq);
      console.log(this.loop.interval);
    },1);
    Tone.Transport.start();




    // The Player's Main Channel
    this.channel = new Tone.Channel();
    this.dist = new Tone.Distortion(0.8);

    // The Player's FEEDBACK DELAY
    this.fdelay = new Tone.FeedbackDelay({
      delayTime: '2n',
      feedback: 0.5}).connect(dac);
      this.verb = new Tone.Reverb().connect(dac);
      // this.shift = new Tone.PitchShift(5);
      // this.synth.chain(this.shift, this.fdelay, dac);


      // The Player's EQUAL PANNER OBJ
      this.panner  = new Tone.Panner({pan:0});
      this.lfo = new Tone.LFO(0.1, -1,1).connect(this.panner.pan).start();

      // The FX CHAIN --> connects player to dac
      this.synth.chain(this.panner, this.channel, dac);
      this.synth.fan(this.fdelay);
      this.synth.fan(this.verb);


      // console.log(Created synth:  + this.oscid);
    }
    vol(f) {
      // console.log(f)
      this.synth.volume.rampTo(f,0.1);
    }

    pitch(f) {
      console.log(f);
      this.freq = f;
      this.synth.triggerAttackRelease(f);
      // this.synth.frequency.rampTo(f, 0.1);
    }

    // envelope(f) {
    //   if(f){
    //     this.synth.triggerAttack(this.freq);
    //     console.log('Hiciste Click');
    //   } else {
    //     this.synth.triggerRelease();
    //     console.log('Levantaste el dedo');
    //   }
    // }
    detune(f) {
      this.synth.detune.rampTo(f, 0.1);
    }

    filterf(f) {
      this.synth.filter.frequency.rampTo(f, 1);
    }

    delaywet(f) {
      this.fdelay.wet.rampTo(f,0.1);
    }

    verbwet(f) {
      // console.log(f);
      this.verb.wet.rampTo(f,0.1);
    }

    selectFilter(f) {
      console.log(f);
      this.synth.filter.set({
        type:f.value
      }
    );
  }

  selectSource(f) {
    let opt = options[f];
    console.log(opt);
    this.synth.oscillator.type = opt;
  }

  loopstart(f) {
    if(f){
      this.loop.start();
    }
    else {
      this.loop.stop();
    }
  }

  setrandom(f) {
    if(f){
      this.fdelay.delayTime.linearRampTo(Nexus.rf(0.01,1), Nexus.rf(0.01,1));
      this.fdelay.feedback.linearRampTo(Nexus.rf(0.01,1), Nexus.rf(0.01,1));
      this.loop.interval = Nexus.rf(0.01,1);
    }
    else{
      this.fdelay.delayTime.linearRampTo(Nexus.rf(0.01,1),Nexus.rf(0.01,1));
      this.fdelay.feedback.linearRampTo(Nexus.rf(0.01,1),Nexus.rf(0.01,1));
      this.loop.interval = Nexus.rf(0.01,1);
    }
  }


  // harmonicity(f) {
  // //     this.synth.harmonicity = f;
  // // }
  // // mod(f) {
  // //     this.synth.modulationIndex = f;
  // // }
  // destroyer() {
  // console.log(Disconnecting synth:  + this.oscid);
  // ramp to -Infinity in 30 seconds, and out.
  // this.synth.dispose();
}
