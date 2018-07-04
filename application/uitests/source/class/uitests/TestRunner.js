/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2018 Zenesis Ltd, john.spackman@zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (johnspackman)

************************************************************************ */

/**
 * Helper class for running unit tests outside of teh "real" testrunner
 */
qx.Class.define("uitests.TestRunner", {
  extend: qx.core.Object,

  statics: {
    /**
     * Runs tests in a class
     *
     * @param clazz {qx.Class} the unit test class
     * @param methodNames {String[]?} method names, if not provided then all methods are run
     * @param cb {Function} called when all tests are complete
     * @param context {?} context for `cb`
     */
    runAll: function(clazz, methodNames, cb, context) {
      if (typeof methodNames === "function") {
        context = cb;
        cb = methodNames;
        methodNames = null;
      }
      if (cb && context)
        cb = cb.bind(context);
      if (typeof methodNames === "string")
        methodNames = [methodNames];
      if (!methodNames) {
        methodNames = [];
        Object.keys(clazz.prototype).forEach(function(name) {
          if (name.length < 5 || !name.startsWith("test") || name.substring(4, 5) !== name.substring(4, 5).toUpperCase())
            return;
          methodNames.push(name);
        });
      }

      var obj = new clazz();
      var index = -1;
      function next() {
        if (++index >= methodNames.length) {
          console.log("Finished all tests");
          cb && cb(null);
          return;
        }
        var methodName = methodNames[index];
        var fn = obj[methodName];
        obj.setTestResult({
          run: function() {
            setTimeout(next, 1);
          }
        });
        try {
          console.log("Starting " + methodName);
          fn.call(obj);
          setTimeout(next, 1);
        } catch(ex) {
          if (!(ex instanceof qx.dev.unit.AsyncWrapper)) {
            console.log("Error in " + methodName + ": " + ex);
            cb && cb(ex);
          }
        }
      }
      next();
    }

  }
});

