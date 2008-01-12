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

/* ************************************************************************

#module(event)

************************************************************************ */

/**
 * This handler provides event for the window object.
 */
qx.Class.define("qx.event.handler.Window",
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

    // Define shorthands
    this._manager = manager;
    this._window = manager.getWindow();

    // Initialize observers
    this._initWindowObserver();
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
      return target === this._window && this._eventTypes[type];
    },


    // interface implementation
    registerEvent : function(target, type) {
      // Nothing needs to be done here
    },


    // interface implementation
    unregisterEvent : function(target, type) {
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
      error : 1,
      load : 1,
      beforeunload : 1,
      unload : 1,
      resize : 1,
      scroll : 1
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
    _initWindowObserver : function()
    {
      this._onNativeWrapper = qx.lang.Function.bind(this._onNative, this);

      for (var key in this._eventTypes) {
        qx.event.Registration.addNativeListener(this._window, key, this._onNativeWrapper);
      }
    },


    /**
     * Disconnect the native mouse event listeners.
     *
     * @type member
     * @return {void}
     */
    _stopWindowObserver : function()
    {
      for (var key in this._eventTypes) {
        qx.event.Registration.removeNativeListener(this._window, key, this._onNativeWrapper);
      }
    },






    /*
    ---------------------------------------------------------------------------
      NATIVE EVENT SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Native listener for all supported events.
     *
     * @type member
     * @param e {Event} Native event
     * @return {void}
     */
    _onNative : function(e)
    {
      if (!e) {
        e = window.event;
      }

      this._manager.fireCustomEvent(this._window, qx.event.type.Event, [e.type, false]);
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._stopWindowObserver();

    this._disposeFields("_manager", "_window");
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
