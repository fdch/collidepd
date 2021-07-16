//Socket.on recibe los mensajes desde el servidor

socket.on('loopstart', (data) => {
    let i = data[0]; // indice del usuario
    let x = data[1]; // valor
    sintes[i].loopstart(x);
});

socket.on('set', (data) => {
    let i = data[0]; // indice del usuario
    let x = data[1];
    sintes[i].setrandom(x);
});

socket.on('tilt', (data) => {
    let i = data[0];
    let x = data[1].x;
    let y = data[1].y;
    let z = data[1].z;
    sintes[i].pitch(Nexus.scale(x, -1, 1, 60, 5500));
    sintes[i].filterf(Nexus.scale(y, -1, 1, 0, 1));
    sintes[i].loop.set({
        interval: Nexus.scale(z, 0, 1, 0.001, 0.1)
    });
});

socket.on('delay', (data) => {
    let i = data[0]; // indice del usuario
    let x = data[1]; // valor
    sintes[i].delaywet(x);
});

socket.on('bpm', (data) => {
    let i = data[0]; // indice del usuario
    let x = data[1]; // valor
    sintes[i].bpm(x);
});

socket.on('verb', (data) => {
    let i = data[0];
    let x = data[1];
    sintes[i].verbwet(x);
});

socket.on('selectF', (data) => {
    let i = data[0]; // indice del usuario
    let x = data[1];
    sintes[i].selectFilter(x);
});

socket.on('selectS', (data) => {
    let i = data[0]; // indice del usuario
    let x = data[1]; // no cambiar
    sintes[i].selectSource(x);
});

socket.on('position', (data) => {
    let i = data[0]; // indice del usuario
    let x = data[1].x;
    let y = data[1].y;

    sintes[i].pitch(x);
    sintes[i].filterf(y);
    sintes[i].lfopan(y);
    // sintes[i].envelope(c.position.event.clicked)
});
