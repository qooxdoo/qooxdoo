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
 * Required interface for all window manager.
 *
 * Window manager handle the z-order and modality blocking of windows managed
 * by the connected desktop {@link IDesktop}.
 */
qx.Interface.define("qx.ui.window.IWindowManager",
{
  members :
  {
    /**
     * Connect the window manager to the window desktop
     *
     * @param desktop {IDesktop} The connected desktop
     */
    setDesktop : function(desktop) {
      this.assertInterface(desktop, qx.ui.window.IDesktop);
    },

    /**
     * Inform the window manager about a new active window
     *
     * @param active {Window} new active window
     * @param oldActive {Window} old active window
     */
    changeActiveWindow : function(active, oldActive) {},

    /**
     * Update the window order and modality blocker
     */
    updateStack : function() {},

    /**
     * Ask the manager to bring a window to the front.
     *
     * @param win {Window} window to bring to front
     */
    bringToFront : function(win) {
      this.assertInstance(win, qx.ui.window.Window);
    },

    /**
     * Ask the manager to bring a window to the front.
     *
     * @param win {Window} window to sent to back
     */
    sendToBack : function(win) {
      this.assertInstance(win, qx.ui.window.Window);
    }
  }
});