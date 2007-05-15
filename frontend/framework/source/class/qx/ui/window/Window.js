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

#module(ui_window)

************************************************************************ */

/**
 * @state active
 * @state maximized This state is active if the window is maximized
 *
 * @appearance window The main window object
 * @appearance window-resize-frame {qx.ui.basic.Terminator}
 * @appearance window-captionbar-icon {qx.ui.basic.Image}
 * @appearance window-captionbar-title {qx.ui.basic.Label} The label of the caption bar
 * @appearance window-captionbar-minimize-button {qx.ui.form.Button}
 * @appearance window-captionbar-restore-button {qx.ui.form.Button}
 * @appearance window-captionbar-maximize-button {qx.ui.form.Button}
 * @appearance window-captionbar-close-button {qx.ui.form.Button}
 * @appearance window-statusbar {qx.ui.layout.HorizontalBoxLayout}
 * @appearance window-statusbar-text {qx.ui.basic.Label}
 *
 * @appearance window-captionbar {qx.ui.layout.HorizontalBoxLayout}
 * @state active {window-captionbar}
 */
qx.Class.define("qx.ui.window.Window",
{
  extend : qx.ui.resizer.ResizeablePopup,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vCaption, vIcon, vWindowManager)
  {
    this.base(arguments);

    // ************************************************************************
    //   MANAGER
    // ************************************************************************
    // Init Window Manager
    this.setWindowManager(vWindowManager || qx.ui.window.Window.getDefaultWindowManager());

    // ************************************************************************
    //   LAYOUT
    // ************************************************************************
    var l = this._layout = new qx.ui.layout.VerticalBoxLayout;
    l.setEdge(0);
    this.add(l);

    // ************************************************************************
    //   CAPTIONBAR
    // ************************************************************************
    var cb = this._captionBar = new qx.ui.layout.HorizontalBoxLayout;
    cb.setAppearance("window-captionbar");
    cb.setHeight("auto");
    cb.setOverflow("hidden");
    l.add(cb);

    // ************************************************************************
    //   CAPTIONICON
    // ************************************************************************
    if (vIcon != null)
    {
      var ci = this._captionIcon = new qx.ui.basic.Image(vIcon);
      ci.setAppearance("window-captionbar-icon");
      cb.add(ci);
    }

    // ************************************************************************
    //   CAPTIONTITLE
    // ************************************************************************
    var ct = this._captionTitle = new qx.ui.basic.Label(vCaption);
    ct.setAppearance("window-captionbar-title");
    ct.setSelectable(false);
    cb.add(ct);

    // ************************************************************************
    //   CAPTIONFLEX
    // ************************************************************************
    var cf = this._captionFlex = new qx.ui.basic.HorizontalSpacer;
    cb.add(cf);

    // ************************************************************************
    //   CAPTIONBUTTONS: MINIMIZE
    // ************************************************************************
    var bm = this._minimizeButton = new qx.ui.form.Button;

    bm.setAppearance("window-captionbar-minimize-button");
    bm.setTabIndex(-1);

    bm.addEventListener("execute", this._onminimizebuttonclick, this);
    bm.addEventListener("mousedown", this._onbuttonmousedown, this);

    cb.add(bm);

    // ************************************************************************
    //   CAPTIONBUTTONS: RESTORE
    // ************************************************************************
    var br = this._restoreButton = new qx.ui.form.Button;

    br.setAppearance("window-captionbar-restore-button");
    br.setTabIndex(-1);

    br.addEventListener("execute", this._onrestorebuttonclick, this);
    br.addEventListener("mousedown", this._onbuttonmousedown, this);

    // don't add initially
    // cb.add(br);
    // ************************************************************************
    //   CAPTIONBUTTONS: MAXIMIZE
    // ************************************************************************
    var bx = this._maximizeButton = new qx.ui.form.Button;

    bx.setAppearance("window-captionbar-maximize-button");
    bx.setTabIndex(-1);

    bx.addEventListener("execute", this._onmaximizebuttonclick, this);
    bx.addEventListener("mousedown", this._onbuttonmousedown, this);

    cb.add(bx);

    // ************************************************************************
    //   CAPTIONBUTTONS: CLOSE
    // ************************************************************************
    var bc = this._closeButton = new qx.ui.form.Button;

    bc.setAppearance("window-captionbar-close-button");
    bc.setTabIndex(-1);

    bc.addEventListener("execute", this._onclosebuttonclick, this);
    bc.addEventListener("mousedown", this._onbuttonmousedown, this);

    cb.add(bc);

    // ************************************************************************
    //   PANE
    // ************************************************************************
    var p = this._pane = new qx.ui.layout.CanvasLayout;
    p.setHeight("1*");
    p.setOverflow("hidden");
    l.add(p);

    // ************************************************************************
    //   STATUSBAR
    // ************************************************************************
    var sb = this._statusBar = new qx.ui.layout.HorizontalBoxLayout;
    sb.setAppearance("window-statusbar");
    sb.setHeight("auto");

    // ************************************************************************
    //   STATUSTEXT
    // ************************************************************************
    var st = this._statusText = new qx.ui.basic.Label("Ready");
    st.setAppearance("window-statusbar-text");
    st.setSelectable(false);
    sb.add(st);

    // ************************************************************************
    //   INIT
    // ************************************************************************
    if (vCaption != null) {
      this.setCaption(vCaption);
    }

    if (vIcon != null) {
      this.setIcon(vIcon);
    }

    // ************************************************************************
    //   FUNCTIONAL
    // ************************************************************************
    this.setAutoHide(false);

    // ************************************************************************
    //   EVENTS: WINDOW
    // ************************************************************************
    this.addEventListener("mousedown", this._onwindowmousedown);
    this.addEventListener("click", this._onwindowclick);

    // ************************************************************************
    //   EVENTS: CAPTIONBAR
    // ************************************************************************
    cb.addEventListener("mousedown", this._oncaptionmousedown, this);
    cb.addEventListener("mouseup", this._oncaptionmouseup, this);
    cb.addEventListener("mousemove", this._oncaptionmousemove, this);
    cb.addEventListener("dblclick", this._oncaptiondblblick, this);

    // ************************************************************************
    //   REMAPPING
    // ************************************************************************
    this.remapChildrenHandlingTo(this._pane);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      MANAGER HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type static
     * @return {var} TODOC
     */
    getDefaultWindowManager : function()
    {
      if (!qx.ui.window.Window._defaultWindowManager) {
        qx.ui.window.Window._defaultWindowManager = new qx.manager.object.WindowManager;
      }

      return qx.ui.window.Window._defaultWindowManager;
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Appearance of the widget */
    appearance :
    {
      refine : true,
      init : "window"
    },


    /** The windowManager to use for. */
    windowManager :
    {
      check : "qx.manager.object.WindowManager",
      event : "changeWindowManager"
    },


    /**
     * If the window is active, only one window in a single qx.manager.object.WindowManager could
     *  have set this to true at the same time.
     */
    active :
    {
      check : "Boolean",
      init : false,
      apply : "_modifyActive",
      event : "changeActive"
    },


    /** Should be window be modal (this disable minimize and maximize buttons) */
    modal :
    {
      check : "Boolean",
      init : false,
      apply : "_modifyModal",
      event : "changeModal"
    },


    /** Should be window be modal (this disables minimize and maximize buttons) */
    mode :
    {
      check : [ "minimized", "maximized" ],
      init : null,
      nullable: true,
      apply : "_modifyMode",
      event : "changeMode"
    },


    /** The opener (button) of the window */
    opener :
    {
      check : "qx.ui.core.Widget"
    },


    /** The text of the caption */
    caption :
    {
      apply : "_modifyCaption",
      event : "changeCaption",
      dispose : true
    },


    /** The icon of the caption */
    icon :
    {
      check : "String",
      nullable : true,
      event : "changeIcon"
    },


    /** The text of the statusbar */
    status :
    {
      check : "String",
      init : "Ready",
      apply : "_modifyStatus",
      event :"changeStatus"
    },


    /** Should the close button be shown */
    showClose :
    {
      check : "Boolean",
      init : true,
      apply : "_modifyShowClose"
    },


    /** Should the maximize button be shown */
    showMaximize :
    {
      check : "Boolean",
      init : true,
      apply : "_modifyShowMaximize"
    },


    /** Should the minimize button be shown */
    showMinimize :
    {
      check : "Boolean",
      init : true,
      apply : "_modifyShowMinimize"
    },


    /** Should the statusbar be shown */
    showStatusbar :
    {
      check : "Boolean",
      init : false,
      apply : "_modifyShowStatusbar"
    },


    /** Should the user have the ability to close the window */
    allowClose :
    {
      check : "Boolean",
      init : true,
      apply : "_modifyAllowClose"
    },


    /** Should the user have the ability to maximize the window */
    allowMaximize :
    {
      check : "Boolean",
      init : true,
      apply : "_modifyAllowMaximize"
    },


    /** Should the user have the ability to minimize the window */
    allowMinimize :
    {
      check : "Boolean",
      init : true,
      apply : "_modifyAllowMinimize"
    },


    /** If the text (in the captionbar) should be visible */
    showCaption :
    {
      check : "Boolean",
      init : true,
      apply : "_modifyShowCaption"
    },


    /** If the icon (in the captionbar) should be visible */
    showIcon :
    {
      check : "Boolean",
      init : true,
      apply : "_modifyShowIcon"
    },


    /** If the window is moveable */
    moveable :
    {
      check : "Boolean",
      init : true,
      event : "changeMoveable"
    },


    /** The move method to use */
    moveMethod :
    {
      check : [ "opaque", "frame", "translucent" ],
      init : "opaque",
      event : "changeMoveMethod"
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
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getPane : function() {
      return this._pane;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getCaptionBar : function() {
      return this._captionBar;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getStatusBar : function() {
      return this._statusBar;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    close : function() {
      this.hide();
    },


    /**
     * TODOC
     *
     * @type member
     * @param vOpener {var} TODOC
     * @return {void}
     */
    open : function(vOpener)
    {
      if (vOpener != null) {
        this.setOpener(vOpener);
      }

      if (this.getCentered()) {
        this.centerToBrowser();
      }

      this.show();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    focus : function() {
      this.setActive(true);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    blur : function() {
      this.setActive(false);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    maximize : function() {
      this.setMode("maximized");
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    minimize : function() {
      this.setMode("minimized");
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    restore : function() {
      this.setMode(null);
    },




    /*
    ---------------------------------------------------------------------------
      APPEAR/DISAPPEAR
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _beforeAppear : function()
    {
      // Intentionally bypass superclass and call super.super._beforeAppear
      qx.ui.layout.CanvasLayout.prototype._beforeAppear.call(this);

      // Hide popups
      qx.manager.object.PopupManager.getInstance().update();

      // Configure the focus root to be the current opened window
      qx.event.handler.EventHandler.getInstance().setFocusRoot(this);

      this.getWindowManager().add(this);
      this._makeActive();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _beforeDisappear : function()
    {
      // Intentionally bypass superclass and call super.super._beforeDisappear
      qx.ui.layout.CanvasLayout.prototype._beforeDisappear.call(this);

      // Reset focus root
      var vFocusRoot = qx.event.handler.EventHandler.getInstance().getFocusRoot();

      if (vFocusRoot == this || this.contains(vFocusRoot)) {
        qx.event.handler.EventHandler.getInstance().setFocusRoot(null);
      }

      // Be sure to disable any capturing inside invisible parts
      // Is this to much overhead?
      // Are there any other working solutions?
      var vWidget = qx.event.handler.EventHandler.getInstance().getCaptureWidget();

      if (vWidget && this.contains(vWidget)) {
        vWidget.setCapture(false);
      }

      this.getWindowManager().remove(this);
      this._makeInactive();
    },




    /*
    ---------------------------------------------------------------------------
      ZIndex Positioning
    ---------------------------------------------------------------------------
    */

    _minZIndex : 1e5,


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _sendTo : function()
    {
      var vAll = qx.lang.Object.getValues(this.getWindowManager().getAll()).sort(qx.util.Compare.byZIndex);
      var vLength = vAll.length;
      var vIndex = this._minZIndex;

      for (var i=0; i<vLength; i++) {
        vAll[i].setZIndex(vIndex++);
      }
    },




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
     * @return {Boolean} TODOC
     */
    _modifyActive : function(value, old)
    {
      if (old)
      {
        if (this.getFocused()) {
          this.setFocused(false);
        }

        if (this.getWindowManager().getActiveWindow() == this) {
          this.getWindowManager().setActiveWindow(null);
        }

        this.removeState("active");
        this._captionBar.removeState("active");
        this._minimizeButton.removeState("active");
        this._restoreButton.removeState("active");
        this._maximizeButton.removeState("active");
        this._closeButton.removeState("active");
      }
      else
      {
        // Switch focus
        // Also do this if gets inactive as this moved the focus outline
        // away from any focused child.
        if (!this.getFocusedChild()) {
          this.setFocused(true);
        }

        this.getWindowManager().setActiveWindow(this);
        this.bringToFront();

        this.addState("active");
        this._captionBar.addState("active");
        this._minimizeButton.addState("active");
        this._restoreButton.addState("active");
        this._maximizeButton.addState("active");
        this._closeButton.addState("active");
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {Boolean} TODOC
     */
    _modifyModal : function(value, old)
    {
      // Inform blocker
      if (this._initialLayoutDone && this.getVisibility() && this.getDisplay())
      {
        var vTop = this.getTopLevelWidget();
        value ? vTop.block(this) : vTop.release(this);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {var} TODOC
     */
    _modifyAllowClose : function(value, old) {
      this._closeButtonManager();
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {var} TODOC
     */
    _modifyAllowMaximize : function(value, old) {
      this._maximizeButtonManager();
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {var} TODOC
     */
    _modifyAllowMinimize : function(value, old) {
      this._minimizeButtonManager();
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {Boolean} TODOC
     */
    _modifyMode : function(value, old)
    {
      switch(value)
      {
        case "minimized":
          this._minimize();
          break;

        case "maximized":
          this._maximize();
          break;

        default:
          switch(old)
          {
            case "maximized":
              this._restoreFromMaximized();
              break;

            case "minimized":
              this._restoreFromMinimized();
              break;
          }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {Boolean} TODOC
     */
    _modifyShowCaption : function(value, old)
    {
      if (value) {
        this._captionBar.addAt(this._captionTitle, this.getShowIcon() ? 1 : 0);
      } else {
        this._captionBar.remove(this._captionTitle);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {Boolean} TODOC
     */
    _modifyShowIcon : function(value, old)
    {
      if (value) {
        this._captionBar.addAtBegin(this._captionIcon);
      } else {
        this._captionBar.remove(this._captionIcon);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {Boolean} TODOC
     */
    _modifyShowStatusbar : function(value, old)
    {
      if (value) {
        this._layout.addAtEnd(this._statusBar);
      } else {
        this._layout.remove(this._statusBar);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {Boolean} TODOC
     */
    _modifyShowClose : function(value, old)
    {
      if (value) {
        this._captionBar.addAtEnd(this._closeButton);
      } else {
        this._captionBar.remove(this._closeButton);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {Boolean} TODOC
     */
    _modifyShowMaximize : function(value, old)
    {
      if (value)
      {
        var t = this.getMode() == "maximized" ? this._restoreButton : this._maximizeButton;

        if (this.getShowMinimize()) {
          this._captionBar.addAfter(t, this._minimizeButton);
        } else {
          this._captionBar.addAfter(t, this._captionFlex);
        }
      }
      else
      {
        this._captionBar.remove(this._maximizeButton);
        this._captionBar.remove(this._restoreButton);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {Boolean} TODOC
     */
    _modifyShowMinimize : function(value, old)
    {
      if (value) {
        this._captionBar.addAfter(this._minimizeButton, this._captionFlex);
      } else {
        this._captionBar.remove(this._minimizeButton);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {Boolean} TODOC
     */
    _minimizeButtonManager : function() {
      this.getAllowMinimize() === false ? this._minimizeButton.setEnabled(false) : this._minimizeButton.resetEnabled();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {Boolean} TODOC
     */
    _closeButtonManager : function() {
      this.getAllowClose() === false ? this._closeButton.setEnabled(false) : this._closeButton.resetEnabled();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {Boolean} TODOC
     */
    _maximizeButtonManager : function()
    {
      var b = this.getAllowMaximize() && this.getResizeable() && this._computedMaxWidthTypeNull && this._computedMaxHeightTypeNull;

      if (this._maximizeButton) {
        b === false ? this._maximizeButton.setEnabled(false) : this._maximizeButton.resetEnabled();
      }

      if (this._restoreButton) {
        b === false ? this._restoreButton.setEnabled(false) : this._restoreButton.resetEnabled();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {Boolean} TODOC
     */
    _modifyStatus : function(value, old) {
      this._statusText.setText(value);
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {var} TODOC
     */
    _modifyMaxWidth : function(value, old)
    {
      this.base(arguments);
      this._maximizeButtonManager();
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {var} TODOC
     */
    _modifyMaxHeight : function(value, old)
    {
      this.base(arguments);
      this._maximizeButtonManager();
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {var} TODOC
     */
    _modifyResizeable : function(value, old) {
      this._maximizeButtonManager();
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {Boolean} TODOC
     */
    _modifyCaption : function(value, old) {
      this._captionTitle.setText(value);
    },




    /*
    ---------------------------------------------------------------------------
      STATE LAYOUT IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _minimize : function()
    {
      this.blur();
      this.hide();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _restoreFromMaximized : function()
    {
      // restore previous dimension and location
      this.setLeft(this._previousLeft ? this._previousLeft : null);
      this.setWidth(this._previousWidth ? this._previousWidth : null);
      this.setRight(this._previousRight ? this._previousRight : null);

      this.setTop(this._previousTop ? this._previousTop : null);
      this.setHeight(this._previousHeight ? this._previousHeight : null);
      this.setBottom(this._previousBottom ? this._previousBottom : null);

      // update state
      this.removeState("maximized");

      // toggle button
      if (this.getShowMaximize())
      {
        var cb = this._captionBar;
        var v = cb.indexOf(this._restoreButton);

        cb.remove(this._restoreButton);
        cb.addAt(this._maximizeButton, v);
      }

      // finally focus the window
      this.focus();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _restoreFromMinimized : function()
    {
      if (this.hasState("maximized")) {
        this.setMode("maximized");
      }

      this.show();
      this.focus();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _maximize : function()
    {
      if (this.hasState("maximized")) {
        return;
      }

      // store current dimension and location
      this._previousLeft = this.getLeft();
      this._previousWidth = this.getWidth();
      this._previousRight = this.getRight();
      this._previousTop = this.getTop();
      this._previousHeight = this.getHeight();
      this._previousBottom = this.getBottom();

      // setup new dimension and location
      this.setWidth(null);
      this.setLeft(0);
      this.setRight(0);
      this.setHeight(null);
      this.setTop(0);
      this.setBottom(0);

      // update state
      this.addState("maximized");

      // toggle button
      if (this.getShowMaximize())
      {
        var cb = this._captionBar;
        var v = cb.indexOf(this._maximizeButton);

        cb.remove(this._maximizeButton);
        cb.addAt(this._restoreButton, v);
      }

      // finally focus the window
      this.focus();
    },




    /*
    ---------------------------------------------------------------------------
      EVENTS: WINDOW
    ---------------------------------------------------------------------------
    */


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onwindowclick : function(e)
    {
      // stop event
      e.stopPropagation();
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onwindowmousedown : function(e) {
      this.focus();
    },



    /*
    ---------------------------------------------------------------------------
      EVENTS: BUTTONS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onbuttonmousedown : function(e) {
      e.stopPropagation();
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onminimizebuttonclick : function(e)
    {
      this.minimize();

      // we need to be sure that the button gets the right states after clicking
      // because the button will move and does not get the mouseup event anymore
      this._minimizeButton.removeState("pressed");
      this._minimizeButton.removeState("abandoned");
      this._minimizeButton.removeState("over");

      e.stopPropagation();
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onrestorebuttonclick : function(e)
    {
      this.restore();

      // we need to be sure that the button gets the right states after clicking
      // because the button will move and does not get the mouseup event anymore
      this._restoreButton.removeState("pressed");
      this._restoreButton.removeState("abandoned");
      this._restoreButton.removeState("over");

      e.stopPropagation();
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmaximizebuttonclick : function(e)
    {
      this.maximize();

      // we need to be sure that the button gets the right states after clicking
      // because the button will move and does not get the mouseup event anymore
      this._maximizeButton.removeState("pressed");
      this._maximizeButton.removeState("abandoned");
      this._maximizeButton.removeState("over");

      e.stopPropagation();
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onclosebuttonclick : function(e)
    {
      this.close();

      // we need to be sure that the button gets the right states after clicking
      // because the button will move and does not get the mouseup event anymore
      this._closeButton.removeState("pressed");
      this._closeButton.removeState("abandoned");
      this._closeButton.removeState("over");

      e.stopPropagation();
    },




    /*
    ---------------------------------------------------------------------------
      EVENTS: CAPTIONBAR
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _oncaptionmousedown : function(e)
    {
      if (!e.isLeftButtonPressed() || !this.getMoveable() || this.getMode() != null) {
        return;
      }

      // enable capturing
      this._captionBar.setCapture(true);

      // element cache
      var el = this.getElement();

      // measuring and caching of values for drag session
      var pa = this.getParent();
      var pl = pa.getElement();

      var l = qx.html.Location.getPageAreaLeft(pl);
      var t = qx.html.Location.getPageAreaTop(pl);
      var r = qx.html.Location.getPageAreaRight(pl);
      var b = qx.html.Location.getPageAreaBottom(pl);

      this._dragSession =
      {
        offsetX                   : e.getPageX() - qx.html.Location.getPageBoxLeft(el) + l,
        offsetY                   : e.getPageY() - qx.html.Location.getPageBoxTop(el) + t,
        parentAvailableAreaLeft   : l + 5,
        parentAvailableAreaTop    : t + 5,
        parentAvailableAreaRight  : r - 5,
        parentAvailableAreaBottom : b - 5
      };

      // handle frame and translucently
      switch(this.getMoveMethod())
      {
        case "translucent":
          this.setOpacity(0.5);
          break;

        case "frame":
          var f = this._frame;

          if (f.getParent() != this.getParent())
          {
            f.setParent(this.getParent());
            qx.ui.core.Widget.flushGlobalQueues();
          }

          f._applyRuntimeLeft(qx.html.Location.getPageBoxLeft(el) - l);
          f._applyRuntimeTop(qx.html.Location.getPageBoxTop(el) - t);

          f._applyRuntimeWidth(qx.html.Dimension.getBoxWidth(el));
          f._applyRuntimeHeight(qx.html.Dimension.getBoxHeight(el));

          f.setZIndex(this.getZIndex() + 1);

          break;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _oncaptionmouseup : function(e)
    {
      var s = this._dragSession;

      if (!s) {
        return;
      }

      // disable capturing
      this._captionBar.setCapture(false);

      // move window to last position
      if (s.lastX != null) {
        this.setLeft(s.lastX);
      }

      if (s.lastY != null) {
        this.setTop(s.lastY);
      }

      // handle frame and translucently
      switch(this.getMoveMethod())
      {
        case "translucent":
          this.setOpacity(null);
          break;

        case "frame":
          this._frame.setParent(null);
          break;
      }

      // cleanup session
      delete this._dragSession;
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _oncaptionmousemove : function(e)
    {
      var s = this._dragSession;

      // pre check for active session and capturing
      if (!s || !this._captionBar.getCapture()) {
        return;
      }

      // pre check if we go out of the available area
      if (!qx.lang.Number.isBetweenRange(e.getPageX(), s.parentAvailableAreaLeft, s.parentAvailableAreaRight) || !qx.lang.Number.isBetweenRange(e.getPageY(), s.parentAvailableAreaTop, s.parentAvailableAreaBottom)) {
        return;
      }

      // use the fast and direct dom methods
      var o = this.getMoveMethod() == "frame" ? this._frame : this;

      o._applyRuntimeLeft(s.lastX = e.getPageX() - s.offsetX);
      o._applyRuntimeTop(s.lastY = e.getPageY() - s.offsetY);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void | var} TODOC
     */
    _oncaptiondblblick : function()
    {
      if (!this._maximizeButton.getEnabled()) {
        return;
      }

      return this.getMode() == "maximized" ? this.restore() : this.maximize();
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("_layout", "_captionBar", "_captionIcon",
      "_captionTitle", "_captionFlex", "_closeButton", "_minimizeButton",
      "_maximizeButton", "_restoreButton", "_pane", "_statusBar", "_statusText");
  }
});
