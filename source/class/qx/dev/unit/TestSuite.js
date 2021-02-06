/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A TestSuite is a collection of test functions, classes and other test suites,
 * which should be run together.
 */
qx.Class.define("qx.dev.unit.TestSuite",
{
  extend : qx.dev.unit.AbstractTestSuite,


  /**
   * @param testClassOrNamespace {var} Either a string with the name of the test
   *    class or test namespace or a reference to the test class or namespace.
   *    All test in the given class/namespace will be added to the suite.
   */
  construct : function(testClassOrNamespace)
  {
    this.base(arguments);

    this._tests = [];

    if (testClassOrNamespace) {
      this.add(testClassOrNamespace);
    }
  },


  members :
  {
    /**
     * Add a test class or namespace to the suite
     *
     * @lint ignoreDeprecated(alert, eval)
     *
     * @param testClassOrNamespace {var} Either a string with the name of the test
     *    class or test namespace or a reference to the test class or namespace.
     *    All test in the given class/namespace will be added to the suite.
     */
    add : function(testClassOrNamespace)
    {
      // This try-block is needed to avoid errors (e.g. "too much recursion")
//      try
//      {
        if (qx.lang.Type.isString(testClassOrNamespace))
        {
          var evalTestClassOrNamespace = window.eval(testClassOrNamespace);

          if (!evalTestClassOrNamespace) {
            this.addFail(testClassOrNamespace, "The class/namespace '" + testClassOrNamespace + "' is undefined!");
          }

          testClassOrNamespace = evalTestClassOrNamespace;
        }

        if (qx.lang.Type.isFunction(testClassOrNamespace)) {
          this.addTestClass(testClassOrNamespace);
        } else if (qx.lang.Type.isObject(testClassOrNamespace)) {
          this.addTestNamespace(testClassOrNamespace);
        }
        else
        {
          this.addFail("existsCheck", "Unknown test class '" + testClassOrNamespace + "'!");
          return;
        }
//      }
//      catch (ex)
//      {
//        window.alert("An error occurred while adding test classes/namespaces\nPlease try a different test file.");
//      }
    },


    /**
     * Add all tests from the given namespace to the suite
     *
     * @param namespace {Object} The topmost namespace of the tests classes to add.
     */
    addTestNamespace : function(namespace)
    {
      if (qx.lang.Type.isFunction(namespace) && namespace.classname)
      {
        if (qx.Class.isSubClassOf(namespace, qx.dev.unit.TestCase))
        {
          if (namespace.$$classtype !== "abstract") {
            this.addTestClass(namespace);
          }
          return;
        }
      }
      else if (qx.lang.Type.isObject(namespace) && !(namespace instanceof Array))
      {
        for (var key in namespace) {
          this.addTestNamespace(namespace[key]);
        }
      }
    },


    /**
     * Add a test class to the suite
     *
     * @param clazz {Class} The test class to add
     */
    addTestClass : function(clazz) {
      this._tests.push(new qx.dev.unit.TestClass(clazz));
    },


    /**
     * Get a list of all test classes in the suite
     *
     * @return {Class[]} A list of all test classes in the suite
     */
    getTestClasses : function()
    {
      var classes = [];

      for (var i=0; i<this._tests.length; i++)
      {
        var test = this._tests[i];

        if (test instanceof qx.dev.unit.TestClass) {
          classes.push(test);
        }
      }

      return classes;
    }
  }
});
