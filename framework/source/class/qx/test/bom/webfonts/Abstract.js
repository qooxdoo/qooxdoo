/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

qx.Class.define("qx.test.bom.webfonts.Abstract", {

  extend : qx.dev.unit.TestCase,

  members :
  {
    hasWebFontSupport : function()
    {
      var browser = qx.core.Environment.get("browser.name");
      var version = qx.core.Environment.get("browser.version");
      if ((browser == "firefox" && version < 3.5) ||
          (browser == "opera" && version < 10))
      {
        return false;
      }
      return true;
    }
  }
});