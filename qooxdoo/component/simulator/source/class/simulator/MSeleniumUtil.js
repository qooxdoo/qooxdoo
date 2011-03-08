/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Utility functions for Simulator tests.
 */
 
qx.Mixin.define("simulator.MSeleniumUtil", {

  members :
  {
    /**
     * Uses the given locator to search the AUT for a qooxdoo widget. If found,
     * the return value of its toString method is returned. Otherwise, null is 
     * returned.
     * 
     * @param locator {String} (Qx)Selenium locator string
     * @return {String|null} String representation of the widget or null
     */
    getWidgetOrNull : function(locator)
    {
      var snippet = 'selenium.getQxWidgetByLocator("' + locator +'")';
      var widget;
      try {
        widget = String(simulator.QxSelenium.getInstance().getEval(snippet));
      } catch(ex) {
        widget = null;
      }
      return widget;
    },
    
    /**
     * Uses the given locator to search the AUT for a qooxdoo widget. If found,
     * the getter function for the property with the given name is called 
     * and the value is returned. If no widget is found or the property does not
     * exist, null is returned.
     * 
     * @param locator {String} (Qx)Selenium locator string 
     * @param property {String} Name of a qooxdoo property
     * @return {String|null} Property value string or null
     */
    getWidgetPropertyValueOrNull : function(locator, property)
    {
      var propertyName = qx.lang.String.firstUp(property);
      var snippet = 'selenium.getQxObjectFunction("' + locator +'", "get' + propertyName + '")';
      var propertyValue;
      try {
        propertyValue = String(simulator.QxSelenium.getInstance().getEval(snippet));
      } catch(ex) {
        propertyValue = null;
      }
      return propertyValue;
    },
    
    /**
     * Repeatedly tries to find a visible widget using the given locator until
     * the timeout is reached.
     * 
     * @throws an Error if no visible widget is found before the timeout is 
     * reached
     * @param locator {String} (Qx)Selenium locator string
     * @param timeout {Integer?} Timeout in milliseconds. Default: 5000
     */
    waitForWidget : function(locator, timeout)
    {
      locator = locator.replace(/\"/g, '\\"');

      var snippet = '(function() {\
        try {\
          var widget = selenium.getQxWidgetByLocator("' + locator +'");\
        } catch(ex) {\
          return false;\
        }\
        return widget.isVisible();\
      })()';
      
      var timeout = timeout || 5000;
      try {
        simulator.QxSelenium.getInstance().waitForCondition(snippet, timeout.toString());
      }
      catch(ex) {
        if (ex.toString().match(/Timed out after/)) {
          // Use a more meaningful error message
          throw new Error("waitForWidget: No visible widget found for locator " + locator 
          + " in " + timeout + "ms!");
        } else {
          //something else went wrong
          throw ex;
        }
      }
    }
  }
});