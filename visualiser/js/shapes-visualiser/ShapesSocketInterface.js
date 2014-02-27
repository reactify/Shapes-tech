(function() {

	var EventDispatcher = retropi.getNamespace("events").EventDispatcher;
	
	retropi.createClass("shapes-visualiser", "ShapesSocketInterface", EventDispatcher, function(aClassObject, aClassPrototype, aClassName){

		var p = aClassPrototype;
		var s = EventDispatcher.prototype;

		aClassObject.EVENT_BEAT = "shapesSocketInterfaceBeat";

		p.init = function() {

			s.init.call(this);

			this._socket = null;

			this._socketConnectBound = this._onSocketConnect.bind(this);

			this._socketBeatBound = this._onSocketBeat.bind(this);




		}

		p.connect = function(aClientIp) {

			this._socket = io.connect(aClientIp);

			// this._socket.on('connect', this._onSocketConnectBound);
			this._socket.on('beat', this._socketBeatBound);

		};

		p._onSocketConnect = function(aSocket){

			console.log("ShapesSocketInterface :: on Connect!");


			

		};


		p._onSocketBeat = function(aSocket){

			this.dispatchCustomEvent(aClassObject.EVENT_BEAT, null);

		};

	});
 

})();