/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.basic.Label",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    testHeightForWidth : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.Grow());
      this.getRoot().add(container);

      var label = new qx.ui.basic.Label("juhu kinners juhu kinners juhu kinners juhu kinners juhu kinners juhu kinners ").set({
        rich: true
      });
      container.add(label);

      this.flush();
      var width = label.getBounds().width;
      this.assertEquals(width, container.getBounds().width);

      container.setWidth(10);
      this.flush();

      container.resetWidth();
      this.flush();

      this.assertEquals(width, label.getBounds().width);
    },


    testWrapSet : function() {
      var l = new qx.ui.basic.Label();
      l.setRich(true);
      l.setWrap(true);
      this.assertEquals("normal", l.getContentElement().getStyle("whiteSpace"));
      l.dispose();
    },


    testWrapNotSet : function() {
      var l = new qx.ui.basic.Label();
      l.setRich(true);
      l.setWrap(false);
      this.assertEquals("nowrap", l.getContentElement().getStyle("whiteSpace"));
      l.dispose();
    }
  }
});
