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

qx.Class.define("testrunner.test.ui.BackgroundColor",
{
  extend : testrunner.test.ui.LayoutTestCase,

  members :
  {
    testChangeColorInContainer : function()
    {
      var widget = new qx.ui.container.Composite();
      this.getRoot().add(widget);

      this.assertStyle(widget, "backgroundColor", "");

      widget.setBackgroundColor("red");
      this.assertStyle(widget, "backgroundColor", "red");

      widget.setBackgroundColor("green");
      this.assertStyle(widget, "backgroundColor", "green");

      widget.setBackgroundColor(null);
      this.assertStyle(widget, "backgroundColor", "");

      this.getRoot().remove(widget);
      widget.dispose();
    },


    testChangeColorInDecorator : function()
    {
      var widget = new qx.ui.container.Composite();
      this.getRoot().add(widget);

      var deco = new qx.ui.decoration.Single(1);
      widget.setDecorator(deco);
      this.assertStyle(widget, "backgroundColor", "");
      this.assertDecoratorStyle(widget, "backgroundColor", "");

      widget.setBackgroundColor("red");
      this.assertStyle(widget, "backgroundColor", "");
      this.assertDecoratorStyle(widget, "backgroundColor", "red");

      widget.setBackgroundColor("green");
      this.assertStyle(widget, "backgroundColor", "");
      this.assertDecoratorStyle(widget, "backgroundColor", "green");

      widget.setBackgroundColor(null);
      this.assertStyle(widget, "backgroundColor", "");
      this.assertDecoratorStyle(widget, "backgroundColor", "");

      this.getRoot().remove(widget);
      widget.dispose();
    },


    testSetColorInContainer : function()
    {
      var widget = new qx.ui.container.Composite();
      this.getRoot().add(widget);

      widget.setBackgroundColor("red");
      this.assertStyle(widget, "backgroundColor", "red");

      // only create on demand
      this.assertUndefined(widget._decorationElement);

      // set decoration
      var deco = new qx.ui.decoration.Single(1);
      widget.setDecorator(deco);
      this.assertStyle(widget, "backgroundColor", "");
      this.assertDecoratorStyle(widget, "backgroundColor", "red");

      // remove decoration
      widget.setDecorator(null);
      this.assertDecoratorStyle(widget, "backgroundColor", "");
      this.assertStyle(widget, "backgroundColor", "red");

      this.getRoot().remove(widget);
      widget.dispose();
    },


    testSetColorInDecorator : function()
    {
      var widget = new qx.ui.container.Composite();
      this.getRoot().add(widget);
      this.assertStyle(widget, "backgroundColor", "");

      // only create on demand
      this.assertUndefined(widget._decorationElement);

      // set decoration
      var deco = new qx.ui.decoration.Single(1);
      widget.setDecorator(deco);
      this.assertStyle(widget, "backgroundColor", "");
      this.assertDecoratorStyle(widget, "backgroundColor", "");

      // set background color with decoration
      widget.setBackgroundColor("red");
      this.assertDecoratorStyle(widget, "backgroundColor", "red");
      this.assertStyle(widget, "backgroundColor", "");

      // remove decoration
      widget.setDecorator(null);
      this.assertDecoratorStyle(widget, "backgroundColor", "");
      this.assertStyle(widget, "backgroundColor", "red");

      this.getRoot().remove(widget);
      widget.dispose();
    },


    testChangeDecorator : function()
    {
      var widget = new qx.ui.container.Composite();
      this.getRoot().add(widget);
      this.assertStyle(widget, "backgroundColor", "");

      // set decoration
      widget.setDecorator(new qx.ui.decoration.Single(1));

      // set background color
      widget.setBackgroundColor("red");
      this.assertDecoratorStyle(widget, "backgroundColor", "red");
      this.assertStyle(widget, "backgroundColor", "");

      // change decorator
      widget.setDecorator(new qx.ui.decoration.Double());
      this.assertDecoratorStyle(widget, "backgroundColor", "red");
      this.assertStyle(widget, "backgroundColor", "");

      // remove decoration
      widget.setDecorator(null);
      this.assertDecoratorStyle(widget, "backgroundColor", "");
      this.assertStyle(widget, "backgroundColor", "red");

      this.getRoot().remove(widget);
      widget.dispose();
    },


    testDecorationColor : function()
    {
      var widget = new qx.ui.container.Composite();
      this.getRoot().add(widget);
      this.assertStyle(widget, "backgroundColor", "");

      widget.setBackgroundColor("green");
      this.assertStyle(widget, "backgroundColor", "green");

      // set decoration
      var deco = new qx.ui.decoration.Single(1);
      widget.setDecorator(deco);
      this.assertDecoratorStyle(widget, "backgroundColor", "green");
      this.assertStyle(widget, "backgroundColor", "");

      // change deco color
      deco.setBackgroundColor("red");
      this.assertDecoratorStyle(widget, "backgroundColor", "green");
      this.assertStyle(widget, "backgroundColor", "");

      // remove deco color
      widget.setBackgroundColor(null);
      this.assertDecoratorStyle(widget, "backgroundColor", "red");
      this.assertStyle(widget, "backgroundColor", "");

      // remove decoration
      widget.setDecorator(null);
      this.assertDecoratorStyle(widget, "backgroundColor", "");
      this.assertStyle(widget, "backgroundColor", "");

      this.getRoot().remove(widget);
      widget.dispose();
    }

  }
});
