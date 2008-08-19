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

qx.Class.define("qx.test.ui.Insets",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    testPadding : function()
    {
      var widget = new qx.ui.core.Widget();
      this.getRoot().add(widget);

      this.assertPadding(widget, 0, 0, 0, 0);

      widget.setPadding(1,2,3,4);
      this.assertPadding(widget, 1,2,3,4);

      // shorthand mode
      widget.setPadding(1);
      this.assertPadding(widget, 1,1,1,1);

      widget.setPadding(2, 5);
      this.assertPadding(widget, 2,5,2,5);

      this.getRoot().remove(widget);
      widget.dispose();
    },


    testDecoration : function()
    {
      var widget = new qx.ui.core.Widget();
      this.getRoot().add(widget);

      var deco = new qx.ui.decoration.Background();
      widget.setDecorator(deco);
      this.assertPadding(widget, 0, 0, 0, 0);

      this.getRoot().remove(widget);
      widget.dispose();
    },


    testInsets : function()
    {
      var widget = new qx.ui.core.Widget();
      this.getRoot().add(widget);
      var deco;

      this.assertPadding(widget, 0, 0, 0, 0);

      deco = new qx.ui.decoration.Single(1);
      widget.setDecorator(deco);
      this.assertPadding(widget, 1, 1, 1, 1);

      deco = new qx.ui.decoration.Single(1);
      deco.setWidth(2);
      widget.setDecorator(deco);
      widget.setPadding(2)
      this.assertPadding(widget, 4, 4, 4, 4);

      deco = new qx.ui.decoration.Single(1);
      deco.setWidth(2, 3, 5, 7);
      widget.setDecorator(deco);
      widget.setPadding(1, 4, 16, 64)
      this.assertPadding(widget, 3, 7, 21, 71);

      widget.setDecorator(null);
      this.assertPadding(widget, 1, 4, 16, 64);

      this.getRoot().remove(widget);
      widget.dispose();
    }
  }
});
