var gn;

function init_gn() {
  var args = {
    logger: logger
  };

  gn = new GyroNorm();

  gn.init(args).then(function() {
    var isAvailable = gn.isAvailable();
    if(!isAvailable.deviceOrientationAvailable) {
      logger({message:'Device orientation is not available.'});
    }

    if(!isAvailable.accelerationAvailable) {
      logger({message:'Device acceleration is not available.'});
    }

    if(!isAvailable.accelerationIncludingGravityAvailable) {
      logger({message:'Device acceleration incl. gravity is not available.'});
    } 

    if(!isAvailable.rotationRateAvailable) {
      logger({message:'Device rotation rate is not available.'});
    }

    start_gn();
  }).catch(function(e){

    console.log(e);
    
  });
}

function logger(data) {
  $('#error-message').append(data.message + "\n");
}

function stop_gn() {
  gn.stop();
}

function start_gn() {
  gn.start(gnCallBack);
}

function gnCallBack(data) {
  $('#do_alpha').val(data.do.alpha);
  $('#do_beta').val(data.do.beta);
  $('#do_gamma').val(data.do.gamma);

  $('#dm_x').val(data.dm.x);
  $('#dm_y').val(data.dm.y);
  $('#dm_z').val(data.dm.z);

  $('#dm_gx').val(data.dm.gx);
  $('#dm_gy').val(data.dm.gy);
  $('#dm_gz').val(data.dm.gz);

  $('#dm_alpha').val(data.dm.alpha);
  $('#dm_beta').val(data.dm.beta);
  $('#dm_gamma').val(data.dm.gamma);
}

function norm_gn() {
  gn.normalizeGravity(true);
}

function org_gn() {
  gn.normalizeGravity(false);
}

function set_head_gn() {
  gn.setHeadDirection();
}

function showDO() {
  $('#do').show();
  $('#dm').hide();
  $('#btn-dm').removeClass('selected');
  $('#btn-do').addClass('selected');
}

function showDM() {
  $('#dm').show();
  $('#do').hide();
  $('#btn-do').removeClass('selected');
  $('#btn-dm').addClass('selected');
}

$(function() { // called when DOM is ready

  // establishes a socket.io connection
  var socket = io();

  // interface functions
  $('#shootbutton1').click(function() {
    socket.emit('inc', '1');
    console.log("increaseP1");
    return false; // false does not reload the page
  });

  $('#inc-button1').click(function() {
    socket.emit('inc', '1');
    console.log("increaseP1");
    return false; // false does not reload the page
  });

  $('#inc-button2').click(function() {
    socket.emit('inc', '2');
    console.log("increaseP2");
    return false; // false does not reload the page
  });

  $('#inc-button3').click(function() {
    socket.emit('inc', '3');
    console.log("increaseP3");
    return false; // false does not reload the page
  });

  $('#inc-button4').click(function() {
    socket.emit('inc', '4');
    console.log("increaseP4");
    return false; // false does not reload the page
  });

  $('#dec-button1').click(function() {
    socket.emit('dec', '1');
    console.log("decreaseP1");
    return false; // false does not reload the page
  });

  $('#dec-button2').click(function() {
    socket.emit('dec', '2');
    console.log("decreaseP2");
    return false; // false does not reload the page
  });

  $('#dec-button3').click(function() {
    socket.emit('dec', '3');
    console.log("decreaseP3");
    return false; // false does not reload the page
  });

  $('#dec-button4').click(function() {
    socket.emit('dec', '4');
    console.log("decreaseP4");
    return false; // false does not reload the page
  });

  $('#collectible-button').click(function() {
    socket.emit('spawnCollectible');
    console.log("spawning collectible");
    return false; // false does not reload the page
  });


  $('#dec-tempo').click(function() {
    socket.emit('decreaseTempo', socket.id);
    console.log("decreasing Tempo");
    return false; // false does not reload the page
  });

  $('#inc-tempo').click(function() {
    socket.emit('increaseTempo', socket.id);
    console.log("increasing Tempo");
    return false; // false does not reload the page
  });

































});