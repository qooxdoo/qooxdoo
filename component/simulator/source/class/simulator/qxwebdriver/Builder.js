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
#ignore(require)
#ignore(simulator.webdriver
#asset(simulator/webdriver/webdriver.js))
************************************************************************ */

/**
 * Thin wrapper around webdriver.Builder that returns a customized WebDriver
 * instance.
 */
qx.Class.define("simulator.qxwebdriver.Builder", {

  extend : Object,

  /**
   * @lint ignoreUndefined(require)
   */
  construct : function() {
    if (qx.core.Environment.get("runtime.name") !== "node.js") {
      throw new Error("QxWebdriver applications must run in node.js!");
    }
    //TODO: Figure out why this won't work:
    //var qwdPath = qx.util.ResourceManager.getInstance().toUri("simulator/webdriver/webdriver.js");
    var qwdPath = "../../../resource/simulator/webdriver/webdriver.js";
    simulator.webdriver = require(qwdPath);

    this.__builder = new simulator.webdriver.Builder();
  },

  members : {

    __builder : null,

    /**
     * Sets the Selenium server URL.
     * @param url {String} The Selenium server's URL
     * @return {simulator.qxwebdriver.Builder} Builder instance for chaining
     */
    usingServer : function(url)
    {
      this.__builder.serverUrl_ = url;
      return this;
    },

    /**
     * Sets the Selenium session ID.
     * @param id {String} The Selenium session ID
     * @return {simulator.qxwebdriver.Builder} Builder instance for chaining
     */
    usingSession : function(id) {
      this.__builder.sessionId_ = id;
      return this;
    },

    /**
     * Sets the desired WebDriver capabilities.
     * @param capabilities {Map} Desired capabilities
     * @return {simulator.qxwebdriver.Builder} Builder instance for chaining
     */
    withCapabilities : function(capabilities)
    {
      this.__builder.capabilities_ = capabilities;
      return this;
    },

    /**
     * Builds a new webdriver.WebDriver instance using this builder's
     * current configuration and adds qooxdoo-specific methods.
     * @return {webdriver.WebDriver} A new WebDriver client.
     */
    build : function()
    {
      var driver = this.__builder.build();
      var mixin = simulator.qxwebdriver.MQxWebDriver;
      for (var methodName in mixin.$$members) {
        driver[methodName] = mixin.$$members[methodName].bind(driver);
      }
      return driver;
    }
  }
});