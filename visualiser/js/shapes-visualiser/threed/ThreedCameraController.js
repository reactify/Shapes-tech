(function() {

	var EventDispatcher = retropi.getNamespace("events").EventDispatcher;

	retropi.createClass("shapes-visualiser.threed", "ThreedCameraController", EventDispatcher, function(aClassObject, aClassPrototype, aClassName){
	
		var p = aClassPrototype;
		var s = EventDispatcher.prototype;

		var ThreedCameraController = aClassObject;

		ThreedCameraController.NEW_SCENE_LOADED = "ThreedCameraControllernewsceneloaded";

		p.init = function(aCamera) {

			s.init.call(this);

			this._wobbleAmplitude = 0;
			
			this._wobblePositionTweens = {x : null, y: null, z:null};
			this._wobbleRotationTweens = {x : null, y: null, z:null};
			this._wobbleVector = new THREE.Vector3();
			this._rotWobbleVector = new THREE.Vector3();

			this._targetLocation = null;
			this._lookAtTarget = null;

			this._lastTimeStamp = Date.now();

			this._moveTween = null;
			this._lookAtTween = null;

			this._cameraOrigin = null;
			this._cameraRotationOrigin = null;

			this._camera = aCamera;

			this._cameraOrigin = aCamera.position.clone();
			this._cameraRotationOrigin = aCamera.rotation.clone();
			this._targetLocation = this._cameraOrigin.clone();
			this._lookAtTarget = new THREE.Vector3(0,0,0);

			this._createNewWobble();
		};

		p.setWobble = function(aWobbleAmplitude) {
			this._wobbleAmplitude = aWobbleAmplitude;

			this._createNewWobble();
		}

		p._wobbleCamera = function() {

			
		};

		p._createNewWobble = function() {
			this._createNewWobbleOnAxis("x");
			this._createNewWobbleOnAxis("y");
			this._createNewWobbleOnAxis("z");

		}

		p._createNewWobbleOnAxis = function(aAxis) {

			if (!this._wobbleAmplitude) return;

			var seed = Math.random() * 2 * Math.PI;

			var newPositionValue =0;
			if (aAxis == "x"){
				newPositionValue = Math.sin(seed) * this._wobbleAmplitude;
			} else {
				newPositionValue = Math.cos(seed) * this._wobbleAmplitude;
			}

			var wobbleSpeed = this._wobbleAmplitude * 1000 + (Math.random() * 3000);
			

			var newRotationValue = Math.sin(Math.random() * 2 * Math.PI) * 20;

			

			if (this._wobblePositionTweens[aAxis]) this._wobblePositionTweens[aAxis].stop();
			if (this._wobbleRotationTweens[aAxis]) this._wobbleRotationTweens[aAxis].stop();

			switch(aAxis) {
				case "x":
					this._wobblePositionTweens["x"] = new TWEEN.Tween(this._wobbleVector).to({x : newPositionValue}, wobbleSpeed).easing(TWEEN.Easing.Quadratic.InOut).start();
					this._wobbleRotationTweens["x"] = new TWEEN.Tween(this._rotWobbleVector).to({ x : newRotationValue}, wobbleSpeed).easing(TWEEN.Easing.Quadratic.InOut).start();
				break;
				case "y":
					this._wobblePositionTweens["y"] = new TWEEN.Tween(this._wobbleVector).to({y: newPositionValue}, wobbleSpeed).easing(TWEEN.Easing.Quadratic.InOut).start();
					this._wobbleRotationTweens["y"] = new TWEEN.Tween(this._rotWobbleVector).to({ y : newRotationValue}, wobbleSpeed).easing(TWEEN.Easing.Quadratic.InOut).start();
				break;
				case "z":
					this._wobblePositionTweens["z"] = new TWEEN.Tween(this._wobbleVector).to({z: newPositionValue}, wobbleSpeed).easing(TWEEN.Easing.Quadratic.InOut).start();
					this._wobbleRotationTweens["z"] = new TWEEN.Tween(this._rotWobbleVector).to({ z : newRotationValue}, wobbleSpeed).easing(TWEEN.Easing.Quadratic.InOut).start();
				break;
			}


			setTimeout(function() {
				this._createNewWobbleOnAxis(aAxis);
			}.bind(this), wobbleSpeed);
		};

		p.moveToLocation = function(aLocationVector, aAnimate, aOverTime) {

			if (aAnimate) {

				if (this._moveTween) this._moveTween.stop();
				this._moveTween = new TWEEN.Tween(this._targetLocation).to({ x : aLocationVector.x, y : aLocationVector.y, z : aLocationVector.z }, aOverTime).easing(TWEEN.Easing.Quadratic.InOut).start();

			} else {
				this._targetLocation = aLocationVector.clone();

			}

		};

		p.lookAtLocation = function(aLookAtPositionVector, aAnimate, aOverTime) {

			if (aAnimate) {

				if (this._lookAtTween) this._lookAtTween.stop();
				this._lookAtTween = new TWEEN.Tween(this._lookAtTarget).to({ x : aLookAtPositionVector.x, y : aLookAtPositionVector.y, z : aLookAtPositionVector.z }, aOverTime).easing(TWEEN.Easing.Quadratic.InOut).start();

			} else {

				this._lookAtTarget = aLookAtPositionVector.clone();

			}

		};


		p.update = function() {
			this._camera.position = this._targetLocation.clone().add(this._wobbleVector);
			// this._camera.rotation.set(this._rotWobbleVector.x, this._rotWobbleVector.y, this._rotWobbleVector.z, 1);
			this._camera.lookAt(this._lookAtTarget);
		};

});

})();