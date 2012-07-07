/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * Common superclass for test suite model items
 */

qx.Class.define("testrunner.runner.TestItem", {

  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);
    this.$$test = this;
  },

  properties :
  {
    /** The item's state. The state of a parent item reflects its children:
     *  If one or more children have "error" or "failure" states, so will the
     *  parent.
     */
    state :
    {
      init : "start",
      event : "changeState",
      apply : "_applyState"
    },

    /**
     * The item's previous state. This is used to preserve the correct state value
     * for asynchronous tests that have an intermediate "wait" value.
     */
    previousState :
    {
      nullable : true,
      init : null
    },

    /**
     * Any exceptions caught during a test's execution.
     */
    exceptions :
    {
      init : [],
      nullable : true,
      event : "changeExceptions"
    }
  },

  statics :
  {
    /**
     * Compare function for test model items.
     *
     * @param aItem {testrunner.runner.TestItem} First item
     * @param bItem {testrunner.runner.TestItem} Second item
     * @return {Integer} Comparison result
     */
    sortFunction : function(aItem, bItem)
    {
      var aType = aItem.getType();
      var bType = bItem.getType();
      // always sort packages before classes
      if (aType == "package" && bType == "class") {
        return -1;
      }
      if (aType == "class" && bType == "package") {
        return 1;
      }

      var a = aItem.getName();
      var b = bItem.getName();
      if (a < b) {
        return -1;
      }
      if (a > b ) {
        return 1;
      }
      return 0;
    }
  },

  members :
  {
    /**
     * Returns this instance. Workaround needed to bind each child item's state
     * to the parent's.
     *
     * @return {Object} This model object
     */
    getModel : function() {
      return this.$$test;
    },

    /**
     * Returns the fully qualified name of a model item, e.g.
     * "someApp.test.foo.Bar:testBaz"
     *
     * @return {String} The item's fully qualified name
     */
    getFullName : function()
    {
      return this.fullName;
    },


    /**
     * Return the item's type ("package", "class" or "test")
     *
     * @return {String} The item's type
     */
    getType : function()
    {
      var itemName = this.getName();

      if (itemName.indexOf("test") === 0 && itemName.length > 4) {
        // ugly workaround for packages with names beginning with "test"
        if (this.getChildren) {
          return "package";
        }
        return "test";
      }
      if (itemName.substr(0,1) === itemName.substr(0,1).toUpperCase()) {
        return "class";
      }
      return "package";
    },


    /**
     * Sorts the item's children. Packages are always listed before classes.
     */
    sortChildren : function()
    {
      this.getChildren().sort(testrunner.runner.TestItem.sortFunction);
    },


    /**
     * Serializes and returns any exceptions caught during the test's execution
     *
     * @return {String} Exceptions
     */
    getMessage : qx.core.Environment.select("engine.name",
    {
      "default" : function()
      {
        if (this.getExceptions() && this.getExceptions().length > 0) {
          var exceptions = this.getExceptions();
          var message = "";
          for (var i=0,l=exceptions.length; i<l; i++) {
            message += exceptions[i].exception.toString() + " ";
          }
          return message;
        } else {
          return "";
        }
      },

      "opera" : function()
      {
        if (this.getExceptions() && this.getExceptions().length > 0) {
          var exceptions = this.getExceptions();
          var message = "";
          for (var i=0,l=exceptions.length; i<l; i++) {
            var msg = exceptions[i].exception.message + "";
            if (msg.indexOf("Backtrace:") < 0) {
              message += exceptions[i].exception.toString();
            } else {
              message += qx.lang.String.trim(msg.split("Backtrace:")[0]);
            }
          }
          return message;
        }
        else
        {
          return "";
        }
      }
    }),


    /**
     * Returns stack trace information for a given exception.
     *
     * @param ex {Error} Exception
     * @return {String} Stack trace information
     */
    getStackTrace : function(ex)
    {
      var trace = [];

      if (typeof (ex.getStackTrace) == "function") {
        trace = ex.getStackTrace();
      } else {
        trace = qx.dev.StackTrace.getStackTraceFromError(ex);
      }

      // filter Test Runner functions from the stack trace
      while (trace.length > 0)
      {
        var first = trace[0];

        if (first.indexOf("qx.dev.unit.AssertionError") == 0 || first.indexOf("qx.Class") == 0 || first.indexOf("qx.dev.unit.MAssert") == 0 || first.indexOf("script") == 0) {
          trace.shift();
        } else {
          break;
        }
      }

      return trace.join("<br>");
    },


    /**
     * Save the previous value when the state changes
     *
     * @param newState {String} New state value
     * @param oldState {String} Previous state value
     */
    _applyState : function(newState, oldState) {
      if (oldState) {
        this.setPreviousState(oldState);
      }
    }
  }
});