/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
qx.Class.define("qx.test.ui.Window",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    _win : null,

    setUp : function()
    {
      this.base(arguments);

      this._win = [];

      for (var i = 0; i < 5; i++) {
        var win = new qx.ui.window.Window("My Window " + i);
        this._win.push(win);
        this.getRoot().add(win);
      }
      this.flush();
    },

    tearDown : function()
    {
      this.base(arguments);

      this._disposeArray("_win");
    },

    testActiveWindowBeforeWindowOpened : function()
    {
      this.assertNull(this.getRoot().getActiveWindow());
    },

    testActiveWindowAfterWindowOpened : function()
    {
      this._win[0].open();
      this.flush();

      this.assertIdentical(this._win[0], this.getRoot().getActiveWindow());
    },

    testActiveWindowAfterWindowOpened2 : function()
    {
      this._win[0].open();
      this._win[1].open();
      this.flush();

      this.assertIdentical(this._win[1], this.getRoot().getActiveWindow());
    },

    testActiveWindowAfterWindowClosed : function()
    {
      this._win[0].open();
      this.flush();

      this._win[0].close();
      this.flush();

      this.assertNull(this.getRoot().getActiveWindow());
    },

    testActiveWindowAfterWindowClosed2 : function()
    {
      this._win[0].open();
      this._win[1].open();
      this.flush();

      this._win[1].close();
      this.flush();

      this.assertIdentical(this._win[0], this.getRoot().getActiveWindow());
    },

    testActiveWindowAfterAllWindowsOpened : function()
    {
      for (var i = 0; i < this._win.length; i++) {
        this._win[i].open();
      }
      this.flush();

      this.assertIdentical(this._win[this._win.length - 1],
        this.getRoot().getActiveWindow());
    },

    testActiveWindowAfterRemovingOpenedWindow : function()
    {
      this._win[0].open();
      this.flush();

      this.getRoot().remove(this._win[0]);
      this.flush();

      this.assertNull(this.getRoot().getActiveWindow());
    },

    testActiveWindowAfterRemovingOpenedWindow2 : function()
    {
      this._win[0].open();
      this._win[1].open();
      this.flush();

      this.getRoot().remove(this._win[1]);
      this.flush();

      this.assertIdentical(this._win[0], this.getRoot().getActiveWindow());
    },

    testActiveWindowAfterRemovingAllWindows : function()
    {
       for (var i = 0; i < this._win.length; i++) {
        this._win[i].open();
      }
      this.flush();

      this.getRoot().removeAll();
      this.flush();

      this.assertNull(this.getRoot().getActiveWindow());
    },

    testModalWindowIsAlwaysActiveIfOpen : function()
    {
      this._win[0].setModal(true);
      this._win[0].open();
      this._win[1].open();
      this.flush();

      this.assertIdentical(this._win[0], this.getRoot().getActiveWindow());
    },

    testOrderModalOverAlwaysOnTopOverNormalWindow : function()
    {
      var modal       = this._win[0];
      var alwaysOnTop = this._win[1];
      var normal      = this._win[2];

      modal.setModal(true);
      alwaysOnTop.setAlwaysOnTop(true);

      modal.open();
      alwaysOnTop.open();
      normal.open();

      this.flush();

      this.assertTrue(+modal.getZIndex() > +alwaysOnTop.getZIndex());
      this.assertTrue(+alwaysOnTop.getZIndex() > +normal.getZIndex());
    }
  }
});
