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
 * All parent widgets of windows must implement this interface.
 */
qx.Interface.define("qx.ui.window.IDesktop", {
  members: {
    /**
     * Sets the desktop's window manager
     *
     * @param manager {qx.ui.window.IWindowManager} The window manager
     */
    setWindowManager(manager) {
      this.assertInterface(manager, qx.ui.window.IWindowManager);
    },

    /**
     * Get a list of all windows added to the desktop (including hidden windows)
     *
     * @return {qx.ui.window.Window[]} Array of managed windows
     */
    getWindows() {},

    /**
     * Whether the configured layout supports a maximized window
     * e.g. is a Canvas.
     *
     * @return {Boolean} Whether the layout supports maximized windows
     */
    supportsMaximize() {},

    /**
     * Block direct child widgets with a zIndex below <code>zIndex</code>
     *
     * @param zIndex {Integer} All child widgets with a zIndex below this value
     *     will be blocked
     */
    blockContent(zIndex) {
      this.assertInteger(zIndex);
    },

    /**
     * Remove the blocker.
     */
    unblock() {},

    /**
     * Whether the widget is currently blocked
     *
     * @return {Boolean} whether the widget is blocked.
     */
    isBlocked() {}
  }
});
