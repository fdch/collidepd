control  = "#control";
initfreq = 30;

dac = new Tone.Channel({
    volume:-100, 
    pan:0, 
    channelCount:2
}).toDestination();


class Control {

    constructor() {

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
          'x': 0.5,  // initial x value
          'minX': 30,
          'maxX': 100,
          'stepX': 1,
          'y': 0.5,  // initial y value
          'minY': 1,
          'maxY': 24,
          'stepY': 1
        });

        this.tilt = new Nexus.Add.Tilt(control,{
            'size': [200,200]
        });
        this.tilt.active=false;

        // create a meter on the destination node
        this.meter = new Nexus.Add.Meter(control).connect(dac);


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

        
        // The Player's UserData (from the server)
        this.oscid = ud.oscid;
        this.id    = ud.id;
        this.name  = ud.name;
        this.time  = ud.time;

        this.rampt   = 0.1;
        this.freq    = Tone.Midi(Nexus.rf(40,50));
        // The Player's main Synth:
        this.synth = new Tone.MetalSynth({
            frequency: this.freq, // Hz
            detune: 0, //cents
            envelope: {
                attack   : 0.1,
                decay    : 0.4,
                release  : 0.5,
                sustain  : 0
            },
            harmonicity: 0, // positive
            modulationIndex: Nexus.rf(0,12), // Hz
            octaves: 1,
            portamento: 0, //sec
            resonance: Nexus.rf(82,100), // Hz or MIDI
            volume: 0,
        });
        
        
        // this.f = 

        this.loop = new Tone.Loop((time) => {
          // channel.pan.rampTo(Nexus.rf(-1,1), vel * 0.1);
            // vel = Nexus.rf(0.1, 1);
            // console.log(vel);
            this.synth.triggerAttackRelease(this.freq);
        }, "4n").start(0);


        // The Player's FEEDBACK DELAY
        this.fdelay  = new Tone.FeedbackDelay("8n", 0.5);

        // The Player's Main Channel
        this.channel = new Tone.Channel();
        
        // The Player's EQUAL PANNER OBJ
        this.panner  = new Tone.Panner({pan:Nexus.rf(-1,1)});
        this.lfo = new Tone.LFO(20, -1,1).connect(this.panner.pan).start();
        
        // The FX CHAIN --> connects player to dac
        this.synth.chain(this.fdelay, this.channel, this.panner, dac);
        
        console.log("Created synth: " + this.oscid);
    }
    pitch(f) {
        this.freq = Tone.Midi(f);
        this.synth.frequency.rampTo(this.freq / 2, this.rampt);
        this.synth.resonance = this.freq / 2;
    }
    harmonicity(f) {
        this.synth.harmonicity = f;
    }
    mod(f) {
        this.synth.modulationIndex = f;
    }
    vol(f) {
        // console.log(f)
        this.synth.volume.rampTo(f,this.rampt);
    }
    destroyer() {
        console.log("Disconnecting synth: " + this.oscid);
        // ramp to -Infinity in 30 seconds, and out.
        this.synth.dispose();
    }
}