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
qx.Class.define("qx.ui.window.WindowManager",
{
  extend : qx.core.Object,
  implement : qx.ui.window.IWindowManager,

  members :
  {
    // interface implementation
    setDesktop : function(desktop)
    {
      this._desktop = desktop;
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
      this._desktop.unblockContent();

      var windows = this._desktop.getWindows();
      var zIndex = this._minZIndex - 1;
      var hasActive = false;

      for (var i=0, l=windows.length; i<l; i++)
      {
        var win = windows[i];

        if (!win.isVisible()) {
          continue;
        }

        // we use only every second z index to easily insert a blocker between
        // two windows
        zIndex += 2;
        win.setZIndex(zIndex);

        // move blocker below the topmost modal window
        if (win.getModal()) {
          this._desktop.blockContent(zIndex - 1);
        }

        // ensure that at least one window is active
        hasActive = hasActive || win.getActive();
        var last = win;
      }

      if (!hasActive && last) {
        last.setActive(true);
      }
    },


    // interface implementation
    bringToFront : function(win)
    {
      var windows = this._desktop.getWindows();

      var removed = qx.lang.Array.remove(windows, win);
      if (removed) {
        windows.push(win);
        this.updateStack();
      }
    },


    // interface implementation
    sendToBack : function(win)
    {
      var windows = this._desktop.getWindows();

      var removed = qx.lang.Array.remove(_windows, win);
      if (removed) {
        windows.unshift(win);
        this.updateStack();
      }
    }
  }
});