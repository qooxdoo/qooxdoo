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
 * Required interface for all window manager.
 *
 * Window manager handle the z-order and modality blocking of windows managed
 * by the connected desktop {@link qx.ui.window.IDesktop}.
 */
qx.Interface.define("qx.ui.window.IWindowManager",
{
  members :
  {
    /**
     * Connect the window manager to the window desktop
     *
     * @param desktop {qx.ui.window.IDesktop|null} The connected desktop or null
     */
    setDesktop : function(desktop) {
      if (desktop !== null) {
        this.assertInterface(desktop, qx.ui.window.IDesktop);
      }
    },

    /**
     * Inform the window manager about a new active window
     *
     * @param active {qx.ui.window.Window} new active window
     * @param oldActive {qx.ui.window.Window} old active window
     */
    changeActiveWindow : function(active, oldActive) {},

    /**
     * Update the window order and modality blocker
     */
    updateStack : function() {},

    /**
     * Ask the manager to bring a window to the front.
     *
     * @param win {qx.ui.window.Window} window to bring to front
     */
    bringToFront : function(win) {
      this.assertInstance(win, qx.ui.window.Window);
    },

    /**
     * Ask the manager to send a window to the back.
     *
     * @param win {qx.ui.window.Window} window to sent to back
     */
    sendToBack : function(win) {
      this.assertInstance(win, qx.ui.window.Window);
    }
  }
});
