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
  extend : qx.ui.resizer.ResizablePopup,



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
    var ci = this._captionIcon = new qx.ui.basic.Image;
    ci.setAppearance("window-captionbar-icon");
    cb.add(ci);

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
     * Returns the default window manager. If no exists a new instance of
     * the manager is created.
     *
     * @type static
     * @return {qx.ui.window.Manager} window manager instance
     */
    getDefaultWindowManager : function()
    {
      if (!qx.ui.window.Window._defaultWindowManager) {
        qx.ui.window.Window._defaultWindowManager = new qx.ui.window.Manager;
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
      check : "qx.ui.window.Manager",
      event : "changeWindowManager"
    },


    /**
     * If the window is active, only one window in a single qx.ui.window.Manager could
     *  have set this to true at the same time.
     */
    active :
    {
      check : "Boolean",
      init : false,
      apply : "_applyActive",
      event : "changeActive"
    },


    /** Should be window be modal (this disable minimize and maximize buttons) */
    modal :
    {
      check : "Boolean",
      init : false,
      apply : "_applyModal",
      event : "changeModal"
    },


    /** The current mode (minimized or maximized) of the window instance
     * <b>Attention:</b> if the window instance is neither maximized nor minimized this
     * property will return <code>null</code>
     */
    mode :
    {
      check : [ "minimized", "maximized" ],
      init : null,
      nullable: true,
      apply : "_applyMode",
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
      apply : "_applyCaption",
      event : "changeCaption",
      dispose : true
    },


    /** The icon of the caption */
    icon :
    {
      check : "String",
      nullable : true,
      apply : "_applyIcon",
      event : "changeIcon"
    },


    /** The text of the statusbar */
    status :
    {
      check : "String",
      init : "Ready",
      apply : "_applyStatus",
      event :"changeStatus"
    },


    /** Should the close button be shown */
    showClose :
    {
      check : "Boolean",
      init : true,
      apply : "_applyShowClose"
    },


    /** Should the maximize button be shown */
    showMaximize :
    {
      check : "Boolean",
      init : true,
      apply : "_applyShowMaximize"
    },


    /** Should the minimize button be shown */
    showMinimize :
    {
      check : "Boolean",
      init : true,
      apply : "_applyShowMinimize"
    },


    /** Should the statusbar be shown */
    showStatusbar :
    {
      check : "Boolean",
      init : false,
      apply : "_applyShowStatusbar"
    },


    /** Should the user have the ability to close the window */
    allowClose :
    {
      check : "Boolean",
      init : true,
      apply : "_applyAllowClose"
    },


    /** Should the user have the ability to maximize the window */
    allowMaximize :
    {
      check : "Boolean",
      init : true,
      apply : "_applyAllowMaximize"
    },


    /** Should the user have the ability to minimize the window */
    allowMinimize :
    {
      check : "Boolean",
      init : true,
      apply : "_applyAllowMinimize"
    },


    /** If the text (in the captionbar) should be visible */
    showCaption :
    {
      check : "Boolean",
      init : true,
      apply : "_applyShowCaption"
    },


    /** If the icon (in the captionbar) should be visible */
    showIcon :
    {
      check : "Boolean",
      init : true,
      apply : "_applyShowIcon"
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
     * Accessor method for the pane sub widget
     *
     * @type member
     * @return {qx.ui.layout.CanvasLayout} pane sub widget
     */
    getPane : function() {
      return this._pane;
    },


    /**
     * Accessor method for the captionbar sub widget
     *
     * @type member
     * @return {qx.ui.layout.HorizontalBoxLayout} captionbar sub widget
     */
    getCaptionBar : function() {
      return this._captionBar;
    },


    /**
     * Accessor method for the statusbar sub widget
     *
     * @type member
     * @return {qx.ui.layout.HorizontalBoxLayout} statusbar sub widget
     */
    getStatusBar : function() {
      return this._statusBar;
    },


    /**
     * Closes the current window instance.
     * Technically calls the {@link qx.ui.core.Widget#hide} method.
     *
     * @type member
     * @return {void}
     */
    close : function() {
      this.hide();
    },


    /**
     * Opens the window.<br/>
     * Sets the opener property (if available) and centers
     * the window if the property {@link #centered} is enabled.
     *
     * @type member
     * @param vOpener {Object} Opener widget
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
     * Set the focus on the window.<br/>
     * Setting the {@link #active} property to <code>true</code>
     *
     * @type member
     * @return {void}
     */
    focus : function() {
      this.setActive(true);
    },


    /**
     * Release the focus on the window.<br/>
     * Setting the {@link #active} property to <code>false</code>
     *
     * @type member
     * @return {void}
     */
    blur : function() {
      this.setActive(false);
    },


    /**
     * Maximize the window by setting the property {@link mode} to <code>maximized</code>
     *
     * @type member
     * @return {void}
     */
    maximize : function() {
      this.setMode("maximized");
    },


    /**
     * Maximize the window by setting the property {@link mode} to <code>minimized</code>
     *
     * @type member
     * @return {void}
     */
    minimize : function() {
      this.setMode("minimized");
    },


    /**
     * Maximize the window by setting the property {@link mode} to <code>null</code>
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
     * Executes routines to ensure the window is displayed correctly and gains control.<br/>
     * Hides all open popups, sets the focus root to the current window, adds
     * the current window to the window manager and calls {@link qx.ui.popup.Popup#_makeActive}.
     *
     * @type member
     * @return {void}
     */
    _beforeAppear : function()
    {
      // Intentionally bypass superclass and call super.super._beforeAppear
      qx.ui.layout.CanvasLayout.prototype._beforeAppear.call(this);

      // Hide popups
      qx.ui.popup.PopupManager.getInstance().update();

      // Configure the focus root to be the current opened window
      qx.event.handler.EventHandler.getInstance().setFocusRoot(this);

      this.getWindowManager().add(this);
      this._makeActive();
    },


    /**
     * Executes routines to ensure the window releases all control.<br/>
     * Resets the focus root, release the capturing on any contained widget,
     * deregisters from the window manager and calls {@link qx.ui.popup.Popup#_makeInactive}.
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
     * Gets all registered window instances (sorted by the zIndex) and resets
     * the zIndex on all instances.
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
     */
    _applyActive : function(value, old)
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
     */
    _applyModal : function(value, old)
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
    _applyAllowClose : function(value, old) {
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
    _applyAllowMaximize : function(value, old) {
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
    _applyAllowMinimize : function(value, old) {
      this._minimizeButtonManager();
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyMode : function(value, old)
    {
      switch(value)
      {
        case "minimized":
          this._disableResize = true;
          this._minimize();
          break;

        case "maximized":
          this._disableResize = true;
          this._maximize();
          break;

        default:
          delete this._disableResize;
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
     */
    _applyShowCaption : function(value, old)
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
     */
    _applyShowIcon : function(value, old)
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
     */
    _applyShowStatusbar : function(value, old)
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
     */
    _applyShowClose : function(value, old)
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
     */
    _applyShowMaximize : function(value, old)
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
     */
    _applyShowMinimize : function(value, old)
    {
      if (value) {
        this._captionBar.addAfter(this._minimizeButton, this._captionFlex);
      } else {
        this._captionBar.remove(this._minimizeButton);
      }
    },


    /**
     * Enables/disables the minimize button in order of the {@link #allowMinimize} property
     *
     * @type member
     */
    _minimizeButtonManager : function() {
      this.getAllowMinimize() === false ? this._minimizeButton.setEnabled(false) : this._minimizeButton.resetEnabled();
    },


    /**
     * Enables/disables the close button in order of the {@link #allowClose} property
     *
     * @type member
     */
    _closeButtonManager : function() {
      this.getAllowClose() === false ? this._closeButton.setEnabled(false) : this._closeButton.resetEnabled();
    },


    /**
     * Disables the maximize and restore buttons when the window instance is already maximized,
     * otherwise the {@link #enabled} property of both buttons get resetted.
     *
     * @type member
     */
    _maximizeButtonManager : function()
    {
      var b = this.getAllowMaximize() && this.getResizable() && this._computedMaxWidthTypeNull && this._computedMaxHeightTypeNull;

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
     */
    _applyStatus : function(value, old) {
      this._statusText.setText(value);
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {void} TODOC
     */
    _applyMaxWidth : function(value, old)
    {
      this.base(arguments, value);
      this._maximizeButtonManager();
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {void} TODOC
     */
    _applyMaxHeight : function(value, old)
    {
      this.base(arguments, value);
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
    _applyResizable : function(value, old) {
      this._maximizeButtonManager();
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyCaption : function(value, old) {
      this._captionTitle.setText(value);
    },

    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyIcon : function(value, old) {
      this._captionIcon.setSource(value);
    },




    /*
    ---------------------------------------------------------------------------
      STATE LAYOUT IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    /**
     * Minimizes the window. Technically this methods calls the {@link qx.ui.core.Widget#blur}
     * and the {@link qx.ui.core.Widget#hide} methods.
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
     * Restores the window from maximized mode.<br/>
     * Restores the previous dimension and location, removes the
     * state <code>maximized</code> and replaces the restore button
     * with the maximize button.
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
     * Restores the window from minimized mode.<br/>
     * Reset the window mode to maximized if the window
     * has the state maximized and call {@link qx.ui.core.Widget#show} and
     * {@link qx.ui.core.Widget#focus}
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
     * Maximizes the window.<br/>
     * Stores the current dimension and location and setups up
     * the new ones. Adds the state <code>maximized</code> and toggles
     * the buttons in the caption bar.
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
     * Stops every mouse click on the window by calling {@link qx.event.type.Event#stopPropagation}
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouse click event
     * @return {void}
     */
    _onwindowclick : function(e)
    {
      // stop event
      e.stopPropagation();
    },


    /**
     * Focuses the window instance.
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouse down event
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
     * Stops every mouse down event on each button in the captionbar
     * by calling {@link qx.event.type.Event#stopPropagation}
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouse down event
     * @return {void}
     */
    _onbuttonmousedown : function(e) {
      e.stopPropagation();
    },


    /**
     * Minmizes the window, removes all states from the minimize button and
     * stops the further propagation of the event (calling {@link qx.event.type.Event#stopPropagation}).
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouse click event
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
     * Restores the window, removes all states from the restore button and
     * stops the further propagation of the event (calling {@link qx.event.type.Event#stopPropagation}).
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouse click event
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
     * Maximizes the window, removes all states from the maximize button and
     * stops the further propagation of the event (calling {@link qx.event.type.Event#stopPropagation}).
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouse click event
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
     * Closes the window, removes all states from the close button and
     * stops the further propagation of the event (calling {@link qx.event.type.Event#stopPropagation}).
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouse click event
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
     * Enables the capturing of the caption bar and prepares the drag session and the
     * appearance (translucent, frame or opaque) for the moving of the window.
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouse down event
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

      // compute locations
      var paLoc = qx.bom.element.Location.get(pl, "scroll");
      var elLoc = qx.bom.element.Location.get(el);

      this._dragSession =
      {
        offsetX                   : e.getPageX() - elLoc.left + paLoc.left,
        offsetY                   : e.getPageY() - elLoc.top + paLoc.top,
        parentAvailableAreaLeft   : paLoc.left + 5,
        parentAvailableAreaTop    : paLoc.top + 5,
        parentAvailableAreaRight  : paLoc.right - 5,
        parentAvailableAreaBottom : paLoc.bottom - 5
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

            // This flush is required to get the element node, needed by
            // the code below and the other event handlers
            qx.ui.core.Widget.flushGlobalQueues();
          }

          f._renderRuntimeLeft(elLoc.left - paLoc.left);
          f._renderRuntimeTop(elLoc.top - paLoc.top);

          f._renderRuntimeWidth(el.offsetWidth);
          f._renderRuntimeHeight(el.offsetHeight);

          f.setZIndex(this.getZIndex() + 1);

          break;
      }
    },


    /**
     * Disables the capturing of the caption bar and moves the window
     * to the last position of the drag session. Also restores the appearance
     * of the window.
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouse up event
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
     * Does the moving of the window by rendering the position
     * of the window (or frame) at runtime using direct dom methods.
     *
     * @type member
     * @param e {qx.event.type.Event} mouse move event
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

      o._renderRuntimeLeft(s.lastX = e.getPageX() - s.offsetX);
      o._renderRuntimeTop(s.lastY = e.getPageY() - s.offsetY);
    },


    /**
     * Maximizes the window or restores it if it is already
     * maximized.
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} double click event
     * @return {void}
     */
    _oncaptiondblblick : function(e)
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
