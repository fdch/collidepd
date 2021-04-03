const userAgent = window.navigator.userAgent;
const MAXCHATS = 10;
var deviceIsAndroid;
var canvas, socket, status;
var x, y, z, print=1;
var i, a;
var sx,sy,angle,radius,click;
var playerTitle = document.getElementById('userid');
var statusTitle = document.getElementById('status');
var messages = document.getElementById('messages');
var chatbox = document.getElementById('chatbox');
var chat = document.getElementById('chat');

// using motion or mouse
var usingMotion = false; 
var usingMouse = false; 
var play = false;

let motion = {
  turned: 0,
  moved: 0,
  shaken: 0
};

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

function handleMotionEvent(event) {
  // get the raw accelerometer values (invert if Android)
  if (deviceIsAndroid) {
    accelRange.rawX = -(event.accelerationIncludingGravity.x);
    accelRange.rawY = -(event.accelerationIncludingGravity.y);
    accelRange.rawZ = -(event.accelerationIncludingGravity.z);
  }
  else {
    accelRange.rawX = event.accelerationIncludingGravity.x;
    accelRange.rawY = event.accelerationIncludingGravity.y;
    accelRange.rawZ = event.accelerationIncludingGravity.z;
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
  x  = (accelRange.tempX - accelRange.loX) / accelRange.scaleX;
  y  = (accelRange.tempY - accelRange.loY) / accelRange.scaleY;
  z  = (accelRange.tempZ - accelRange.loZ) / accelRange.scaleZ;
}

function startController() {

  // iOS 13 motion permission
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission()
    .then(permissionState => {
      if (permissionState === 'granted') {
        window.addEventListener("devicemotion", handleMotionEvent, true);
        // window.alert("Using motion.")
        usingMotion = true; // use motion
        usingMouse = false; // use mouse
      
        // send onoff message to server
        if ( socket.connected ) {
          socket.emit('onoff', 1);
        }

        play = true;


      } else {
        // window.alert(permissionState);
        usingMotion = false;
        usingMouse = true; // use mouse

        

        // send onoff message to server
        if ( socket.connected ) {
          socket.emit('onoff', 1);
        }

        play = true;

      }
    })
    .catch(console.error);
  } else {
    
    // beginMotionDetection();

    // window.alert("Using Mouse");
    usingMotion = false;
    usingMouse = true; // use mouse

    // send onoff message to server
    if ( socket.connected ) {
      socket.emit('onoff', 1);
    }

    play = true;
  }


}

function stopController() {

  // stops listening for motion
  if (usingMotion) {
    window.removeEventListener("devicemotion", handleMotionEvent, true);
    usingMotion = false;
  }

  if ( socket.connected ) {
    socket.emit('onoff', 0);
  }

  play = false;

}

function deviceMoved() {
  motion.moved = motion.moved + 5;
  if (motion.moved > 255) {
    motion.moved = 0;
  }
}
function deviceTurned() {
  if (motion.turned === 0) {
    motion.turned = 255;
  } else if (motion.turned === 255) {
    motion.turned = 0;
  }
}
function deviceShaken() {
  motion.shaken = motion.shaken + 5;
  if (motion.shaken > 255) {
    motion.shaken = 0;
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
    if (play) {
     
      // background('rgba(0,255,0, 0.11)');
     
      if (usingMouse) {
        x = map(mouseX, 0, width, 1, 0);
        y = map(mouseY, 0, height, 1, 0);
        z = map(mouseY+mouseX, 0, height, 1, 0);
        // console.log(x,y,z);
      }



      socket.emit('event', {header:'/xyz',values:[x,y,z]});
      
      if (usingMotion) {
        socket.emit('event', {header:'/act',values:
          [
          motion.turned,
          motion.shaken,
          motion.moved
          ]});
      }
      
      col = x * 255;
      num = y * 14;

      hexagon(col,num,i);
    } 
    else { // no play
    
    background(255);
  }
  }
}
