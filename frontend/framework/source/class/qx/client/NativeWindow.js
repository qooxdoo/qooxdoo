/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************


************************************************************************ */

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
      apply : "_modifyOpen"
    },


    /** The outer width of the window. */
    width :
    {
      check : "Integer",
      init : 400,
      apply : "_modifyDimension"
    },


    /** The outer height of the window. */
    height :
    {
      check : "Integer",
      init : 250,
      apply : "_modifyDimension"
    },


    /** The left screen coordinate of the window. */
    left :
    {
      check : "Integer",
      init : 100,
      apply : "_modifyPosition"
    },


    /** The top screen coordinate of the window. */
    top :
    {
      check : "Integer",
      init : 200,
      apply : "_modifyPosition"
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
      apply : "_modifyUrl",
      init : "about:blank"
    },


    /** The window name */
    name :
    {
      check : "String",
      apply : "_modifyName",
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


    /** If the window is resizeable */
    resizeable :
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

    /** Location (left, right) of the window */
    location : {
      group : [ "left", "right" ]
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
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propName {var} TODOC
     * @return {Boolean} TODOC
     */
    _modifyPosition : function(propValue, propOldValue, propName)
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

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propName {var} TODOC
     * @return {Boolean} TODOC
     */
    _modifyDimension : function(propValue, propOldValue, propName)
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

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propName {var} TODOC
     * @return {Boolean} TODOC
     */
    _modifyName : function(propValue, propOldValue, propName)
    {
      if (!this.isClosed()) {
        this._window.name = propValue;
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propName {var} TODOC
     * @return {Boolean} TODOC
     */
    _modifyUrl : function(propValue, propOldValue, propName)
    {
      // String hack needed for old compressor (compile.py)
      if (!this.isClosed()) {
        this._window.location.replace(propValue != null ? propValue : ("javascript:/" + "/"));
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyOpen : function(propValue, propOldValue, propData)
    {
      propValue ? this._open() : this._close();
      return true;
    },




    /*
    ---------------------------------------------------------------------------
      NAME
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     * @throws TODOC
     */
    getName : function()
    {
      if (!this.isClosed())
      {
        try {
          var name = this._window.name;
        } catch(ex) {
          return this._valueName;
        }

        if (name == this._valueName) {
          return name;
        } else {
          throw new Error("window name and name property are not identical");
        }
      }
      else
      {
        return this._valueName;
      }
    },




    /*
    ---------------------------------------------------------------------------
      UTILITY
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
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
     * TODOC
     *
     * @type member
     * @return {void}
     */
    open : function() {
      this.setOpen(true);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    close : function() {
      this.setOpen(false);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
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
     * TODOC
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
      conf.push(this.getResizeable() ? "yes" : "no");
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

      if (this.getName() != null) {
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
     * TODOC
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
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    centerToScreen : function() {
      return this._centerHelper((screen.width - this.getWidth()) / 2, (screen.height - this.getHeight()) / 2);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    centerToScreenArea : function() {
      return this._centerHelper((screen.availWidth - this.getWidth()) / 2, (screen.availHeight - this.getHeight()) / 2);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    centerToOpener : function() {
      return this._centerHelper(((qx.html.Window.getInnerWidth(window) - this.getWidth()) / 2) + qx.html.Location.getScreenBoxLeft(window.document.body), ((qx.html.Window.getInnerHeight(window) - this.getHeight()) / 2) + qx.html.Location.getScreenBoxTop(window.document.body));
    },


    /**
     * TODOC
     *
     * @type member
     * @param l {var} TODOC
     * @param t {var} TODOC
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
     * TODOC
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
     * TODOC
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
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
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
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
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
