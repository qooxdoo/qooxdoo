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

/* ************************************************************************

#module(ui_core)
#optional(qx.client.NativeWindow)
#optional(qx.ui.window.Window)
#optional(qx.ui.popup.PopupManager)

************************************************************************ */

/**
 * This is the basic widget of all qooxdoo applications.
 *
 * qx.ui.core.ClientDocument is the parent of all children inside your application. It
 * also handles their resizing and focus navigation.
 *
 * @appearance client-document
 */
qx.Class.define("qx.ui.core.ClientDocument",
{
  type : "singleton",
  extend : qx.ui.layout.CanvasLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._window = window;
    this._document = window.document;

    // Init element
    this.setElement(this._document.body);

    // Reset absolute position
    this._document.body.style.position = "";

    // Disable IE background image cache
    if( qx.core.Variant.isSet("qx.client", "mshtml") && (qx.core.Client.getInstance().getMajor() < 7) ){
      try {
        document.execCommand("BackgroundImageCache", false, true);
      } catch(err) {};
    }

    // Cache current size
    this._cachedInnerWidth = this._document.body.offsetWidth;
    this._cachedInnerHeight = this._document.body.offsetHeight;

    // Add Resize Handler
    this.addEventListener("windowresize", this._onwindowresize);

    // Dialog Support
    this._modalWidgets = [];
    this._modalNativeWindow = null;

    // Enable as focus root behavior
    this.activateFocusRoot();

    // Initialize Properties
    this.initHideFocus();
    this.initSelectable();

    // Register as current focus root
    qx.event.handler.EventHandler.getInstance().setFocusRoot(this);
  },



  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events:
  {
    /** (Fired by {@link qx.event.handler.EventHandler}) */
    "focus"         : "qx.event.type.Event",

    /** Fired when the window looses the focus (Fired by {@link qx.event.handler.EventHandler}) */
    "windowblur"    : "qx.event.type.Event",

    /**  Fired when the window gets the focus (Fired by {@link qx.event.handler.EventHandler}) */
    "windowfocus"   : "qx.event.type.Event",

    /** Fired when the window has been resized (Fired by {@link qx.event.handler.EventHandler}) */
    "windowresize"  : "qx.event.type.Event"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "client-document"
    },

    enableElementFocus :
    {
      refine : true,
      init : false
    },

    enabled :
    {
      refine : true,
      init : true
    },

    selectable :
    {
      refine : true,
      init : false
    },

    hideFocus :
    {
      refine : true,
      init : true
    },

    /**
     *  Sets the global cursor style
     *
     *  The name of the cursor to show when the mouse pointer is over the widget.
     *  This is any valid CSS2 cursor name defined by W3C.
     *
     *  The following values are possible:
     *  <ul><li>default</li>
     *  <li>crosshair</li>
     *  <li>pointer (hand is the ie name and will mapped to pointer in non-ie).</li>
     *  <li>move</li>
     *  <li>n-resize</li>
     *  <li>ne-resize</li>
     *  <li>e-resize</li>
     *  <li>se-resize</li>
     *  <li>s-resize</li>
     *  <li>sw-resize</li>
     *  <li>w-resize</li>
     *  <li>nw-resize</li>
     *  <li>text</li>
     *  <li>wait</li>
     *  <li>help </li>
     *  <li>url([file]) = self defined cursor, file should be an ANI- or CUR-type</li>
     *  </ul>
     */
    globalCursor :
    {
      check : "String",
      nullable : true,
      themeable : true,
      apply : "_applyGlobalCursor",
      event : "changeGlobalCursor"
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
      OVERWRITE WIDGET FUNCTIONS/PROPERTIES
    ---------------------------------------------------------------------------
    */

    /**
     * @signature function()
     */
    _applyParent : qx.lang.Function.returnTrue,


    /**
     * @signature function()
     * @return {Object}
     */
    getTopLevelWidget : qx.lang.Function.returnThis,


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getWindowElement : function() {
      return this._window;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getDocumentElement : function() {
      return this._document;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {qx.ui.core.Parent} TODOC
     * @signature function()
     */
    getParent : qx.lang.Function.returnNull,


    /**
     * TODOC
     *
     * @type member
     * @return {qx.ui.popup.ToolTip} TODOC
     * @signature function()
     */
    getToolTip : qx.lang.Function.returnNull,


    /**
     * TODOC
     *
     * @type member
     * @signature function()
     * @return {boolean}
     */
    isMaterialized : qx.lang.Function.returnTrue,


    /**
     * TODOC
     *
     * @type member
     * @signature function()
     * @return {boolean}
     */
    isSeeable : qx.lang.Function.returnTrue,


    _isDisplayable : true,
    _hasParent : false,
    _initialLayoutDone : true,




    /*
    ---------------------------------------------------------------------------
      BLOCKER AND DIALOG SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the blocker widget if already created; otherwise create it first
     *
     * @type member
     * @return {ClientDocumentBlocker} the blocker widget.
     */
    _getBlocker : function()
    {
      if (!this._blocker)
      {
        // Create blocker instance
        this._blocker = new qx.ui.core.ClientDocumentBlocker;

        // Add blocker events
        this._blocker.addEventListener("mousedown", this.blockHelper, this);
        this._blocker.addEventListener("mouseup", this.blockHelper, this);

        // Add blocker to client document
        this.add(this._blocker);
      }

      return this._blocker;
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    blockHelper : function(e)
    {
      if (this._modalNativeWindow)
      {
        if (!this._modalNativeWindow.isClosed()) {
          this._modalNativeWindow.focus();
        }
        else
        {
          this.debug("Window seems to be closed already! => Releasing Blocker");
          this.release(this._modalNativeWindow);
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vActiveChild {var} TODOC
     * @return {void}
     */
    block : function(vActiveChild)
    {
      // this.debug("BLOCK: " + vActiveChild.toHashCode());
      this._getBlocker().show();

      if (qx.Class.isDefined("qx.ui.window.Window") && vActiveChild instanceof qx.ui.window.Window)
      {
        this._modalWidgets.push(vActiveChild);

        var vOrigIndex = vActiveChild.getZIndex();
        this._getBlocker().setZIndex(vOrigIndex);
        vActiveChild.setZIndex(vOrigIndex + 1);
      }
      else if (qx.Class.isDefined("qx.client.NativeWindow") && vActiveChild instanceof qx.client.NativeWindow)
      {
        this._modalNativeWindow = vActiveChild;
        this._getBlocker().setZIndex(1e7);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vActiveChild {var} TODOC
     * @return {void}
     */
    release : function(vActiveChild)
    {
      // this.debug("RELEASE: " + vActiveChild.toHashCode());
      if (vActiveChild)
      {
        if (qx.Class.isDefined("qx.client.NativeWindow") && vActiveChild instanceof qx.client.NativeWindow) {
          this._modalNativeWindow = null;
        } else {
          qx.lang.Array.remove(this._modalWidgets, vActiveChild);
        }
      }

      var l = this._modalWidgets.length;

      if (l == 0) {
        this._getBlocker().hide();
      }
      else
      {
        var oldActiveChild = this._modalWidgets[l - 1];

        var o = oldActiveChild.getZIndex();
        this._getBlocker().setZIndex(o);
        oldActiveChild.setZIndex(o + 1);
      }
    },




    /*
    ---------------------------------------------------------------------------
      CSS API
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vCssText {var} TODOC
     * @return {var} TODOC
     */
    createStyleElement : function(vCssText) {
      return qx.html.StyleSheet.createElement(vCssText);
    },


    /**
     * TODOC
     *
     * @type member
     * @param vSheet {var} TODOC
     * @param vSelector {var} TODOC
     * @param vStyle {var} TODOC
     * @return {var} TODOC
     */
    addCssRule : function(vSheet, vSelector, vStyle) {
      return qx.html.StyleSheet.addRule(vSheet, vSelector, vStyle);
    },


    /**
     * TODOC
     *
     * @type member
     * @param vSheet {var} TODOC
     * @param vSelector {var} TODOC
     * @return {var} TODOC
     */
    removeCssRule : function(vSheet, vSelector) {
      return qx.html.StyleSheet.removeRule(vSheet, vSelector);
    },


    /**
     * TODOC
     *
     * @type member
     * @param vSheet {var} TODOC
     * @return {var} TODOC
     */
    removeAllCssRules : function(vSheet) {
      return qx.html.StyleSheet.removeAllRules(vSheet);
    },




    /*
    ---------------------------------------------------------------------------
      GLOBAL CURSOR SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyGlobalCursor : qx.core.Variant.select("qx.client",
    {
      // MSHTML uses special code here. The default code works, too in MSHTML
      // but is really really slow. To change style sheets or class names
      // in documents with a deep structure is nearly impossible in MSHTML. It
      // runs multiple seconds to minutes just for adding a new rule to a global
      // style sheet. For the highly interactive use cases of this method, this
      // is not practicable. The alternative implementation directly patches
      // all DOM elements with a manual cursor setting (to work-around the
      // inheritance blocking nature of these local values). This solution does
      // not work as perfect as the style sheet modification in other browsers.
      // While a global cursor is applied the normal cursor property would overwrite
      // the forced global cursor value. This site effect was decided to be less
      // important than the expensive performance issue of the better working code.
      // See also bug: http://bugzilla.qooxdoo.org/show_bug.cgi?id=487
      "mshtml" : function(value, old)
      {
        if (value == "pointer") {
          value = "hand";
        }

        if (old == "pointer") {
          old = "hand";
        }

        var elem, current;

        var list = this._cursorElements;
        if (list)
        {
          for (var i=0, l=list.length; i<l; i++)
          {
            elem = list[i];

            if (elem.style.cursor == old)
            {
              elem.style.cursor = elem._oldCursor;
              elem._oldCursor = null;
            }
          }
        }

        var all = document.all;
        var list = this._cursorElements = [];

        if (value != null && value != "" && value != "auto")
        {
          for (var i=0, l=all.length; i<l; i++)
          {
            elem = all[i];
            current = elem.style.cursor;

            if (current != null && current != "" && current != "auto")
            {
              elem._oldCursor = current;
              elem.style.cursor = value;
              list.push(elem);
            }
          }

          // Also apply to body element
          document.body.style.cursor = value;
        }
        else
        {
          // Reset from body element
          document.body.style.cursor = "";
        }
      },

      "default" : function(value, old)
      {
        if (!this._globalCursorStyleSheet) {
          this._globalCursorStyleSheet = this.createStyleElement();
        }

        this.removeCssRule(this._globalCursorStyleSheet, "*");

        if (value) {
          this.addCssRule(this._globalCursorStyleSheet, "*", "cursor:" + value + " !important");
        }
      }
    }),




    /*
    ---------------------------------------------------------------------------
      WINDOW RESIZE HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onwindowresize : function(e)
    {
      // Hide popups, tooltips, ...
      if (qx.Class.isDefined("qx.ui.popup.PopupManager")) {
        qx.ui.popup.PopupManager.getInstance().update();
      }

      // Update children
      this._recomputeInnerWidth();
      this._recomputeInnerHeight();

      // Flush queues
      qx.ui.core.Widget.flushGlobalQueues();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    _computeInnerWidth : function() {
      return this._document.body.offsetWidth;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    _computeInnerHeight : function() {
      return this._document.body.offsetHeight;
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings :
  {
    "qx.enableApplicationLayout" : true,
    "qx.boxModelCorrection"      : true
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function()
  {
    // CSS fix
    if (qx.core.Setting.get("qx.boxModelCorrection"))
    {
      var boxSizingAttr = qx.core.Client.getInstance().getEngineBoxSizingAttributes();
      var borderBoxCss = boxSizingAttr.join(":border-box;") + ":border-box;";
      var contentBoxCss = boxSizingAttr.join(":content-box;") + ":content-box;";

      qx.html.StyleSheet.createElement(
        "html,body { margin:0;border:0;padding:0; } " +
        "html { border:0 none; } " +
        "*{" + borderBoxCss +"} " +
        "img{" + contentBoxCss + "}"
      );
    }

    if (qx.core.Setting.get("qx.enableApplicationLayout")) {
      qx.html.StyleSheet.createElement("html,body{width:100%;height:100%;overflow:hidden;}");
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("_blocker");
    this._disposeFields("_window", "_document", "_modalWidgets", "_modalNativeWindow", "_globalCursorStyleSheet");
  }
});
