const c            = new Control();
const MAXUSERS     = 1002;
const MAXCHATS     = 10;
const startButton  = document.getElementById('start');
const stopButton   = document.getElementById('stop');
const playerTitle  = document.getElementById('userid');
const playersTitle = document.getElementById('players');
const statusTitle  = document.getElementById('status');
const messages     = document.getElementById('messages');
const chatbox      = document.getElementById('chatbox');
const chat         = document.getElementById('chat');
const userAgent    = window.navigator.userAgent;

var userData       = new Array(MAXUSERS);
var sintes         = new Array(MAXUSERS);
var initialized    = false;

var s;            // the client's osc id
var num_players;  // the number of connected players
var players;      // the array of connected players

var socket;       // the socket
var now;          // Tone.now
var CHORRO = true;
sintes.fill(0);

// -----------------------------------------------------------------------------
//
// UPDATE PLAYERS
//
// -----------------------------------------------------------------------------

function updatePlayers(data) {

  players = data.filter(function(x) { return x !==0 ; });


  for (let i=0; i<players.length; i++) {

      let idx = players[i].oscid;

      // console.log(idx);

      if (sintes[idx]===0) {
        sintes[idx] = new Player(data[i]);
      } else {
        console.log("Player "+idx+" is already ON.");
      }
  };


  num_players = players.length;

  playersTitle.innerHTML= num_players.toString();

};


// -----------------------------------------------------------------------------
//
// CHAT ROUTINES
//
// -----------------------------------------------------------------------------

function addChat(e) {

  let li = document.createElement('li');
  let liapp = messages.appendChild(li);

  if (messages.firstChild) {
    messages.removeChild(messages.firstChild);
  }

  liapp.innerHTML = e;
}

chatbox.addEventListener("submit", function(evt) {

  evt.preventDefault();

  if(socket.connected) {

    socket.emit('chat', chat.value);
    addChat(chat.value);
    chat.value = '';

  }

});

for (i=0;i<MAXCHATS;i++) {
  let li = document.createElement('li');
  let liapp = messages.appendChild(li);
  liapp.innerHTML = '.';
}

// -----------------------------------------------------------------------------
//
// START THE SOCKET
//
// -----------------------------------------------------------------------------

socket = io({
  transports: ['websocket'],
  autoConnect: true
});

// -----------------------------------------------------------------------------
//
// INICIALIZAR LOS CONTROLES
//
// -----------------------------------------------------------------------------
c.onoff.on('change',function(v) {
  if(socket.connected && CHORRO) socket.emit('loopstart', v);
});

c.set.on('change',function(v) {
  if(socket.connected && CHORRO) socket.emit('set', v);
});

c.tilt.on('change',function(v) {
  if(socket.connected && CHORRO) socket.emit('tilt', v);
});

c.delay.on('change',function(v) {
  if(socket.connected && CHORRO) socket.emit('delay', v);
});

c.verb.on('change',function(v) {
  if(socket.connected && CHORRO) socket.emit('verb', v);
});

c.selectF.on('change',function(v) {
  if(socket.connected && CHORRO) socket.emit('selectF', v);
});

c.selectS.on('change',function(v) {
  if(socket.connected && CHORRO) socket.emit('selectS', v);
});

c.position.on('change',function(v) {
  if(socket.connected && CHORRO) socket.emit('position', v);
});

//local
c.slidervol.on('change',function(v) {
  dac.volume.rampTo(v,0.1);
});

// -----------------------------------------------------------------------------
//
// EVENT HANDLING
//
// -----------------------------------------------------------------------------

//
// 1. "connected" message
//

socket.on('connected', function(data) {
    // populate global variables 's' and 'num_players'
    // this user's oscid (from the server)
    s = data[0];
    // the current number of players upon initial connection
    num_players = data[1];
    // display these values on the html interface
    playerTitle.innerHTML = s.toString();
    playersTitle.innerHTML= num_players.toString();
    // display a 'connected' message on the interface
    statusTitle.innerHTML = 'connected';
    console.log("Player #"+s+" of "+num_players+" connected.");
});

//
// 2. "userdata" message
//

socket.on('userdata', function(data) {
    // console.log(data);
    updatePlayers(data);
    userData = data;
});

socket.on('removeuser', function(idx) {
    console.log("Disconnecting: "+ idx);
    if (sintes[idx]!=0) {
      sintes[idx].destroyer();
      sintes[idx] = 0;
    } else {
      console.log("Player "+idx+" is already OFF.");
    }
});
//
// "chat" message
//

socket.on('chat', function(e) {
    addChat(e);
});
//Socket.on recibe los mensajes desde el servidor


socket.on('loopstart', (data) => {

  let i = data[0]; // indice del usuario
  let x = data[1];


  sintes[i].loopstart(x)
  // sintes[data[0]].harm(data[1][1].z)
  // player.synth.frequency.rampTo(x, 0.1);
  // player.synth.modulationIndex.rampTo(y, 0.1);
  // player.frequency = x;
  // console.log(player, x, y);
})

socket.on('set', (data) => {

  let i = data[0]; // indice del usuario
  let x = data[1];
  sintes[i].setrandom(x);

  // sintes[data[0]].harm(data[1][1].z)
  // player.synth.frequency.rampTo(x, 0.1);
  // player.synth.modulationIndex.rampTo(y, 0.1);
  // player.frequency = x;
  // console.log(player, x, y);
})

socket.on('tilt', (data) => {

  let i = data[0]; // indice del usuario
  let x = data[1].x; // no cambiar
  let y = data[1].y; // no cambiar
  let z = data[1].z; // no cambiar
  // console.log(data[1].x);
  // console.log(x);
  // console.log(y);
  // console.log(z);

  sintes[i].pitch(Nexus.scale(x, 0, 1, 200, 5000))
  sintes[i].filterf(Nexus.scale(y, -1, 1.5, 0, 1))
  sintes[i].loop.set({
    interval: Nexus.scale(z, 0, 1, 0.005, 1)
  })

  // sintes[data[0]].harm(data[1][1].z)
  // player.synth.frequency.rampTo(x, 0.1);
  // player.synth.modulationIndex.rampTo(y, 0.1);
  // player.frequency = x;
  // console.log(player, x, y);
});

socket.on('delay', (data) => {

  let i = data[0]; // indice del usuario
  let x = data[1] // no cambiar
  sintes[i].delaywet(x);

  // sintes[data[0]].harm(data[1][1].z)
  // player.synth.frequency.rampTo(x, 0.1);
  // player.synth.modulationIndex.rampTo(y, 0.1);
  // player.frequency = x;
  // console.log(player, x, y);
})

socket.on('verb', (data) => {

  let i = data[0]; // indice del usuario
  let x = data[1];
  // console.log(data);
  sintes[i].verbwet(x);

  // sintes[data[0]].harm(data[1][1].z)
  // player.synth.frequency.rampTo(x, 0.1);
  // player.synth.modulationIndex.rampTo(y, 0.1);
  // player.frequency = x;
  // console.log(player, x, y);
})

socket.on('selectF', (data) => {

  let i = data[0]; // indice del usuario
  let x = data[1];
  sintes[i].selectFilter(x);

  // sintes[data[0]].harm(data[1][1].z)
  // player.synth.frequency.rampTo(x, 0.1);
  // player.synth.modulationIndex.rampTo(y, 0.1);
  // player.frequency = x;
  // console.log(player, x, y);
});

socket.on('selectS', (data) => {
  // console.log(data[1][1].value);

  let i = data[0]; // indice del usuario
  let x = data[1]; // no cambiar
  // console.log(x);

  sintes[i].selectSource(x);

  // sintes[data[0]].harm(data[1][1].z)
  // player.synth.frequency.rampTo(x, 0.1);
  // player.synth.modulationIndex.rampTo(y, 0.1);
  // player.frequency = x;
  // console.log(player, x, y);
});

socket.on('position', (data) => {
  // console.log(data);

  let i = data[0]; // indice del usuario
  let x = data[1].x; // no cambiar
  let y = data[1].y; // no cambiar

  sintes[i].pitch(x)
  sintes[i].filterf(y)
  // sintes[i].envelope(c.position.event.clicked)
  // console.log(c.position);

  // sintes[data[0]].harm(data[1][1].z)
  // player.synth.frequency.rampTo(x, 0.1);
  // player.synth.modulationIndex.rampTo(y, 0.1);
  // player.frequency = x;
  // console.log(player, x, y);
});
// socket.on('trigger', (data) => {
//   console.log(player,v);
// })


// -----------------------------------------------------------------------------
//
// START BUTTON
//
// -----------------------------------------------------------------------------

startButton.onclick = async function () {
  if (!initialized) {
    await Tone.start();
    now = Tone.now();
    console.log("Context started");
    // cuando apreto start, debo inicializar los players
    // prender los sintes de todos
    if (socket.connected) await updatePlayers(userData);
    Tone.Transport.start();
    initialized = true;
    CHORRO = true;
  }
};

// -----------------------------------------------------------------------------
//
// STOP BUTTON
//
// -----------------------------------------------------------------------------

stopButton.onclick = async function ()  {

  if (socket.connected) {
    socket.emit('onoff');
  }

  if (initialized) {

    let a = userData.filter(function(x) { return x !==0 ; });
    for (let i of a) {
      let idx = i.oscid;
      if (sintes[idx] !== 0) {
        sintes[idx].destroyer();
        sintes[idx] = 0;
      }
    }
    Tone.Transport.stop();
    initialized = false;
    CHORRO = false;
  }
};
