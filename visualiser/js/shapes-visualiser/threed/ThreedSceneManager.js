(function() {

	var EventDispatcher = retropi.getNamespace("events").EventDispatcher;

	retropi.createClass("shapes-visualiser.threed", "ThreedSceneManager", EventDispatcher, function(aClassObject, aClassPrototype, aClassName){
	
	var p = aClassPrototype;
	var s = EventDispatcher.prototype;

	var ThreedSceneManager = aClassObject;

	var ThreedSceneController = retropi.getClass("shapes-visualiser.threed.ThreedSceneController");

	ThreedSceneManager.NEW_SCENE_LOADED = "threedscenemanagernewsceneloaded";

	p.init = function() {

		s.init.call(this);


		if (!THREE){
			throw new Error("THREE.js not loaded");
		}

		this.renderer = new THREE.WebGLRenderer();
		

		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.sortObjects = false;
		this.renderer.autoClear = false;

	}

	p.loadScene = function(aSceneController) {

		if (this.currentSceneController) {
			var that = this;
			this.currentSceneController.addEventListener(ThreedSceneController.UNLOADED, function() {
				that.currentSceneController = null;
				that.loadScene(aSceneController);
			})
		} else {

			this.currentSceneController = aSceneController;
			this.currentSceneController.addEventListener(ThreedSceneController.LOADED, this._sceneLoaded.bind(this));
			this.currentSceneController.load();
		}

	};

	p._sceneLoaded = function() {
		console.log("ThreedSceneManager :: scene loaded");
		this.dispatchCustomEvent(ThreedSceneManager.NEW_SCENE_LOADED, null);
	};



	p.render = function() {

		this.currentSceneController.render(this.renderer);

	};

});

})();