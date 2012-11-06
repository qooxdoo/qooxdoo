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
************************************************************************ */

/**
 * Loads the WebDriverJs module and exposes it as simulator.webdriver
 * @lint ignoreUndefined(require)
 * @lint ignoreUndefined(simulator.webdriver)
 */
qx.Class.define("simulator.qxwebdriver.WebDriverLoader", {

  defer : function()
  {
    simulator.webdriver = require("selenium-webdriverjs");
  }
});
