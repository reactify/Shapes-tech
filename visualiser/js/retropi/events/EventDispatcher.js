(function() {

	retropi.createClass("events", "EventDispatcher", null, function(aClassObject, aClassPrototype, aClassName){


		var p = aClassPrototype;

		p.init = function() {
			this._eventListeners = null;
		}

		// Check if this browser supports Custom Events
		var supportsCustomEvents = true;
		try {
			var newTestCustomEvent = document.createEvent("CustomEvent");
		} catch(e){
			supportsCustomEvents = false;
		}
			
		
		p.addEventListener = function(aEventType, aFunction) {

			if(this._eventListeners === null) {
				this._eventListeners = {};
			}
			if(!this._eventListeners[aEventType]){
				this._eventListeners[aEventType] = [];
			}
			this._eventListeners[aEventType].push(aFunction);
			
			return this;
		};
		
		p.removeEventListener = function(aEventType, aFunction) {
			if(this._eventListeners === null) {
				this._eventListeners = {};
			}
			var currentArray = this._eventListeners[aEventType];
			
			if (typeof(currentArray) === "undefined") {
				// console.warn("EventDispatcher :: removeEventListener :: Tried to remove an event handler (for " + aEventType +") that doesn't exist");
				return this;
			}
			
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++){
				if(currentArray[i] === aFunction){
					currentArray.splice(i, 1);
					i--;
					currentArrayLength--;
				}
			}
			return this;
		};
		
		p.dispatchEvent = function(aEvent) {
			if(this._eventListeners === null) {
				this._eventListeners = {};
			}
			var eventType = aEvent.type;
			
			try {
				if(aEvent.target === null) {
					aEvent.target = this;
				}
				aEvent.currentTarget = this;
			}
			catch(theError) {
				// console.error("Couldn't set targets for current event. " + aEvent.message);
				//MENOTE: sometimes Firefox can't set the target
				var newEvent = {"type" : eventType, "detail" : aEvent.detail, "dispatcher" : this };
				return this.dispatchEvent(newEvent);
			}
			
			//console.log(eventType, this._eventListeners[eventType], this._eventListeners[eventType].length);
			var currentEventListeners = this._eventListeners[eventType];
			if(currentEventListeners !== null && currentEventListeners !== undefined) {
				var currentArray = this._copyArray(currentEventListeners);
				var currentArrayLength = currentArray.length;
				for(var i = 0; i < currentArrayLength; i++){
					var currentFunction = currentArray[i];
					//console.log(currentFunction);
					//console.log(eventType, i, currentArray.length);
					currentFunction.call(this, aEvent);
				}
			}
			return this;
		};
		
		p.dispatchCustomEvent = function(aEventType, aDetail) {
			var newEvent;
			if (supportsCustomEvents){
				newEvent = document.createEvent("CustomEvent");
				newEvent.dispatcher = this;
				newEvent.initCustomEvent(aEventType, false, false, aDetail);
			}
			else {
				newEvent = {"type" : aEventType, "detail" : aDetail, "dispatcher" : this };
			}
			return this.dispatchEvent(newEvent);
		};
		
		p._destroy = function() {
			s._destroy.call(this);
			if(this._eventListeners !== null) {
				for(var objectName in this._eventListeners) {
					var currentArray = this._eventListeners[objectName];
					var currentArrayLength = currentArray.length;
					for(var i = 0; i < currentArrayLength; i++) {
						currentArray[i] = null;
					}
					delete this._eventListeners[objectName];
				}
				this._eventListeners = null;
			}
		};

		p._copyArray = function(aArray) {
			var currentArray = new Array(aArray.length);
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				currentArray[i] = aArray[i];
			}
			return currentArray;
		};
		
		/*
		 *	Decorate (Static)
		 *
		 *	Decorator method that bestows distpatching behaviours upon generic objects.
		 *	A convenience method for when your object cannot extend EventDispatcher
		 */
		aClassName.decorate = function( object ){
			aClassObject.apply( object );
			object.addEventListener = p.addEventListener;
			object.dispatchEvent = p.dispatchEvent;
			object.dispatchCustomEvent = p.dispatchCustomEvent;
			object.removeEventListener = p.removeEventListener;
			return object;
		};

	});

})();
