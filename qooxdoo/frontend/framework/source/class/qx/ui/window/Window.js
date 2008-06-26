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
 * An internal window based on qooxdoo widgets
 *
 * More information can be found in the package description {@link qx.ui.window}.
 *
 * @state active
 * @state maximized This state is active if the window is maximized
 *
 * @appearance window The main window object
 * @appearance window-resize-frame {qx.ui.basic.Terminator}
 * @appearance window-pane {qx.ui.container.Composite}
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

    this._createChildControl("captionbar");
    this._createChildControl("pane");

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

    this.initVisibility();
    this.initShowIcon();
    this.initShowCaption();
    this.initShowMinimize();
    this.initShowMaximize();
    this.initShowClose();
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
    /**
     * Fired before the window is closed.
     *
     * The close action can be prevented by calling
     * {@link qx.event.type.Event#preventDefault} on the event object
     */
    "beforeClose" : "qx.event.type.Event",

    /** Fired if the window is closed */
    "close" : "qx.event.type.Event",

    /**
     * Fired before the window is minimize.
     *
     * The minimize action can be prevented by calling
     * {@link qx.event.type.Event#preventDefault} on the event object
     */
    "beforeMinimize" : "qx.event.type.Event",

    /** Fired if the window is minimized */
    "minimize" : "qx.event.type.Event",

    /**
     * Fired before the window is maximize.
     *
     * The maximize action can be prevented by calling
     * {@link qx.event.type.Event#preventDefault} on the event object
     */
    "beforeMaximize" : "qx.event.type.Event",

    /** Fired if the window is maximized */
    "maximize" : "qx.event.type.Event",

    /**
     * Fired before the window is restored from a minimized or maximized state.
     *
     * The restored action can be prevented by calling
     * {@link qx.event.type.Event#preventDefault} on the event object
     */
    "beforeRestore" : "qx.event.type.Event",

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
      init : false,
      apply : "_applyShowMaximize"
    },


    /** Should the minimize button be shown */
    showMinimize :
    {
      check : "Boolean",
      init : false,
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
    },


    /** Center the window on open */
    centered :
    {
      check : "Boolean",
      init : false
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
      WIDGET INTERNALS
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
      return this._getChildControl("pane");
    },


    // overridden
    _getStyleTarget : function() {
      return this._getChildControl("pane");
    },


    /*
    ---------------------------------------------------------------------------
      CHILD CONTROL SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id)
    {
      var control;
      var isActive = this.hasState("active");

      switch(id)
      {
        case "statusbar":
          control = new qx.ui.container.Composite(new qx.ui.layout.HBox());
          this._add(control);
          control.add(this._getChildControl("status-text"));
          break;

        case "status-text":
          control = new qx.ui.basic.Label("Ready");
          control.setContent(this.getStatus());
          break;

        case "pane":
          control = new qx.ui.container.Composite();
          this._add(control, {flex: 1});
          break;

        case "captionbar":
          control = new qx.ui.container.Composite(new qx.ui.layout.HBox());
          if (isActive) {
            control.addState("active");
          }
          this._add(control);

          control.add(this._getChildControl("captionbar-spacer"), {flex: 1});

          // captionbar events
          control.addListener("mousedown", this._oncaptionmousedown, this);
          control.addListener("mouseup", this._oncaptionmouseup, this);
          control.addListener("mousemove", this._oncaptionmousemove, this);
          control.addListener("dblclick", this._oncaptiondblblick, this);
          break;

        case "captionbar-spacer":
          control = new qx.ui.core.Spacer();
          break;

        case "icon":
          control = new qx.ui.basic.Image(this.getIcon());
          this._getChildControl("captionbar").addAt(control, 0);
          break;

        case "title":
          control = new qx.ui.basic.Label(this.getCaption());
          var spacer = this._getChildControl("captionbar-spacer");
          this._getChildControl("captionbar").addBefore(control, spacer);
          break;

        case "minimize-button":
          control = new qx.ui.form.Button();
          control.setFocusable(false);
          if (isActive) {
            control.addState("active");
          }

          control.addListener("execute", this._onminimizebuttonclick, this);
          control.addListener("mousedown", this._onbuttonmousedown, this);

          var spacer = this._getChildControl("captionbar-spacer");
          this._getChildControl("captionbar").addAfter(control, spacer);
          break;

        case "restore-button":
          control = new qx.ui.form.Button();
          control.setFocusable(false);
          if (isActive) {
            control.addState("active");
          }

          control.addListener("execute", this._onrestorebuttonclick, this);
          control.addListener("mousedown", this._onbuttonmousedown, this);

          var btnMaximize = this._getChildControl("maximize-button");
          this._getChildControl("captionbar").addBefore(control, btnMaximize);
          break;

        case "maximize-button":
          control = new qx.ui.form.Button();
          control.setFocusable(false);
          if (isActive) {
            control.addState("active");
          }

          control.addListener("execute", this._onmaximizebuttonclick, this);
          control.addListener("mousedown", this._onbuttonmousedown, this);

          var captionBar = this._getChildControl("captionbar");
          var btnClose = this._getChildControl("close-button", true);
          if (btnClose) {
            captionBar.addBefore(control, btnClose);
          } else {
            captionBar.add(control);
          }
          break;

        case "close-button":
          control = new qx.ui.form.Button();
          control.setFocusable(false);
          if (isActive) {
            control.addState("active");
          }

          control.addListener("execute", this._onclosebuttonclick, this);
          control.addListener("mousedown", this._onbuttonmousedown, this);
          this._getChildControl("captionbar").add(control);
          break;
      }

      return control || this.base(arguments, id);
    },


    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Accessor method for the captionbar sub widget
     *
     * @type member
     * @return {qx.ui.container.Composite} captionbar sub widget
     */
    getCaptionBar : function() {
      return this._getChildControl("captionbar");
    },


    /**
     * Accessor method for the statusbar sub widget
     *
     * @type member
     * @return {qx.ui.container.Composite} statusbar sub widget
     */
    getStatusBar : function() {
      return this._getChildControl("statusbar");
    },


    /**
     * Closes the current window instance.
     * Technically calls the {@link qx.ui.core.Widget#hide} method.
     *
     * @type member
     * @return {void}
     */
    close : function()
    {
      if (!this.fireEvent("beforeClose", qx.event.type.Event, [false, true])) {
        return;
      };
      this.hide();
      this.fireEvent("close");
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
        this.centerToParent();
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
     * Get the current mode (minimized or maximized) of the window instance
     * <b>Attention:</b> if the window instance is neither maximized nor minimized this
     * property will return <code>null</code>
     *
     * @return {String|null} The current window mode
     */
    getMode : function() {
      return this.__mode || null;
    },


    /**
     * Sets the current mode (minimized or maximized)
     *
     * @param mode {String|null} The new mode. A value of <code>null</code> will
     *     restore the window
     */
    _setMode : function(mode)
    {
      var oldMode = this.__mode;

      switch(mode)
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
          switch(oldMode)
          {
            case "maximized":
              this._restoreFromMaximized();
              break;

            case "minimized":
              this._restoreFromMinimized();
              break;
          }
      }

      this.__mode = mode;
    },


    /**
     * Maximize the window by setting the property {@link mode} to <code>maximized</code>
     *
     * @type member
     * @return {void}
     */
    maximize : function()
    {
      if (!this.fireEvent("beforeMaximize", qx.event.type.Event, [false, true])) {
        return;
      };
      this._setMode("maximized");
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
      if (!this.fireEvent("beforeMinimize", qx.event.type.Event, [false, true])) {
        return;
      };
      this._setMode("minimized");
      this.fireEvent("minimize");
    },


    /**
     * Maximize the window by setting the property {@link mode} to <code>null</code>
     *
     * @type member
     * @return {void}
     */
    restore : function()
    {
      if (!this.fireEvent("beforeRestore", qx.event.type.Event, [false, true])) {
        return;
      };
      this._setMode(null);
      this.fireEvent("restore");
    },


    /**
     * Set the window's position relative to its parent
     *
     * @param left {Integer} The left position
     * @param top {Integer} The top position
     */
    moveTo : function(left, top)
    {
      this.setLayoutProperties({
        left : left,
        top : top
      });
    },


    /**
     * Centeres the window in the browser window.
     *
     * @type member
     */
    centerToParent : function()
    {
      var parentBounds = this.getLayoutParent().getBounds();
      if (!parentBounds)
      {
        this.getLayoutParent().addListenerOnce("resize", this.centerToParent, this);
        return;
      }

      var size = this.getSizeHint();

      var left = Math.round((parentBounds.width - size.width) / 2);
      var top = Math.round((parentBounds.height - size.height) / 2);

      this.moveTo(left, top);
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

    /**
     * Bring the window to front (if possible)
     *
     * @type member
     * @return {void}
     */
    bringToFront : function() {
      this.getWindowManager().bringToFront(this);
    },


    /**
     * Send the window to the back (if possible)
     *
     * @type member
     * @return {void}
     */
    sendToBack : function() {
      this.getWindowManager().sendToBack(this);
    },






    /*
    ---------------------------------------------------------------------------
      MODIFIERS
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyActive : function(value, old)
    {
      var captionBar = this._getChildControl("captionbar");
      var btnMinimize = this._getChildControl("minimize-button", true);
      var btnRestore = this._getChildControl("restore-button", true);
      var btnMaximize = this._getChildControl("maximize-button", true);
      var btnClose = this._getChildControl("close-button", true);

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
        captionBar.removeState("active");
        btnMinimize ? btnMinimize.removeState("active") : null;
        btnRestore ? btnRestore.removeState("active") : null;
        btnMaximize ? btnMaximize.removeState("active") : null;
        btnClose ? btnClose.removeState("active") : null;
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
        captionBar.addState("active");
        btnMinimize ? btnMinimize.addState("active") : null;
        btnRestore ? btnRestore.addState("active") : null;
        btnMaximize ? btnMaximize.addState("active") : null;
        btnClose ? btnClose.addState("active") : null;
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
    _applyShowCaption : function(value, old)
    {
      if (value) {
        this._showChildControl("title");
      } else {
        this._excludeChildControl("title");
      }
    },


    // property apply
    _applyShowIcon : function(value, old)
    {
      if (value) {
        this._showChildControl("icon");
      } else {
        this._excludeChildControl("icon");
      }
    },


    // property apply
    _applyShowStatusbar : function(value, old)
    {
      if (value) {
        this._showChildControl("statusbar");
      } else {
        this._excludeChildControl("statusbar");
      }
    },


    // property apply
    _applyShowClose : function(value, old)
    {
      if (value) {
        this._showChildControl("close-button");
      } else {
        this._excludeChildControl("close-button");
      }
    },


    // property apply
    _applyShowMaximize : function(value, old)
    {
      if (value)
      {
        if (this.getMode() == "maximized")
        {
          this._showChildControl("restore-button");
          this._excludeChildControl("maximize-button");
        }
        else
        {
          this._showChildControl("maximize-button");
          this._excludeChildControl("restore-button");
        }
      }
      else
      {
        this._excludeChildControl("restore-button");
        this._excludeChildControl("maximize-button");
      }
    },


    // property apply
    _applyShowMinimize : function(value, old)
    {
      if (value) {
        this._showChildControl("minimize-button");
      } else {
        this._excludeChildControl("minimize-button");
      }
    },


    /**
     * Enables/disables the minimize button in order of the {@link #allowMinimize} property
     *
     * @type member
     */
    _minimizeButtonManager : function()
    {
      var btnMinimize = this._getChildControl("minimize-button");

      if (this.getAllowMinimize() === false) {
        btnMinimize.setEnabled(false);
      } else {
        btnMinimize.resetEnabled();
      }
    },


    /**
     * Enables/disables the close button in order of the {@link #allowClose} property
     *
     * @type member
     */
    _closeButtonManager : function()
    {
      var btnClose = this._getChildControl("close-button");

      if (this.getAllowClose() === false) {
        btnClose.setEnabled(false);
      } else {
        btnClose.resetEnabled();
      }
    },


    /**
     * Disables the maximize and restore buttons when the window instance is already maximized,
     * otherwise the {@link #enabled} property of both buttons get resetted.
     *
     * @type member
     */
    _maximizeButtonManager : function()
    {
      var isMaximized = this.getMode() == "maximized";

      var btnMaximize = this._getChildControl("maximize-button", true);
      if (btnMaximize) {
        isMaximized ? btnMaximize.setEnabled(false) : btnMaximize.resetEnabled();
      }

      var btnRestore = this._getChildControl("restore-button", true);
      if (btnRestore) {
        isMaximized ? this.btnRestore.setEnabled(false) : this.btnRestore.resetEnabled();
      }
    },


    // property apply
    _applyStatus : function(value, old)
    {
      var label = this._getChildControl("status-text", true);
      if (label) {
        label.setContent(value);
      }
    },


    // property apply
    _applyResizable : function(value, old) {
      this._maximizeButtonManager();
    },


    // property apply
    _applyCaption : function(value, old)
    {
      var label = this._getChildControl("title", true);
      if (label) {
        label.setContent(value);
      }
    },


    // property apply
    _applyIcon : function(value, old)
    {
      var icon = this._getChildControl("icon", true);
      if (icon) {
        icon.setSource(value);
      }
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
        this._showChildControl("maximize-button");
        this._excludeChildControl("restore-button");
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
        this._setMode("maximized");
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
        this._showChildControl("restore-button");
        this._excludeChildControl("maximize-button");
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
      btnMinimize = this._getChildControl("minimize-button");
      btnMinimize.removeState("pressed");
      btnMinimize.removeState("abandoned");
      btnMinimize.removeState("over");
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
      btnRestore = this._getChildControl("restore-button");
      btnRestore.removeState("pressed");
      btnRestore.removeState("abandoned");
      btnRestore.removeState("over");
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
      btnMaximize = this._getChildControl("maximize-button");
      btnMaximize.removeState("pressed");
      btnMaximize.removeState("abandoned");
      btnMaximize.removeState("over");
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
      btnClose = this._getChildControl("close-button");
      btnClose.removeState("pressed");
      btnClose.removeState("abandoned");
      btnClose.removeState("over");
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
      this._getChildControl("captionbar").capture();

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
      this._getChildControl("captionbar").releaseCapture();
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
      if (!this.getAllowMaximize()) {
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
    this._disposeObjects("_pane");
  }
});
