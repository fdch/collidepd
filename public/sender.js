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
    if (socket.connected && CHORRO) socket.emit('tilt', v);
});

c.delay.on('change', function (v) {
    if (socket.connected && CHORRO) socket.emit('delay', v);
});

c.verb.on('change', function (v) {
    if (socket.connected && CHORRO) socket.emit('verb', v);
});

c.selectF.on('change', function (v) {
    if (socket.connected && CHORRO) socket.emit('selectF', v);
});

c.selectS.on('change', function (v) {
    if (socket.connected && CHORRO) socket.emit('selectS', v);
});

c.position.on('change', function (v) {
    if (socket.connected && CHORRO) socket.emit('position', v);
});

//local
c.slidervol.on('change', function (v) {
    dac.volume.rampTo(v, 0.1);
});