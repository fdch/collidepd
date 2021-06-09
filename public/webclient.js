var players = [];

var Motion = {
  x : 0.5, 
  y : 0.5,
  z : 0.5,
  t : 0.0,
  m : 0.0,
  s : 0.0,
  running : false,
  device : 'undefined'
}

const userAgent = window.navigator.userAgent;
const MAXCHATS = 10;
var deviceIsAndroid;
var canvas, socket, status;

var i, a;
var sx,sy,angle,radius,click;
var startButton = document.getElementById('start');
var stopButton = document.getElementById('stop');
var playerTitle = document.getElementById('userid');
var playersTitle = document.getElementById('players');
var statusTitle = document.getElementById('status');
var messages = document.getElementById('messages');
var chatbox = document.getElementById('chatbox');
var chat = document.getElementById('chat');

// using motion or mouse
var usingMotion = false; 
var usingMouse = false; 
var play = false;


var accelRange = {
  rawX: 0.0, // raw value as reported by device motion
  loX: -10.0, // both axes will probably have same ranges, but you never know ..
  hiX: 10.0,
  scaleX: 20.0,   // total range of raw motion data (divide by this to get output in normalized range)
  tempX: 0.0, // clamped raw value to be scaled
  
  rawY: 0.0,
  loY: -10.0,
  hiY: 10.0,
  scaleY: 20.0,
  tempY: 0.0,
  
  rawZ: 0.0,
  loZ: -10.0,
  hiZ: 10.0,
  scaleZ: 20.0,
  tempZ: 0.0,
  
}


// const gainNode = new Tone.Gain(0).toDestination();
// const oscil = new Tone.Oscillator().connect(gainNode);
// const signal = new Tone.Signal({
//   value: frequency,
//   units: "frequency"
// }).connect(oscil.frequency);


// self-calibrating device will call this often at first, then only with extreme motion
function updateAccelRange() {
  // find full range of raw values
  accelRange.scaleX = accelRange.hiX - accelRange.loX; 
  accelRange.scaleY = accelRange.hiY - accelRange.loY;
  accelRange.scaleZ = accelRange.hiZ - accelRange.loZ;
}

if (userAgent.match(/Android/i)) {
  deviceIsAndroid = true;
}
else {
  deviceIsAndroid = false;
}

function motionEvent(e) {
  // get the raw accelerometer values (invert if Android)
  if (deviceIsAndroid) {
    accelRange.rawX = -(e.accelerationIncludingGravity.x);
    accelRange.rawY = -(e.accelerationIncludingGravity.y);
    accelRange.rawZ = -(e.accelerationIncludingGravity.z);
  }
  else {
    accelRange.rawX = e.accelerationIncludingGravity.x;
    accelRange.rawY = e.accelerationIncludingGravity.y;
    accelRange.rawZ = e.accelerationIncludingGravity.z;
  }
  // clamp to default to iOS range (typically -10 to 10)
  if (accelRange.rawX < accelRange.loX) { 
    accelRange.tempX = accelRange.loX;
  }
  else if (accelRange.rawX > accelRange.hiX) {
    accelRange.tempX = accelRange.hiX;
  }
  else {
    accelRange.tempX = accelRange.rawX;
  }

  if (accelRange.rawY < accelRange.loY) {
    accelRange.tempY = accelRange.loY;
  }
  else if (accelRange.rawY > accelRange.hiY) {
    accelRange.tempY = accelRange.hiY;
  }
  else {
    accelRange.tempY = accelRange.rawY;
  }

  if (accelRange.rawZ < accelRange.loZ) {
    accelRange.tempZ = accelRange.loZ;
  }
  else if (accelRange.rawZ > accelRange.hiZ) {
    accelRange.tempZ = accelRange.hiZ;
  }
  else {
    accelRange.tempZ = accelRange.rawZ;
  }

  // normalize to 0.0 to 1.0
  Motion.x  = (accelRange.tempX - accelRange.loX) / accelRange.scaleX;
  Motion.y  = (accelRange.tempY - accelRange.loY) / accelRange.scaleY;
  Motion.z  = (accelRange.tempZ - accelRange.loZ) / accelRange.scaleZ;
}

startButton.onclick = function () {
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
  // iOS 13+
  DeviceMotionEvent.requestPermission()
  .then(response => {
    if (response == 'granted') {
      Motion.device = 'controller';
      window.addEventListener('devicemotion', motionEvent);
    }
  })
  .catch(console.error)
  } else {
    // non iOS 13+
    if ('DeviceMotionEvent' in window) {
      Motion.device = 'controller';
      window.addEventListener('devicemotion', motionEvent); 
    } else {
      Motion.device = 'mouse';
    }
  }
  if ( socket.connected ) {
    socket.emit('onoff', 1);
  }
  Motion.device = 'mouse';

  Motion.running = true;
  Tone.start();
  initPlayer(0);
  // initPlayer(1);

  // startosc1();
  // startosc2();
}

function initPlayer(i) {

  var player = new Player(-100,80);
  var p;
  if (i>=0) {
    p = players[i];
    p = player;
  } else {
    players.push(player);
    p = players[players.length];
  }

  p.slider.on('change',function(v) {
      p.osc.frequency.rampTo(v, 0.1);
      socket.emit('slider'+(i+1),v);
  });

  p.dial.on('change',function(v) {
      p.osc.volume.rampTo(v, 0.1);
  });

  p.toggle.on('change', function(v) {
      if(v) {
          p.osc.start();
      } else {
          p.osc.stop();
      }
  });
}

function deinitPlayer(i) {
  players[i].destroyer();
}


stopButton.onclick = function ()  {
  
  Motion.running = false;

  if ( socket.connected ) {
    socket.emit('onoff', 0);
  }
  // stops listening for motion

  if (Motion.device === 'controller') {
    window.removeEventListener("devicemotion", motionEvent);
  }
  deinitPlayer(0);
  // stoposc1();
  // stoposc2();
}

function deviceTurned() {
  if (Motion.t == 0) {
    Motion.t = 127;
  } else if (Motion.t == 127) {
    Motion.t = 0;
  }
}
function deviceShaken() {
  Motion.s += 1;
  if (Motion.s > 128) {
    Motion.s = 0;
  }
}
function deviceMoved() {
  Motion.m += 1;
  if (Motion.m > 128) {
    Motion.m = 0;
  }
}

function hexagon(col,num,i) {
  i = frameCount * 0.1;
  translate(width/2,height/2);
  rotate(i);
  angle = TWO_PI / num;

  if (radius < 0) {
   //reset radius
   clear();
   radius = height/2;

   // radius = 0;
   // noLoop();
  } else { 
   radius = height/2 - i;
  }

  fill(col);

  beginShape();
  for (a = 0; a < TWO_PI; a += angle) {
   sx = cos(a) * radius + (Math.random()*2);
   sy = sin(a) * radius + (Math.random()*2);
   vertex(sx, sy);
  }

 endShape(CLOSE);
}

function addChat(e) {
  if (messages.firstChild) 
        messages.removeChild(messages.firstChild);
  let li = document.createElement('li');
  let liapp = messages.appendChild(li);
  liapp.innerHTML = e;
}



function setup() {

  canvas = createCanvas(windowWidth, windowHeight);
  // const synth = new Tone.Synth().toDestination();

  

  frameRate(30);

  socket = io({
    transports: ['websocket'],
    autoConnect: true
  });

  socket.on('connected', function(data) {
      playerTitle.innerHTML = data[0].toString();
      playersTitle.innerHTML= data[1].toString();
      statusTitle.innerHTML = 'connected';
      
  });
  
  socket.on('disconnected', function() {
      playerTitle.innerHTML = -1;
      statusTitle.innerHTML = 'disconnected';
  });

  socket.on('users', function(s) {
      playersTitle.innerHTML = s.toString();
  });
  
  socket.on('sliders', (data) => {
    // console.log(data.length);
    for(var i=0;i<data.length;i++){
      // players[i].slider.value = data[i];
      // players[i].dial.value = data[i];
      // players[i].toggle.value = data[i];
      players[i].osc.volume.rampTo(data[i],0.1);
      // oscils[i].volume.rampTo(data[i],0.1);
    }
    // console.log(data);
    // oscils[0].volume.value = val;
    // set_vol1(data.value[0]);
    // set_vol2(data.value[1]);
  });

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

  socket.on('chat', function(e) {
      addChat(e);
  });

}
let k=0,t=0,m=0;
function loadingDots(w,h) {
  background(255);
  translate(w/2,h/2);
  noStroke();
  fill(0);
  ellipse(100*sin(radians(k)),0,20*cos(radians(m)),20*cos(radians(m)));
  ellipse(100*sin(radians(k)+PI/3),0,20*cos(radians(m)+PI/3),20*cos(radians(m)+PI/3));
  ellipse(100*sin(radians(k)+PI/6),0,20*cos(radians(m)+PI/6),20*cos(radians(m)+PI/6));
  if(k<360) {
    k+=4;
    if(180<k) {
      if(m<360) {
        m+=8;
      } else m = 0;
    }
  } else {
    k=0;
    m=0;
  }
}

// if (players.length >= 1) {
//   for (var player of players) {
//     player.
//   }
// }


function draw() {



  if (socket.connected) {

    

    if (Motion.running) {

      if(players.length>=1) socket.emit('poll');
     
      // background('rgba(0,255,0, 0.11)');
     
      if (Motion.device === 'mouse') {
        Motion.x = map(mouseX, 0, width, 1, 0);
        Motion.y = map(mouseY, 0, height, 1, 0);
        Motion.z = map(mouseY+mouseX, 0, height, 1, 0);
        socket.emit('event', {
          header:'/xyz',
          values: [ Motion.x, Motion.y, Motion.z ]
        });
        // let frequency = Motion.x * 500 + 100;
        

        
        // gainNode.gain.rampTo(Motion.y, 0.1);
        // console.log(x,y,z);
      }


      
      if (Motion.device === 'controller') {
        socket.emit('event', {
          header:'/xyz',
          values: [ Motion.x, Motion.y, Motion.z ]
        });
        socket.emit('event', {
          header:'/act',
          values: [ Motion.t, Motion.s, Motion.m]
        });
        // signal.value = Motion.x * 500 + 100;
        // gainNode.gain.rampTo(Motion.y, 0.1);

      }
      
      // draw a hexagon
      col = Motion.x * 255;
      num = Motion.y * 14;

      hexagon(col, num, i);
    } 
    else { // not playing
    // background(255);
     loadingDots(width, height);
    }
  } else { // socket disconnected

  }
}
