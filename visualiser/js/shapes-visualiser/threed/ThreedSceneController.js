(function() {

	var EventDispatcher = retropi.getNamespace("events").EventDispatcher;
	

	retropi.createClass("shapes-visualiser.threed", "ThreedSceneController", EventDispatcher, function(aClassObject, aClassPrototype, aClassName){
	
	var p = aClassPrototype;
	var s = EventDispatcher.prototype;

	aClassObject.NEW_SCENE_LOADED = "threedscenemanagernewsceneloaded";

	var ThreedSceneController = aClassObject;

	ThreedSceneController.LOADED = "sceneControllerLoaded";
	ThreedSceneController.UNLOADED = "sceneControllerUnloaded";
	ThreedSceneController.CAMERA_MOVE = "sceneControllerCameraMove";


	// SETUP VARS
	var sceneWidth = window.innerWidth;
	var sceneHeight = window.innerHeight;
	var view_angle = 45,
		aspect_ratio = sceneWidth / sceneHeight,
		near_value = 0.1,
		far_value = 10000;

	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;

	p.init = function() {
		s.init.call(this);

		

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(view_angle, aspect_ratio, near_value, far_value);

		this.scene.add(this.camera);
		this.camera.up = new THREE.Vector3(0,0,-1);

	};


	p.load = function() {
		// override this method
		this._loadComplete();
	};

	p._loadComplete = function() {
		this.dispatchCustomEvent(ThreedSceneController.LOADED, this);
	};

	p.unload = function() {
		// override this method
		this._unloadComplete();

	};

	p._unloadComplete = function() {
		this.dispatchCustomEvent(ThreedSceneController.UNLOADED, this);
	};

	p._createImageTextureMaterial = function(aTexturePath, aRepeatSetting) {

		var textMap = THREE.ImageUtils.loadTexture(aTexturePath);
		textMap.wrapS = textMap.wrapT = THREE.RepeatWrapping;
		textMap.repeat.set(aRepeatSetting, aRepeatSetting);
		textMap.needsUpdate = true;

		var material = new THREE.MeshLambertMaterial({ map : textMap});

		return material;

	};

	p._createVideoTextureMaterialObject = function(aVideoPath) {

		var videoElement = document.createElement("video");
		videoElement.src = aVideoPath;
		videoElement.loop = true;
		videoElement.load();
		videoElement.play();


		var videoImage = document.createElement("canvas");
		videoImage.width = 640;
		videoImage.height = 480;

		videoImageContext = videoImage.getContext( '2d' );
		// background color if no video present
		videoImageContext.fillStyle = '#000000';
		videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );

		videoTexture = new THREE.Texture( videoImage );
		videoTexture.minFilter = THREE.LinearFilter;
		videoTexture.magFilter = THREE.LinearFilter;
		videoTexture.wrapS = videoTexture.wrapT = THREE.RepeatWrapping;
		videoTexture.repeat.set(1, 1.3);

		var materialObject = {
			material : null,
			update : function () {
				if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA){
					videoImageContext.drawImage(videoElement, 0,0);
					if (videoTexture) videoTexture.needsUpdate = true;
				}
			}
		};

		
	
		materialObject.material = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );

		return materialObject;

	};

	p._createSimpleColorMaterial = function(aColor) {

		var newMaterial = new THREE.MeshLambertMaterial( { color : aColor});
		return newMaterial;

	};
	

	p.render = function(aRenderer) {

		// override this method
		aRenderer.clear();
		aRenderer.render(this.scene, this.camera);


	};


});

})();