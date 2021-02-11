/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
        
      if(desktop) {
        this.updateStack();
      }
      else {
         // the window manager should be removed
         // from the widget queue if the desktop
         // was set to null
         qx.ui.core.queue.Widget.remove(this);
      }
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
        this.bringToFront(active);
        active.setActive(true);
      }
      if (oldActive) {
        oldActive.resetActive();
      }
    },


    /** @type {Integer} Minimum zIndex to start with for windows */
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
      this.__desktop.forceUnblock();

      var windows = this.__desktop.getWindows();
      // z-index for all three window kinds
      var zIndex = this._minZIndex;
      var zIndexOnTop = zIndex + windows.length * 2;
      var zIndexModal = zIndex + windows.length * 4;
      // marker if there is an active window
      var active = null;

      for (var i = 0, l = windows.length; i < l; i++)
      {
        var win = windows[i];
        // ignore invisible windows
        if (!win.isVisible()) {
          continue;
        }
        // take the first window as active window
        active = active || win;

        // We use only every second z index to easily insert a blocker between
        // two windows
        // Modal Windows stays on top of AlwaysOnTop Windows, which stays on
        // top of Normal Windows.
        if (win.isModal()) {
          win.setZIndex(zIndexModal);
          this.__desktop.blockContent(zIndexModal - 1);
          zIndexModal +=2;
          //just activate it if it's modal
          active = win;

        } else if (win.isAlwaysOnTop()) {
          win.setZIndex(zIndexOnTop);
          zIndexOnTop +=2;

        } else {
          win.setZIndex(zIndex);
          zIndex +=2;
        }

        // store the active window
        if (!active.isModal() &&
            win.isActive() ||
            win.getZIndex() > active.getZIndex()) {
          active = win;
        }
      }

      //set active window or null otherwise
      this.__desktop.setActiveWindow(active);
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
