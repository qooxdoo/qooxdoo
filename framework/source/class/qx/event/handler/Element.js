/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * This class supports typical DOM element inline events like scroll,
 * change, select, ...
 * 
 * NOTE: Instances of this class must be disposed of after use
 *
 */
qx.Class.define("qx.event.handler.Element",
{
  extend : qx.core.Object,
  implement : [ qx.event.IEventHandler, qx.core.IDisposable ],




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

    this._manager = manager;
    this._registeredEvents = {};
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** @type {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL,


    /** @type {Map} Supported event types */
    SUPPORTED_TYPES :
    {
      abort : true,    // Image elements
      load : true, // Image elements
      scroll : true,
      select : true,
      reset : true,    // Form Elements
      submit : true   // Form Elements
    },

    /** @type {MAP} Whether the event is cancelable */
    CANCELABLE :
    {
      selectstart: true
    },

    /** @type {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_DOMNODE,

    /** @type {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : false
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
    canHandleEvent : function(target, type)
    {
      // Don't handle "load" event of Iframe. Unfortunately, both Element and
      // Iframe handler support "load" event. Should be handled by
      // qx.event.handler.Iframe only. Fixes [#BUG 4587].
      if (type === "load") {
        return target.tagName.toLowerCase() !== "iframe";
      } else {
        return true;
      }
    },


    // interface implementation
    registerEvent : function(target, type, capture)
    {
      var elementId = qx.core.ObjectRegistry.toHashCode(target);
      var eventId = elementId + "-" + type;

      var listener = qx.lang.Function.listener(this._onNative, this, eventId);
      qx.bom.Event.addNativeListener(target, type, listener);

      this._registeredEvents[eventId] =
      {
        element : target,
        type : type,
        listener : listener
      };
    },


    // interface implementation
    unregisterEvent : function(target, type, capture)
    {
      var events = this._registeredEvents;
      if (!events) {
        return;
      }

      var elementId = qx.core.ObjectRegistry.toHashCode(target);
      var eventId = elementId + "-" + type;

      var eventData = this._registeredEvents[eventId];
      if(eventData) {
        qx.bom.Event.removeNativeListener(target, type, eventData.listener);
      }

      delete this._registeredEvents[eventId];
    },



    /*
    ---------------------------------------------------------------------------
      EVENT-HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Default event handler.
     *
     * @signature function(nativeEvent, eventId)
     * @param nativeEvent {Event} Native event
     * @param eventId {Integer} ID of the event (as stored internally)
     */
    _onNative : qx.event.GlobalError.observeMethod(function(nativeEvent, eventId)
    {
      var events = this._registeredEvents;
      if (!events) {
        return;
      }

      var eventData = events[eventId];
      var isCancelable = this.constructor.CANCELABLE[eventData.type];

      qx.event.Registration.fireNonBubblingEvent(
        eventData.element, eventData.type,
        qx.event.type.Native, [nativeEvent, undefined, undefined, undefined, isCancelable]
      );
    })
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    var entry;
    var events = this._registeredEvents;

    for (var id in events)
    {
      entry = events[id];
      qx.bom.Event.removeNativeListener(entry.element, entry.type, entry.listener);
    }

    this._manager = this._registeredEvents = null;
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
