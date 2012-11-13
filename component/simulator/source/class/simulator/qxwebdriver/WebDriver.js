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
#ignore(simulator.webdriver)
#ignore(simulator.webdriver.*)
************************************************************************ */

/**
 * A WebDriver client with support for qx.Desktop applications.
 *
 * The most important interface for test authors is {@link #findWidget}, which
 * is called with a Locator parameter just like WebDriver.findElement and also
 * returns a webdriver.WebElement.
 * If the locator finds a DOM element that is part of a qooxdoo widget, special
 * methods called 'interactions' will be added to the returned WebElement.
 * @lint ignoreUndefined(simulator.webdriver.WebDriver)
 *
 */
qx.Class.define("simulator.qxwebdriver.WebDriver",
{
  extend : simulator.webdriver.WebDriver,

  /**
   * @param session {webdriver.Session|webdriver.promise.Promise} Either a
   * known session or a promise that will be resolved to a session.
   * @param executor {webdriver.CommandExecutor} The executor to use when
   * sending commands to the browser.
   * @lint ignoreUndefined(simulator.webdriver.WebDriver)
   */
  construct : function(session, executor)
  {
    simulator.webdriver.WebDriver.call(this, session, executor);
  },

  statics :
  {
    /** Default timeout value for {@link #waitForQxApplication} */
    AUT_LOAD_TIMEOUT : 10000,

    /**
     * Creates a new WebDriver client for an existing session.
     * @param executor {webdriver.CommandExecutor} Command executor to use when
     * querying for session details.
     * @param sessionId {String} ID of the session to attach to.
     * @return {simulator.qxwebdriver.WebDriver} A new client for the specified session.
     * @lint ignoreUndefined(simulator.webdriver.Command)
     * @lint ignoreUndefined(simulator.webdriver.CommandName)
     */
    attachToSession : function(executor, sessionId) {
      return simulator.qxwebdriver.WebDriver.acquireSession_(executor,
        new simulator.webdriver.Command(simulator.webdriver.CommandName.DESCRIBE_SESSION)
        .setParameter('sessionId', sessionId),
          'WebDriver.attachToSession()');
    },

    /**
     * Creates a new WebDriver session.
     * @param executor {webdriver.CommandExecutor} The executor to create the new
     * session with.
     * @param desiredCapabilities {Map} The desired capabilities for the new
     * session.
     * @return {simulator.qxwebdriver.WebDriver} The driver for the newly created session.
     * @lint ignoreUndefined(simulator.webdriver.Command)
     * @lint ignoreUndefined(simulator.webdriver.CommandName)
     */
    createSession : function(executor, desiredCapabilities)
    {
      return simulator.qxwebdriver.WebDriver.acquireSession_(executor,
        new simulator.webdriver.Command(simulator.webdriver.CommandName.NEW_SESSION)
        .setParameter('desiredCapabilities', desiredCapabilities),
          'WebDriver.createSession()');
    },

    /**
     * Sends a command to the server that is expected to return the details for a
     * <code>webdriver.Session</code>. This may either be an existing session, or a
     * newly created one.
     * @param executor {webdriver.CommandExecutor} Command executor to use when
     * querying for session details.
     * @param command {webdriver.Command} The command to send to fetch the session
     * details.
     * @param description {String} A descriptive debug label for this action.
     * @return {simulator.qxwebdriver.WebDriver} A new WebDriver client for the session.
     * @lint ignoreUndefined(simulator.webdriver.promise)
     * @lint ignoreUndefined(simulator.webdriver.Session)
     */
    acquireSession_ : function(executor, command, description)
    {
      var fn = executor.execute.bind(executor, command);
      var session = simulator.webdriver.promise.Application.getInstance().schedule(
        description, function() {
          return simulator.webdriver.promise.checkedNodeCall(fn).then(function(response) {
            //bot.response.checkResponse(response);
            return new simulator.webdriver.Session(response['sessionId'],
                                         response['value']);
          });
        });
      return new simulator.qxwebdriver.WebDriver(session, executor);
    }
  },

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
     * @lint ignoreUndefined(simulator.webdriver.promise)
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
     * @param timeout {Integer?} Optional amount of time to wait in ms. Default:
     * {@link #AUT_LOAD_TIMEOUT}
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
      }, timeout || simulator.qxwebdriver.WebDriver.AUT_LOAD_TIMEOUT);
    },

    /**
     * Opens the given URL in the browser, waits until the qooxdoo application
     * to finish loading and initializes the AUT-side helpers.
     * @param url {String} The AUT's URL
     * @param timeout {Integer?} Optional timeout value for {@link #waitForQxApplication}
     * @return {webdriver.promise.Promise} A promise that will be resolved when
     * the environment is ready for testing.
     */
    getQx : function(url, timeout)
    {
      var wait = function() {
        return this.waitForQxApplication(timeout);
      };

      var init = function() {
        return this.init()
        .then(wait.bind(this));
      };

     return this.get(url)
     .then(init.bind(this));
    },

    /**
     * Initialize this simulator.qxwebdriver instance
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
     * Use {@link #executeFunction} to call the function.
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
     * Executes a function defined by {@link #defineFunction}.
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
