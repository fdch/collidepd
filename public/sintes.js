// The Player's main Synth:
class Player {

  constructor(idx) {
    this.oscid = idx;
    this.initialized = false;
    this.freq = Tone.Midi(Nexus.rf(40, 50));

    // The Player's Main Channel effects
    this.filter = new Tone.Filter(200, "lowpass");
    this.filter.set({channelCount:2})
    this.dist = new Tone.Distortion(0.8);
    this.autopanner = new Tone.AutoPanner(1)

    this.fdelay = new Tone.FeedbackDelay({
      delayTime: 0.125,
      feedback: 0.1,
      channelCount:2
    });

    this.verb = new Tone.Reverb({
      channelCount:2
    });
    
    this.lfofilter = new Tone.LFO(10, Nexus.rf(300, 400), Nexus.rf(4500, 5000));
    this.lfofilter.connect(this.filter.frequency);

    //Loop
    this.loop = new Tone.Loop((time) => {
      this.synth.triggerAttackRelease(this.freq, time+Nexus.rf(0.1,1));
    }, 1);
    this.envtime = Nexus.rf(0.01, 1);

    this.synth = new Tone.Synth({
      detune: 0, //cents
      portamento: 0,
      volume: -6,
      envelope: {
        attack: 0.1 * this.envtime,
        attackCurve: "linear",
        decay: 0.3 * this.envtime,
        decayCurve: "exponential",
        release: 0.8 * this.envtime,
        releaseCurve: "exponential",
        sustain: 0
      },
      oscillator: {
        harmonicty: 20,
        modulationType: "sine",
        type: "sine"
      },
    });

  }

  vol(f) {
    this.synth.volume.rampTo(f, 0.1);
  }

  pitch(f, clicked) {
    if (clicked) {
      this.synth.triggerAttack(f);
    } else {
      this.synth.triggerRelease();
    }
    this.freq = f;
  }

  bpm(f) {
    this.loop.interval = f;
  }

  detune(f) {
    this.synth.detune.rampTo(f, 0.1);
  }

  lfopan(f) {
    this.autopanner.frequency.rampTo(Nexus.scale(f, 60, 5000, 1, 5), 0.1);
  }

  filterf(f) {
    this.lfofilter.frequency.rampTo(Nexus.scale(f, 60, 5000, 0.1, 3.4), 1);
  }

  delaywet(f) {
    this.fdelay.wet.rampTo(f, 0.1);
  }

  verbwet(f) {
    this.verb.wet.rampTo(f, 0.1);
  }

  selectFilter(f) {
    this.filter.set({type: filterOptions[f]});
  }

  selectSource(f) {
    this.synth.oscillator.type = options[f];
  }

  loopstart(f) {
    if (f) {
      this.loop.start();
    } else {
      this.loop.stop();
    }
  }

  setrandom(f) {
    if (f) {
      this.fdelay.delayTime.linearRampTo(Nexus.rf(0.05, 0.5), Nexus.rf(0.5, 3));
      this.fdelay.feedback.linearRampTo(Nexus.rf(0.05, 1), Nexus.rf(0.5, 3));
      this.verb.decay = Nexus.rf(2, 10);
      // this.loop.interval = Nexus.rf(0.005, 0.1);
    } else {
      this.fdelay.delayTime.linearRampTo(Nexus.rf(0.05, 0.5), Nexus.rf(0.5, 3));
      this.fdelay.feedback.linearRampTo(Nexus.rf(0.05, 1), Nexus.rf(0.5, 3));
      this.verb.decay = Nexus.rf(2, 10);
      // this.loop.interval = Nexus.rf(0.005, 0.1);
    }
  }

  destroyer() {
    // console.log(Disconnecting synth:  + this.oscid);
    // ramp to -Infinity in 30 seconds, and out.
    this.synth.dispose();
  }

  initialize(dac) {
    // connect the player's to the audio context

    this.filter.connect(dac);
    this.fdelay.connect(dac);
    this.verb.connect(dac);


    // The FX CHAIN --> connects player to dac
    this.filter.fan(this.fdelay);
    this.filter.fan(this.verb);
    this.synth.chain(this.dist, this.autopanner, this.filter);

    this.lfofilter.start();
    this.autopanner.start();
    console.log("Initialized synth: "  + this.oscid);

  }

}
