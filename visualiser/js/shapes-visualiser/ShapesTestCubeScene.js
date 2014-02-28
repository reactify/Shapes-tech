(function() {

	var EventDispatcher = retropi.getNamespace("events").EventDispatcher;
	var ThreedSceneController = retropi.getClass("shapes-visualiser.threed.ThreedSceneController");
	
	retropi.createClass("shapes-visualiser", "ShapesTestCubeScene", ThreedSceneController, function(aClassObject, aClassPrototype, aClassName){

		var p = aClassPrototype;
		var s = ThreedSceneController.prototype;

		var ThreedCameraController = retropi.getClass("shapes-visualiser.threed.ThreedCameraController");


		p.init = function() {

			s.init.call(this);

			this._cube = null;

		};

		p.load = function() {

			this._cube = new THREE.Mesh( new THREE.CubeGeometry( 100, 100, 100 ), new THREE.MeshBasicMaterial({
				wireframe : true,
				color:'white'
			}) );
			this._cube.position.x = 0;
			this._cube.position.y = 0;
			this._cube.position.z = 0;

			// this._cube.material = this._createSimpleColorMaterial("#ffcc22");

			this.scene.add(this._cube);

			this.ambientLight = new THREE.AmbientLight(0x695b54);
			this.scene.add(this.ambientLight);


			this.cameraController = new ThreedCameraController();
			this.cameraController.init(this.camera);
			this.cameraController.setWobble(2);

			this.cameraController.moveToLocation(new THREE.Vector3(0,10,400), false);
			this.cameraController.lookAtLocation(new THREE.Vector3(0,0,0), false);
	

			this._loadComplete();
		};

		p.onBeat = function() {

			this._cube.scale.x = 2;
			this._cube.scale.y = 2;
			this._cube.scale.z = 2;

			// var randomColor = new THREE.Color();
			// randomColor.setRGB(parseInt(Math.random() * 255),parseInt(Math.random() * 255),parseInt(Math.random() * 255));

			// var randomMaterial = new THREE.MeshBasicMaterial({
			// 	wireframe : true,
			// 	color: white;

			// });

			this._cube.material.color.setRGB(1, Math.random(), Math.random());
			this._cube.material.needsUpdate = true;
			this._cube.needsUpdate = true;

		};

		p._tendToValue = function(aValue, aTowardsValue) {
			var diff = aValue - aTowardsValue;

			return aValue - (diff * 0.1);
		};


		p.render = function(aRenderer){

			this.cameraController.update();

			this._cube.scale.x = this._tendToValue(this._cube.scale.x, 1);
			this._cube.scale.y = this._tendToValue(this._cube.scale.y, 1);
			this._cube.scale.z = this._tendToValue(this._cube.scale.z, 1);



			this._cube.rotation.x += 0.02;
			this._cube.rotation.y += 0.0225;
			this._cube.rotation.z += 0.0175;


			s.render.call(this, aRenderer);
		}

	});
 

})();