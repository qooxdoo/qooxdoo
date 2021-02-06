/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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

      var widget = new qx.ui.core.Widget();
      this.getRoot().add(widget);
      var deco;

      this.assertPadding(widget, 0, 0, 0, 0);

      deco = new qx.ui.decoration.Decorator().set({width: 1});
      widget.setDecorator(deco);
      this.assertPadding(widget, 0, 0, 0, 0);

      deco.dispose();
      deco = new qx.ui.decoration.Decorator().set({width: 2});
      widget.setDecorator(deco);
      widget.setPadding(2);
      this.assertPadding(widget, 2, 2, 2, 2);

      deco.dispose();
      deco = new qx.ui.decoration.Decorator().set({width: [2, 3, 5, 7]});
      widget.setDecorator(deco);
      widget.setPadding(1, 4, 16, 64);
      this.assertPadding(widget, 1, 4, 16, 64);

      widget.setDecorator(null);
      this.assertPadding(widget, 1, 4, 16, 64);

      deco.dispose();
      deco = new qx.ui.decoration.Decorator().set({
        width: 2,
        innerWidth: 2
      });
      widget.setDecorator(deco);
      widget.setPadding(2);
      this.assertPadding(widget, 4, 4, 4, 4);

      this.getRoot().remove(widget);
      widget.dispose();
      deco.dispose();
    },


    testDecoration : function()
    {
      var widget = new qx.ui.core.Widget();
      this.getRoot().add(widget);

      var deco = new qx.ui.decoration.Decorator();
      widget.setDecorator(deco);
      this.assertPadding(widget, 0, 0, 0, 0);

      this.getRoot().remove(widget);
      widget.dispose();
      deco.dispose();
    }
  }
});
