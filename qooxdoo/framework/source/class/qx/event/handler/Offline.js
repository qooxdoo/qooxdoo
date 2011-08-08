/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This class provides a handler for the online event.
 */
qx.Class.define("qx.event.handler.Offline",
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

    this.__manager = manager;
    this.__window = manager.getWindow();

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
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL,


    /** {Map} Supported event types */
    SUPPORTED_TYPES :
    {
      online : true,
      offline : true
    },


    /** {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_WINDOW,


    /** {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : true
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __manager : null,
    __window : null,
    __onNativeWrapper : null,


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


    /**
     * Connects the native online and offline event listeners.
     */
    _initObserver : function() {
      this.__onNativeWrapper = qx.lang.Function.listener(this._onNative, this);

      qx.bom.Event.addNativeListener(this.__window, "offline", this.__onNativeWrapper);
      qx.bom.Event.addNativeListener(this.__window, "online", this.__onNativeWrapper);
    },


    /**
     * Disconnects the native online and offline event listeners.
     */
    _stopObserver : function() {
      qx.bom.Event.removeNativeListener(this.__window, "offline", this.__onNativeWrapper);
      qx.bom.Event.removeNativeListener(this.__window, "online", this.__onNativeWrapper);
    },


    /**
     * Native handler function which fires a qooxdoo event.
     * @signature function(domEvent)
     * @param domEvent {Event} Native DOM event
     */
    _onNative : qx.event.GlobalError.observeMethod(function(domEvent) {
      qx.event.Registration.fireEvent(
          this.__window,
          domEvent.type,
          qx.event.type.Event,
          []
      );
    }),


    /*
    ---------------------------------------------------------------------------
      USER ACCESS
    ---------------------------------------------------------------------------
    */


    /**
     * Returns whether the current window thinks its online or not.
     * @return {Boolean} <code>true</code> if its online
     */
    isOnline : function() {
      return !!this.__window.navigator.onLine;
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.__manager = null;
    this._stopObserver();

    // Deregister
    delete qx.event.handler.Appear.__instances[this.$$hash];
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
