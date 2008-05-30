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
     * Fabian Jakobs (fjakobs)

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
  extend : qx.ui.core.Widget,

  include : [
    qx.ui.core.MRemoteChildrenHandling,
    qx.ui.core.MRemoteLayoutHandling,
    qx.ui.resizer.MResizable
  ],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vCaption, vIcon, vWindowManager)
  {
    this.base(arguments);

    // Init Window Manager
    this.setWindowManager(vWindowManager || qx.ui.window.Window.getDefaultWindowManager());

    this.setResizableNorth(true);
    this.setResizableWest(true);

    // layout
    this._setLayout(new qx.ui.layout.VBox());

    // caption bar
    var cb = this._captionBar = new qx.ui.container.Composite(new qx.ui.layout.HBox());
    cb.setAppearance("window-captionbar");
    this._add(cb);

    // caption icon
    var ci = this._captionIcon = new qx.ui.basic.Image(vIcon);
    ci.setAppearance("window-captionbar-icon");
    cb._add(ci);

    // caption title
    var ct = this._captionTitle = new qx.ui.basic.Label(vCaption);
    ct.setAppearance("window-captionbar-title");
    cb.add(ct);

    // spacer
    this._captionFlex = new qx.ui.core.Spacer();
    cb.add(this._captionFlex, {flex: 1});

    // minimize
    var bm = this._minimizeButton = new qx.ui.form.Button();
    bm.setAppearance("window-captionbar-minimize-button");
    bm.setFocusable(false);

    bm.addListener("execute", this._onminimizebuttonclick, this);
    bm.addListener("mousedown", this._onbuttonmousedown, this);
    cb.add(bm);

    // restore
    var br = this._restoreButton = new qx.ui.form.Button();
    br.setAppearance("window-captionbar-restore-button");
    bm.setFocusable(false);

    br.addListener("execute", this._onrestorebuttonclick, this);
    br.addListener("mousedown", this._onbuttonmousedown, this);
    // don't add initially

    // minimize
    var bx = this._maximizeButton = new qx.ui.form.Button();
    bx.setAppearance("window-captionbar-maximize-button");
    bm.setFocusable(false);

    bx.addListener("execute", this._onmaximizebuttonclick, this);
    bx.addListener("mousedown", this._onbuttonmousedown, this);
    cb.add(bx);

    // close
    var bc = this._closeButton = new qx.ui.form.Button();
    bc.setAppearance("window-captionbar-close-button");
    bm.setFocusable(false);

    bc.addListener("execute", this._onclosebuttonclick, this);
    bc.addListener("mousedown", this._onbuttonmousedown, this);
    cb.add(bc);

    // pane
    var p = this._pane = new qx.ui.container.Composite();
    this._add(p, {flex: 1});

    // status bar
    var sb = this._statusBar = new qx.ui.container.Composite(new qx.ui.layout.HBox());
    sb.setAppearance("window-statusbar");

    // status text
    var st = this._statusText = new qx.ui.basic.Label("Ready");
    st.setAppearance("window-statusbar-text");
    sb.add(st);


    // init
    if (vCaption != null) {
      this.setCaption(vCaption);
    }

    if (vIcon != null) {
      this.setIcon(vIcon);
    }

    // functional
    //this.activateFocusRoot();


    // window events
    this.addListener("mousedown", this._onwindowmousedown);
    this.addListener("click", this._onwindowclick);

    // captionbar events
    cb.addListener("mousedown", this._oncaptionmousedown, this);
    cb.addListener("mouseup", this._oncaptionmouseup, this);
    cb.addListener("mousemove", this._oncaptionmousemove, this);

    cb.addListener("dblclick", this._oncaptiondblblick, this);

    this.initVisibility();
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

  events :
  {
    /** Fired if the window is closed */
    "close" : "qx.event.type.Event",

    /** Fired if the window is minimized */
    "minimize" : "qx.event.type.Event",

    /** Fired if the window is maximized */
    "maximize" : "qx.event.type.Event",

    /** Fired if the window is restored from a minimized or maximized state */
    "restore" : "qx.event.type.Event"
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
    opener : {
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
     * The children container needed by the {@link qx.ui.core.MRemoteChildrenHandling}
     * mixin
     *
     * @type member
     * @return {qx.ui.container.Composite} pane sub widget
     */
    getChildrenContainer : function() {
      return this._pane;
    },


    /**
     * Accessor method for the captionbar sub widget
     *
     * @type member
     * @return {qx.ui.container.Composite} captionbar sub widget
     */
    getCaptionBar : function() {
      return this._captionBar;
    },


    /**
     * Accessor method for the statusbar sub widget
     *
     * @type member
     * @return {qx.ui.container.Composite} statusbar sub widget
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

      // TODO
//      if (this.getCentered()) {
//        this.centerToBrowser();
//      }

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
    maximize : function()
    {
      this.setMode("maximized");
      this.fireEvent("maximize");
    },


    /**
     * Maximize the window by setting the property {@link mode} to <code>minimized</code>
     *
     * @type member
     * @return {void}
     */
    minimize : function()
    {
      this.setMode("minimized");
      this.fireEvent("minimize");
    },


    /**
     * Maximize the window by setting the property {@link mode} to <code>null</code>
     *
     * @type member
     * @return {void}
     */
    restore : function() {
      this.setMode(null);
      this.fireEvent("restore");
    },


    /**
     * Centeres the window in the browser window.
     *
     * @type member
     */
    centerToBrowser : function()
    {
      var parentEl = this.getLayoutParent().getContentElement().getDomElement();
      if (!parentEl)
      {
        this.addListenerOnce("resize", this.centerToBrowser, this);
        return;
      }
      var parentLocation = qx.bom.element.Location.get(parentEl);

      var size = this.getSizeHint();

      var clientWidth = qx.bom.Viewport.getWidth();
      var clientHeight = qx.bom.Viewport.getHeight();

      var left = (clientWidth - size.width) / 2;
      var top = (clientHeight - size.height) / 2;

      left = left - parentLocation.left;
      top = top - parentLocation.top;

      left = Math.min(Math.max(-size.width+5, left), parentLocation.right-parentLocation.left-5);
      top = Math.min(Math.max(0, top), parentLocation.bottom-parentLocation.top+size.height-5);

      this.setLocation(left, top);
    },


    /*
    ---------------------------------------------------------------------------
      APPEAR/DISAPPEAR
    ---------------------------------------------------------------------------
    */

    // overridden
    _applyVisibility : function(value, old)
    {
      this.base(arguments, value, old);
      var isVisible = value == "visible";

      if (isVisible)
      {
        this.getWindowManager().add(this);
        // TODO
        //this._makeActive();
      }
      else
      {
        this.getWindowManager().remove(this);
        // TODO
        //this._makeInactive();
      }
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
      var list = this.getWindowManager().getAll();

      list.sort(function(a, b) {
        return a.getZIndex() - b.getZIndex()
      });

      var zindex = this._minZIndex;
      for (var i=0, l=list.length; i<l; i++) {
        list[i].setZIndex(zindex++);
      }
    },


    /**
     * Sets the {@link #zIndex} to Infinity and calls the
     * method {@link #_sendTo}
     *
     * @type member
     * @return {void}
     */
    bringToFront : function()
    {
      this.setZIndex(this._minZIndex+1000000);
      this._sendTo();
    },


    /**
     * Sets the {@link #zIndex} to -Infinity and calls the
     * method {@link #_sendTo}
     *
     * @type member
     * @return {void}
     */
    sendToBack : function()
    {
      this.setZIndex(this._minZIndex+1);
      this._sendTo();
    },






    /*
    ---------------------------------------------------------------------------
      MODIFIERS
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyActive : function(value, old)
    {
      if (old)
      {
        // TODO: Focus handling
        /*
        if (this.getFocused()) {
          this.setFocused(false);
        }
        */

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
        // TODO: Focus handling
        /*
        if (!this.getFocusedChild()) {
          this.setFocused(true);
        }
        */

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


    // property apply
    _applyModal : function(value, old)
    {
      // Inform blocker
      if (this._initialLayoutDone && this.getVisibility() && this.getDisplay())
      {
        var vTop = this.getTopLevelWidget();
        value ? vTop.block(this) : vTop.release(this);
      }
    },


    // property apply
    _applyAllowClose : function(value, old) {
      this._closeButtonManager();
    },


    // property apply
    _applyAllowMaximize : function(value, old) {
      this._maximizeButtonManager();
    },


    // property apply
    _applyAllowMinimize : function(value, old) {
      this._minimizeButtonManager();
    },


    // property apply
    _applyMode : function(value, old)
    {
      switch(value)
      {
        case "minimized":
          this.setDisableResize(true);
          this._minimize();
          break;

        case "maximized":
          this.setDisableResize(true);
          this._maximize();
          break;

        default:
          this.setDisableResize(false);
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


    // property apply
    _applyShowCaption : function(value, old)
    {
      if (value) {
        this._captionBar.addAt(this._captionTitle, this.getShowIcon() ? 1 : 0);
      } else {
        this._captionBar.remove(this._captionTitle);
      }
    },


    // property apply
    _applyShowIcon : function(value, old)
    {
      if (value) {
        this._captionBar.addAt(this._captionIcon, 0);
      } else {
        this._captionBar.remove(this._captionIcon);
      }
    },


    // property apply
    _applyShowStatusbar : function(value, old)
    {
      if (value) {
        this._add(this._statusBar);
      } else {
        this._remove(this._statusBar);
      }
    },


    // property apply
    _applyShowClose : function(value, old)
    {
      if (value) {
        this._captionBar.add(this._closeButton);
      } else {
        this._captionBar.remove(this._closeButton);
      }
    },


    // property apply
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


    // property apply
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
      var b = this.getAllowMaximize() && this.isResizable() && this._computedMaxWidthTypeNull && this._computedMaxHeightTypeNull;

      if (this._maximizeButton) {
        b === false ? this._maximizeButton.setEnabled(false) : this._maximizeButton.resetEnabled();
      }

      if (this._restoreButton) {
        b === false ? this._restoreButton.setEnabled(false) : this._restoreButton.resetEnabled();
      }
    },


    // property apply
    _applyStatus : function(value, old) {
      this._statusText.setText(value);
    },


    // property apply
    _applyResizable : function(value, old) {
      this._maximizeButtonManager();
    },


    // property apply
    _applyCaption : function(value, old) {
      this._captionTitle.setContent(value);
    },


    // property apply
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
      this.setLayoutProperties(this.__previousLayoutProps);

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
      var props = this.getLayoutProperties();
      this.__previousLayoutProps = {
        left: props.left || 0,
        right: props.right || null,
        bottom: props.bottom || null,
        top: props.top || 0
      };

      // setup new dimension and location
      this.setLayoutProperties({
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      })

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

      this.fireEvent("close");

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
      if (!this.getMoveable() || this.getMode() != null) {
        return;
      }

      // enable capturing
      this._captionBar.capture();

      // measuring and caching of values for drag session
      var pl = this.getLayoutParent().getContainerElement().getDomElement();

      // compute locations
      var paLoc = qx.bom.element.Location.get(pl, "scroll");
      var location = qx.bom.element.Location.get(this.getContainerElement().getDomElement());
      var bounds = this.getBounds();

      this._dragSession =
      {
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,

        elementLocation: location,

        parentAvailableAreaLeft : paLoc.left + 5,
        parentAvailableAreaTop : paLoc.top + 5,
        parentAvailableAreaRight : paLoc.right - 5,
        parentAvailableAreaBottom : paLoc.bottom - 5,

        mouseStartLeft: e.getDocumentLeft(),
        mouseStartTop: e.getDocumentTop()
      };

      // handle frame and translucently
      switch(this.getMoveMethod())
      {
        case "translucent":
          this.setOpacity(0.5);
          break;

        case "frame":
          var frame = this._getFrame();
          frame.show();
          frame.setUserBounds(
            location.left,
            location.top,
            location.right-location.left,
            location.bottom - location.top
          );
          frame.setZIndex(this.getZIndex() + 1);
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
      this._captionBar.releaseCapture();
      this.resetUserBounds();

      // move window to last position
      if (s.lastX != null) {
        this.setLayoutProperties({left: s.lastX});
      }

      if (s.lastY != null) {
        this.setLayoutProperties({top: s.lastY});
      }

      // handle frame and translucently
      switch(this.getMoveMethod())
      {
        case "translucent":
          this.setOpacity(null);
          break;

        case "frame":
          this._getFrame().hide();
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

      var s = this._dragSession;
      if (!s) {
        return;
      }

      // pre check if we go out of the available area
      // pre check if we go out of the available area
      if (
        !qx.lang.Number.isBetweenRange(e.getViewportLeft(), s.parentAvailableAreaLeft, s.parentAvailableAreaRight) ||
        !qx.lang.Number.isBetweenRange(e.getViewportTop(), s.parentAvailableAreaTop, s.parentAvailableAreaBottom)
      ) {
        return;
      }

      var dragOffsetLeft = e.getDocumentLeft() - s.mouseStartLeft;
      var dragOffsetTop = e.getDocumentTop() - s.mouseStartTop;

      s.lastX = s.left + dragOffsetLeft;
      s.lastY = s.top + dragOffsetTop;

      // handle frame and translucently
      switch(this.getMoveMethod())
      {
        case "translucent":
        case "opaque":
          this.setUserBounds(
            s.lastX,
            s.lastY,
            s.width,
            s.height
          );
          break;

        case "frame":
          this._getFrame().setUserBounds(
            s.elementLocation.left + dragOffsetLeft,
            s.elementLocation.top + dragOffsetTop,
            s.width,
            s.height
          );
          break;
      }
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
