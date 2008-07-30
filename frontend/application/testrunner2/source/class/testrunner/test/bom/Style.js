/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("testrunner.test.bom.Style",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    /**
     * Test setting string like values e.g. instances of qx.lang.BaseString
     * as values for CSS styles. IE has some problems with this for special
     * styles (backgroundColor, color).
     */
    testStringLikeValue : function()
    {
      var el = document.createElement("div");
      var Style = qx.bom.element.Style;

      var border = new qx.lang.BaseString("solid")
      Style.set(el, "borderStyleTop", border);

      this.assertEquals(border.toString(), Style.get(el, "borderStyleTop", Style.LOCAL_MODE));

      var borderColor = new qx.lang.BaseString("#00ff00")
      Style.set(el, "borderColorTop", borderColor);
      this.assertEquals(borderColor.toString(), Style.get(el, "borderColorTop", Style.LOCAL_MODE));

      var textColor = new qx.lang.BaseString("#00fe00")
      Style.set(el, "color", textColor);
      this.assertCssColor(textColor.toString(), Style.get(el, "color", Style.LOCAL_MODE));

      var color = {
          toString : function() { return "#fe0000"; }
      }
      Style.set(el, "backgroundColor", color);
      this.assertCssColor(color.toString(), Style.get(el, "backgroundColor", Style.LOCAL_MODE));

      var color = new qx.lang.BaseString("#ff0000")
      Style.set(el, "backgroundColor", color);
      this.assertCssColor(color.toString(), Style.get(el, "backgroundColor", Style.LOCAL_MODE));
    }
  }
});
