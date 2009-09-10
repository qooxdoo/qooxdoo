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
     * Alexander Back (aback)

************************************************************************ */

/**
 * Includes library functions to work with browser windows
 */
qx.Class.define("qx.bom.Window",
{
  statics :
  {
     __availableOptions :
    {
      top        : 1,
      left       : 1,
      width      : 1,
      height     : 1,
      dependent  : 1,
      resizable  : 1,
      status     : 1,
      location   : 1,
      menubar    : 1,
      scrollbars : 1,
      toolbar    : 1
    },


    /**
     * Opens a native window with the given options.
     *
     * Native windows can have the following options:
     *   - top
     *   - left
     *   - width
     *   - height
     *   - dependent
     *   - resizable
     *   - status
     *   - location
     *   - menubar
     *   - scrollbars
     *   - toolbar
     *
     * Except of dimension and location options all other options are boolean
     * values.
     *
     * @param url {String} URL of the window
     * @param name {String} Name of the window
     * @param options {Map} Window options
     * @return {win} native window object
     */
    open : function(url, name, options)
    {
      if (url == null) {
        url = "javascript:/";
      }

      if (name == null) {
        name = "qxNativeWindow" + new Date().getTime();
      }

      var configuration = [];
      var value;
      var availableOptions = this.__availableOptions;
      var Type = qx.lang.Type;

      for (var key in options)
      {
        if (availableOptions[key])
        {
          if (Type.isBoolean(options[key])) {
            value = key + "=" + (options[key] ? "yes" : "no");
          } else {
            value = key + "=" + options[key];
          }

          configuration.push(value);
        }
        else
        {
          qx.log.Logger.warn("Option '" + key + "' is not supported for native windows.");
        }
      }

      return window.open(url, name, configuration.join(","));
    },


    /**
     * Closes the given window
     *
     * @param win {Window} Native window object
     * @return {void}
     */
    close : function(win)
    {
      if (win) {
        return win.close();
      }
    },


    /**
     * Checks if the window is closed
     *
     * @param win {Window} Native window object
     * @return {Boolean} Closed state
     */
    isClosed : function(win)
    {
      var closed = true;

      if (win)
      {
        try {
          closed = win.closed;
        } catch(ex) {}
      }

      return closed;
    },


    /**
     * Moving an opened window is not allowed in the most browsers anymore.
     *
     * @param win {Window} Native window object
     * @param top {Integer} Y-coordinate
     * @param left {Integer} X-coordinate
     * @return {void}
     */
    moveTo : function(win, top, left)
    {
      /*
        http://www.microsoft.com/technet/prodtechnol/winxppro/maintain/sp2brows.mspx
        Changes to Functionality in Microsoft Windows XP Service Pack 2
        Part 5: Enhanced Browsing Security
        URLACTION_FEATURE_WINDOW_RESTRICTIONS
        Allow script-initiated windows without size or position constraints
        Code: 2102
      */

      if (!qx.bom.Window.isClosed(win))
      {
        try {
          win.moveTo(left, top);
        } catch(ex) {
          qx.log.Logger.error("Cross-Domain Scripting problem: Could not move window!", ex);
        }
      }
    },


    /**
     * Resizing an opened window is not allowed in the most browsers anymore.
     *
     * @param win {Window} Native window object
     * @param width {Integer} New width
     * @param height {Integer} New height
     * @return {void}
     */
    resizeTo : function(win, width, height)
    {
      /*
        http://www.microsoft.com/technet/prodtechnol/winxppro/maintain/sp2brows.mspx
        Changes to Functionality in Microsoft Windows XP Service Pack 2
        Part 5: Enhanced Browsing Security
        URLACTION_FEATURE_WINDOW_RESTRICTIONS
        Allow script-initiated windows without size or position constraints
        Code: 2102
      */

      if (!qx.bom.Window.isClosed(win))
      {
        try {
          win.resizeTo(width, height);
        } catch(ex) {
          qx.log.Logger.error("Cross-Domain Scripting problem: Could not resize window!", ex);
        }
      }
    }
  }
});