qx.log.Logger.getClassLogger(qx.core.Init).setMinLevel(qx.log.Logger.LEVEL_ERROR);

qx.log.Logger.ROOT_LOGGER.removeAllAppenders();
qx.log.Logger.ROOT_LOGGER.addAppender(new qx.log.FireBugAppender());
qx.log.Logger.ROOT_LOGGER.addAppender(new qx.log.JsUnitAppender());


function setupQooxdooTests(testClassName) {
	setupQooxdooTests.testClassNames.push(testClassName);
	var evalClass = eval(testClassName);
	setupQooxdooTests.testClasses.push(evalClass);

	if (qx.Clazz.isSubClassOf(evalClass, qxunit.TestCase))
	{
		for (var test in evalClass.prototype) {
			if (evalClass.prototype.hasOwnProperty(test)) {
	            if (typeof(evalClass.prototype[test]) == "function" && test.indexOf("test") == 0) {
					var testFunctionName = "$test_" + testClassName.replace(".", "_") + "_" + test;
					eval(testFunctionName + " = function() { (new " + testClassName +"())['"+test+"']() }");
					setupQooxdooTests.tests.push(testFunctionName);
				}
			}
		}
	}
	else
	{
	    for (var test in evalClass) {
			if (evalClass.hasOwnProperty(test)) {
	            if (typeof(evalClass[test]) == "function" && test.indexOf("test") == 0) {
					var testFunctionName = "$test_" + testClassName.replace(".", "_") + "_" + test;
	                eval(testFunctionName + "="+testClassName+"."+test);
	                setupQooxdooTests.tests.push(testFunctionName);
	            }
	        }
	    }
	}
};

setupQooxdooTests.tests = ["$testExist"];
setupQooxdooTests.tests_post = ["$testPollution"];
setupQooxdooTests.testClasses = [];
setupQooxdooTests.testClassNames = [];

exposeTestFunctionNames = function() {
	var ret = qx.lang.Array.clone(setupQooxdooTests.tests);
	return qx.lang.Array.append(ret, setupQooxdooTests.tests_post);
}

$testExist = function() {
	var classes = setupQooxdooTests.testClasses
	for (var i=0; i<classes.length; i++) {
    	assertNotUndefined("The test class '" + setupQooxdooTests.testClassNames[i] + "' is undefined!", classes[i]);
	}
}

$testPollution = function() {
	// ignore test functions
	qx.lang.Array.append(qx.dev.Pollution.ignore.window, exposeTestFunctionNames());
	
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
		setupQooxdooTests.testClassNames.map( function(name) {
			return name.split(".")[0];
		})
	);
	
	// ignore global functions from this file
	qx.lang.Array.append(qx.dev.Pollution.ignore.window, [
		"setupQooxdooTests", "exposeTestFunctionNames"
	]);
		
	var pollution = qx.dev.Pollution.extract("window");
	assertEquals(
		qx.io.Json.stringify([]),
		qx.io.Json.stringify(pollution)
	);
}



if (
	(window.JSUNIT_VERSION == undefined) ||
	(window.top.JsUnitTestManager == undefined)
) {
	assert = assertTrue = assertFalse = assertEquals = assertNotEquals =
    assertNull = assertNotNull = assertUndefined = assertNotUndefined =
    assertNaN = assertNotNaN = fail = function() {};

	var oldHandler = window.onload || function() {};
	window.onload = function() {
		oldHandler();
  		var tests = exposeTestFunctionNames();
		for (var i=0; i<tests.length; i++) {
			window[tests[i]]();
		}
	}
}
