var http = require('http'),
    static = require('node-static'),
    fs = require('fs'),
    osc = require('osc-min'),
    dgram = require('dgram'),
    path = require('path'),
    udp = dgram.createSocket('udp4'),
    levels = require('./js/levels'),
    midi = require('midi');

var outport = 41234;

console.log('Starting...');
// console.log(levels["1"]);

// Set up a new midi output.
var midiOutput = new midi.output();

// List the available midi output ports
for (var p = 0; p < midiOutput.getPortCount(); p++) {
  midiPortName = midiOutput.getPortName(p);
  if (midiPortName.indexOf("IAC") != -1) {
    console.log("Opening "+p+" - "+midiPortName);
    midiOutput.openPort(p);
  }else{
    // console.log("Not opening "+p+" - "+midiPortName);
  }
}

var file = new(static.Server)();

http.createServer(function (req, res) {
  file.serve(req, res);
}).listen(8000);

var io = require('socket.io').listen(8081);

io.set("origins = *");
io.set("log level", 1); // reduce logging

function sendOSC(oscAddress, state) {
  var buf;
  if (oscAddress !== undefined) {
    var address = "/" + oscAddress;
    buf = osc.toBuffer({
      address: address,
      args: [state]
    });
    // console.log(address, state);
    return udp.send(buf, 0, buf.length, outport, "localhost");
  }
}

sock = dgram.createSocket("udp4", function(msg, rinfo) {
  var oscIn = osc.fromBuffer(msg);
  // Receive beats in from Live via OSC
  if (oscIn.address == "/beat") {
    var oscInArgs = oscIn.args;
    var oscInValue = oscInArgs[0].value;
    io.sockets.emit('beat', oscInValue);
    // console.log("Beat "+oscInValue);
  }else{
    console.log(oscIn.address);
  }
});

sock.bind(9001);

var usernames = {};
var usernames2 = [];
var controller;
var display;

user = new Object();
user.userName = "Blah";
user.assignedButtons = [0,1];

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

// Get the size of an object
var usersCount;

function sortButtons (count) {
  console.log('Dividing buttons among '+count+ ' users');
  switch (count) {
    case 1:
      return [[0, 1, 2, 3], [], [], []];
    case 2:
      return [[0, 1], [2, 3], [], []];
    case 3:
      return [[0, 1], [2], [3], []];
    case 4:
      return [[0], [1], [2], [3]];
    default:
      return [0, 1, 2, 3];
  }
}

function addUser(name, assignedButtons, date) {
  this.userName = name;
  this.assignedButtons = assignedButtons;
  this.date = date;
  this.currentLevel = 0;
}

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });

  // when the client emits 'adduser', this listens and executes
  socket.on('adduser', function(username){
    console.log("User connected");
    // we store the username in the socket session for this client
    socket.username = username;

    //get current date for timestamp
    var currentDate = new Date();

    // set up a new user object and pre-populate it
    var newUser = new addUser(username, [0, 1, 2, 3], currentDate);

    console.log('New user = ' + newUser.userName);

    // add the client's username to the global list
    usernames[username] = newUser;

    usernames2.unshift(newUser);

    // recalculate number of users
    usersCount = Object.size(usernames);

    if (usersCount == 16) {
      console.log('Removing a user');
      usernames2.splice(3, 1);
      delete usernames[socket.username];
      usersCount = Object.size(usernames);
    }

    // recalculate the distribution of buttons across users based on number of connected users
    var sortedButtons = sortButtons(usersCount);

    // assign each connected user their buttons
    for (i=0; i < usersCount; i++) {
      // usernames2[i].assignedButtons = sortedButtons[i];
      usernames2[i].assignedButtons = i;
      // console.log('assigning user');
      // console.log(usernames2[i].userName);
      // console.log('these buttons');
      // console.log(sortedButtons[usersCount-1]);
    }

    console.log(usernames2);
    
    io.sockets.socket(display).emit('userCountUpdated', usersCount);
    io.sockets.socket(display).emit('allUsers', usernames2);

    // tell client to update its view
    io.sockets.emit('assignButtons', usernames2);
  });

  socket.on('registerAsDisplay', function(id) {
    console.log('Display registered');
    display = socket.id;
  });

  socket.on('didAccelerate', function(tilt) {
    // console.log('Acceleration: '+tilt);
    for (var i=0; i<usersCount; i++) {
      if (usernames2[i].userName == socket.username) {
        // sendOSC(sendOSC(i + "/accelX", tilt[0]));
        // sendOSC(sendOSC(i + "/accelY", tilt[1]));
        // sendOSC(sendOSC(i + "/accelZ", tilt[2]));

        //scale -1 - 1 to 0 - 127 for midi
        var midiX = parseInt((tilt[0]+1)*64);
        console.log("midiX = "+midiX);
        midiOutput.sendMessage([189, 13, midiX]);
      }
    }
  });

  socket.on('buttonPressed', function(buttonIndex) {
    for (var i=0; i<usersCount; i++) {
      if (usernames2[i].userName == socket.username) {
        console.log(usernames2[i].userName + ' pressed = ' + buttonIndex);
        // sendOSC(sendOSC("button-on", parseInt(buttonIndex)));
        midiOutput.sendMessage([187, parseInt(buttonIndex), 127]);
        io.sockets.emit('peerButtonPressed', buttonIndex);
        io.sockets.emit('timeoutButton', buttonIndex);
      }
    }
  });

  socket.on('buttonReleased', function(buttonIndex) {
    for (var i=0; i<usersCount; i++) {
      if (usernames2[i].userName == socket.username) {
        console.log(usernames2[i].userName + ' released = ' + buttonIndex);
        // sendOSC(sendOSC("button-off", parseInt(buttonIndex)));
        midiOutput.sendMessage([188, parseInt(buttonIndex), 127]);
        io.sockets.emit('peerButtonReleased', buttonIndex);
      }
    }
  });

  socket.on('getNewLevel', function(username, currentLevel){
    if (currentLevel < 3){
      console.log('Getting new level for client');
      requestingClient = socket.id;

      var newLevelNumber = currentLevel+1;
      var newLevelName = levels[newLevelNumber]["name"];
      var newLevelTimeLimit = levels[newLevelNumber]["time-limit"];

      io.sockets.socket(requestingClient).emit('updateLevel', newLevelNumber, newLevelName, newLevelTimeLimit);
    }else{
      console.log('Already at the top level');
    }
  });

  // when the user disconnects.. perform this
  // TO-DO // TIDY THIS UP. LOTS OF IDENTICAL/REDUNTANT CALLS TO .connect ABOVE
  socket.on('disconnect', function(){
    console.log(socket.username + ' disconnected');

    for (var i=0; i<usersCount; i++){
      if (usernames2[i].userName == socket.username) {
        usernames2.splice(i, 1);
        console.log('Removing item ' + i + ' from array');
      }

    // remove the username from global usernames list
    delete usernames[socket.username];

    // recalculate number of users
    usersCount = Object.size(usernames);

    // recalculate the distribution of buttons across users based on number of connected users
    var sortedButtons = sortButtons(usersCount);
    }

    // assign each connected user their buttons
    for (i=0; i < usersCount; i++) {
      // usernames2[i].assignedButtons = sortedButtons[i];
      usernames2[i].assignedButtons = i;
      // console.log('assigning user ' + usernames2[i] + ' these buttons ' + sortedButtons[usersCount-1]);
      console.log('assigning user ' + usernames2[i] + ' these buttons ' + i);
    }

    // tell client to update its view
    io.sockets.emit('assignButtons', usernames2);

    console.log(usernames2);
    
    io.sockets.socket(display).emit('userCountUpdated', usersCount);
  });
});