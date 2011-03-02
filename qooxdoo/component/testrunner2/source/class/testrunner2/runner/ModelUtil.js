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
     * Adds a reference to the parent node to each model item. Also adds a
     * getFullName method to each item.
     * 
     * @param model {Object} The model to process
     */
    addParentRefs : function(model)
    {
      var gfn = function() {
        if (this.parent && this.parent.getFullName) {
          return this.parent.getFullName() + "." + this.getName();
        } else {
          return this.getName();
        }
      };
      
      model.getFullName = gfn;
      
      if (model.getChildren) {
        var kids = model.getChildren();
        for (var i=0,l=kids.length; i<l; i++) {
          var child = kids.getItem(i);
          child.parent = model;
          child.getFullName = gfn;
          arguments.callee(child);
        }
      }
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
      
      var found = false;
      for (var i=0,l=obj.children.length; i<l; i++) {
        if (obj.children[i].name === next) {
          found = obj.children[i];
          break;
        }
      }
      
      if (!found) {
        found = {
          name : next
        };
        var type = testrunner2.runner.ModelUtil.getTestItemType(next);
        // getTestItemType will incorrectly return "test" for package names
        // beginning with "test" so we need to check the parent (a test's parent
        // can only be a class)
        if (type === "test" && (!obj.type || obj.type !== "class")) {
          type = "package";
        }
        found.type = type;
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
      if (itemName[0] === itemName[0].toUpperCase()) {
        return "class";
      }
      return "package";
    }
  }
});