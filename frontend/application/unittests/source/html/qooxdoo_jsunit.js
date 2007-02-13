//qx.log.Logger.getClassLogger(qx.core.Init).setMinLevel(qx.log.Logger.LEVEL_ERROR);
//qx.log.Logger.getClassLogger(qx.component.init.InterfaceInitComponent).setMinLevel(qx.log.Logger.LEVEL_ERROR);

qx.log.Logger.ROOT_LOGGER.removeAllAppenders();
qx.log.Logger.ROOT_LOGGER.addAppender(new qx.log.FireBugAppender());
qx.log.Logger.ROOT_LOGGER.addAppender(new qx.log.JsUnitAppender());


function setupQooxdooTests(testClassName) {
	var evalClass = eval(testClassName);
	setupQooxdooTests.testClasses.push(evalClass);
	
    for (var test in evalClass) {
		if (evalClass.hasOwnProperty(test)) {
            if (typeof(evalClass[test]) == "function" && test.indexOf("test") == 0) {
                eval("$" + test + "="+testClassName+"."+test);
                setupQooxdooTests.tests.push("$" + test);
            }
        }
    }
};

setupQooxdooTests.tests = ["testExist"];
setupQooxdooTests.testClasses = [];

exposeTestFunctionNames = function() {
	return setupQooxdooTests.tests;
}

testExist = function() {
	var classes = setupQooxdooTests.testClasses
	for (var i=0; i<classes.length; i++) {
    	assertNotUndefined(classes[i]);
	}
}

if (window.JSUNIT_VERSION == undefined || window.top.JSUNIT_VERSION == undefined) {
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