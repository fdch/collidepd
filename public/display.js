const win = window;
const doc = document;
const docElem = doc.documentElement;
const body = doc.getElementsByTagName('body')[0];
const controls = doc.getElementById('controls');
const startButton = doc.getElementById('start');
const stopButton = doc.getElementById('stop');
const playerTitle = doc.getElementById('userid');
const playersTitle = doc.getElementById('players');
const messages = doc.getElementById('messages');
const chatbox = doc.getElementById('chatbox');
const chatButton = doc.getElementById('show-chat');
const chat = doc.getElementById('chat');
const chatContainer = doc.getElementById('chat-container');
const userAgent = win.navigator.userAgent;
const x = win.innerWidth || docElem.clientWidth || body.clientWidth;
const y = win.innerHeight || docElem.clientHeight || body.clientHeight;
// console.log(x, y);
const orientMessage = `Please LOCK the orientation in PORTRAIT MODE.\n
Then, close this window and refresh the page.\n
Happy playing.`;

var orient = "Browser";
var allowMotion = false;
const pad = 2;
let dw = x - pad * 2;
// clip width to max out at 720 or min at 200
const displayW = dw > 720 ? 720 : dw < 200 ? 200 : dw;
// the top control div in header
const headHeight = 40;
// nexus ui buttons
const nxB = headHeight - pad;
const displayH = y - headHeight * 2 - pad * 2;
const elements = ['header', 'main', 'footer'];

if (typeof window.orientation !== 'undefined') {
    orient = window.orientation;
}

if (orient === "Browser" | orient === 0) {
    console.log("User in Portrait mode or on a Browser");
} else {
    window.alert(orientMessage);
}
// body's margin
body.style.padding = pad * 2 + "px";

for (let e of elements) {
    let t = document.getElementsByTagName(e)[0];
    // reset paddings and margins
    t.style.padding = 0;
    t.style.margin = 0;
    // adjust width
    t.style.width = displayW - pad + "px";
    // adjust height (main is different)
    if (e === 'main') {
        t.style.height = displayH + "px";
    } else {
        t.style.height = headHeight - pad + "px";
    }
}
const ctrlDivs = [
    document.getElementById('contsuperior'),
    document.getElementById('controlsuperior'),
    document.getElementById('contposition'),
    document.getElementById('controlposition'),
    document.getElementById('continferior'),
    document.getElementById('controlinferior')
];

for (let e of ctrlDivs) {
    e.style.position = "relative";
    e.style.width = displayW - pad + "px";
    e.style.marginTop = pad + "px";
}
//top div
ctrlDivs[0].style.height = headHeight * 2 + "px";
ctrlDivs[1].style.height = headHeight * 2 + "px";
//mid div
ctrlDivs[2].style.height = displayW - pad + "px";
ctrlDivs[3].style.height = displayW - pad + "px";
//bottom div
ctrlDivs[4].style.height = headHeight - pad + "px";
ctrlDivs[5].style.height = headHeight - pad + "px";

for (let e of document.getElementsByTagName("input")) {
    e.style.height = headHeight - pad;
}

chatContainer.style.top = headHeight + "px";