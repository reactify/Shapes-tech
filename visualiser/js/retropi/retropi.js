(function() {
	
	var retropi = {};
	if (!window.retropi) window.retropi = retropi;

	retropi.getNamespace = function(aNamespace){

		var components = aNamespace.split('.');
		var namespaceObj = retropi;
		for (var i=0; i < components.length; i++){
			if (!namespaceObj[components[i]]) namespaceObj[components[i]] = {};
			namespaceObj = namespaceObj[components[i]];
		}
		return namespaceObj;
	};

	retropi.getClass = function(aClassPath) {

		var lastSplitPosition = aClassPath.lastIndexOf(".");
		var packagePath = aClassPath.substring(0, lastSplitPosition);
		var className = aClassPath.substring(lastSplitPosition+1, aClassPath.length);
		
		var packageObject = this.getNamespace(packagePath);
		if(packageObject[className] === undefined) {
			console.error("Class " + aClassPath + " doesn't exist.");
			return null;
		}
		return packageObject[className];
	};


	retropi.createClass = function(aNamespace, aClassName, aInheritedClass, aDefinitionFunction){

		var namespace = retropi.getNamespace(aNamespace);
		if (!namespace[aClassName]){

			namespace[aClassName] = function() {};	

		} else {
			throw new Error("retropi.js :: Class " + aClassName + " already defined in namespace " + aNamespace);
		}

		var classObject = namespace[aClassName];


		if (aInheritedClass){
			classObject.prototype = new aInheritedClass();
		}
		
		var prototype = namespace[aClassName].prototype;

		aDefinitionFunction.call(this, classObject, prototype, aClassName, aInheritedClass);

	};


})();