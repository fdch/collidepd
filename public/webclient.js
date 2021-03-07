var canvas, socket, connected=0;
var x, y, z, print=1;
var deviceIsAndroid, deviceShouldSelfCalibrate = 0;

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
  shouldReset: true // if (ToneMotion.deviceShouldSelfCalibrate), must reset thresholds once first
}


// self-calibrating device will call this often at first, then only with extreme motion
function updateAccelRange() {
  accelRange.scaleX = accelRange.hiX - accelRange.loX; // find full range of raw values
  accelRange.scaleY = accelRange.hiY - accelRange.loY;
}

const userAgent = window.navigator.userAgent;

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
  }
  else {
    accelRange.rawX = event.accelerationIncludingGravity.x;
    accelRange.rawY = event.accelerationIncludingGravity.y;
  }
  // calibrate range of values for clamp (only if device is set to self-calibrate)
  if (deviceShouldSelfCalibrate) {
    if (accelRange.shouldReset) { // only true initially
      accelRange.loX = Number.POSITIVE_INFINITY; // anything will be less than this
      accelRange.hiX = Number.NEGATIVE_INFINITY; // anything will be greater than this
      accelRange.loY = Number.POSITIVE_INFINITY;
      accelRange.hiY = Number.NEGATIVE_INFINITY;
      accelRange.shouldReset = false; // only reset once
    }
    if (accelRange.rawX < accelRange.loX) { // new trough
      accelRange.loX = accelRange.rawX;
      updateAccelRange();
    }
    else if (accelRange.rawX > accelRange.hiX) { // new peak
      accelRange.hiX = accelRange.rawX;
      updateAccelRange();
    }
    if (accelRange.rawY < accelRange.loY) {
      accelRange.loY = accelRange.rawY;
      updateAccelRange();
    }
    else if (accelRange.rawY > accelRange.hiY) {
      accelRange.hiY = accelRange.rawY;
      updateAccelRange();
    }
  }
  // clamp: if device does not self-calibrate, default to iOS range (typically -10 to 10)
  if (accelRange.rawX < accelRange.loX) { // thresholds are immutable if ToneMotion.deviceShouldSelfCalibrate == false
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
  // normalize to 0.0 to 1.0
  x  = (accelRange.tempX - accelRange.loX) / accelRange.scaleX; // set properties of ToneMotion object
  y  = (accelRange.tempY - accelRange.loY) / accelRange.scaleY;
}
/*
** TEST IF DEVICE REPORTS MOTION. If not, XY-pad will be added by interface.
*/
// If motion data doesn't change, either the device doesn't report motion or it's perfectly level
var motionCheckIntervId; // interval ID for checking motion detection
var motionCheckDur = 3; // number of seconds before concluding there is no motion detection
var motionCheckInterval = 500; // number of milliseconds between checks
var motionFailCount = (motionCheckDur*1000)/motionCheckInterval;
// Set sensitivity below. Low sensitivity will say device isn't reporting motion if user is holding it fairly flat
var motionCheckSensitivity = 0.01 // motion beyond this threshold shows device is moving
var loThreshold = 0.5 - motionCheckSensitivity; // 0.5 is perfectly level
var hiThreshold = 0.5 + motionCheckSensitivity;


function beginMotionDetection() {
  motionCheckIntervId = setInterval(testForMotion, motionCheckInterval);
}


// closure keeps counter of failed attempts at polling device motion
var testForMotion = (function() {
  var counter = 1; // counter incremented *after* test
  return function() {
    if ( (x > loThreshold && x < hiThreshold) && (y > loThreshold & y < hiThreshold) ) {
      // no motion detected. check if motionFailCount is exceeded and increment counter.
      if (print) { console.log("No device motion detected. motionFailCount: " + counter); }
      if (counter > motionFailCount || status === "deviceDoesNotReportMotion") {
        // Either the device isn't moving or it will not report motion
        // iOS 12.2 requires permission for motion access but does not support permission API so user has to set manually
        // This scenario is pretty awkward because user has to go to settings and change them, then MUST reload page. This only happens on iOS devices from 12.2 up to before 13
        // This also happens on Chrome on laptop because it claims to report device motion but does not actually do it.
        window.alert("Your device is not reporting motion. You may either be on a desktop computer, or this may be a result of your mobile browser settings. If you're on an iPhone, go to Settings > Safari > Motion & Orientation Access and make sure this setting is on. Reload the page to try again, or continue to launch the desktop version.");

        status = "deviceDoesNotReportMotion";
        window.removeEventListener("devicemotion", handleMotionEvent, true); // stops listening for motion
        clearInterval(motionCheckIntervId);
      }
      return counter++;
    }
    else {
      status = "deviceDoesReportMotion";
      counter = 0; // motion detected. reset counter and use in future if letting user test again
      clearInterval(motionCheckIntervId); // stops testing for motion handling
      return counter;
    }
  };
}());


function startController() {

  socket.emit('chat', {header:"hello", values:"world"});
  // testing iOS 13 motion permission
  // Guard against reference erros by checking that DeviceMotionEvent is defined
  if (typeof DeviceMotionEvent !== 'undefined' &&
  typeof DeviceMotionEvent.requestPermission === 'function') {
    // Device requests motion permission (e.g., iOS 13+)
    // delayPlayingUntilPermission = true;
    DeviceMotionEvent.requestPermission()
    .then(permissionState => {
      if (permissionState === 'granted') {
        window.addEventListener("devicemotion", handleMotionEvent, true);
      } else {
        // user has not give permission for motion. Pretend device is laptop
        status = "deviceDoesNotReportMotion";
      }

    })
    .catch(console.error);
  } else {
    // handle non iOS 13+ devices, which could still report motion
    console.log('Not an iOS 13+ device');
    if ('DeviceMotionEvent' in window) {
      console.log('Device claims DeviceMotionEvent in window');
      window.addEventListener("devicemotion", handleMotionEvent, true);
      // But wait! My laptop sometimes says it reports motion but doesn't. Check for that case below.
      beginMotionDetection();
    }
    else {
      status = "deviceDoesNotReportMotion";
    }
  }
}


function startSocket() {
  // establishes a socket.io connection
  socket = io({transports: ['websocket']});
  var checkSocket = setInterval(function() {
    if (socket.connected) {
      connected = 1;
    } 
    else if (socket.disconnected) {
      connected = 0;
    } else {
      connected = -1;
    }}, 1000);
}

let motion = {
  turned: 0,
  moved: 0,
  shaken: 0
};

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
function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  frameRate(30);
}

function draw() {
  col = map(mouseY, 0, height, 255, 0);
  num = map(mouseX, 0, width, 1, 14);
  // console.log(col,num);
  hexagon(col,num,i);

  if (status == "deviceDoesNotReportMotion") {
    x = map(mouseX, 0, height, 1, 0);
    y = map(mouseY, 0, height, 1, 0);
  } else {
    // x = motion.turned;
    // y = motion.shaken;
    // z = motion.moved;
  }

  if (connected==1) {
    socket.emit('event', {header:'/pos',values:[x,y]});
  }

}

var i, a;
var sx,sy,angle,radius,click;

function hexagon(col,num,i) {
  i = frameCount * 0.1;
  translate(width/2,height/2);
  rotate(i);
  angle = TWO_PI / num;

  if (radius < 0) {
   radius = 0;
   noLoop();
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