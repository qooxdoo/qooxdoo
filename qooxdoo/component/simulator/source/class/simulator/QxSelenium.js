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

/* ************************************************************************
#ignore(importClass)
#ignore(QxSelenium)
#ignore(ThreadSafeSeleniumSessionStorage)
************************************************************************ */


/**
 * Imports the com.thoughtworks.selenium.QxSelenium Java class and creates 
 * an instance. If the "simulator.threadSafe" setting is active, a session 
 * created by Selenium Grid's ThreadSafeSeleniumSessionStorage is returned 
 * instead.
 * 
 * @lint ignoreUndefined(importClass,QxSelenium,ThreadSafeSeleniumSessionStorage)
 */
qx.Class.define("simulator.QxSelenium", {

  extend : qx.core.Object,
  
  type : "singleton",

  construct : function()
  {
    this.base(arguments);
    var server = qx.core.Setting.get("simulator.selServer");
    var port = qx.core.Setting.get("simulator.selPort");
    var browser = qx.core.Setting.get("simulator.testBrowser");
    var host = qx.core.Setting.get("simulator.autHost");
    
    var threadSafe = false;
    try {
      threadSafe = qx.core.Setting.get("simulator.threadSafe");
    } catch(ex) {}
    
    if (threadSafe) {
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
    else {
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

