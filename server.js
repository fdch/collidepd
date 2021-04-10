const fs = require('fs');
const url = require('url');
const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const server = http.Server(app);
const io = require('socket.io')(server);
const RTCMultiConnectionServer = require('rtcmulticonnection-server');
const PORT = process.env.PORT || 80;
const MAXUSERS = 1002;
// store everythin here for now:
let verbose = 0, store = 0, mode = 1;
let slots = new Array(MAXUSERS); // slots for the players
let userData = new Array(MAXUSERS); // data for players
let userConf = new Array(MAXUSERS); // user ICE configuration
userData.fill(0); // fill the array with zeros
slots.fill(0);
userConf.fill('empty');
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



var isUseHTTPs = true;

const jsonPath = {
    config: 'config.json',
    logs: 'logs.json'
};

const BASH_COLORS_HELPER = RTCMultiConnectionServer.BASH_COLORS_HELPER;
const getValuesFromConfigJson = RTCMultiConnectionServer.getValuesFromConfigJson;
const getBashParameters = RTCMultiConnectionServer.getBashParameters;
const resolveURL = RTCMultiConnectionServer.resolveURL;

var config = getValuesFromConfigJson(jsonPath);
config = getBashParameters(config, BASH_COLORS_HELPER);

RTCPORT = config.port;

if(isUseHTTPs === false) {
    isUseHTTPs = config.isUseHTTPs;
}

function serverHandler(request, response) {
    // to make sure we always get valid info from json file
    // even if external codes are overriding it
    config = getValuesFromConfigJson(jsonPath);
    config = getBashParameters(config, BASH_COLORS_HELPER);

    // HTTP_GET handling code goes below
    try {
        var uri, filename;

        try {
            if (!config.dirPath || !config.dirPath.length) {
                config.dirPath = null;
            }

            uri = url.parse(request.url).pathname;
            filename = path.join(config.dirPath ? resolveURL(config.dirPath) : process.cwd(), uri);
        } catch (e) {
            pushLogs(config, 'url.parse', e);
        }

        filename = (filename || '').toString();

        if (request.method !== 'GET' || uri.indexOf('..') !== -1) {
            try {
                response.writeHead(401, {
                    'Content-Type': 'text/plain'
                });
                response.write('401 Unauthorized: ' + path.join('/', uri) + '\n');
                response.end();
                return;
            } catch (e) {
                pushLogs(config, '!GET or ..', e);
            }
        }

        if(filename.indexOf(resolveURL('/admin/')) !== -1 && config.enableAdmin !== true) {
            try {
                response.writeHead(401, {
                    'Content-Type': 'text/plain'
                });
                response.write('401 Unauthorized: ' + path.join('/', uri) + '\n');
                response.end();
                return;
            } catch (e) {
                pushLogs(config, '!GET or ..', e);
            }
            return;
        }

        var matched = false;
        ['/demos/', '/dev/', '/dist/', '/socket.io/', '/node_modules/canvas-designer/', '/admin/'].forEach(function(item) {
            if (filename.indexOf(resolveURL(item)) !== -1) {
                matched = true;
            }
        });

        // files from node_modules
        ['RecordRTC.js', 'FileBufferReader.js', 'getStats.js', 'getScreenId.js', 'adapter.js', 'MultiStreamsMixer.js'].forEach(function(item) {
            if (filename.indexOf(resolveURL('/node_modules/')) !== -1 && filename.indexOf(resolveURL(item)) !== -1) {
                matched = true;
            }
        });

        if (filename.search(/.js|.json/g) !== -1 && !matched) {
            try {
                response.writeHead(404, {
                    'Content-Type': 'text/plain'
                });
                response.write('404 Not Found: ' + path.join('/', uri) + '\n');
                response.end();
                return;
            } catch (e) {
                pushLogs(config, '404 Not Found', e);
            }
        }

        ['Video-Broadcasting', 'Screen-Sharing', 'Switch-Cameras'].forEach(function(fname) {
            try {
                if (filename.indexOf(fname + '.html') !== -1) {
                    filename = filename.replace(fname + '.html', fname.toLowerCase() + '.html');
                }
            } catch (e) {
                pushLogs(config, 'forEach', e);
            }
        });

        var stats;

        try {
            stats = fs.lstatSync(filename);

            if (filename.search(/demos/g) === -1 && filename.search(/admin/g) === -1 && stats.isDirectory() && config.homePage === '/demos/index.html') {
                if (response.redirect) {
                    response.redirect('/demos/');
                } else {
                    response.writeHead(301, {
                        'Location': '/demos/'
                    });
                }
                response.end();
                return;
            }
        } catch (e) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404 Not Found: ' + path.join('/', uri) + '\n');
            response.end();
            return;
        }

        try {
            if (fs.statSync(filename).isDirectory()) {
                response.writeHead(404, {
                    'Content-Type': 'text/html'
                });

                if (filename.indexOf(resolveURL('/demos/MultiRTC/')) !== -1) {
                    filename = filename.replace(resolveURL('/demos/MultiRTC/'), '');
                    filename += resolveURL('/demos/MultiRTC/index.html');
                } else if (filename.indexOf(resolveURL('/admin/')) !== -1) {
                    filename = filename.replace(resolveURL('/admin/'), '');
                    filename += resolveURL('/admin/index.html');
                } else if (filename.indexOf(resolveURL('/demos/dashboard/')) !== -1) {
                    filename = filename.replace(resolveURL('/demos/dashboard/'), '');
                    filename += resolveURL('/demos/dashboard/index.html');
                } else if (filename.indexOf(resolveURL('/demos/video-conference/')) !== -1) {
                    filename = filename.replace(resolveURL('/demos/video-conference/'), '');
                    filename += resolveURL('/demos/video-conference/index.html');
                } else if (filename.indexOf(resolveURL('/demos')) !== -1) {
                    filename = filename.replace(resolveURL('/demos/'), '');
                    filename = filename.replace(resolveURL('/demos'), '');
                    filename += resolveURL('/demos/index.html');
                } else {
                    filename += resolveURL(config.homePage);
                }
            }
        } catch (e) {
            pushLogs(config, 'statSync.isDirectory', e);
        }

        var contentType = 'text/plain';
        if (filename.toLowerCase().indexOf('.html') !== -1) {
            contentType = 'text/html';
        }
        if (filename.toLowerCase().indexOf('.css') !== -1) {
            contentType = 'text/css';
        }
        if (filename.toLowerCase().indexOf('.png') !== -1) {
            contentType = 'image/png';
        }

        fs.readFile(filename, 'binary', function(err, file) {
            if (err) {
                response.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                response.write('404 Not Found: ' + path.join('/', uri) + '\n');
                response.end();
                return;
            }

            try {
                file = file.replace('connection.socketURL = \'/\';', 'connection.socketURL = \'' + config.socketURL + '\';');
            } catch (e) {}

            response.writeHead(200, {
                'Content-Type': contentType
            });
            response.write(file, 'binary');
            response.end();
        });
    } catch (e) {
        pushLogs(config, 'Unexpected', e);

        response.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        response.write('404 Not Found: Unexpected error.\n' + e.message + '\n\n' + e.stack);
        response.end();
    }
}

var httpApp;

if (isUseHTTPs) {
    httpServer = require('https');

    // See how to use a valid certificate:
    // https://github.com/muaz-khan/WebRTC-Experiment/issues/62
    var options = {
        key: null,
        cert: null,
        ca: null
    };

    var pfx = false;

    if (!fs.existsSync(config.sslKey)) {
        console.log(BASH_COLORS_HELPER.getRedFG(), 'sslKey:\t ' + config.sslKey + ' does not exist.');
    } else {
        pfx = config.sslKey.indexOf('.pfx') !== -1;
        options.key = fs.readFileSync(config.sslKey);
    }

    if (!fs.existsSync(config.sslCert)) {
        console.log(BASH_COLORS_HELPER.getRedFG(), 'sslCert:\t ' + config.sslCert + ' does not exist.');
    } else {
        options.cert = fs.readFileSync(config.sslCert);
    }

    if (config.sslCabundle) {
        if (!fs.existsSync(config.sslCabundle)) {
            console.log(BASH_COLORS_HELPER.getRedFG(), 'sslCabundle:\t ' + config.sslCabundle + ' does not exist.');
        }

        options.ca = fs.readFileSync(config.sslCabundle);
    }

    if (pfx === true) {
        options = {
            pfx: sslKey
        };
    }

    httpApp = httpServer.createServer(options, serverHandler);
} else {
    httpApp = httpServer.createServer(serverHandler);
}

RTCMultiConnectionServer.beforeHttpListen(httpApp, config);
httpApp = httpApp.listen(process.env.RTCPORT || RTCPORT, process.env.IP || "0.0.0.0", function() {
    RTCMultiConnectionServer.afterHttpListen(httpApp, config);
});



















function getKeys(obj) {
  var x = [];
  Object.keys(obj).forEach(function(key) {
    x.push(key+":"+obj[key]);
  });
  return x;
}

// request the ip
app.get('/req', (req, res) => {
  if (req.baseUrl) res.send("baseUrl: "+req.baseUrl);
  if (req.hostname) res.send("hostname: "+req.hostname);
  if (req.ip) res.send("ip: "+req.ip);
  if (req.ips) res.send("ips: "+req.ips);
  if (req.originalUrl) res.send("originalUrl: "+req.originalUrl);
  if (req.path) res.send("path: "+req.path);
  if (req.protocol) res.send("protocol: "+req.protocol);
  if (req.secure) res.send("secure: "+req.secure);
  if (req.hxr) res.send("xhr: "+req.xhr);
  if (req.route) res.send("route: "+(getKeys(req.route)).join());
  if (req.subdomains) res.send("subdomains: "+req.subdomains.join());
  if (req.query) res.send("query: "+(getKeys(req.query)).join());
  if (req.params) res.send("params: "+(getKeys(req.params)).join());
});


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

  RTCMultiConnectionServer.addSocket(socket);

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

  socket.emit('connected', s); // tell user its id
  let players = slots.filter(x => x==1).length;
  socket.broadcast.emit('users', players + 1)

  socket.on('disconnect', function() {
    userData[s] = 0;
    slots[s] = 0;
    userConf[s] = 'empty';
    console.log("disconnecting ", s);
    socket.emit('disconnected'); // disconnect user oscid from osc
    // socket.broadcast.emit('userdata', userData);
    let players = slots.filter(x => x==1).length;
    socket.broadcast.emit('users', players + 1)
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
  
  socket.on('offer', function(x) {
    userConf[s] = x;
    console.log(userConf[s]);
  })

  socket.on('get_ice', function() {
    socket.emit('ice', userConf[s]);
  })

});

server.listen(PORT, () => console.log(`Listening on ${ PORT }`));