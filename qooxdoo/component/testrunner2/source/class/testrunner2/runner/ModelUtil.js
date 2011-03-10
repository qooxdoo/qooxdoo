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
 * Utilities for creating and querying the test (suite) model.
 */

qx.Class.define("testrunner2.runner.ModelUtil", {

  type : "static",
  
  statics :
  {
    
    /**
     * Creates a nested map for the test namespace from the flat list of tests
     * 
     * @param testRep {Object} Test suite object obtained by parsing the JSON 
     * returned by {@link qx.dev.unit.TestLoader:getTestDescriptions}
     * @return {Object} Test suite object
     */
    createModelData : function(testRep)
    {
      var data = {};
      for (var i=0, l=testRep.length; i<l; i++) {
        var nameSpace = testRep[i].classname.split(".");
        var testList = testRep[i].tests;
        for (var x=0,y=testList.length; x<y; x++) {
          testrunner2.runner.ModelUtil.addChainToMap(nameSpace.concat(testList[x]), data);
        }
      }
      return data;
    },
    
    
    /**
     * Recursively searches a model for all items with a given property/value
     * combination
     * 
     * @param model {Object} The test model to search
     * @param property {String} Property name
     * @param value {var} Property value
     * @return {Object[]} Array of matching model items
     */
    getItemsByProperty : function(model, property, value)
    {
      var propertyName = qx.lang.String.firstUp(property);
      var testList = [];
      if (model["get" + propertyName] && model["get" + propertyName]() === value) {
        testList.push(model);
      }
      
      if (!model.getChildren) {
        return testList;
      }
      
      var kids = model.getChildren();
      for (var i=0,l=kids.length; i<l; i++) {
        var child = kids.getItem(i);
        testList = testList.concat(arguments.callee(child, property, value));
      }
      return testList;
    },
    
    
    /**
     * Finds a model item by its full path name
     * 
     * @param model {Object} The test model to search
     * @param fullName {String} The item's name
     * @return {Object|null} The matching item or null if there is no match
     */
    getItemByFullName : function(model, fullName)
    {
      if (model.getFullName() == fullName) {
        return model;
      }
      if (model.getChildren) {
        var kids = model.getChildren();
        for (var i=0,l=kids.length; i<l; i++) {
          var child = kids.getItem(i);
          var found = arguments.callee(child, fullName);
          if (found) {
            return found;
          }
        }
      }
      return null;
    },
    
    
    /**
     * Adds additional data fields to the model items:
     * parent : reference to the parent item
     * getFullName : see {@link #getFullName}
     * getMessage : see {@link #getMessage}
     * getStackTrace : see {@link #getStackTrace}
     * 
     * @param model {Object} The model to process
     */
    addDataFields : function(model)
    {
      model.getFullName = testrunner2.runner.ModelUtil.getFullName;
      
      model.$$test = model
      model.getModel = function() {
        return this.$$test;
      }
      
      if (model.getChildren) {
        var kids = model.getChildren();
        kids.sort(testrunner2.runner.ModelUtil.itemSorter);
        for (var i=0,l=kids.length; i<l; i++) {
          var child = kids.getItem(i);
          child.parent = model;
          if (child.getType() == "test") {
            child.getMessage = testrunner2.runner.ModelUtil.getMessage;
            child.getStackTrace = testrunner2.runner.ModelUtil.getStackTrace;
          }
          arguments.callee(child);
          
          child.bind("state", model, "state", {
            converter : function(data, model) {
              if (model.getState() == "failure" || model.getState() == "error"
                || data == "start" || data == "wait") {
                return model.getState();
              }
              return data;
            }
          });
        }
      }
    },
    
    
    /**
     * Compare function for test model items
     * 
     * @param aItem {} First item
     * @param bItem {} Second item
     * @return {Integer} Comparison result
     */
    itemSorter : function(aItem, bItem)
    {
      var a = aItem.getName();
      var b = bItem.getName();
      if (a < b) { 
        return -1; 
      }
      if (a > b ) {
        return 1;
      } 
      return 0;
    },
    
    
    /**
     * Recursively dispose the entire model
     * 
     * @param model {Object} The model
     */
    disposeModel : function(model)
    {
      if (model.getChildren) {
        var kids = model.getChildren();
        for (var i=0,l=kids.length; i<l; i++) {
          var child = kids.getItem(i);
          arguments.callee(child);
        }
      }
      model.dispose();
    },
    
    
    /**
     * Adds nested keys to a map, e.g.: addChainToMap(["foo", "bar", "baz"], {})
     * creates the following structure:
     * {
     *   "foo" :
     *   {
     *     "bar" :
     *     {
     *       "baz" : {}
     *     }
     *   }
     * }
     * 
     * @param nsArr {String[]} Array of key names
     * @param obj {Map} The initial map
     */
    addChainToMap : function(nsArr, obj)
    {
      if (nsArr.length == 0) {
        return;
      }
      
      var list = nsArr.concat();
      var next = list.shift();
      
      if (!obj.children) {
        obj.children = [];
      }
      
      if (!obj.state) {
        obj.state = "start";
      }
      
      var found = false;
      for (var i=0,l=obj.children.length; i<l; i++) {
        if (obj.children[i].name === next) {
          found = obj.children[i];
          break;
        }
      }
      
      if (!found) {
        found = {
          name : next,
          state : "start"
        };
        var type = testrunner2.runner.ModelUtil.getTestItemType(next);
        // getTestItemType will incorrectly return "test" for package names
        // beginning with "test" so we need to check the parent (a test's parent
        // can only be a class)
        if (type === "test" && (!obj.type || obj.type !== "class")) {
          type = "package";
        }
        found.type = type;
        if (type === "test") {
          found.exceptions = null;
        }
        obj.children.push(found);
      }
      
      arguments.callee(list, found);
    },
    
    
    /**
     * Tries to determine the type of a test suite item by its name
     * 
     * @param itemName {String} The item's name
     * @return {String} One of "package", "class", "test"
     */
    getTestItemType : function(itemName)
    {
      if (itemName.indexOf("test") === 0 && itemName.length > 4 ) {
        return "test";
      }
      if (itemName.substr(0,1) === itemName.substr(0,1).toUpperCase()) {
        return "class";
      }
      return "package";
    },
    
    
    /**
     * Returns the fully qualified name of a model item, e.g. 
     * "someApp.test.foo.Bar:testBaz"
     * 
     * @return {String} The item's fully qualified name
     */
    getFullName : function()
    {
      if (this.parent && this.parent.getFullName) {
        var separator = ".";
        if (!this.getChildren) {
          separator = ":";
        }
        return this.parent.getFullName() + separator + this.getName();
      } else {
        return this.getName();
      }
    },
    
    
    /**
     * Returns the following sibling of a given model item or null if there isn't
     * one.
     * 
     * @param node {Object} Model node
     * @return {Object|null} Following sibling
     */
    getNextSiblingOf : function(node)
    {
      if (!node.parent) {
        return null;
      }
      var siblings = node.parent.getChildren();
      if (!siblings) {
        return null;
      }
      var index = siblings.indexOf(node);
      if (index < siblings.length - 1) {
        return siblings.getItem(index + 1);
      }
      return null;
    },
    
    
    /**
     * Serializes and returns any exceptions caught during the test's execution
     * 
     * @return {String} Exceptions
     */
    getMessage : qx.core.Variant.select("qx.client",
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
    }
  }
});