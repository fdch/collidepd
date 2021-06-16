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
sintes.fill(0);

// -----------------------------------------------------------------------------
//
// UPDATE PLAYERS
//
// -----------------------------------------------------------------------------

function updatePlayers(data, onoff) {
  players = data.filter(function(x) { return x !==0 ; });    
      // ver cuál player hay que inicializar y cuál no.
        // connectedSintesNew = data.filter(function(x) { return x !==0 ; });
    // console.log(connectedSintes);

    // for (let i=0; i<data.length-1;i++) {
    //   // walk the list and find dis/connection
    //   // there will never be contiguous zeros, 
    //   // so if you find contiguous zeros, break out, you are done
    //   if (data[i] === 0 && data[i+1] === 0) break;
      
    //   if (data[i] === 0) {
    //     sintes[i] = 0;
    //     console.log("Este se desconectó: " + i)
    //     updatePlayers(data, false);
    //   } else if (userData[i].id !== data[i].id) {
    //   // check if value in userData is different from data at same index
    //     // son distintos
    //     console.log("Este se conectó: " + data[i].oscid)
    //     updatePlayers(data, true);
    //   }
    // }
    // habilitar sintes para todos los players
    // caso 1 player:
    //    solamente estoy conectado yo,
    //    habilitar mi sinte solamente
    
    // caso 2 o mas:
    //    para todos los players aparte de mi,
    //    habilitar sus sintes


  // no hacer nada si no Web Audio no está inicializado
  // if (!initialized) return;

  // filtrar los zeros
  // let a = data.filter(function(x) { return x !== 0 ; });
  // para todos los conectados
  for (let i=0; i<data.length-1; i++) {

    if (data[i] === data[i+1]) {
      break;
    } else {
      // buscar el oscid (indice en sintes)
      let idx = data[i].oscid;

      if (onoff) {
        sintes[idx] = new Player(i);
      } else {
        sintes[idx].destroyer();
        sintes[idx] = 0;      
      }

      console.log(sintes[idx].oscid);

    }
  };

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
c.position.on('change',function(v) {
  if(socket.connected) socket.emit('position', [s, v]);
});

c.tilt.on('change',function(v) {
  if(socket.connected) socket.emit('position', [s, v]);
});

c.slider.on('change',function(v) {
  c.dac.volume.rampTo(v,0.1);
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
    updatePlayers(data, true);
});


//
// "chat" message
//

socket.on('chat', function(e) {
    addChat(e);
});

socket.on('position', (data) => {
  // console.log(data);
  sintes[data[0]].pitch(data[1][1].x)
  sintes[data[0]].mod(data[1][1].y)
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
    // prender los intes de todos
    await updatePlayers(userData, true);
    Tone.Transport.start();
    initialized = true;
  }
};

// -----------------------------------------------------------------------------
//
// STOP BUTTON
//
// -----------------------------------------------------------------------------

stopButton.onclick = async function ()  {
  
  // if (socket.connected) {
  //   socket.emit('onoff', 0);
  // }

  if (initialized) {
    
    let a = userData.filter(function(x) { return x !==0 ; });
    for (let i of a) {
      console.log(i.oscid);
      sintes[i.oscid].destroyer();
      // sintes[i.oscid] = 0;
    }
    Tone.Transport.stop();
    initialized = false;
  }
};