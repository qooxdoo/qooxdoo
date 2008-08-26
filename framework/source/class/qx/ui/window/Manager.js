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

/**
 * The default window manager implementation
 */
qx.Class.define("qx.ui.window.Manager",
{
  extend : qx.core.Object,
  implement : qx.ui.window.IWindowManager,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __desktop : null,


    // interface implementation
    setDesktop : function(desktop)
    {
      this.__desktop = desktop;
      this.updateStack();
    },


    // interface implementation
    changeActiveWindow : function(active, oldActive) {
      this.bringToFront(active);
    },


    /** {Integer} Minimum zIndex to start with for windows */
    _minZIndex : 1e5,


    // interface implementation
    updateStack : function()
    {
      // we use the widget queue to do the sorting one before the queues are
      // flushed. The queue will call "syncWidget"
      qx.ui.core.queue.Widget.add(this);
    },


    /**
     * This method is called during the flush of the
     * {@link qx.ui.core.queue.Widget widget queue}.
     */
    syncWidget : function()
    {
      this.__desktop.unblockContent();

      var windows = this.__desktop.getWindows();
      var zIndex = this._minZIndex - 1;
      var hasActive = false;
      var win, last;

      for (var i=0, l=windows.length; i<l; i++)
      {
        win = windows[i];
        if (!win.isVisible()) {
          continue;
        }

        // we use only every second z index to easily insert a blocker between
        // two windows
        zIndex += 2;
        win.setZIndex(zIndex);

        // move blocker below the topmost modal window
        if (win.getModal()) {
          this.__desktop.blockContent(zIndex - 1);
        }

        // ensure that at least one window is active
        hasActive = hasActive || win.isActive();
        last = win;
      }

      if (!hasActive && last) {
        last.setActive(true);
      }
    },


    // interface implementation
    bringToFront : function(win)
    {
      var windows = this.__desktop.getWindows();

      var removed = qx.lang.Array.remove(windows, win);
      if (removed)
      {
        windows.push(win);
        this.updateStack();
      }
    },


    // interface implementation
    sendToBack : function(win)
    {
      var windows = this.__desktop.getWindows();

      var removed = qx.lang.Array.remove(windows, win);
      if (removed)
      {
        windows.unshift(win);
        this.updateStack();
      }
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("__desktop");
  }
});