const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const server = http.Server(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 80;
const MAXUSERS = 1002;

// store everythin here for now:
let verbose = 0, store = 0, mode = 1;
let slots = new Array(MAXUSERS); // slots for the players
let userData = new Array(MAXUSERS); // data for players
let sliders = new Array(2); // data for players

userData.fill(0); // fill the array with zeros
slots.fill(0);
sliders.fill(0);

/* 
 * 
 * HTTP routines
 * 
 */
app.use(express.static(path.join(__dirname, 'public')));

// serve the homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// function getKeys(obj) {
//   var x = [];
//   Object.keys(obj).forEach(function(key) {
//     x.push(key+":"+obj[key]);
//   });
//   return x;
// }

// // request the ip
// app.get('/req', (req, res) => {
//   if (req.baseUrl) res.send("baseUrl: "+req.baseUrl);
//   if (req.hostname) res.send("hostname: "+req.hostname);
//   if (req.ip) res.send("ip: "+req.ip);
//   if (req.ips) res.send("ips: "+req.ips);
//   if (req.originalUrl) res.send("originalUrl: "+req.originalUrl);
//   if (req.path) res.send("path: "+req.path);
//   if (req.protocol) res.send("protocol: "+req.protocol);
//   if (req.secure) res.send("secure: "+req.secure);
//   if (req.hxr) res.send("xhr: "+req.xhr);
//   if (req.route) res.send("route: "+(getKeys(req.route)).join());
//   if (req.subdomains) res.send("subdomains: "+req.subdomains.join());
//   if (req.query) res.send("query: "+(getKeys(req.query)).join());
//   if (req.params) res.send("params: "+(getKeys(req.params)).join());
// });


/* 
 * 
 * Helper routines
 * 
 */
function getObjectReference(arr, key, val) {
  /* 
   * returns an array of two elements with 
   *  - the reference to an entry inside the array of objects 'arr'
   *  - the index to the array (arr) of objects
   * where 'key' matches with value 'val'
   * 
   */
  var i=0, entry;
  for (var i=0; i<arr.length; i++) {
    if (!arr[i][key].localeCompare(val)) {
      // get the entry that matches our id
      entry = arr[i];
      break;
    }
  }
  if (entry) {
    return [ entry, i ];
  }
  else {
    console.error(arr, "Could not find reference.");
  }
}
function getUsername(u) {
  /*
   * returns a string with the user name 
   * if user.data.name does not exist, the user.id is appended instead
   * 
   * NOTE:
   * u must be a dict with the form
   *    user.id
   *    user.data
   *    user.data.name
   * 
   */
  if ( u.data.hasOwnProperty('name') && u.data.name) {
    return u.data.name;
  } else {
    return u.id;
  }
}
function getUserList(arr) {
  /* 
   * returns a string with all usernames or user id 
   * that exist within userData (the input array)
   * 
   */
  var userlist=[];
  for (var i=0; i<arr.length; i++) userlist.push(getUsername(arr[i]));
  return userlist.join(" ");
}
function broadcast(socket,head,...data) {
	if (mode == 0) {

		socket.emit(head,data); 

	} else {
	
		socket.broadcast.emit(head,data); 
  	
  }
  if (verbose)  {
  	console.log("%s: %j",head,data);
  }
}
function updateDict(socket,userData,prop,header,values,f) {
    const newStuff = {
      head: header,
      value: values,
      time: new Date().getTime(),
      id: socket.id
    }
    // broadcasts a prop to all clients
    broadcast(socket, prop, newStuff);

    if (store || f) { // override store flag
      // if there is none, push a prop property to the object
      if (!userData.hasOwnProperty(prop)) userData.prop = [];

      userData[prop].push(newStuff);
    }
}
/*
 *
 *
 *  Begin listening for client connections
 *
 *
 */
io.sockets.on('connection', function(socket) {

  var u;

  // look for an empty slot:
  var s = slots.findIndex( (e) => e === 0 );
  slots[s] = 1;
  
  console.log("slot:%d -- %s", s, socket.id);

  const ud = { 
    id: socket.id,
    oscid: s,
    name: '',
    time: new Date().getTime()
  };

  userData[s] = ud;

  // tell user its id and num of players
  let players = slots.filter(x => x==1).length;
  
  socket.emit('connected', [s, players]); 
  
  socket.broadcast.emit('users', players)

  socket.on('disconnect', function() {
    userData[s] = 0;
    slots[s] = 0;

    console.log("disconnecting ", s);
    socket.emit('disconnected'); // disconnect user oscid from osc
    // socket.broadcast.emit('userdata', userData);
    let players = slots.filter(x => x==1).length;
    socket.broadcast.emit('users', players)
  });

  socket.on('name',function(x) {
    userData[s].name = x;
    socket.broadcast.emit('notify', x + " joined.")
  });
  
  socket.on('userdata', function() {
    // send user data to requester
    socket.emit('userdata', userData);
  })

  socket.on('chat', function(data) {
    socket.broadcast.emit('chat',data); 
  });
  
  socket.on('event', function(data) {
    const newStuff = {
      head: data.header,
      value: data.values,
      time: new Date().getTime(),
      id: s
    }
    // broadcasts the event to all clients
    socket.broadcast.emit('event',newStuff); 
  });

  socket.on('onoff', function(x) {
    socket.broadcast.emit('onoff',s,x); 
  });

  socket.on('slider1', function(x) {
    sliders[0] = x;
    // socket.broadcast.emit('onoff',s,x); 
  });
  socket.on('slider2', function(x) {
    sliders[1] = x;
    // socket.broadcast.emit('onoff',s,x); 
  });
  socket.on('poll', function() {
    socket.emit('sliders',sliders); 
  });


});

server.listen(PORT, () => console.log(`Listening on ${ PORT }`));