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
// cantidad máxima de chats (10)
//
const chatHist = new Array(10);
chatHist.fill({head:1002,value:""});
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

  if (s >= 0) {
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

    socket.emit('chathist', chatHist);

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
      socket.broadcast.emit('removeuser', s);

      // Broadcast the new userData array
      socket.broadcast.emit('userdata', userData);

    });

    //
    // "name" change
    //

    socket.on('name',function(x) {
      userData[s].name = x;
      socket.broadcast.emit('notify', x + " joined.");
    });

    //
    // "userdata" array polling
    //

    socket.on('userdata', function() {
      // send userData to requester
      socket.emit('userdata', userData);
    });

    //
    // handle "chat"
    //

    socket.on('chat', function(data) {
      const chat = {
        head: s,
        value: data
      };
      chatHist.shift();
      chatHist.push(chat);
      // broadcast the last chat message
      socket.broadcast.emit('chat', chat);
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
      };
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
    // canales de mensajes
    //
    //Loop Start
    socket.on('loopstart', function(data) {
      io.sockets.emit('loopstart', [s, data]);
    });
    //Set?
    socket.on('set', function(data) {
      io.sockets.emit('set', [s, data]);
    });
    //Tilt
    socket.on('tilt', function(data) {
      io.sockets.emit('tilt', [s, data]);
    });
    //Wet Delay
    socket.on('delay', function(data) {
      io.sockets.emit('delay', [s, data]);
    });
    //Wet Reverb
    socket.on('verb', function(data) {
      io.sockets.emit('verb', [s, data]);
      console.log(data);
    });
    //Selector de Filtro
    socket.on('selectF', function(data) {
      io.sockets.emit('selectF', [s, data]);
    });
    //Selector de Fuente
    socket.on('selectS', function(data) {
      io.sockets.emit('selectS', [s, data]);
    });
    //Position
    socket.on('position', function(data) {
      io.sockets.emit('position', [s, data]);
    });
  } else {
    // TODO: if s is undefined, tell user to wait
    socket.emit("waiting");
    // for (infinito) {
    //   proba si hay lugar,
    //   si hay lugar,
    //   anda a la funcion de arriba
    // }
  }



});// end io.sockets.on
// =============================================================================
// -----------------------------------------------------------------------------
//  START LISTENING
// -----------------------------------------------------------------------------
// =============================================================================
server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
// =============================================================================