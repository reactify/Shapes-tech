var clientName;
var peerName;
var totalButtonCount = 16;
var assignedButton;
var sec = 0;
var interactionLevel = 0;
var progressbar
var incrementUnwrappedSeconds = 1;
var secondsUnwrapped = 0;
var sendAccelerometer = 0;

var socket = io.connect('http://yuli-mbp.home:8081');
// var socket = io.connect('http://localhost:8081');
socket.on('news', function (data) {
// console.log(data);
socket.emit('my other event', { my: 'data' });
});

socket.on('log', function (label, data) {
console.log(label);
console.log(data);
});

// on connection to server, ask for user's name with an anonymous callback
socket.on('connect', function(){
// call the server-side function 'adduser' and send one parameter (value of prompt)
// clientName = prompt("What's your name?");
clientName = Math.floor(Math.random()*1000,0);
socket.emit('adduser', clientName);
});

socket.on('beat', function(beat) {
  // console.log('Received beat '+beat);
});

socket.on('peerButtonPressed', function(button) {
$('#btn'+button).css({"backgroundColor": "grey"});
});

socket.on('peerButtonReleased', function(button) {
$('#btn'+button).css({"backgroundColor": origColours[button]});
});

socket.on('timeoutButton', function(timeoutButton) {
// When the button is pressed, unbind it from its press actions, fade it out and fade it back in again slowly
$('#btn'+timeoutButton).unbind('vmousedown');
$('#btn'+timeoutButton).css({"color": "black"});
$('#btn'+timeoutButton).fadeTo(0, 0, function() {
var fadeBackTo = 0.25;
if (timeoutButton == assignedButton) {fadeBackTo = 1.0};
  $('#btn'+timeoutButton).fadeTo(5000, fadeBackTo, function() {
    // When the fade back in is complete, rebind it to the button press actions
    // console.log('timeoutButton = '+timeoutButton);
    // console.log('timeoutButton = '+assi);
    $('#btn'+timeoutButton).css({"color": "white"});
    if (timeoutButton == assignedButton) {
      console.log('Rebinding');
      bindButtonToActions('#btn'+timeoutButton);
    }
  });
});
console.log('Timing out '+timeoutButton);
})

socket.on('assignButtons', function(users) {
for (var i=0; i < totalButtonCount; i++) {
  var buttonToDisable = "#btn"+i;
  $(buttonToDisable).unbind();
  $(buttonToDisable).css({"opacity": "0.1"});
}

for (var i=0; i < users.length; i++) {
  if (users[i].userName == clientName) {
    // console.log(users[i].assignedButtons);
    enableButtons(users[i].assignedButtons);
    labelButtons(users[i].userName, users[i].assignedButtons);
    assignedButton = users[i].assignedButtons;
  }else{
    labelButtons(users[i].userName, users[i].assignedButtons);
  }
}
// console.log('Users = ' + users[0].userName);
})

socket.on('updateLevel', function(level, name, timeLimit) {
interactionLevel = level;
$('#interactionLevelName').html(name);
secondsUnwrapped = 0;
progressbar.attr('value', '0');
progressbar.attr('max',timeLimit);
incrementUnwrappedSeconds = 1;
})

function labelButtons (name, buttonsToLabel) {
// console.log('Labelling button ' + buttonsToLabel[i] + ' with ' + name);
var buttonToLabel = "#btn"+buttonsToLabel;
$(buttonToLabel).text(name);
}

function enableButtons (enableButtons) {
console.log('Enabling button ' + enableButtons);
var buttonToEnable = "#btn"+enableButtons;
$(buttonToEnable).css({"opacity": "1.0"});
bindButtonToActions(buttonToEnable);

// hack to assign all buttons by default
// for (var i=0; i < 16; i++) {
//   // console.log('Enabling button ' + enableButtons[i]);
//   var buttonToEnable = "#btn"+i;
//   $(buttonToEnable).css({"opacity": "1.0"});
//   bindButtonToActions(buttonToEnable);
// }
}

function bindButtonToActions(buttonToBind) {
$(buttonToBind).bind('vmousedown', sendButtonReleasedToServer);
$(buttonToBind).bind('vmouseup', sendButtonPressedToServer); 
}

function bindButtonToAccelerometer(buttonToBind) {
$(buttonToBind).bind('vmousedown', accelerometerToServerStart);
$(buttonToBind).bind('vmouseup', accelerometerToServerStop); 
}

function accelerometerToServerStart() {
console.log('sendAccel 1');
sendAccelerometer = 1;
}

function accelerometerToServerStop() {
console.log('sendAccel 0');
sendAccelerometer = 0;
}

function sendButtonPressedToServer() {
$(this).css({"backgroundColor": origColours[$(this).attr('buttonIndex')]});
event.preventDefault();
socket.emit('buttonReleased', $(this).attr('buttonIndex'));
}

function sendButtonReleasedToServer() {
$(this).css({"backgroundColor": "grey"});
event.preventDefault();
socket.emit('buttonPressed', $(this).attr('buttonIndex'));
}


var origColours = ['red', 'green', 'blue', 'yellow'];
var tilt;

$(document).ready(function() {

window.addEventListener("devicemotion", function(event) {
  tilt = [  (event.accelerationIncludingGravity.x/10), 
            (event.accelerationIncludingGravity.y/10),
            (event.acceleration.z/10)];
}, true);

$(".btn").bind('taphold', function(event) {
  event.preventDefault();
})

sec = 0;
function pad ( val ) { return val > 9 ? val : "0" + val; }
setInterval( function(){
  var secondsWrapped = pad(++sec%60);
  secondsUnwrapped = ++secondsUnwrapped;
  var minutes = pad(parseInt(sec/60,10));
  $("#elapsedTime").html(minutes+":"+secondsWrapped);
  if (incrementUnwrappedSeconds) {
    $("#elapsedSeconds").html(secondsUnwrapped);
    loading();
  }
}, 1000);

// Progress bar
progressbar = $('#progressbar');  

var loading = function() {  
    addValue = progressbar.val(secondsUnwrapped);
    if (secondsUnwrapped == progressbar.attr('max')) { 
      // tell server we've finished this level and request a new one
      console.log('Reached max');
      socket.emit('getNewLevel', clientName, interactionLevel); 
      incrementUnwrappedSeconds = 0;
    }
};

bindButtonToAccelerometer("#btn15");

});
window.ondevicemotion = function() {
// if (tilt) {
//   if (sendAccelerometer == 1) {
//     socket.emit('didAccelerate', tilt);
//   }
// };
};

setInterval( function(){
if (tilt) {
  if (sendAccelerometer == 1) {
    socket.emit('didAccelerate', tilt);
  }
};
}, 15);