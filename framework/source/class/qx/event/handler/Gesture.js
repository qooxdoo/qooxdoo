/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Unified gesture event handler.
 *
 * @require(qx.event.handler.Pointer)
 */
qx.Class.define("qx.event.handler.Gesture",
{
  extend : qx.event.handler.GestureCore,
  implement : [ qx.event.IEventHandler, qx.core.IDisposable ],

  statics : {

    /** @type {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL,

    /** @type {Map} Supported event types */
    SUPPORTED_TYPES : {
      tap : 1,
      swipe : 1,
      longtap : 1,
      dbltap : 1,
      rotate : 1,
      pinch : 1,
      track : 1,
      trackstart : 1,
      trackend : 1,
      roll : 1
    },

    GESTURE_EVENTS : ["gesturebegin", "gesturefinish", "gesturemove", "gesturecancel"],

    /** @type {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_DOMNODE + qx.event.IEventHandler.TARGET_DOCUMENT,

    /** @type {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : true,

    EVENT_CLASSES : {
      "tap": qx.event.type.Tap,
      "longtap": qx.event.type.Tap,
      "dbltap": qx.event.type.Tap,
      "swipe": qx.event.type.Swipe,
      "rotate": qx.event.type.Rotate,
      "pinch": qx.event.type.Pinch,
      "track": qx.event.type.Track,
      "trackstart": qx.event.type.Track,
      "trackend": qx.event.type.Track,
      "roll" : qx.event.type.Roll
    }
  },

  /**
   * Create a new instance
   *
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct : function(manager)
  {
    // Define shorthands
    this.__manager = manager;
    this.__window = manager.getWindow();
    this.__root = this.__window.document;

    qx.event.handler.GestureCore.apply(this, [this.__root]);
  },

  members : {
    __manager : null,
    __window : null,
    __root : null,
    __listener : null,
    __onDblClickWrapped : null,
    __fireRollWrapped : null,

    /**
     * Getter for the internal __window object
     * @return {Window} DOM window instance
     */
    getWindow: function() {
      return this.__window;
    },

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

    // overridden
    _initObserver : function() {
      this.__listener = qx.lang.Function.listener(this.checkAndFireGesture, this);
      qx.event.handler.Gesture.GESTURE_EVENTS.forEach(function(type) {
        qx.event.Registration.addListener(this.__root, type, this.__listener, this);
      }.bind(this));

      if (qx.core.Environment.get("engine.name") == "mshtml" &&
        qx.core.Environment.get("browser.documentmode") < 9)
      {
        this.__onDblClickWrapped = qx.lang.Function.listener(this._onDblClick, this);
        qx.bom.Event.addNativeListener(this.__root, "dblclick", this.__onDblClickWrapped);
      }

      // list to wheel events
      var data = qx.bom.client.Event.getMouseWheel(this.__window);
      this.__fireRollWrapped = qx.lang.Function.listener(this._fireRoll, this);
      // replaced the useCapture (4th parameter) from this to true
      // see https://github.com/qooxdoo/qooxdoo/pull/9292
      qx.bom.Event.addNativeListener(data.target, data.type, this.__fireRollWrapped, true, false);
    },

    /**
     * Checks if a gesture was made and fires the gesture event.
     *
     * @param pointerEvent {qx.event.type.Pointer} Pointer event
     * @param type {String ? null} type of the event
     * @param target {Element ? null} event target
     */
    checkAndFireGesture : function(pointerEvent, type, target) {
      this.__callBase("checkAndFireGesture",
        [pointerEvent.getNativeEvent(), pointerEvent.getType(), pointerEvent.getTarget()]
      );
    },


    // overridden
    _stopObserver : function() {
      qx.event.handler.Gesture.GESTURE_EVENTS.forEach(function(type) {
        qx.event.Registration.removeListener(this.__root, type, this.__listener);
      }.bind(this));

      if (qx.core.Environment.get("engine.name") == "mshtml" &&
        qx.core.Environment.get("browser.documentmode") < 9)
      {
        qx.bom.Event.removeNativeListener(this.__root, "dblclick", this.__onDblClickWrapped);
      }

      var data = qx.bom.client.Event.getMouseWheel(this.__window);
      qx.bom.Event.removeNativeListener(data.target, data.type, this.__fireRollWrapped);
    },


    // overridden
    _hasIntermediaryHandler : function(target) {
      /* This check is irrelevant for qx.Desktop since there is only one
         gesture handler */
      return false;
    },


    /**
     * Fire a touch event with the given parameters
     *
     * @param domEvent {Event} DOM event
     * @param type {String ? null} type of the event
     * @param target {Element ? null} event target
     */
    _fireEvent : function(domEvent, type, target) {
      if (!target) {
        target = qx.bom.Event.getTarget(domEvent);
      }

      if (!type) {
        type = domEvent.type;
      }

      var eventTypeClass = qx.event.handler.Gesture.EVENT_CLASSES[type] || qx.event.type.Pointer;

      if (target && target.nodeType) {
        qx.event.Registration.fireEvent(
          target,
          type,
          eventTypeClass,
          [domEvent, target, null, true, true]
        );
      }

      // Fire user action event
      qx.event.Registration.fireEvent(this.__window, "useraction", qx.event.type.Data, [type]);
    },


    /**
     * Dispose this object
     */
    dispose : function()
    {
      this._stopObserver();
      this.__callBase("dispose");
      this.__manager = this.__window = this.__root = this.__onDblClickWrapped = null;
    },


    /**
     * Call overridden method.
     *
     * @param method {String} Name of the overridden method.
     * @param args {Array} Arguments.
     */
    __callBase: function(method, args) {
      qx.event.handler.GestureCore.prototype[method].apply(this, args || []);
    }
  },

  defer : function(statics) {
    qx.event.Registration.addHandler(statics);
    qx.event.Registration.getManager(document).getHandler(statics);
  }
});
