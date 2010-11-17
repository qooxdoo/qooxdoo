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
 * Creates and configures a QxSelenium instance.
 */
qx.Class.define("simulator.QxSelenium", {

  extend : qx.core.Object,

  statics :
  {
    /**
     * Imports the com.thoughtworks.selenium.QxSelenium Java class and creates 
     * an instance.
     * 
     * @param server {String} The Selenium RC server's domain, e.g. "localhost"
     * @param port {Integer} The Selenium server's port number
     * @param browser {String} Selenium browser launcher, e.g. "*firefox3"
     * @param host {String} The AUT's host name
     * @return {Object} The configured QxSelenium instance
     * @lint ignoreUndefined(importClass,QxSelenium)
     */
    create : function(server, port, browser, host)
    {
      // Basic sanity check: No sense in continuing without QxSelenium.
      try {
        importClass(Packages.com.thoughtworks.selenium.QxSelenium);
      }
      catch(ex) {
        throw new Error("Couldn't import QxSelenium class! Make sure the qooxdoo " 
        + "Selenium user extensions are installed in your Selenium client.\n" + ex);
      }
      
      // Create and configure QxSelenium instance
      return new QxSelenium(server, port, browser, host);

    }
  }

});

