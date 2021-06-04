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