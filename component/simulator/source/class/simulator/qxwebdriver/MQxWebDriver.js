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
#ignore(simulator.webdriver.promise.Application)
************************************************************************ */

/**
 * qooxdoo-specific extension methods added to webdriver.WebDriver
 */
qx.Mixin.define("simulator.qxwebdriver.MQxWebDriver", {

  members :
  {
    /**
     * Returns a WebElement representing a qooxdoo widget.
     * In addition to the standard WebElement methods, interaction
     * methods specific to the interfaces implemented by the widget
     * will be available, e.g. {@link simulator.webdriver.interactions.Form.selectItem}
     * for qx.ui.form.SelectBox or widgets inheriting from it.
     *
     * @param locator {webdriver.Locator} locator strategy to search for a widget's
     * DOM element
     * @return {webdriver.WebElement} WebElement object
     */
    findWidget : function(locator)
    {
      var driver = this;
      var app = simulator.webdriver.promise.Application.getInstance();
      return app.schedule("findQxWidget", function() {
        var element = driver.findElement(locator);
        return driver.addQxBehavior(element);
      });
    },

    /**
     * Adds widget-specific interactions to a WebElement
     *
     * @param element {webdriver.WebElement} WebElement representing a
     * qooxdoo widget's DOM element
     */
    addQxBehavior : function(element)
    {
      var driver = this;
      return driver.executeScript(simulator.qxwebdriver.Util.getInterfacesByElement, element)
      .then(function(iFaces) {
        driver.executeScript(simulator.qxwebdriver.Util.getClassHierarchy, element)
        .then(function(hierarchy) {
          hierarchy.reverse();
          iFaces = hierarchy.concat(iFaces);
          simulator.qxwebdriver.Util.addInteractions(iFaces, element);
        });

        // Store the widget's qx object registry id
        var script = "return qx.ui.core.Widget.getWidgetByElement(arguments[0]).toHashCode()";
        return driver.executeScript(script, element)
        .then(function(hash) {
          element.qxHash = hash;
          return element;
        });
      });
    },

    /**
     * Wait until the qooxdoo application under test is initialized
     * @param timeout {Integer} Time to wait in ms
     * @return {webdriver.promise.Promise} A promise that will be resolved when
     * the qx application is ready
     */
    waitForQxApplication : function(timeout)
    {
      var driver = this;
      return driver.wait(function() {
        var ready = false;
        var isQxReady = function() {
          try {
            var $qx = qx;
            return !!$qx.core.Init.getApplication();
          } catch(ex) {
            return false;
          }
        };
        ready = driver.executeScript(isQxReady);
        return ready;
      }, timeout || 5000);
    },

    /**
     * Initialize this QxWebDriver instance
     *
     * @return {webdriver.promise.Promise} At promise that will be resolved
     * when initialization is done
     */
    init : function()
    {
      return this.defineFunction(simulator.qxwebdriver.Util.toSafeValue, "toSafeValue");
    },

    /**
     * Defines a JavaScript function that will be available in the AUT's
     * context. See the documentation of webdriver.WebDriver.executeScript
     * for details on capabilities and limitations.
     *
     * Use {@link executeFunction} to call the function.
     *
     * @param func {Function} Function object
     * @param name {String} function name
     * @return {webdriver.promise.Promise} A promise that will be resolved
     * when the function has been defined
     */
    defineFunction : function(func, name)
    {
      var script = 'if (!window.qxwebdriver) { window.qxwebdriver = {}; }' +
        'if (!window.qxwebdriver.util) { window.qxwebdriver.util = {}; }' +
        'window.qxwebdriver.util["' + name + '"] = ' + func;
      return this.executeScript(script);
    },

    /**
     * Executes a function defined by {@link defineFunction}.
     *
     * @param name {String} The function's name
     * @param args {Array} Array of arguments for the function
     * @return {webdriver.promise.Promise} A promise that will resolve to
     * the function call's return value
     */
    executeFunction : function(name, args)
    {
      var script = 'return window.qxwebdriver.util["' + name + '"]' +
        '.apply(window, arguments[0])';
      return this.executeScript(script, args);
    }
  }

});