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

qx.Class.define("testrunner.runner.ModelUtil", {

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
        testList.sort();
        for (var x=0,y=testList.length; x<y; x++) {
          testrunner.runner.ModelUtil.addChainToMap(nameSpace.concat(testList[x]), data);
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
      if (model.fullName == fullName) {
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
     *
     * @param model {Object} The model to process
     */
    addDataFields : function(model)
    {
      if (!model.parent) {
        model.fullName = model.getName();
      }

      if (model.getChildren) {
        var mType = model.getType();
        if (mType == "package" || mType == "class" ) {
          model.sortChildren();
        }
        var kids = model.getChildren();
        for (var i=0,l=kids.length; i<l; i++) {
          var child = kids.getItem(i);
          child.parent = model;

          if (child.getType() == "test") {
            child.fullName = model.fullName + ":" + child.getName();
          }
          else {
            child.fullName = model.fullName + "." + child.getName();
          }

          arguments.callee(child);

          // skip binding the children's state to the parent in old IEs to
          // accelerate application startup
          if (!(qx.core.Environment.get("browser.name") === "ie"
              && qx.core.Environment.get("browser.version") < 9)) {
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
        obj.children.push(found);
      }

      arguments.callee(list, found);
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
    }
  }
});