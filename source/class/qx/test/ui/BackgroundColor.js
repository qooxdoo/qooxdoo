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

qx.Class.define("qx.test.ui.BackgroundColor",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    testChangeColorInContainer : function()
    {
      var widget = new qx.ui.container.Composite();
      this.getRoot().add(widget);

      this.assertStyle(widget, "backgroundColor", "transparent");

      widget.setBackgroundColor("red");
      this.assertStyle(widget, "backgroundColor", "red");

      widget.setBackgroundColor("green");
      this.assertStyle(widget, "backgroundColor", "green");

      widget.setBackgroundColor(null);
      this.assertStyle(widget, "backgroundColor", "transparent");

      this.getRoot().remove(widget);
      widget.destroy();
    },


    testChangeColorInDecorator : function()
    {
      var widget = new qx.ui.container.Composite();
      this.getRoot().add(widget);

      var deco = new qx.ui.decoration.Decorator().set({
        width:  1
      });
      widget.setDecorator(deco);
      this.assertStyle(widget, "backgroundColor", "transparent", "no bg color");

      widget.setBackgroundColor("red");
      this.assertStyle(widget, "backgroundColor", "red", "red bg color");

      widget.setBackgroundColor("green");
      this.assertStyle(widget, "backgroundColor", "green", "green bg color");

      widget.setBackgroundColor(null);
      this.assertStyle(widget, "backgroundColor", "transparent", "null bg color");

      this.getRoot().remove(widget);
      widget.dispose();
      deco.dispose();
    },


    testChangeDecorator : function()
    {
      var widget = new qx.ui.container.Composite();
      this.getRoot().add(widget);
      this.assertStyle(widget, "backgroundColor", "transparent");

      // set decoration
      var deco = new qx.ui.decoration.Decorator().set({
        width:  1
      });
      widget.setDecorator(deco);

      // set background color
      widget.setBackgroundColor("red");
      this.assertStyle(widget, "backgroundColor", "red");

      // change decorator
      //var repl = new qx.ui.decoration.Double(1, "solid", "green", 1, "black");
      var repl = new qx.ui.decoration.Decorator().set({
        width: 1,
        style: "solid",
        color: "green",
        innerWidth: 1,
        innerColor: "black"
      });
      widget.setDecorator(repl);
      this.assertStyle(widget, "backgroundColor", "red");

      widget.destroy();
      deco.dispose();
      repl.dispose();
    },


    testDecorationColor : function()
    {
      var widget = new qx.ui.container.Composite();
      this.getRoot().add(widget);
      this.assertStyle(widget, "backgroundColor", "transparent");

      widget.setBackgroundColor("green");
      this.assertStyle(widget, "backgroundColor", "green");

      // set decoration
      var deco = new qx.ui.decoration.Decorator().set({
        width: 1,
        backgroundColor: "red"
      });
      widget.setDecorator(deco);
      // widget color takes precedence over decorator color

      this.assertStyle(widget, "backgroundColor", "green");

      // reset widget bg color
      widget.setBackgroundColor(null);
      this.assertStyle(widget, "backgroundColor", "red");

      this.getRoot().remove(widget);
      widget.dispose();
      deco.dispose();
    }

  }
});
