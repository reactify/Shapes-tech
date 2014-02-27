
// Request animation frame polyfill

if(window.requestAnimFrame == undefined) {
	window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame       || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function( callback ){
        window.setTimeout(callback, 1000 / 60);
        };
    })();
}

// Console grouping polyfill

if(window.console == undefined) {
        var console = new Object();
        window.console = console;
        console.dir = function(){};     
        console.debug = function(){};
        console.error = function(){};
        console.info = function(){};
        console.warn = function(){};
        console.log = function() {};
        console.trace = function(){};
        console.group = function(){};
        console.groupCollapsed = function(){};
        console.timeStamp = function() {};
        console.profile = function() {};
        console.profileEnd = function() {};


        if (document.location.href.indexOf("debug=true") != -1) {

            var logElement = document.createElement("div");
            
            logElement.style.position = "absolute";
            logElement.style.width = "400px";
            logElement.style.height = "200px";
            logElement.style.color = "#FFFFFF";
            logElement.style.background = "#232323";
            logElement.style.top = "60px";
            logElement.style.left = "20px";
            logElement.style.overflow = "scroll";
            logElement.style.zIndex = "100000";
            logElement.style.fontSize = "10px";
            logElement.style.borderWidth = "1px";
            logElement.style.borderColor = "#888888";

        
            // we stack up lines to add to the fake console so it doens't overload the DOM
            var consoleLineStack = [];

            document.body.appendChild(logElement);
            console.log = function(aMessage){

                var argumentsString = "";
                for (var i = 0; i < arguments.length; i++)
                    argumentsString = argumentsString + " "  + arguments[i].toString();

                consoleLineStack.push(argumentsString);
            };

            console.error = function(aMessage){
                var argumentsString = "";
                for (var i = 0; i < arguments.length; i++)
                    argumentsString = argumentsString + " "  + arguments[i].toString();

                consoleLineStack.push("<span style='color:#FF0000'>" + argumentsString + "</span>");        
            };

            // take the last line from the stack and append it to the fake console
            function __updateDummyConsole() {
                if (consoleLineStack.length > 0)
                    logElement.innerHTML = logElement.innerHTML + "<br/>" + consoleLineStack.shift();
            };

            setInterval(__updateDummyConsole, 100);

        }
    
}

// bind polyfill

if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }
 
    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };
 
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
 
    return fBound;
  };
}


