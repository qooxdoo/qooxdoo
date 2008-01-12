/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("testrunner.TestSuite",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(testClassOrNamespace)
  {
    this.base(arguments);

    // qx.log.Logger.ROOT_LOGGER.removeAllAppenders();
    this.__tests = [];

    if (testClassOrNamespace) {
      this.add(testClassOrNamespace);
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @param testClassOrNamespace {var} TODOC
     * @return {void}
     */
    add : function(testClassOrNamespace)
    {
      if (typeof (testClassOrNamespace) == "string")
      {
        var evalTestClassOrNamespace = eval(testClassOrNamespace);

        if (!evalTestClassOrNamespace) {
          this.addFail(testClassOrNamespace, "The class/namespace '" + testClassOrNamespace + "' is undefined!");
        }

        testClassOrNamespace = evalTestClassOrNamespace;
      }

      if (typeof (testClassOrNamespace) == "function") {
        this.addTestClass(testClassOrNamespace);
      } else if (typeof (testClassOrNamespace) == "object") {
        this.addTestNamespace(testClassOrNamespace);
      }
      else
      {
        this.addFail("exsitsCheck", "Unkown test class '" + testClassOrNamespace + "'!");
        return;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param namespace {var} TODOC
     * @return {void}
     */
    addTestNamespace : function(namespace)
    {
      if (typeof (namespace) == "function" && namespace.classname)
      {
        if (qx.Class.isSubClassOf(namespace, testrunner.TestCase))
        {
          this.addTestClass(namespace);
          return;
        }
      }
      else if (typeof (namespace) == "object" && !(namespace instanceof Array))
      {
        for (var key in namespace) {
          this.addTestNamespace(namespace[key]);
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param name {var} TODOC
     * @param fcn {var} TODOC
     * @return {void}
     */
    addTestFunction : function(name, fcn) {
      this.__tests.push(new testrunner.TestFunction(null, name, fcn));
    },


    /**
     * TODOC
     *
     * @type member
     * @param clazz {var} TODOC
     * @param functionName {var} TODOC
     * @return {void}
     */
    addTestMethod : function(clazz, functionName) {
      this.__tests.push(new testrunner.TestFunction(clazz, functionName));
    },


    /**
     * TODOC
     *
     * @type member
     * @param clazz {var} TODOC
     * @return {void}
     */
    addTestClass : function(clazz) {
      this.__tests.push(new testrunner.TestClass(clazz));
    },


    /**
     * TODOC
     *
     * @type member
     * @param functionName {var} TODOC
     * @param message {var} TODOC
     * @return {void}
     */
    addFail : function(functionName, message)
    {
      this.addTestFunction(functionName, function() {
        fail(message);
      });
    },


    /**
     * TODOC
     *
     * @type member
     * @param testResult {var} TODOC
     * @return {void}
     */
    run : function(testResult)
    {
      for (var i=0; i<this.__tests.length; i++) {
        (this.__tests[i]).run(testResult);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getTestClasses : function()
    {
      var classes = [];

      for (var i=0; i<this.__tests.length; i++)
      {
        var test = this.__tests[i];

        if (test instanceof testrunner.TestClass) {
          classes.push(test);
        }
      }

      return classes;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getTestMethods : function()
    {
      var methods = [];

      for (var i=0; i<this.__tests.length; i++)
      {
        var test = this.__tests[i];

        if (test instanceof testrunner.TestFunction) {
          methods.push(test);
        }
      }

      return methods;
    },


    /**
     * currently not working
     *
     * @type member
     * @return {void}
     */
    addPollutionCheck : function() {},

    // this.addTestFunction("$pollutionCheck", qx.lang.Function.bind(this.__pollutionCheck, this));
    /**
     * currently not working !!!
     *
     * @type member
     * @return {void}
     */
    __pollutionCheck : function()
    {
      // ignore test functions
      var testFunctionNames = qx.lang.Object.getKeys(this.__tests);
      qx.lang.Array.append(qx.dev.Pollution.ignore.window, testFunctionNames);

      // ignore JsUnit functions
      qx.lang.Array.append(qx.dev.Pollution.ignore.window, [ "jsUnitSetOnLoad", "newOnLoadEvent", "jsUnitGetParm", "setJsUnitTracer", "JsUnitException", "parseErrorStack", "getStackTrace", "tearDown", "setUp", "assertContains", "assertRoughlyEquals", "assertHashEquals", "assertHTMLEquals", "assertEvaluatesToFalse", "assertEvaluatesToTrue", "assertArrayEquals", "assertObjectEquals", "assertNotNaN", "assertNaN", "assertNotUndefined", "assertUndefined", "assertNotNull", "assertNull", "assertNotEquals", "assertEquals", "assertFalse", "assertTrue", "assert", "_assert", "_validateArguments", "nonCommentArg", "commentArg", "argumentsIncludeComments", "error", "fail", "_displayStringForValue", "_trueTypeOf", "jsUnitFixTop", "isTestPageLoaded", "JSUNIT_VERSION", "standardizeHTML", "isLoaded", "getFunctionName", "warn", "info", "inform", "debug", "trim", "push", "pop", "isBlank" ]);

      // ignore test namespaces
      qx.lang.Array.append(qx.dev.Pollution.ignore.window, this.__testClassNames.map(function(name) {
        return name.split(".")[0];
      }));

      // ignore global functions from this file
      qx.lang.Array.append(qx.dev.Pollution.ignore.window, [ "exposeTestFunctionNames" ]);

      var pollution = qx.dev.Pollution.extract("window");
      new testrunner.TestCase().assertJsonEquals([], pollution);
    }
  }
});
