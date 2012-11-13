/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Author:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/* ************************************************************************
#ignore(qx.ui.core.Widget)
************************************************************************ */

/**
 * QxWebDriver utilities
 */
qx.Class.define("simulator.qxwebdriver.Util", {

  statics : {

    /**
     * Takes any value and converts it so it can be safely returned by
     * webdriver.executeScript:
     * - Primitive values will be returned as-is
     * - qx Widgets will be replaced with their DOM content elements
     *   (if available)
     * - qx Objects (including Widgets without DOM elements) will be
     *   replaced with their string representation
     * - The values of Arrays and Objects will be converted recursively
     *   as above
     *
     * @param val {var} Value to convert
     * @return {val} The converted value
     */
    toSafeValue : function(val)
    {
      var value = arguments[0];
      var retVal;
      var self;
      var type = typeof value;
      if (type == "string" || type == "number" || type == "boolean" ||
          type == "undefined" || value === null)
      {
        return value;
      }

      if (value instanceof qx.core.Object) {
        if (typeof value.getContentElement === "function") {
          var contentElem = value.getContentElement();
          if (contentElem && typeof contentElem.getDomElement == "function") {
            var domElem = contentElem.getDomElement();
            if (domElem) {
              return domElem;
            }
          }
        }
        return value.toString();
      }

      if (value instanceof Array) {
        retVal = [];
        self = arguments.callee;
        value.forEach(function(item) {
          retVal.push(self(item));
        });
        return retVal;
      }

      if (value instanceof Object) {
        retVal = {};
        self = arguments.callee;
        for (var key in value) {
          retVal[key] = self(value[key]);
        }
        return retVal;
      }

      return value.toString();
    },

    /**
     * Converts a function to a string so that it can be used
     * with webdriver.WebDriver.executeScript
     * @param func {Function} function to convert
     * @param replacements {Map} Map of strings to be replaced with
     * computed values
     * @return {String} Serialized function
     */
    functionToString : function(func, replacements)
    {
      var str = func.toString();
      for (var key in replacements) {
        str = str.replace(new RegExp(key, "g"), replacements[key]);
      }
      return str;
    },

    /**
     * Add qooxdoo-specific interactions to a WebElement
     * @param iFaces {String[]} List of class names
     * @param element {webdriver.WebElement} WebElement to be enhanced
     */
    addInteractions : function(iFaces, element) {
      var interactions = simulator.qxwebdriver.Interaction.getInteractions();
      iFaces.forEach(function(iFace, i) {
        if (interactions[iFace]) {
          for (var method in interactions[iFace]) {
            //console.log("adding method", method, "interface", iFace);
            if (typeof element[method] !== "undefined") {
              console.log("Warning: Overriding existing interaction '" + method +
                '" with implementation for "' + iFace + '"');
            }
            element[method] = interactions[iFace][method].bind(element);
          }
        }
      });
    },

    /**
     * Returns the names of any interfaces implemented by the qooxdoo
     * widget associated with a given DOM element
     * @return {String[]} List of interface names
     */
    getInterfacesByElement : function() {
      var widget = qx.ui.core.Widget.getWidgetByElement(arguments[0]);
      var clazz = widget.constructor;
      var iFaces = [];
      qx.Class.getInterfaces(clazz).forEach(function(item, i) {
        iFaces.push(/\[Interface (.*?)\]/.exec(item.toString())[1]);
      });
      return iFaces;
    },

    /**
     * Returns a list of interfaces implemented by a given object
     * @return {String[]} List of interface names
     */
    getInterfaces : function() {
      var clazz = arguments[0].constructor;
      var iFaces = [];
      qx.Class.getInterfaces(clazz).forEach(function(item, i) {
        iFaces.push(/\[Interface (.*?)\]/.exec(item.toString())[1]);
      });
      return iFaces;
    },

    /**
     * Returns the inheritance hierarchy of the qooxdoo widget
     * associated with the given DOM element
     * @return {String[]} List of superclass names
     */
    getClassHierarchy : function()
    {
      var widget = qx.ui.core.Widget.getWidgetByElement(arguments[0]);
      var hierarchy = [];
      var clazz = widget.constructor;
      while (clazz && clazz.classname) {
        hierarchy.push(clazz.classname);
        clazz = clazz.superclass;
      }
      return hierarchy;
    },

    /**
     * Returns the labels of a widget's model items.
     * @return {Array} List of model item labels
     */
    getModelItemLabels : function()
    {
      var labels = [];
      var widget = qx.core.ObjectRegistry.fromHashCode('QXHASH');
      var model = widget.getModel();
      var labelPath = widget.getLabelPath();
      for (var i=0, l= model.length; i<l; i++) {
        var label;
        var item = model.getItem(i);
        if (item instanceof qx.core.Object && labelPath) {
          label = qx.data.SingleValueBinding.resolvePropertyChain(item, labelPath);
        }
        else {
          label = item.toString();
        }
        labels.push(label);
      }
      return labels;
    }
  }

});
