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

#optional(qx.legacy.util.NativeWindow)
#optional(qx.legacy.ui.window.Window)
#optional(qx.legacy.ui.popup.PopupManager)

************************************************************************ */

/**
 * This is the basic widget of all qooxdoo applications.
 *
 * qx.legacy.ui.core.ClientDocument is the parent of all children inside your application. It
 * also handles their resizing and focus navigation.
 *
 * @appearance client-document
 */
qx.Class.define("qx.legacy.ui.core.ClientDocument",
{
  type : "singleton",
  extend : qx.legacy.ui.layout.CanvasLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // CSS fix
    if (qx.core.Setting.get("qx.boxModelCorrection"))
    {
      var boxSizingAttr = qx.legacy.core.Client.getInstance().getEngineBoxSizingAttributes();
      var borderBoxCss = boxSizingAttr.join(":border-box;") + ":border-box;";
      var contentBoxCss = boxSizingAttr.join(":content-box;") + ":content-box;";

      qx.bom.Stylesheet.createElement(
        "html,body { margin:0;border:0;padding:0; } " +
        "html { border:0 none; } " +
        "*{" + borderBoxCss +"} " +
        "img{" + contentBoxCss + "}"
      );
    }

    if (qx.core.Setting.get("qx.enableApplicationLayout")) {
      qx.bom.Stylesheet.createElement("html,body{width:100%;height:100%;overflow:hidden;}");
    }


    this._window = window;
    this._document = window.document;

    // Init element
    this.setElement(this._document.body);

    // Reset absolute position
    this._document.body.style.position = "";

    // Disable IE background image cache
    // TODO: Optimize this => Only needed in IE6
    try {
      document.execCommand("BackgroundImageCache", false, true);
    } catch(err) {};

    // Cache current size
    this._cachedInnerWidth = this._document.body.offsetWidth;
    this._cachedInnerHeight = this._document.body.offsetHeight;

    // Add Resize Handler
    this.addListener("windowresize", this._onwindowresize);

    // Dialog Support
    this._modalWidgets = [];
    this._modalNativeWindow = null;

    // Enable as focus root behavior
    this.activateFocusRoot();

    // Initialize Properties
    this.initHideFocus();
    this.initSelectable();

    // Register as current focus root
    qx.legacy.event.handler.EventHandler.getInstance().setFocusRoot(this);
  },



  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events:
  {
    /** (Fired by {@link qx.legacy.event.handler.EventHandler}) */
    "focus"         : "qx.event.type.Event",

    /** Fired when the window looses the focus (Fired by {@link qx.legacy.event.handler.EventHandler}) */
    "windowblur"    : "qx.event.type.Event",

    /**  Fired when the window gets the focus (Fired by {@link qx.legacy.event.handler.EventHandler}) */
    "windowfocus"   : "qx.event.type.Event",

    /** Fired when the window has been resized (Fired by {@link qx.legacy.event.handler.EventHandler}) */
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
     * @return {var} TODOC
     */
    getWindowElement : function() {
      return this._window;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getDocumentElement : function() {
      return this._document;
    },


    /**
     * TODOC
     *
     * @return {qx.legacy.ui.core.Parent} TODOC
     * @signature function()
     */
    getParent : qx.lang.Function.returnNull,


    /**
     * TODOC
     *
     * @return {qx.legacy.ui.popup.ToolTip} TODOC
     * @signature function()
     */
    getToolTip : qx.lang.Function.returnNull,


    /**
     * TODOC
     *
     * @signature function()
     * @return {boolean}
     */
    isMaterialized : qx.lang.Function.returnTrue,


    /**
     * TODOC
     *
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
     * @return {ClientDocumentBlocker} the blocker widget.
     */
    _getBlocker : function()
    {
      if (!this._blocker)
      {
        // Create blocker instance
        this._blocker = new qx.legacy.ui.core.ClientDocumentBlocker;

        // Add blocker events
        this._blocker.addListener("mousedown", this.blockHelper, this);
        this._blocker.addListener("mouseup", this.blockHelper, this);

        // Add blocker to client document
        this.add(this._blocker);
      }

      return this._blocker;
    },


    /**
     * TODOC
     *
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
     * @param vActiveChild {var} TODOC
     * @return {void}
     */
    block : function(vActiveChild)
    {
      // this.debug("BLOCK: " + vActiveChild.toHashCode());
      this._getBlocker().show();

      if (qx.Class.isDefined("qx.legacy.ui.window.Window") && vActiveChild instanceof qx.legacy.ui.window.Window)
      {
        this._modalWidgets.push(vActiveChild);

        var vOrigIndex = vActiveChild.getZIndex();
        this._getBlocker().setZIndex(vOrigIndex);
        vActiveChild.setZIndex(vOrigIndex + 1);
      }
      else if (qx.Class.isDefined("qx.legacy.util.NativeWindow") && vActiveChild instanceof qx.legacy.util.NativeWindow)
      {
        this._modalNativeWindow = vActiveChild;
        this._getBlocker().setZIndex(1e7);
      }
    },


    /**
     * TODOC
     *
     * @param vActiveChild {var} TODOC
     * @return {void}
     */
    release : function(vActiveChild)
    {
      // this.debug("RELEASE: " + vActiveChild.toHashCode());
      if (vActiveChild)
      {
        if (qx.Class.isDefined("qx.legacy.util.NativeWindow") && vActiveChild instanceof qx.legacy.util.NativeWindow) {
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
     * @param vCssText {var} TODOC
     * @return {var} TODOC
     */
    createStyleElement : function(vCssText) {
      return qx.bom.Stylesheet.createElement(vCssText);
    },


    /**
     * TODOC
     *
     * @param vSheet {var} TODOC
     * @param vSelector {var} TODOC
     * @param vStyle {var} TODOC
     * @return {var} TODOC
     */
    addCssRule : function(vSheet, vSelector, vStyle) {
      return qx.bom.Stylesheet.addRule(vSheet, vSelector, vStyle);
    },


    /**
     * TODOC
     *
     * @param vSheet {var} TODOC
     * @param vSelector {var} TODOC
     * @return {var} TODOC
     */
    removeCssRule : function(vSheet, vSelector) {
      return qx.bom.Stylesheet.removeRule(vSheet, vSelector);
    },


    /**
     * TODOC
     *
     * @param vSheet {var} TODOC
     * @return {var} TODOC
     */
    removeAllCssRules : function(vSheet) {
      return qx.bom.Stylesheet.removeAllRules(vSheet);
    },




    /*
    ---------------------------------------------------------------------------
      GLOBAL CURSOR SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
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
     * @param e {Event} TODOC
     * @return {void}
     */
    _onwindowresize : function(e)
    {
      // Hide popups, tooltips, ...
      if (qx.Class.isDefined("qx.legacy.ui.popup.PopupManager")) {
        qx.legacy.ui.popup.PopupManager.getInstance().update();
      }

      // Update children
      this._recomputeInnerWidth();
      this._recomputeInnerHeight();

      // Flush queues
      qx.legacy.ui.core.Widget.flushGlobalQueues();
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    _computeInnerWidth : function() {
      return this._document.body.offsetWidth;
    },


    /**
     * TODOC
     *
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
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("_blocker");
    this._disposeFields("_window", "_document", "_modalWidgets", "_modalNativeWindow", "_globalCursorStyleSheet");
  }
});
