// this code is adapted from Ryan Carter's suboptimal:
// https://ryancarter.org/suboptimal

// testing iOS 13 motion permission
function askForPermission() {
    let p = false;
    // window.alert("Asking for permissions");
    // Guard against reference erros by checking that DeviceMotionEvent is defined
    if (typeof DeviceMotionEvent !== 'undefined' &&
    typeof DeviceMotionEvent.requestPermission === 'function') {
        // Device requests motion permission (e.g., iOS 13+)
        // delayPlayingUntilPermission = true;
        DeviceMotionEvent.requestPermission()
        .then(permissionState => {
        if (permissionState === 'granted') {
            p = true;
        } else {
            // user has not give permission for motion. Pretend device is laptop
            p = false;
        }
        // NOW we can play sound
        // Tone.Transport.start(ToneMotion.delayBeforePlaying);
            return p;
        })
        .catch(console.error);
    } else {
        // handle non iOS 13+ devices, which could still report motion
        console.log('Not an iOS 13+ device');
        if ('DeviceMotionEvent' in window) {
        // console.log('Device claims DeviceMotionEvent in window');
        // window.addEventListener("devicemotion", handleMotionEvent, true);
        // But wait! My laptop sometimes says it reports motion but doesn't. Check for that case below.
        // beginMotionDetection();
            p = true;
        }
        else {
        // ToneMotion.status = "deviceDoesNotReportMotion";
            p = false;
        }
        return p;
    }
}