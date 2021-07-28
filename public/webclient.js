// -----------------------------------------------------------------------------
//
// USER CONTROLS
//
// -----------------------------------------------------------------------------

const c = new Control();

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
    if ( orient !== "Browser" ) allowMotion = askForPermission();
    Tone.start();
    Tone.setContext(new Tone.Context({ latencyHint : "balanced" }));
    initialized = true;
  }
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
    chatButton.style.borderWidth = 1 + "px";
    chatButton.style.fontWeight = "normal";
  }
};
let intStatus = 0;
instButton.onclick = function () {
  if(intStatus===0) {
    appMain.style.display='block';
    instDivSp.style.display='none';
    instDiv.style.display='none';
  } else if (intStatus===1) {
    appMain.style.display='none';
    instDivSp.style.display='block';
    instDiv.style.display='none';
  } else if (intStatus===2) {
    appMain.style.display='none';
    instDivSp.style.display='none';
    instDiv.style.display='block';
  } else {
    intStatus=0;
    return;
  }
  intStatus += 1;
};
// -----------------------------------------------------------------------------
//
// CHECK FOR AUDIO CONTEXT INITIALIZATION
//
// -----------------------------------------------------------------------------

let timeout = setInterval(function(){

  if (initialized) {

    console.log("Audio context started!");
    updatePlayers(userData);

    for (let idx in sintes) {
      if (!sintes[idx].initialized && sintes[idx] !== 0) {
        sintes[idx].initialize(dac);
      }
    }
    dac.toDestination();
    CHORRO = true;
    Tone.Transport.start();
    clearInterval(timeout);

  } else {
    // console.log("Waiting for audio context...");
  }

}, 1000);
