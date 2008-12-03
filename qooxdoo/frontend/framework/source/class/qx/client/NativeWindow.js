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
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * A native window is a new browser window (popup) with a URL.
 * It wraps the window.open command to a useable cross-browser
 * compatible API.
 */
qx.Class.define("qx.client.NativeWindow",
{
  extend : qx.core.Target,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(url, name)
  {
    this.base(arguments);

    this._timer = new qx.client.Timer(100);
    this._timer.addEventListener("interval", this._oninterval, this);

    if (url != null) {
      this.setUrl(url);
    }

    if (name != null) {
      this.setName(name);
    }
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired when the browser fires the load event of the document */
    "load" : "qx.event.type.Event",

    /** Fired when the window was closed */
    "close" : "qx.event.type.Event"
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** If the window is open or closed */
    open :
    {
      check : "Boolean",
      init : false,
      apply : "_applyOpen"
    },


    /** The inner width of the window. */
    width :
    {
      check : "Number",
      init : 400,
      apply : "_applyDimension"
    },


    /** The inner height of the window. */
    height :
    {
      check : "Number",
      init : 250,
      apply : "_applyDimension"
    },


    /** The left screen coordinate of the window. */
    left :
    {
      check : "Number",
      init : 100,
      apply : "_applyPosition"
    },


    /** The top screen coordinate of the window. */
    top :
    {
      check : "Number",
      init : 200,
      apply : "_applyPosition"
    },


    /** Should be window be modal */
    modal :
    {
      check : "Boolean",
      init : false
    },


    /** Should be window be dependent on this application window */
    dependent :
    {
      check : "Boolean",
      init : true
    },


    /** The url */
    url :
    {
      check : "String",
      apply : "_applyUrl",
      init : "about:blank"
    },


    /** The window name */
    name :
    {
      check : "String",
      apply : "_applyName",
      init : ""
    },


    /** The text of the statusbar */
    status :
    {
      check : "String",
      init : "Ready"
    },


    /** Should the statusbar be shown */
    showStatusbar :
    {
      check : "Boolean",
      init : false
    },


    /** Should the menubar be shown */
    showMenubar :
    {
      check : "Boolean",
      init : false
    },


    /** Should the location(bar) be shown */
    showLocation :
    {
      check : "Boolean",
      init : false
    },


    /** Should the toolbar be shown */
    showToolbar :
    {
      check : "Boolean",
      init : false
    },


    /** If the window is resizable */
    resizable :
    {
      check : "Boolean",
      init : true
    },


    /** If the window is able to scroll and has visible scrollbars if needed */
    allowScrollbars :
    {
      check : "Boolean",
      init : true
    },

    /** Location (left, top) of the window */
    location : {
      group : [ "left", "top" ]
    },

    /** Dimension (width, height) of the window */
    dimension : {
      group : [ "width", "height" ]
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      STATE
    ---------------------------------------------------------------------------
    */

    _loaded : false,




    /*
    ---------------------------------------------------------------------------
      MODIFIERS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyPosition : function(value, old)
    {
      /*
        http://www.microsoft.com/technet/prodtechnol/winxppro/maintain/sp2brows.mspx
        Changes to Functionality in Microsoft Windows XP Service Pack 2
        Part 5: Enhanced Browsing Security
        URLACTION_FEATURE_WINDOW_RESTRICTIONS
        Allow script-initiated windows without size or position constraints
        Code: 2102
      */

      if (!this.isClosed())
      {
        try {
          this._window.moveTo(this.getLeft(), this.getTop());
        } catch(ex) {
          this.error("Cross-Domain Scripting problem: Could not move window!", ex);
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyDimension : function(value, old)
    {
      /*
        http://www.microsoft.com/technet/prodtechnol/winxppro/maintain/sp2brows.mspx
        Changes to Functionality in Microsoft Windows XP Service Pack 2
        Part 5: Enhanced Browsing Security
        URLACTION_FEATURE_WINDOW_RESTRICTIONS
        Allow script-initiated windows without size or position constraints
        Code: 2102
      */

      if (!this.isClosed())
      {
        try {
          this._window.resizeTo(this.getWidth(), this.getHeight());
        } catch(ex) {
          this.error("Cross-Domain Scripting problem: Could not resize window!", ex);
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyName : function(value, old)
    {
      if (!this.isClosed()) {
        this._window.name = value;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyUrl : function(value, old)
    {
      // String hack needed for old compressor (compile.py)
      if (!this.isClosed()) {
        this._window.location.replace(value != null ? value : ("javascript:/" + "/"));
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyOpen : function(value, old) {
      value ? this._open() : this._close();
    },



    /*
    ---------------------------------------------------------------------------
      UTILITY
    ---------------------------------------------------------------------------
    */

    /**
     * Whether the window is closed
     *
     * @type member
     * @return {Boolean} Returns true when the window is closed
     */
    isClosed : function()
    {
      var vClosed = true;

      if (this._window)
      {
        try {
          vClosed = this._window.closed;
        } catch(ex) {}
      }

      return vClosed;
    },


    /**
     * Open the window (if not already opened)
     *
     * @type member
     * @return {void}
     */
    open : function() {
      this.setOpen(true);
    },


    /**
     * Close the window (if not already closed)
     *
     * @type member
     * @return {void}
     */
    close : function() {
      this.setOpen(false);
    },


    /**
     * Whether the content of the window is loaded.
     *
     * @type member
     * @return {Boolean} Returns true when the content is loaded.
     */
    isLoaded : function() {
      return this._loaded;
    },




    /*
    ---------------------------------------------------------------------------
      OPEN METHOD
    ---------------------------------------------------------------------------
    */

    /**
     * Generates the parameter set for the native window.open() and
     * opens the window.
     *
     * Used by the property {@link #open}.
     *
     * @type member
     * @return {void}
     */
    _open : function()
    {
      var conf = [];




      /*
      ------------------------------------------------------------------------------
        PRE CONFIGURE WINDOW
      ------------------------------------------------------------------------------
      */

      if (this.getWidth() != null)
      {
        conf.push("width");
        conf.push("=");
        conf.push(this.getWidth());
        conf.push(",");
      }

      if (this.getHeight() != null)
      {
        conf.push("height");
        conf.push("=");
        conf.push(this.getHeight());
        conf.push(",");
      }

      if (this.getLeft() != null)
      {
        conf.push("left");
        conf.push("=");
        conf.push(this.getLeft());
        conf.push(",");
      }

      if (this.getTop() != null)
      {
        conf.push("top");
        conf.push("=");
        conf.push(this.getTop());
        conf.push(",");
      }

      conf.push("dependent");
      conf.push("=");
      conf.push(this.getDependent() ? "yes" : "no");
      conf.push(",");

      conf.push("resizable");
      conf.push("=");
      conf.push(this.getResizable() ? "yes" : "no");
      conf.push(",");

      conf.push("status");
      conf.push("=");
      conf.push(this.getShowStatusbar() ? "yes" : "no");
      conf.push(",");

      conf.push("location");
      conf.push("=");
      conf.push(this.getShowLocation() ? "yes" : "no");
      conf.push(",");

      conf.push("menubar");
      conf.push("=");
      conf.push(this.getShowMenubar() ? "yes" : "no");
      conf.push(",");

      conf.push("toolbar");
      conf.push("=");
      conf.push(this.getShowToolbar() ? "yes" : "no");
      conf.push(",");

      conf.push("scrollbars");
      conf.push("=");
      conf.push(this.getAllowScrollbars() ? "yes" : "no");
      conf.push(",");

      conf.push("modal");
      conf.push("=");
      conf.push(this.getModal() ? "yes" : "no");
      conf.push(",");




      /*
      ------------------------------------------------------------------------------
        OPEN WINDOW
      ------------------------------------------------------------------------------
      */

      if (this.getName() == "") {
        this.setName("qx_NativeWindow" + this.toHashCode());
      }

      this._window = window.open(this.getUrl(), this.getName(), conf.join(""));

      if (this.isClosed()) {
        this.error("Window could not be opened. It seems, there is a popup blocker active!");
      }
      else
      {
        // This try-catch is needed because of cross domain issues (access rights)
        try
        {
          this._window._native = this;
          this._window.onload = this._onload;
        }
        catch(ex) {}

        // start timer for close detection
        this._timer.start();

        // block original document
        if (this.getModal()) {
          qx.ui.core.ClientDocument.getInstance().block(this);
        }
      }
    },


    /**
     * Implementation of close logic. Used by the property {@link #open}.
     *
     * @type member
     * @return {void}
     */
    _close : function()
    {
      if (!this._window) {
        return;
      }

      // stop timer for close detection
      this._timer.stop();

      // release window again
      if (this.getModal()) {
        qx.ui.core.ClientDocument.getInstance().release(this);
      }

      // finally close window
      if (!this.isClosed()) {
        this._window.close();
      }

      try
      {
        this._window._native = null;
        this._window.onload = null;
      }
      catch(ex) {}

      this._window = null;
      this._loaded = false;

      this.createDispatchEvent("close");
    },




    /*
    ---------------------------------------------------------------------------
      CENTER SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Centers the window to the screen
     *
     * @type member
     * @return {void}
     *
     * @deprecated does not show any effect in FF3, IE7 and Safari 3.2.1. http://bugzilla.qooxdoo.org/show_bug.cgi?id=1007
     */
    centerToScreen : function() {
      /*
      this._centerHelper((screen.width - this.getWidth()) / 2, (screen.height - this.getHeight()) / 2);
      */
    },


    /**
     * Centers the window to the available screen area
     *
     * @type member
     * @return {void}
     *
     * @deprecated does not show any effect in FF3, IE7 and Safari 3.2.1. See http://bugzilla.qooxdoo.org/show_bug.cgi?id=1007
     */
    centerToScreenArea : function() {
      /*
      this._centerHelper((screen.availWidth - this.getWidth()) / 2, (screen.availHeight - this.getHeight()) / 2);
      */
    },


    /**
     * Centers the window to the opener window
     *
     * @type member
     * @return {void}
     *
     * @deprecated does not show any effect in FF3, IE7 and Safari 3.2.1. http://bugzilla.qooxdoo.org/show_bug.cgi?id=1007
     */
    centerToOpener : function() {
      /*
      this._centerHelper(((qx.html.Window.getInnerWidth(window) - this.getWidth()) / 2) + qx.html.Location.getScreenBoxLeft(window.document.body), ((qx.html.Window.getInnerHeight(window) - this.getHeight()) / 2) + qx.html.Location.getScreenBoxTop(window.document.body));
      */
    },


    /**
     * Internal helper to handle centering of native windows.
     *
     * @type member
     * @param l {Integer} left location
     * @param t {Integer} top location
     * @return {void}
     */
    _centerHelper : function(l, t)
    {
      // set new values
      this.setLeft(l);
      this.setTop(t);

      // focus window if opened
      if (!this.isClosed()) {
        this.focus();
      }
    },




    /*
    ---------------------------------------------------------------------------
      FOCUS HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Focus the window (opposite of {@link #blur})
     *
     * @type member
     * @return {void}
     */
    focus : function()
    {
      if (!this.isClosed()) {
        this._window.focus();
      }
    },


    /**
     * Blur the window (opposite of {@link #focus})
     *
     * @type member
     * @return {void}
     */
    blur : function()
    {
      if (!this.isClosed()) {
        this._window.blur();
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Executed on each timer interval to detect two things:
     *
     * * the load status of the document
     * * if the window was closed
     *
     * @type member
     * @param e {Event} DOM Event
     * @return {void}
     */
    _oninterval : function(e)
    {
      if (this.isClosed()) {
        this.setOpen(false);
      }
      else if (!this._loaded)
      {
        // This try-catch is needed because of cross domain issues (access rights)
        try
        {
          if (this._window.document && this._window.document.readyState == "complete")
          {
            this._loaded = true;
            this.createDispatchEvent("load");
          }
        }
        catch(ex) {}
      }
    },


    /**
     * Fires the qooxdoo load event
     *
     * @type member
     * @param e {Event} DOM Event
     * @return {void}
     */
    _onload : function(e)
    {
      var obj = this._native;

      if (!obj._loaded)
      {
        obj._loaded = true;
        obj.createDispatchEvent("load");
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (this.getDependent()) {
      this.close();
    }

    this._disposeObjects("_timer");

    if (this._window)
    {
      try
      {
        this._window._native = null;
        this._window.onload = null;
      }
      catch(ex) {}

      this._window = null;
    }
  }
});
