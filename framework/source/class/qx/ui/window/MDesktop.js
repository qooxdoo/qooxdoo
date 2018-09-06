/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This mixin implements the key methods of the {@link qx.ui.window.IDesktop}.
 *
 * @ignore(qx.ui.window.Window)
 * @ignore(qx.ui.window.Window.*)
 */
qx.Mixin.define("qx.ui.window.MDesktop",
{
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * The currently active window
     */
    activeWindow :
    {
      check : "qx.ui.window.Window",
      apply : "_applyActiveWindow",
      event : "changeActiveWindow",
      init  : null,
      nullable : true
    }
  },


  events:
  {
    /**
     * Fired when a window was added.
     */
    windowAdded: "qx.event.type.Data",

    /**
     * Fired when a window was removed.
     */
    windowRemoved: "qx.event.type.Data"
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __windows : null,
    __manager: null,


    /**
     * Get the desktop's window manager. Each desktop must have a window manager.
     * If none is configured the default window manager {@link qx.ui.window.Window#DEFAULT_MANAGER_CLASS}
     * is used.
     *
     * @return {qx.ui.window.IWindowManager} The desktop's window manager
     */
    getWindowManager : function()
    {
      if (!this.__manager) {
        this.setWindowManager(new qx.ui.window.Window.DEFAULT_MANAGER_CLASS());
      }
      return this.__manager;
    },


    /**
     * Whether the configured layout supports a maximized window
     * e.g. is a Canvas.
     *
     * @return {Boolean} Whether the layout supports maximized windows
     */
    supportsMaximize : function() {
      return true;
    },

    /**
     * Sets the desktop's window manager
     *
     * @param manager {qx.ui.window.IWindowManager} The window manager
     */
    setWindowManager : function(manager)
    {
      if (this.__manager) {
        this.__manager.setDesktop(null);
      }

      manager.setDesktop(this);
      this.__manager = manager;
    },


    /**
     * Event handler. Called if one of the managed windows changes its active
     * state.
     *
     * @param e {qx.event.type.Event} the event object.
     */
    _onChangeActive : function(e)
    {
      if (e.getData()) {
        this.setActiveWindow(e.getTarget());
      } else if (this.getActiveWindow() == e.getTarget()) {
        this.setActiveWindow(null);
      }
    },


    // property apply
    _applyActiveWindow : function(value, old) {
      this.getWindowManager().changeActiveWindow(value, old);
      this.getWindowManager().updateStack();
    },


    /**
     * Event handler. Called if one of the managed windows changes its modality
     *
     * @param e {qx.event.type.Event} the event object.
     */
    _onChangeModal : function(e) {
      this.getWindowManager().updateStack();
    },


    /**
     * Event handler. Called if one of the managed windows changes its visibility
     * state.
     */
    _onChangeVisibility : function() {
      this.getWindowManager().updateStack();
    },


    /**
     * Overrides the method {@link qx.ui.core.Widget#_afterAddChild}
     *
     * @param win {qx.ui.core.Widget} added widget
     */
    _afterAddChild : function(win)
    {
      if (qx.Class.isDefined("qx.ui.window.Window") && win instanceof qx.ui.window.Window) {
        this._addWindow(win);
      }
    },


    /**
     * Handles the case, when a window is added to the desktop.
     *
     * @param win {qx.ui.window.Window} Window, which has been added
     */
    _addWindow : function(win)
    {
      if (!this.getWindows().includes(win))
      {
        this.getWindows().push(win);

        this.fireDataEvent("windowAdded", win);

        win.addListener("changeActive", this._onChangeActive, this);
        win.addListener("changeModal", this._onChangeModal, this);
        win.addListener("changeVisibility", this._onChangeVisibility, this);
      }

      if (win.getActive()) {
        this.setActiveWindow(win);
      }

      this.getWindowManager().updateStack();
    },


    /**
     * Overrides the method {@link qx.ui.core.Widget#_afterRemoveChild}
     *
     * @param win {qx.ui.core.Widget} removed widget
     */
    _afterRemoveChild : function(win)
    {
      if (qx.Class.isDefined("qx.ui.window.Window") && win instanceof qx.ui.window.Window) {
        this._removeWindow(win);
      }
    },


    /**
     * Handles the case, when a window is removed from the desktop.
     *
     * @param win {qx.ui.window.Window} Window, which has been removed
     */
    _removeWindow : function(win)
    {
      if (this.getWindows().includes(win))
      {
        qx.lang.Array.remove(this.getWindows(), win);

        this.fireDataEvent("windowRemoved", win);

        win.removeListener("changeActive", this._onChangeActive, this);
        win.removeListener("changeModal", this._onChangeModal, this);
        win.removeListener("changeVisibility", this._onChangeVisibility, this);

        this.getWindowManager().updateStack();
      }
    },


    /**
     * Get a list of all windows added to the desktop (including hidden windows)
     *
     * @return {qx.ui.window.Window[]} Array of managed windows
     */
    getWindows : function()
    {
      if (!this.__windows) {
        this.__windows = [];
      }
      return this.__windows;
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeArray("__windows");
    this._disposeObjects("__manager");
  }
});
