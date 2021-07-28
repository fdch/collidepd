// -----------------------------------------------------------------------------
//
// INICIALIZAR LOS CONTROLES
//
// -----------------------------------------------------------------------------
c.onoff.on('change', function (v) {
    if (socket.connected && CHORRO) socket.emit('loopstart', v);
});

c.set.on('change', function (v) {
    if (socket.connected && CHORRO) socket.emit('set', v);
});

c.tilt.on('change', function (v) {
    if (socket.connected && CHORRO) {
        socket.emit('tilt', c.getTilt(v));
    };
});

c.bpm.on('change', function (v) {
  if (socket.connected && CHORRO) socket.emit('bpm', v);
});

c.delay.on('change', function (v) {
    if (socket.connected && CHORRO) socket.emit('delay', v);
});


c.verb.on('change', function (v) {
    if (socket.connected && CHORRO) socket.emit('verb', v);
});

c.selectF.addEventListener('change', function() {
    if (socket.connected && CHORRO) socket.emit('selectF', this.value);
});

c.selectS.on('change', function (v) {
    if (socket.connected && CHORRO) socket.emit('selectS', v);
});
c.position.on("release", function() {
    clicked=false;
    // console.log("Released", clicked);
});
c.position.on("click", function(v) {
    clicked=true;
    // console.log("Clicked",clicked);
});

c.position.on('change', function (v) {
    if (socket.connected && CHORRO) socket.emit('position', [clicked, v]);
});

//local
c.slidervol.on('change', function (v) {
    dac.volume.rampTo(v, 0.1);
});
