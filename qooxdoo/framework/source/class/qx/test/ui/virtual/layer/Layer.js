/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.layer.Layer",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {

    setUp : function()
    {
  
      qx.Class.define("qx.test.ui.virtual.TestLayer",
      {
        extend : qx.ui.virtual.layer.AbstractWidget,

        members :
        {

          _poolWidget: function(widget) {
            this._pool.push(widget);
          },

          _getWidget : function(row, column)
          {
            var widget = this._pool.pop() || new qx.ui.core.Widget;
            return widget;
          },

          _configureWidget : function(widget, row, column)
          {
            widget.setUserData("row", row);
            widget.setUserData("column", column);
          }

        }
      });

      this.__scroller = new qx.ui.virtual.core.Scroller(50, 1, 10, 250);
      this.__testLayer = new qx.test.ui.virtual.TestLayer;
      this.__scroller.pane.setWidth(450);
      this.__scroller.pane.addLayer(this.__testLayer);

      this.getRoot().add(this.__scroller, {left : 20, top : 10});
    },

    testScrollDown : function()
    {
      qx.ui.core.queue.Manager.flush();
      this.__scroller.pane.setScrollY(500);
      this.__scroller.pane.fullUpdate();

      var children = this.__testLayer._getChildren();

      this.assertEquals(children[0].getUserData("row"), 20);
      this.assertEquals(children[0].getUserData("column"), 0);

      this.assertEquals(children[children.length-1].getUserData("row"), 49);
      this.assertEquals(children[children.length-1].getUserData("column"), 0);

    }

  }
});
