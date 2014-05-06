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
************************************************************************ */

/**
 * Overrides <code>webdriver.Builder.build</code> so that it returns a
 * {@link simulator.qxwebdriver.WebDriver} object.
 *
 * @require(simulator.qxwebdriver.WebDriverLoader)
 * @ignore(simulator.webdriver.FirefoxDomExecutor)
 * @ignore(simulator.webdriver.process)
 * @ignore(simulator.webdriver.node)
 * @ignore(simulator.webdriver.http)
 * @deprecated{4.0}
 */
qx.Class.define("simulator.qxwebdriver.Builder",
{
  extend : simulator.webdriver.Builder,

  construct : function()
  {
    simulator.webdriver.Builder.apply(this);
  },

  members :
  {
    /**
     * Builds a new {@link simulator.qxwebdriver.WebDriver} instance using this
     * builder's current configuration.
     * @return {simulator.qxwebdriver.WebDriver} A new WebDriver client.
     */
    build : function()
    {
      var executor;
      if (simulator.webdriver.FirefoxDomExecutor.isAvailable()) {
        executor = new simulator.webdriver.FirefoxDomExecutor();
        return simulator.qxwebdriver.WebDriver.createSession(executor, this.capabilities_);
      } else {
        var clientCtor = simulator.webdriver.process.isNative() ?
          simulator.webdriver.node.HttpClient :
          simulator.webdriver.http.CorsClient;

        var client = new clientCtor(this.serverUrl_);
        executor = new simulator.webdriver.http.Executor(client);

        if (this.sessionId_) {
          return simulator.qxwebdriver.WebDriver.attachToSession(executor, this.sessionId_);
        } else if (simulator.webdriver.process.isNative()) {
          return simulator.qxwebdriver.WebDriver.createSession(executor, this.capabilities_);
        } else {
          throw new Error('Unable to create a new client for this browser. The ' +
            'WebDriver session ID has not been defined.');
        }
      }
    }
  }
});
