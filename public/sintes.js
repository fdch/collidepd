control  = "#control";
initfreq = 30;

class Control {

    constructor() {

        // this.panner = new Tone.Panner(0).toDestination()
        this.dac = new Tone.PanVol(0,-Infinity).toDestination();
        this.bus = new Tone.Channel().connect(this.dac);

        this.slider = Nexus.Add.Slider(control,{
            'size': [50, 100],
            'min': -100,
            'max': 0,
            'step': 1,
            'value': -100
        });

        this.position = new Nexus.Add.Position(control,{
          'size': [200,200],
          'mode': 'absolute',  // "absolute" or "relative"
          'x': initfreq,    // initial x value
          'minX': initfreq,
          'maxX': 1000,
          'stepX': 0.4,
          'y': 10,    // initial y value
          'minY': 0.1,
          'maxY': 100,
          'stepY': 0.4
        });

        this.tilt = new Nexus.Add.Tilt(control,{
            'size': [200,200]
        });
        this.tilt.active=false;
        // create a meter on the destination node
        this.meter = new Nexus.Add.Meter(control).connect(this.dac);
    }
    destroyer() {
        this.slider.destroy();
        this.position.destroy();
        this.tilt.destroy();
        this.meter.destroy();
    }
}

class Player {
    //
    // player receives a singlge userdata object (not the array userData)
    //
    constructor(ud) {
        this.pan = Nexus.rf(-0.5,0.5);
        this.panner  = new Tone.Panner(this.pan).toDestination();
        this.channel = new Tone.Channel().connect(this.panner);
        this.rampt = 0.1;
        this.oscid = ud.oscid;
        this.id    = ud.id;
        this.name  = ud.name;
        this.time  = ud.time;
        this.m     = Nexus.rf(0,12);
        this.f     = Nexus.rf(82,100);
        this.v     = 0;
        this.amp_env = [0.1, 0.4, 0.5];
        this.mod_env = [0.2, 0.4, 0.4];
        this.synth = new Tone.FMSynth({
            frequency: this.f,
            modulationIndex: this.m,
            envelope: {
                attack   : this.rampt * this.amp_env[0],
                decay    : this.rampt * this.amp_env[1],
                release  : this.rampt * this.amp_env[2],
                sustain  : 0
            },
            modulation: {
                  type: "square"
            },
            modulationEnvelope: {
            attack  : this.rampt * this.mod_env[0],
            decay   : this.rampt * this.mod_env[1],
            release : this.rampt * this.mod_env[2],
            sustain : 0
            },
            volume: this.v,
        }).connect(this.channel);
        
        this.loop = new Tone.Loop((time) => {
          // this.synth.envelope.attack            = Nexus.rf(0.01,this.rampt);
          // this.synth.envelope.decay             = Nexus.rf(0.01,this.rampt);
          // this.synth.envelope.release           = Nexus.rf(0.01,this.rampt);
          // this.synth.modulationEnvelope.attack  = Nexus.rf(0.01,this.rampt);
          // this.synth.modulationEnvelope.decay   = Nexus.rf(0.01,this.rampt);
          // this.synth.modulationEnvelope.release = Nexus.rf(0.01,this.rampt);
          this.panner.pan.rampTo(Nexus.rf(-1,1),this.rampt*0.5);
          this.synth.triggerAttackRelease(this.f);
        }, this.rampt * 1.1).start(0);

        console.log("Created synth: " + this.oscid);
    }

    pitch(f) {
        this.f = f;
        this.synth.frequency.rampTo(this.f,this.rampt);
    }
    mod(m) {
        this.m = m;
        this.synth.modulationIndex.rampTo(this.m,this.rampt);
    }
    vol(v) {
        this.v = v;
        this.synth.volume.rampTo(this.v,this.rampt);
    }
    destroyer() {
        console.log("Disconnecting synth: " + this.oscid);
        this.synth.dispose();
    }
}