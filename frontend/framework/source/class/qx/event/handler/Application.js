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
   * @type constructor
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct : function(manager)
  {
    this.base(arguments);

    // Initialize observers
    this._initObserver();

    // Validate instanciation
    if (qx.event.handler.Application.$$instance) {
      throw new Error("Only one application could be initialized per qooxdoo instance!");
    }
    
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
    
    
    /**
     * Returns the currently running application
     *
     * @type static
     * @return {qx.application.Abstract}
     */
    getRunning : function() {
      return qx.event.handler.Application.$$instance || null;
    },


    /**
     * Sends the currently running application the ready signal. Used
     * exclusively by package loader system.
     *
     * @internal
     * @type static
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
    canHandleEvent : function(target, type) {
      return target === window && this._eventTypes[type];
    },


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
      HELPER
    ---------------------------------------------------------------------------
    */

    /** {Map} Internal data structure with all supported event types */
    _eventTypes :
    {
      ready : 1,
      shutdown : 1
    },




    /*
    ---------------------------------------------------------------------------
      USER ACCESS
    ---------------------------------------------------------------------------
    */

    /**
     * Fires a global ready event.
     *
     * @type member
     * @return {void}
     */
    __fireReady : function()
    {
      // Wrapper qxloader needed to be compatible with old generator
      if (!this.__isReady)
      {
        this.__isReady = true;

        // Fire user event
        qx.event.Registration.fireCustomEvent(window, qx.event.type.Event, [ "ready", false ]);
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
     * @type member
     * @return {void}
     */
    _initObserver : function()
    {
      this._onNativeLoadWrapped = qx.lang.Function.bind(this._onNativeLoad, this);
      this._onNativeUnloadWrapped = qx.lang.Function.bind(this._onNativeUnload, this);
      
      qx.event.Registration.addNativeListener(window, "load", this._onNativeLoadWrapped);
      qx.event.Registration.addNativeListener(window, "unload", this._onNativeUnloadWrapped);
    },


    /**
     * Disconnect the native mouse event listeners.
     *
     * @type member
     * @return {void}
     */
    _stopObserver : function()
    {
      qx.event.Registration.removeNativeListener(window, "load", this._onNativeLoadWrapped);
      qx.event.Registration.removeNativeListener(window, "unload", this._onNativeUnloadWrapped);
      
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
     * @type member
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
     * @type member
     * @param e {Event} Native event object
     * @return {void}
     */
    _onNativeUnload : function(e)
    {
      if (!this.__isUnloaded)
      {
        this.__isUnloaded = true;

        // Fire user event
        qx.event.Registration.fireCustomEvent(window, qx.event.type.Event, [ "shutdown", false ]);

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
