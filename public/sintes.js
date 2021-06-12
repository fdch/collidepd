var controldiv = document.getElementById('control');
var oscils = []
var numoscil = 2;


for (var i=0; i < numoscil ; i++) {
    
    var wave = 'sawtooth4';


    if( i % 2 == 1) {
        wave = 'triangle';
    }

    var osc1 = new Tone.Oscillator({
                type: wave,
                frequency: 82 * (i+1)  ,
                volume: -Infinity
            }).toDestination();

    oscils[i] = osc1;

}


function startosc1() {
    oscils[0].start();
}

function startosc2() {
    oscils[1].start();
}

function set_vol1(val) {
    document.getElementById('vol1').innerHTML = val;
    oscils[0].volume.rampTo(val, 0.1);
    socket.emit('slider1',val);
}

function set_vol2(val) {
    document.getElementById('vol2').innerHTML = val;
    oscils[1].volume.rampTo(val, 0.1);
    socket.emit('slider2',val);
}

function changePartial1(){
    oscils[0].partials = new Array(8).fill(0).map(() => Math.random());
}

function changePartial2(){
    oscils[1].partials = new Array(8).fill(0).map(() => Math.random());
}

function stoposc1() {
            oscils[0].stop();
        }

function stoposc2() {
            oscils[1].stop();
        }

// Federico Ragessi to Everyone (6:04 PM)

control="#control"

class Player {

    constructor(vol,freq) {
        // x e y es la ubicación del slider en un canvas, 
        // pero no se bien como vamos a hacer eso
        //acá se debe crear un slider linkeado al vol, econtré en p5 este objeto
        // vol = slider.value(//valor de inicio); //Entiendo que esto tiene que estar en un tipo de function Draw
        // this.x = x;
        // this.y = y;
        this.vol = vol;
        this.freq = freq;
        //  Slider

        this.toggle = Nexus.Add.Toggle(control, {
            'size': [40,20],
            'state': false
        });

        this.slider = Nexus.Add.Slider(control,{
            'size': [25, 100],
            'min': 82,
            'max': 5000,
            'step': 10,
            'value': 82
        });

        this.dial = Nexus.Add.Dial(control,{
            'size': [100,100],
            'min': -100,
            'max': -20,
            'value': -100
        });

        //  Sinte
        this.type = "square";

        this.osc = new Tone.Oscillator({
            type: this.type,
            frequency: this.freq,
            volume: this.vol
        }).toDestination();


    }
    destroyer() {
        this.slider.destroy();
        this.dial.destroy();
        this.toggle.destroy();
    }
    
    // change() {
    //     this.slider.on('change',function(v) {
    //         this.osc.frequency.rampTo(v, 0.1);
    //     });

    //     this.dial.on('change',function(v) {
    //         this.osc.volume.rampTo(v, 0.1);
    //     });

    //     this.toggle.on('change', function(v) {
    //         if(v) {
    //             this.osc.start();
    //         } else {
    //             this.osc.stop();
    //         }
    //     });
    // }
}





//Controles;
var volcontrol = new Nexus.Dial('#dial',{
  'size': [50,50],
  'min': -100,
  'max': 0,
  'step': 1,
  'value': -100
});

var position = new Nexus.Position('#dial',{
  'size': [200,200],
  'mode': 'absolute',  // "absolute" or "relative"
  'x': 0.5,  // initial x value
  'minX': 30,
  'maxX': 1000,
  'stepX': 0,
  'y': 0.5,  // initial y value
  'minY': 0.1,
  'maxY': 100,
  'stepY': 0
})

  // var modcontrol = new Nexus.Dial('#dial',{
  //   'min': 0.01,
  //   'max': 100,
  //   'step': 1,
  //   'value': 0
  // });

var button = new Nexus.Toggle('#dial',{
  'size': [80,80],
  'mode': 'aftertouch',
  'state': false
})

var toggle = new Nexus.Toggle('#dial',{
    'size': [40,20],
    'state': false
})

const synth = new Tone.FMSynth({
      modulationIndex: 12,
      envelope: {
                attack: 0.01,
                decay: 0.2
            },
      modulation: {type: "square"},
      modulationEnvelope: {
      attack: 0.2,
      decay: 0.01
    },
    volume: -100
  }).toDestination();

//funciones
button.on('change',fu



