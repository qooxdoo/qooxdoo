/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This handler provides events for qooxdoo application startup/shutdown logic.
 */
qx.Class.define("qx.event.handler.Application",
{
  extend : qx.core.Object,
  implement : qx.event.IEventHandler,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Create a new instance
   *
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct : function(manager)
  {
    this.base(arguments);

    // Define shorthands
    this._window = manager.getWindow();

    // Initialize observers
    this._initObserver();

    // Store instance (only supported for main app window, this
    // is the reason why this is OK here)
    qx.event.handler.Application.$$instance = this;
  },





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL,


    /** {Map} Supported event types */
    SUPPORTED_TYPES :
    {
      ready : 1,
      shutdown : 1
    },


    /** {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_WINDOW,


    /** {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : true,


    /**
     * Sends the currently running application the ready signal. Used
     * exclusively by package loader system.
     *
     * @internal
     * @return {void}
     */
    ready : function()
    {
      var inst = qx.event.handler.Application.$$instance;
      if (inst) {
        inst.__fireReady();
      }
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
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canHandleEvent : function(target, type) {},


    // interface implementation
    registerEvent : function(target, type, capture) {
      // Nothing needs to be done here
    },


    // interface implementation
    unregisterEvent : function(target, type, capture) {
      // Nothing needs to be done here
    },




    /*
    ---------------------------------------------------------------------------
      USER ACCESS
    ---------------------------------------------------------------------------
    */

    /**
     * Fires a global ready event.
     *
     * @return {void}
     */
    __fireReady : function()
    {
      // Wrapper qxloader needed to be compatible with old generator
      if (!this.__isReady)
      {
        this.__isReady = true;

        // Fire user event
        qx.event.Registration.fireEvent(window, "ready");
      }
    },




    /*
    ---------------------------------------------------------------------------
      OBSERVER INIT/STOP
    ---------------------------------------------------------------------------
    */

    /**
     * Initializes the native mouse event listeners.
     *
     * @return {void}
     */
    _initObserver : function()
    {
      this._onNativeLoadWrapped = qx.lang.Function.bind(this._onNativeLoad, this);
      this._onNativeUnloadWrapped = qx.lang.Function.bind(this._onNativeUnload, this);

      qx.bom.Event.addNativeListener(window, "load", this._onNativeLoadWrapped);
      qx.bom.Event.addNativeListener(window, "unload", this._onNativeUnloadWrapped);
    },


    /**
     * Disconnect the native mouse event listeners.
     *
     * @return {void}
     */
    _stopObserver : function()
    {
      qx.bom.Event.removeNativeListener(window, "load", this._onNativeLoadWrapped);
      qx.bom.Event.removeNativeListener(window, "unload", this._onNativeUnloadWrapped);

      this._onNativeLoadWrapped = null;
      this._onNativeUnloadWrapped = null;
    },





    /*
    ---------------------------------------------------------------------------
      NATIVE LISTENER
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for native load event
     *
     * @param e {Event} Native event object
     * @return {void}
     */
    _onNativeLoad : function(e)
    {
      // Wrapper qxloader needed to be compatible with old generator
      if (!window.qxloader) {
        this.__fireReady();
      }
    },


    /**
     * Event listener for native unload event
     *
     * @param e {Event} Native event object
     * @return {void}
     */
    _onNativeUnload : function(e)
    {
      if (!this.__isUnloaded)
      {
        this.__isUnloaded = true;

        // Fire user event
        qx.event.Registration.fireEvent(window, "shutdown");

        // Execute registry shutdown
        qx.core.ObjectRegistry.shutdown();
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._stopObserver();

    this._disposeFields("_window");
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    qx.event.Registration.addHandler(statics);
  }
});
