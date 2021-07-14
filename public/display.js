
const startButton  = document.getElementById('start');
const stopButton   = document.getElementById('stop');
const playerTitle  = document.getElementById('userid');
const playersTitle = document.getElementById('players');
const statusTitle  = document.getElementById('status');
const messages     = document.getElementById('messages');
const chatbox      = document.getElementById('chatbox');
const chatButton   = document.getElementById('show-chat');
const chat         = document.getElementById('chat');
const chatContainer= document.getElementById('chat-container');
const userAgent    = window.navigator.userAgent;

var win = window,
    doc = document,
    docElem = doc.documentElement,
    body = doc.getElementsByTagName('body')[0],
    x = win.innerWidth || docElem.clientWidth || body.clientWidth,
    y = win.innerHeight|| docElem.clientHeight|| body.clientHeight;

var orient = "Browser";

if (typeof window.orientation !== 'undefined') { 
  orient = window.orientation;
}

if (orient === "Browser" | orient === 0) {
  console.log("User in Portrait mode or on a Browser");
} else {
  window.alert(`Please LOCK the orientation in PORTRAIT MODE.\n
Then, close this window and refresh the page.\n
Happy playing.`
);
}

var w = 0, h = 0;

if (x >= y) {
    w = y;
    h = x;
} else {
    w = x;
    h = y;
}

const pad = 4, mgn = 4;
const elements = ['header','main','footer'];


let dw = w - pad * 2 - 4;
const displayW = dw > 500 ? 500 : dw < 200 ? 200: dw;

const headHeight = 45;
const displayH = h - headHeight * 2 - 4;

for (let e of elements){
    let t = document.getElementsByTagName(e)[0];
    // reset paddings and margins
    t.style.padding = 0;
    t.style.margin = 0;
    // adjust width
    t.style.width   = displayW-pad + "px";
    // adjust height (main is different)
    if(e === 'main') {
        t.style.height = displayH + "px";
    } else {
        t.style.height = headHeight-pad + "px";
    }
}
const ctrlDivs = [
    document.getElementById('continferior'),
    document.getElementById('contposition'),
    document.getElementById('contsuperior'),
    document.getElementById('controlsuperior'),
    document.getElementById('controlinferior'),
    document.getElementById('controlposition')
];

for (let e of ctrlDivs) {
    e.style.position = "relative";
    e.style.width = displayW-pad + "px";
}
