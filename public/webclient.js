const c            = new Control();
const MAXUSERS     = 1002;
const MAXCHATS     = 10;
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

var colorFront = 'rgb(130, 254, 255)';
var colorBack = 'white';
var chatStatus = false;



// -----------------------------------------------------------------------------
//
// CHAT ROUTINES
//
// -----------------------------------------------------------------------------

function addChat(data) {
  
  if( data.value !== "" && data.head >= 0 ) {
    if (messages.firstChild) 
      messages.removeChild(messages.firstChild);

    let li = document.createElement('li');
    let liapp = messages.appendChild(li);
    liapp.innerHTML = data.head + ": " + data.value;
  }
 
}

chatbox.addEventListener("submit", function(evt) {

  evt.preventDefault();
  
  if(socket.connected) {
    
    socket.emit('chat', chat.value);
    addChat({head:s,value:chat.value});
    chat.value = '';

  }
  
});

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
// START BUTTON
//
// -----------------------------------------------------------------------------

startButton.onclick = function () {
  if (!initialized) {
    Tone.start();
    now = Tone.now();
    console.log("Context started");
    // cuando apreto start, debo inicializar los players
    // prender los sintes de todos
    if (socket.connected) updatePlayers(userData);
    Tone.Transport.start();
    initialized = true;
    CHORRO = true;
  }

  statusTitle.innerHTML = 'ON';
  body.style.background = "#9bfcf7";
  startButton.style.backgroundColor=colorFront;
  stopButton.style.backgroundColor=colorBack;

};

// -----------------------------------------------------------------------------
//
// STOP BUTTON
//
// -----------------------------------------------------------------------------

stopButton.onclick = function ()  {

  statusTitle.innerHTML = 'OFF';
  body.style.background = "white";

  stopButton.style.backgroundColor=colorFront;
  startButton.style.backgroundColor=colorBack;

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

chatButton.onclick = function () {
  if(chatStatus) {
    chatContainer.style.display='none';
    chatButton.style.backgroundColor=colorBack;
    chatStatus = false;
  } else {
    chatContainer.style.display='block';
    chatButton.style.backgroundColor=colorFront;
    chatStatus = true;
  }
};
