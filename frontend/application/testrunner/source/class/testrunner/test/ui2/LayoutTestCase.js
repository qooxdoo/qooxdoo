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

qx.Class.define("testrunner.test.ui2.LayoutTestCase",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    getRoot : function()
    {
      var cls = testrunner.test.ui2.LayoutTestCase;

      if (!cls._root) {
        cls._root = new qx.ui2.root.Application(document);
      }
      return cls._root;
    },


    _getFixedWidget : function()
    {
      var widget = new qx.ui2.core.Widget();
      widget.set({
        width: 200,
        height: 100,
        maxWidth : "pref",
        minWidth : "pref",
        maxHeight : "pref",
        minHeight : "pref"
      });
      return widget;
    },


    assertSize : function(widget, width, height)
    {
      qx.ui2.core.QueueManager.flush();
      var size = widget.getComputedLayout();
      this.assertEquals(width, size.width);
      this.assertEquals(height, size.height);
    },


    assertStyle : function(widget, style, value)
    {
      qx.ui2.core.QueueManager.flush();
      var widgetStyle = widget.getElement()._element.style[style];
      this.assertEquals(value, widgetStyle);
    }

  }
});
