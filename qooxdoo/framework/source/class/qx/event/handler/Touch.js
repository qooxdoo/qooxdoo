/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Tino butz (tbtz)

************************************************************************ */

qx.Class.define("qx.event.handler.Touch", 
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
    this.__manager = manager;
    this.__window = manager.getWindow();
    this.__root = this.__window.document;

    this._initTouchObserver();
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
      touchstart : 1,
      touchmove : 1,
      touchend : 1,
      touchcancel : 1
    },

    /** {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_DOMNODE,

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
    __onTouchEventWrapper : null,
    
    __manager : null,
    __window : null,
    __root : null,


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
      HELPER
    ---------------------------------------------------------------------------
    */


    /**
     * Fire a mouse event with the given parameters
     *
     * @param domEvent {Event} DOM event
     * @param type {String} type of the event
     * @param target {Element} event target
     */
    __fireEvent : function(domEvent, type, target)
    {
      if (!target) {
        target = domEvent.target || domEvent.srcElement;
      }

      if (target && target.nodeType)
      {
        qx.event.Registration.fireEvent(
          target,
          type||domEvent.type,
          qx.event.type.Touch,
          [domEvent, target, null, true, true]
        );
      }

      // Fire user action event
      qx.event.Registration.fireEvent(this.__window, "useraction", qx.event.type.Data, [type||domEvent.type]);
    },






    /*
    ---------------------------------------------------------------------------
      OBSERVER INIT
    ---------------------------------------------------------------------------
    */

    /**
     * Initializes the native mouse button event listeners.
     *
     * @signature function()
     * @return {void}
     */
    _initTouchObserver : function()
    {
      this.__onTouchEventWrapper = qx.lang.Function.listener(this._onTouchEvent, this);

      var Event = qx.bom.Event;

      Event.addNativeListener(this.__root, "touchstart", this.__onTouchEventWrapper);
      Event.addNativeListener(this.__root, "touchmove", this.__onTouchEventWrapper);
      Event.addNativeListener(this.__root, "touchend", this.__onTouchEventWrapper);
      Event.addNativeListener(this.__root, "touchcancel", this.__onTouchEventWrapper);
    },


    /*
    ---------------------------------------------------------------------------
      OBSERVER STOP
    ---------------------------------------------------------------------------
    */

    /**
     * Disconnects the native mouse button event listeners.
     *
     * @signature function()
     * @return {void}
     */
    _stopTouchObserver : function()
    {
      var Event = qx.bom.Event;

      Event.removeNativeListener(this.__root, "touchstart", this.__onTouchEventWrapper);
      Event.removeNativeListener(this.__root, "touchmove", this.__onTouchEventWrapper);
      Event.removeNativeListener(this.__root, "touchend", this.__onTouchEventWrapper);
      Event.removeNativeListener(this.__root, "touchcancel", this.__onTouchEventWrapper);
    },


    /*
    ---------------------------------------------------------------------------
      NATIVE EVENT OBSERVERS
    ---------------------------------------------------------------------------
    */

    _onTouchEvent : qx.event.GlobalError.observeMethod(function(domEvent) {
      this.__fireEvent(domEvent, domEvent.type);
    })





    /*
    ---------------------------------------------------------------------------
      CROSS BROWSER SUPPORT FIXES
    ---------------------------------------------------------------------------
    */


  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._stopTouchObserver();

    this.__manager = this.__window = this.__root = null;
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