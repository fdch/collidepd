var Motion = {
  x : 0.5, 
  y : 0.5,
  z : 0.5,
  t : 0.0,
  m : 0.0,
  s : 0.0,
  status : 'undefined'
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
      Motion.status = 'device';
      window.addEventListener('devicemotion', motionEvent);
    }
    if ( socket.connected ) {
      socket.emit('onoff', 1);
    }
  })
  .catch(console.error)
  } else {
    // non iOS 13+
    if ( socket.connected ) {
      socket.emit('onoff', 1);
    }
    Motion.status = 'mouse';
  }
}


stopButton.onclick = function ()  {

  if ( socket.connected ) {
    socket.emit('onoff', 0);
  }

  // stops listening for motion

  if (Motion.status === 'device') {
    window.removeEventListener("devicemotion", motionEvent);
    Mostion.status = 'undefined';
  }


}

function deviceMoved() {
  Motion.m += 5;
  if (Motion.m > 255) {
    Motion.m = 0;
  }
}
function deviceTurned() {
  if (Motion.t == 0) {
    Motion.t = 255;
  } else if (Motion.t == 255) {
    Motion.t = 0;
  }
}
function deviceShaken() {
  Motion.s += 5;
  if (Motion.s > 255) {
    Motion.s = 0;
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

  frameRate(30);

  socket = io({
    transports: ['websocket'],
    autoConnect: true
  });

  socket.on('connected', function(s) {
      playerTitle.innerHTML = s.toString();
      statusTitle.innerHTML = 'connected'
  });
  
  socket.on('disconnected', function() {
      playerTitle.innerHTML = -1;
      statusTitle.innerHTML = 'disconnected'
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

function draw() {
  if (socket.connected) {
    if (Motion.status !== 'undefined') {
     
      // background('rgba(0,255,0, 0.11)');
     
      if (Motion.status === 'mouse') {
        Motion.x = map(mouseX, 0, width, 1, 0);
        Motion.y = map(mouseY, 0, height, 1, 0);
        Motion.z = map(mouseY+mouseX, 0, height, 1, 0);
        // console.log(x,y,z);
      }

      socket.emit('event', {
        header:'/xyz',
        values: [ Motion.x, Motion.y, Motion.z ]
      });
      
      if (Motion.status === 'device') {
        socket.emit('event', {
          header:'/act',
          values: [ Motion.t, Motion.s, Motion.m]
        });
      }
      
      col = Motion.x * 255;
      num = Motion.y * 14;

      hexagon(col, num, i);
    } 
    else { // no play
    
    background(255);
  }
  }
}
