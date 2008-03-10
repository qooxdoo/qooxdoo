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

qx.Class.define("testrunner.test.ui.Grid",
{
  extend : testrunner.test.ui.LayoutTestCase,

  members :
  {

    setUp : function()
    {
      this.base(arguments);
      this._gridWidget = new qx.ui.core.Widget();
      this._gridLayout = new qx.ui.layout.Grid();

      this._gridWidget.setLayout(this._gridLayout);
      this.getRoot().getLayout().add(this._gridWidget);
    },


    tearDown : function()
    {
      this.base(arguments);
      this.getRoot().getLayout().remove(this._gridWidget);
      this._gridWidget.dispose();
    },


    _getFixedWidget : function()
    {
      var widget = new qx.ui.core.Widget();
      widget.set({
        width: 200,
        height: 100,
        allowGrowX: false,
        allowShrinkX: false,
        allowGrowY: false,
        allowShrinkY: false
      });
      return widget;
    },


    testAutoSize : function()
    {
      this._gridLayout.add(this._getFixedWidget(), 0, 0);
      this._gridLayout.add(this._getFixedWidget(), 0, 1);
      this._gridLayout.add(this._getFixedWidget(), 1, 0);
      this._gridLayout.add(this._getFixedWidget(), 1, 1);
      this.assertSize(this._gridWidget, 400, 200);

      // spacing
      this._gridLayout.setVerticalSpacing(10);
      this._gridLayout.setHorizontalSpacing(20);
      this.assertSize(this._gridWidget, 420, 210);
    },

    testAddRemove : function()
    {
      var a = this._getFixedWidget();
      var b = this._getFixedWidget();
      var c = this._getFixedWidget();
      var d = this._getFixedWidget();

      this._gridLayout.setVerticalSpacing(10);
      this._gridLayout.setHorizontalSpacing(20);

      // initial layout:
      // ab
      // cd
      this._gridLayout.add(a, 0, 0);
      this._gridLayout.add(b, 0, 1);
      this._gridLayout.add(c, 1, 0);
      this._gridLayout.add(d, 1, 1);
      this.assertSize(this._gridWidget, 420, 210);

      // layout:
      // a
      // c
      this._gridLayout.remove(b);
      this._gridLayout.remove(d);
      this.assertSize(this._gridWidget, 200, 210);

      // layout:
      // a, d, b, c
      this._gridLayout.remove(c);
      this._gridLayout.add(d, 0, 1);
      this._gridLayout.add(b, 0, 2);
      this._gridLayout.add(c, 0, 3);
      this.assertSize(this._gridWidget, 860, 100);
    },


    testVisibility : function()
    {
      var a = this._getFixedWidget();
      var b = this._getFixedWidget();
      var c = this._getFixedWidget();
      var d = this._getFixedWidget();

      this._gridLayout.setVerticalSpacing(10);
      this._gridLayout.setHorizontalSpacing(20);

      // initial layout:
      // ab
      // cd
      this._gridLayout.add(a, 0, 0);
      this._gridLayout.add(b, 0, 1);
      this._gridLayout.add(c, 1, 0);
      this._gridLayout.add(d, 1, 1);
      this.assertSize(this._gridWidget, 420, 210);

      // layout:
      // ab
      // cd
      a.setVisibility("hidden");
      b.setVisibility("hidden");
      c.setVisibility("hidden");
      this.assertSize(this._gridWidget, 420, 210);
      this.assertStyle(a, "display", "none");
      this.assertStyle(b, "display", "none");
      this.assertStyle(c, "display", "none");


      // layout:
      // ab
      b.setVisibility("visible");
      c.setVisibility("excluded");
      d.setVisibility("excluded");
      this.assertSize(this._gridWidget, 420, 100);
      this.assertStyle(b, "display", "");
      this.assertStyle(c, "display", "none");
      this.assertStyle(d, "display", "none");

      // layout:
      // cd
      a.setVisibility("excluded");
      b.setVisibility("excluded");
      c.setVisibility("visible");
      d.setVisibility("visible");
      this.assertSize(this._gridWidget, 420, 110);
      this.assertStyle(b, "display", "none");
      this.assertStyle(b, "display", "none");
      this.assertStyle(c, "display", "");
      this.assertStyle(d, "display", "");
    },


    testCellSize : function()
    {
      this._gridLayout.setRowHeight(0, 40);
      this._gridLayout.setRowHeight(1, 150);
      this._gridLayout.setColumnWidth(0, 70);
      this._gridLayout.setColumnWidth(1, 290);

      var a = new qx.ui.core.Widget();
      var b = new qx.ui.core.Widget();
      var c = new qx.ui.core.Widget();
      var d = new qx.ui.core.Widget();

      this._gridLayout.add(a, 0, 0);
      this._gridLayout.add(b, 0, 1);
      this._gridLayout.add(c, 1, 0);
      this._gridLayout.add(d, 1, 1);

      this.assertSize(a, 70, 40);
      this.assertSize(b, 290, 40);
      this.assertSize(c, 70, 150);
      this.assertSize(d, 290, 150);
    }


  }
});
