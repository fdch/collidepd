//==============================================================================
//------------------------------------------------------------------------------
// Code for the CollidePd server
//------------------------------------------------------------------------------
//==============================================================================
// 
//   CollidePd is a Networked Music Performance plaform
// 
//   Authors:
//       Fede Camara Halac (ffddcchh) 
//       Fede Ragessi (ffrm)
//
//==============================================================================

const express  = require('express');
const app      = express();
const path     = require('path');
const http     = require('http');
const server   = http.Server(app);
const io       = require('socket.io')(server);
const PORT     = process.env.PORT || 80;

//
// cantidad máxima de usuarios
//
const MAXUSERS = 1002;

//
// GLOBAL - data de cada usuario - fill the array with zeros
//
let userData = new Array(MAXUSERS); 
userData.fill(0); 

//
// SERVE THE HOMEPAGE
//
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// =============================================================================
// -----------------------------------------------------------------------------
//  OPEN SOCKETS: BEGIN LISTENING FOR CLIENT CONNECTIONS
// -----------------------------------------------------------------------------
// =============================================================================
io.sockets.on('connection', function(socket) {

  // ---------------------------------------------------------------------   
  // INITIALIZE
  // ---------------------------------------------------------------------   

  //
  // 0. look for an empty slot on the GLOBAL "userData" array
  // buscar el primer lugar vacio en 'userData'
  // 

  var s = userData.findIndex( (e) => e === 0 );
  
  userData[s] = { 
    id: socket.id,
    oscid: s,
    name: '',
    time: new Date().getTime()
  };

  //
  // 1. tell this user its id and num of players 
  // oscid y cantidad de players
  //
  
  let players = userData.filter(x => x!==0).length;
  socket.emit('connected', [s, players]);

  //
  // 2. emit to all users the userData array
  // (info de los usuaris conectados al momento)
  // enviando a todos los clientes toda la userdata actual
  //
  
  io.sockets.emit('userdata', userData); 

  //
  // 3. reportar conexion en la consola del servidor
  //

  console.log("slot:%d -- %s", s, socket.id);

  // ---------------------------------------------------------------------  
  // ---------------------------------------------------------------------  
  // EVENT HANDLING
  // ---------------------------------------------------------------------  
  // ---------------------------------------------------------------------  

  //
  // handle "disconnection"
  //

  socket.on('disconnect', function() {
    
    // report to server console
    console.log("disconnecting ", s);

    // Free our slot in the userdata array
    userData[s] = 0;

    // Broadcast the new userData array
    socket.broadcast.emit('onoff', s); 
    
  });

  //
  // "name" change
  //

  socket.on('name',function(x) {
    userData[s].name = x;
    socket.broadcast.emit('notify', x + " joined.")
  });

  //
  // "userdata" array polling
  //
  
  socket.on('userdata', function() {
    // send userData to requester
    socket.emit('userdata', userData);
  })

  //
  // handle "chat"
  //
  
  socket.on('chat', function(data) {
    // broadcast the chat message as-is
    socket.broadcast.emit('chat',data); 
  });

  //
  // "event" event handling
  //
  
  socket.on('event', function(data) {
    const event = {
      head: data.header,
      value: data.values,
      time: new Date().getTime(),
      id: s
    }
    // emit the event to all clients
    io.sockets.emit('event', event); 
  });

  //
  // "onoff" message
  //
  
  socket.on('onoff', function() {
    socket.broadcast.emit('onoff', s); 
  });

  //
  // "position" message
  //

  socket.on('position', function(data) {
    io.sockets.emit('position', [s, data]);
  })

});// end io.sockets.on
// =============================================================================
// -----------------------------------------------------------------------------
//  START LISTENING
// -----------------------------------------------------------------------------
// =============================================================================
server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
// =============================================================================