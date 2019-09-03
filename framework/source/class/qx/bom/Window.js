/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)

************************************************************************ */

/**
 * Includes library functions to work with browser windows
 */
qx.Class.define("qx.bom.Window",
{
  statics :
  {
    /** Internal blocker instance for all browsers which need an additional
     * blocker for modal windows because they do not support it natively.
     */
    __blocker : null,

    /** Window handle which is currently blocked. */
    __blockerWindow : null,

    /** Timer instance to poll for unblocking if the modal window was closed */
    __timer : null,

    /** Supported options and their mapping to window options */
    __modalOptions :
    {
      "top"      : "dialogTop",
      left       : "dialogLeft",
      width      : "dialogWidth",
      height     : "dialogHeight",
      scrollbars : "scroll",
      resizable  : "resizable"
    },

    /** Supported options for modeless windows */
    __modelessOptions :
    {
      "top"      : 1,
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
     * Whether the browser can open native modal window.
     *
     * @return {Boolean} Capability of open modal windows
     */
    __isCapableToOpenModalWindows : function() {
      return window.showModalDialog != null;
    },


    /**
     * Opens a native window with the given options.
     *
     * Modal windows can have the following options:
     *
     *   * top
     *
     *   * left
     *
     *   * width
     *
     *   * height
     *
     *   * scrollbars
     *
     *   * resizable
     *
     * Modeless windows have the following options:
     *
     *   * top
     *
     *   * left
     *
     *   * width
     *
     *   * height
     *
     *   * dependent
     *
     *   * resizable
     *
     *   * status
     *
     *   * location
     *
     *   * menubar
     *
     *   * scrollbars
     *
     *   * toolbar
     *
     * Except of dimension and location options all other options are boolean
     * values.
     *
     * *Important infos for native modal windows*
     *
     * If you want to reference the opened window from within the native modal
     * window you need to use
     *
     * <pre class='javascript'>
     * var opener = window.dialogArguments[0];
     * </pre>
     *
     * since a reference to the opener is passed automatically to the modal window.
     *
     * *Passing window arguments*
     *
     * This is only working if the page of the modal window is from the same origin.
     * This is at least true for Firefox browsers.
     *
     * @param url {String} URL of the window
     * @param name {String} Name of the window
     * @param options {Map} Window options
     * @param modal {Boolean} Whether the window should be opened modal
     * @param useNativeModalDialog {Boolean} controls if modal windows are opened
     *                                       using the native method or a blocker
     *                                       should be used to fake modality.
     *                                       Default is <b>true</b>
     * @param listener {Function ?} listener function for onload event on the new window
     * @param self {Object ?} Reference to the 'this' variable inside
     *         the event listener. When not given, 'this' variable will be the new window
     * @return {Window} native window object
     */
    open : function(url, name, options, modal, useNativeModalDialog, listener, self)
    {
      var newWindow = null;
      if (url == null) {
        url = "javascript:/";
      }

      if (name == null) {
        name = "qxNativeWindow" + new Date().getTime();
      }

      if (useNativeModalDialog == null) {
        useNativeModalDialog = true;
      }

      var configurationString = this.__generateConfigurationString(options, modal && useNativeModalDialog);

      if (modal)
      {
        if (this.__isCapableToOpenModalWindows() && useNativeModalDialog) {
          newWindow = window.showModalDialog(url, [ window.self ], configurationString);
        }
        else
        {
          this.getBlocker().block();

          if (this.__timer == null)
          {
            this.__timer = new qx.event.Timer(500);
            this.__timer.addListener("interval", this.__checkForUnblocking, this);
          }

          this.__blockerWindow = window.open(url, name, configurationString);
          this.__timer.restart();

          newWindow = this.__blockerWindow;
        }
      } else {
        newWindow = window.open(url, name, configurationString);
      }

      if(newWindow && listener && (listener instanceof Function)){
        var context = self || newWindow;
        var onLoadFunction = qx.lang.Function.bind(listener, context);
        var onNativeLoad = function(){
          onLoadFunction();
          qx.bom.Event.removeNativeListener(newWindow, 'load', onNativeLoad);
        }
        qx.bom.Event.addNativeListener(newWindow, 'load', onNativeLoad);
      }
      return newWindow;
    },


    /**
     * Returns the given config as string for direct use for the "window.open" method
     *
     * @param options {Array} Array with all configuration options
     * @param modality {Boolean} whether the config should be for a modal window
     *
     * @return {String} configuration as string representation
     */
    __generateConfigurationString : function(options, modality)
    {
      var configurationString;
      var value;
      var configuration = [];

      if (modality && this.__isCapableToOpenModalWindows())
      {
        for (var key in options)
        {
          if (qx.bom.Window.__modalOptions[key])
          {
            var suffix = "";
            if (key != "scrollbars" && key != "resizable") {
              suffix = "px";
            }

            value = qx.bom.Window.__modalOptions[key] + ":" + options[key] + suffix;
            configuration.push(value);
          }
          else {
            qx.log.Logger.warn("Option '" + key + "' is not supported for modal windows.");
          }
        }

        configurationString = configuration.join(";");
      }
      else
      {
        for (var key in options)
        {
          if (qx.bom.Window.__modelessOptions[key])
          {
            if (qx.lang.Type.isBoolean(options[key])) {
              value = key + "=" + (options[key] ? "yes" : "no");
            }
            else {
              value = key + "=" + options[key];
            }
            configuration.push(value);
          }
          else {
            qx.log.Logger.warn("Option '" + key + "' is not supported for native windows.");
          }
        }

        configurationString = configuration.join(",");
      }

      return configurationString;
    },


    /**
     * Interval method which checks if the native window was closed to also
     * stop the associated timer.
     */
    __checkForUnblocking : function()
    {
      if (this.isClosed(this.__blockerWindow))
      {
        this.getBlocker().unblock();
        this.__timer.stop();
      }
    },


    /**
     * If a modal window is opened with the option
     *
     * <pre class='javascript'>
     * useNativeModalWindow = false;
     * </pre>
     *
     * an instance of <b>qx.bom.Blocker</b> is used to fake modality. This method
     * can be used to get a reference to the blocker to style it.
     *
     * @return {qx.bom.Blocker?null} Blocker instance or null if no blocker is used
     */
    getBlocker : function()
    {
      if (this.__blocker == null) {
        this.__blocker = new qx.bom.Blocker;
      }

      return this.__blocker;
    },


    /**
     * Closes the given window
     *
     * @param win {Window} Native window object
     * @return {var} The return value (if any) of the window's native
     * <code>close</code> method
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
