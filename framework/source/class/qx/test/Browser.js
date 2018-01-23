/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.Browser",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    testForIn : function()
    {
      var map = {};

      map["234"] = 234;
      map["123"] = 123;
      map["345"] = 345;

      var order = ["234", "123", "345"];

      // google chrome, opera 10.5, Safari 7 and ie 9
      if (
        qx.core.Environment.get("browser.name").indexOf("chrome") != -1 ||
        qx.core.Environment.get("browser.name") == "edge" ||
        (qx.core.Environment.get("browser.name") == "opera" &&
         qx.core.Environment.get("browser.version") >= 10.5) ||
        (qx.core.Environment.get("browser.name") == "ie" &&
         qx.core.Environment.get("browser.documentmode") >= 9) ||
        (qx.core.Environment.get("browser.name") == "firefox" &&
         qx.core.Environment.get("browser.version") >= 21) ||
        (qx.core.Environment.get("browser.name") == "safari" &&
         qx.core.Environment.get("browser.version") >= 7)
      ) {
        var i = 0;
        // is in a sorted order
        for (var key in map) {
          if (i == 0) {
            this.assertEquals("123", key, "1");
          } else if (i == 1) {
            this.assertEquals("234", key, "2");
          } else {
            this.assertEquals("345", key, "3");
          }
          i++;
        }
      }

      // default browsers
      else {
        var i = 0;
        // should be the same order the elements were added
        for (var key in map) {
          this.assertEquals(order[i], key);
          i++;
        }
      }
    }
  }
});
