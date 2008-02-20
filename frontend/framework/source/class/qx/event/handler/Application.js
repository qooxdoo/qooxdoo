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
  },





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL
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
      qx.event.Registration.addNativeListener(window, "load", this._onNativeLoad);
      qx.event.Registration.addNativeListener(window, "unload", this._onNativeUnload);
    },


    /**
     * Disconnect the native mouse event listeners.
     *
     * @type member
     * @return {void}
     */
    _stopObserver : function()
    {
      qx.event.Registration.removeNativeListener(window, "load", this._onNativeLoad);
      qx.event.Registration.removeNativeListener(window, "unload", this._onNativeUnload);
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
      if (!this.__ready)
      {
        this.__ready = true;

        // Fire user event
        qx.event.Registration.fireCustomEvent(window, qx.event.type.Event, [ "ready", false ]);
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
      if (!this.__down)
      {
        this.__down = true;

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

  destruct : function()
  {
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
