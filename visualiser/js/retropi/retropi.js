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