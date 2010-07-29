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


    /**
     * Returns the connected desktop
     *
     * @return {qx.ui.window.IDesktop} The desktop
     */
    getDesktop : function() {
      return this.__desktop;
    },


    // interface implementation
    changeActiveWindow : function(active, oldActive) {
      if (active) {
        this.updateStack();
        this.bringToFront(active);
        active.setActive(true);
      }
      if (oldActive) {
        oldActive.resetActive();
      }
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
      this.__desktop.forceUnblockContent();

      var windows = this.__desktop.getWindows(),
          zIndex = this._minZIndex - 1,
          tzIndex = zIndex + windows.length,
          mzIndex = tzIndex * 2,
          hasActive = false,
          win, 
          modalWin = [], 
          topWin = [], 
          last = null;

      for (var i=0, l=windows.length; i<l; i++)
      {
        win = windows[i];
        if (!win.isVisible()) {
          continue;
        }

        /*
         * We use only every second z index to easily 
         * insert a blocker between two windows
         *
         * Modal Windows stays on top of 
         * AlwaysOnTop Windows, which stays on top of
         * Normal Windows.
         */
        if(win.isAlwaysOnTop()) {
          tzIndex +=2;
          win.setZIndex(tzIndex);
        } else if (win.isModal()) {
          mzIndex +=2;
          win.setZIndex(mzIndex);
          this.__desktop.blockContent(mzIndex - 1);
        } else {
          zIndex +=2;
          win.setZIndex(zIndex);
        }

        // ensure that at least one window is active
        hasActive = hasActive || win.isActive();
        last = win;
      }

      if (!hasActive) {
        this.__desktop.setActiveWindow(last);
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
