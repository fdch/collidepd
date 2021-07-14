var controlsup  = '#controlsuperior';
var controlinf  = '#controlinferior';

var dac = new Tone.Channel({
  volume:-Infinity,
  pan:0,
  channelCount:2
}).toDestination();

// var width = document.getElementById('continferior').clientWidth;
class Control {

  constructor() {

    //Start Loop

    this.onoff = new Nexus.Add.Button(controlsup,{
      'size': [40,40],
      'mode': 'toggle',
      'state': false,
    })

    //Randomizer all
    this.set = new Nexus.Add.Button(controlsup,{ ////Random todo
      'size': [40,40],
      'mode': 'toggle',
      'state': false
    })

    this.tilt = new Nexus.Add.Tilt(controlsup,{
      'size': [40,40]
    });
    this.tilt.active=false;

    this.slidervol = new Nexus.Add.Slider(controlsup,{
      'size': [90, 40],
      'min': -100,
      'max': 0,
      'step': 1,
      'value': -100
    });

    this.delay = new Nexus.Add.Dial(controlsup,{
      'size': [40, 40],
      'min': 0,
      'max': 1,
      'step': 0,
      'value': 0.5
    });

    this.verb = new Nexus.Add.Dial(controlsup,{
      'size': [40, 40],
      'min': 0,
      'max': 1,
      'step': 0,
      'value': 0.5
    });

    this.selectF = new Nexus.Add.Select(controlsup, {
      'size': [100,30],
      'options': ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'notch', 'allpass', 'peaking']
    })

    this.selectS = new Nexus.Add.Select(controlsup, {
      'size': [100,30],
      'options': ['sine', 'sawtooth', 'square', 'pwm', 'pulse', 'triangle']
    })

    this.position = new Nexus.Add.Position(controlinf,{
      'size': [650,470],
      'mode': 'absolute',  // absolute or relative
      'x': 0.5,  // initial x value
      'minX': 100,
      'maxX': 5000,
      'stepX': 1,
      'y': 0.5,  // initial y value
      'minY': 100,
      'maxY': 5000,
      'stepY': 0
      // 'releaseEvent':
    });


    //
    // create a meter on the destination node
    this.meter = new Nexus.Add.Meter(controlinf).connect(dac);
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
        attack: 0.1,
        attackCurve: "linear",
        decay: 0.7,
        decayCurve: "exponential",
        release: 1,
        releaseCurve: "exponential",
        sustain: 0
      },
      filter: {
        Q: 0.5,
        detune: 0,
        frequency: 0, //position2
        gain: 0,
        rolloff: -12,
        type: "bandpass"
      },
      filterEnvelope: {
        attack: 0.1,
        attackCurve: "linear",
        decay: 0.3,
        decayCurve: "exponential",
        release: 0.5,
        releaseCurve: "exponential",
        sustain: 0,
        baseFrequency: 300,
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
      // console.log(this.loop.interval);
    },1);
    Tone.Transport.start();



    // The Player's Main Channel effects
      this.filter = new Tone.Filter(200, "lowpass", -12)
      this.dist = new Tone.Distortion(0.8);
      this.fdelay = new Tone.FeedbackDelay({
        delayTime: '2n',
        feedback: 0.5});
      this.verb = new Tone.Reverb().connect(this.filter);
      // this.channelfx = new Tone.channel()connect(dac);


      // The Player's EQUAL PANNER OBJ
      this.panner  = new Tone.Panner({pan:0});
      this.lfo = new Tone.LFO(1, -1,1).connect(this.panner.pan).start();

      // The FX CHAIN --> connects player to dac
      this.synth.chain(this.panner, this.filter, dac);
      this.panner.chain(this.fdelay, this.verb, dac);
      this.synth.fan(this.fdelay);
      this.synth.fan(this.verb);


      // console.log(Created synth:  + this.oscid);
    }
    vol(f) {
      // console.log(f)
      this.synth.volume.rampTo(f,0.1);
    }

    pitch(f) {
      // console.log(f);
      this.freq = f;
      this.synth.triggerAttackRelease(f)
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
      this.synth.detune.rampTo(f, 0.1)
    }

    filterf(f) {
      // console.log(f);
      this.filter.frequency.rampTo(f,0.1);
    }

    delaywet(f) {
      this.fdelay.wet.rampTo(f,0.1);
    }

    verbwet(f) {
      // console.log(f);
      this.verb.wet.rampTo(f,0.1);
    }

    selectFilter(f) {
      // console.log(f);
      this.filter.set({
        type:f.value
      }
    )
  }

  selectSource(f) {
    // console.log(f);

    this.synth.oscillator.type = f.value
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
      this.fdelay.delayTime.linearRampTo(Nexus.rf(0.005,1), Nexus.rf(0.1,1));
      this.fdelay.feedback.linearRampTo(Nexus.rf(0.005,1), Nexus.rf(0.1,1));
      this.verb.decay = Nexus.rf(0.1,2);
      this.loop.interval = Nexus.rf(0.005,5);
    }
    else{
      this.fdelay.delayTime.linearRampTo(Nexus.rf(0.01,1),Nexus.rf(0.1,1));
      this.fdelay.feedback.linearRampTo(Nexus.rf(0.01,1),Nexus.rf(0.1,1));
      this.verb.decay = Nexus.rf(0.1,2);
      this.loop.interval = Nexus.rf(0.005,5);
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
