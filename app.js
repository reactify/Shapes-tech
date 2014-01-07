var http = require('http'),
    static = require('node-static'),
    fs = require('fs'),
    osc = require('osc-min'),
    dgram = require('dgram'),
    path = require('path'),
    udp = dgram.createSocket('udp4');

var outport = 41234;

console.log('blagagag');

var file = new(static.Server)();

http.createServer(function (req, res) {
  file.serve(req, res);
}).listen(8080);

var io = require('socket.io').listen(8081);

io.set("origins = *");
io.set("log level", 1); // reduce logging

function sendOSC(oscAddress, state) {
  var buf;
  if (oscAddress != undefined) {
    var address = "/" + oscAddress;
    buf = osc.toBuffer({
      address: address,
      args: [state]
    })
    // console.log(address);
    return udp.send(buf, 0, buf.length, outport, "localhost");
  };
};

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

function addUser(name, assignedButtons) {
  this.userName = name;
  this.assignedButtons = assignedButtons;
}

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });

  // when the client emits 'adduser', this listens and executes
  socket.on('adduser', function(username){
    console.log("User connected");
    // we store the username in the socket session for this client
    socket.username = username;

    // set up a new user object and pre-populate it
    var newUser = new addUser(username, [0, 1, 2, 3]);

    console.log('New user = ' + newUser.userName);

    // add the client's username to the global list
    usernames[username] = newUser;

    usernames2.unshift(newUser);

    // recalculate number of users
    usersCount = Object.size(usernames);

    if (usersCount == 5) {
      console.log('Removing a user');
      usernames2.splice(3, 1)
      delete usernames[socket.username]; 
      usersCount = Object.size(usernames);  
    }

    // recalculate the distribution of buttons across users based on number of connected users
    var sortedButtons = sortButtons(usersCount);

    // assign each connected user their buttons
    for (i=0; i < usersCount; i++) {
      usernames2[i].assignedButtons = sortedButtons[i];
      console.log('assigning user ' + usernames2[i] + ' these buttons ' + sortedButtons[usersCount-1]);
    }

    console.log(usernames2);
    
    io.sockets.socket(display).emit('userCountUpdated', usersCount);

    // tell client to update its view
    io.sockets.emit('assignButtons', usernames2);
  });

  socket.on('registerAsDisplay', function(id) {
    console.log('Display registered');
    display = socket.id;
  })



  socket.on('didAccelerate', function(tilt) {
    for (var i=0; i<usersCount; i++) {
      if (usernames2[i].userName == socket.username) {
        sendOSC(sendOSC(i + "/accelX", tilt[0]));
        sendOSC(sendOSC(i + "/accelY", tilt[1]));
        sendOSC(sendOSC(i + "/accelZ", tilt[2]));
      }
    }
  });

  socket.on('buttonPressed', function(buttonIndex) {
    for (var i=0; i<usersCount; i++) {
      if (usernames2[i].userName == socket.username) {
        console.log(usernames2[i].userName + ' pressed = ' + buttonIndex);
        sendOSC(sendOSC(i + "/button" + buttonIndex, 1));
        io.sockets.emit('peerButtonPressed', buttonIndex);
        io.sockets.emit('timeoutButton', buttonIndex);
      }
    }
  });

  socket.on('buttonReleased', function(buttonIndex) {
    for (var i=0; i<usersCount; i++) {
      if (usernames2[i].userName == socket.username) {
        console.log(usernames2[i].userName + ' released = ' + buttonIndex);
        sendOSC(sendOSC(i + "/button" + buttonIndex, 0));
        io.sockets.emit('peerButtonReleased', buttonIndex);
      }
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
      usernames2[i].assignedButtons = sortedButtons[i];
      console.log('assigning user ' + usernames2[i] + ' these buttons ' + sortedButtons[usersCount-1]);
    }

    // tell client to update its view
    io.sockets.emit('assignButtons', usernames2);

    console.log(usernames2);
    
    io.sockets.socket(display).emit('userCountUpdated', usersCount);
  });

});