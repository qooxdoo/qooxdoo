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
 * Uses Selenium Grid's Creates ThreadSafeSeleniumSessionStorage to create a 
 * QxSelenium session.
 */
qx.Class.define("simulator.ThreadSafeQxSelenium", {

  extend : qx.core.Object,

  statics :
  {
    /**
     * Imports the 
     * com.thoughtworks.selenium.grid.tools.ThreadSafeSeleniumSessionStorage 
     * Java class and returns a configured session.
     * 
     * @param server {String} The Selenium RC server's domain, e.g. "localhost"
     * @param port {Integer} The Selenium server's port number
     * @param browser {String} Selenium browser launcher, e.g. "*firefox3"
     * @param host {String} The AUT's host name
     * @return {Object} The configured QxSelenium session (already started)
     * @lint ignoreUndefined(importClass,ThreadSafeSeleniumSessionStorage)
     */
    create : function(server, port, browser, host)
    {
      // Basic sanity check: No sense in continuing without QxSelenium.
      try {
        importClass(Packages.com.thoughtworks.selenium.grid.tools.ThreadSafeSeleniumSessionStorage);
      }
      catch(ex) {
        throw new Error("Couldn't import ThreadSafeSeleniumSessionStorage class!\n\
         Make sure the Selenium Grid Tools are available.\n" + ex);
      }
      
      // Create and configure QxSelenium instance
      ThreadSafeSeleniumSessionStorage.startSeleniumSession(server, port, browser, host);
      return ThreadSafeSeleniumSessionStorage.session();

    }
  }

});

