const MAXUSERS     = 1002;
const MAXCHATS     = 10;
var userData       = new Array(MAXUSERS);
var sintes         = new Array(MAXUSERS);
var initialized    = false;

var s;            // the client's osc id
var num_players;  // the number of connected players
var players;      // the array of connected players

var socket;       // the socket

var CHORRO = true;
sintes.fill(0);

var colorFront = 'rgb(130, 254, 255)';
var colorBack = 'white';
var chatStatus = false;

// The Destination "DAC"
const dac = new Tone.Channel({
    volume:-Infinity,
  pan: 0,
  channelCount: 2,
});
// si el position esta clickeado o no (para release)
let clicked=false;
