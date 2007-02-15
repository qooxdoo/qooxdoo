
qx.Clazz.define("qxunit.TestSuite", {
	
	extend: qx.core.Object,
	
	construct: function(testClassOrNamespace) {
		if (testClassOrNamespace) {
			this.add(testClassOrNamespace);
		}
	},
	
	members: {
				
		__checks: 0,

		add: function(testClassOrNamespace) {
			if (typeof(testClassOrNamespace) == "string") {
				var evalTestClassOrNamespace = eval(testClassOrNamespace);
				if (!evalTestClassOrNamespace) {
					this.addFail(testClassOrNamespace, "The class/namespace '" + testClassOrNamespace + "' is undefined!");
				}
				testClassOrNamespace = evalTestClassOrNamespace;
			}
			
			if (typeof(testClassOrNamespace) == "function") {
				this.addTestClass(testClassOrNamespace);
			} else if (typeof(testClassOrNamespace) == "object") {
				this.addTestNamespace(testClassOrNamespace);
			} else {
				this.addFail("exsitsCheck" + this.__checks++, "Unkown test class '" + testClassOrNamespace + "'!");
				return;
			}
		},


		__testFunctions: {},
		__testClassNames: [],
		
		addTestClass: function(clazz) {
			if (!clazz) {
				this.addFail("exsitsCheck" + this.__testClassNames.length, "Unkown test class!");
				return;
			}
			if (qx.Clazz.isSubClassOf(clazz, qxunit.TestCase))
			{
				var proto = clazz.prototype;
				var classname = clazz.classname;
				this.__testClassNames.push(classname);
				
				for (var test in proto) {
					if (proto.hasOwnProperty(test)) {
			            if (typeof(proto[test]) == "function" && test.indexOf("test") == 0) {
							var testFunctionName = "$test_" + classname.replace(".", "_") + "_" + test;
							this.__testFunctions[testFunctionName] = this.__createTestFunctionWrapper(clazz, test);
						}
					}
				}
			}			
		},
		
		addTestNamespace: function(namespace) {
			if (typeof(namespace) == "function" && namespace.classname) {
				this.addTestClass(namespace);
				return;
			} else if (typeof(namespace) == "object" && !(namespace instanceof Array)) {
				for (var key in namespace) {
					this.addTestNamespace(namespace[key]);
				}
			}
		},
		
		addTestFunction: function(name, fcn) {
			if (name.charAt(0) != "$") {
				name = "$" + name;
			}
			this.__testFunctions[name] = fcn;
		},
		
		addPollutionCheck: function() {
			var self = this;
			this.addTestFunction("$pollutionCheck", function() {
				self.__pollutionCheck();
			});
		},
		
		addFail: function(functionName, message) {
			this.addTestFunction(functionName, function() {
				fail(message);
			});
		},
		
		exportToJsUnit: function() {
			var names = [];
			for (var testName in this.__testFunctions) {
				names.push(testName);
				window[testName] = this.__testFunctions[testName];
			}
			window.exposeTestFunctionNames = function() {
				return names;
			}
		},
		
		
		__pollutionCheck: function() {
			// ignore test functions
			var testFunctionNames = qx.lang.Object.getKeys(this.____testFunctions)
			qx.lang.Array.append(qx.dev.Pollution.ignore.window, testFunctionNames);

			// ignore JsUnit functions
			qx.lang.Array.append(qx.dev.Pollution.ignore.window, [
				"jsUnitSetOnLoad", "newOnLoadEvent", "jsUnitGetParm", "setJsUnitTracer", "JsUnitException", "parseErrorStack",
				"getStackTrace", "tearDown", "setUp", "assertContains", "assertRoughlyEquals", "assertHashEquals", 
				"assertHTMLEquals", "assertEvaluatesToFalse", "assertEvaluatesToTrue", "assertArrayEquals", "assertObjectEquals",
				"assertNotNaN", "assertNaN", "assertNotUndefined", "assertUndefined", "assertNotNull", "assertNull", 
				"assertNotEquals", "assertEquals", "assertFalse", "assertTrue", "assert", "_assert", "_validateArguments",
				"nonCommentArg", "commentArg", "argumentsIncludeComments", "error", "fail", "_displayStringForValue",
				"_trueTypeOf", "jsUnitFixTop", "isTestPageLoaded", "JSUNIT_VERSION", "standardizeHTML", "isLoaded",
				"getFunctionName", "warn", "info", "inform", "debug", "trim", "push", "pop", "isBlank"
			]);

			// ignore test namespaces

			qx.lang.Array.append(
				qx.dev.Pollution.ignore.window,
				this.__testClassNames.map( function(name) {
					return name.split(".")[0];
				})
			);

			// ignore global functions from this file
			qx.lang.Array.append(qx.dev.Pollution.ignore.window, ["exposeTestFunctionNames"]);

			var pollution = qx.dev.Pollution.extract("window");
			assertEquals(
				qx.io.Json.stringify([]),
				qx.io.Json.stringify(pollution)
			);			
		},
		
		__createTestFunctionWrapper: function(clazz, functionName) {
			return function() {
				( (new clazz()) [functionName]) ();
			}
		}		
	}
}) 