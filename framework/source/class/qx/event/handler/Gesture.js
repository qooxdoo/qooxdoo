/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Unified gesture event handler.
 */
qx.Class.define("qx.event.handler.Gesture",
{
  extend : qx.event.handler.GestureCore,
  implement : qx.event.IEventHandler,

  statics : {

    /** @type {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL,

    /** @type {Map} Supported event types */
    SUPPORTED_TYPES : {
      tap : 1,
      swipe : 1,
      longtap : 1
    },

    POINTER_EVENTS : ["pointerdown", "pointerup", "pointermove"],

    /** @type {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_DOMNODE + qx.event.IEventHandler.TARGET_DOCUMENT,

    /** @type {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : true
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
    this._initObserver();
  },

  members : {
    __manager : null,
    __window : null,
    __root : null,
    __listener : null,


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

    _initObserver : function() {
      this.__listener = qx.lang.Function.listener(this.checkAndFireGesture, this);
      qx.event.handler.Gesture.POINTER_EVENTS.forEach(function(type) {
        qx.event.Registration.addListener(this.__root, type, this.__listener, this);
      }.bind(this));
    },

    /**
     * Checks if a gesture was made and fires the gesture event.
     *
     * @param pointerEvent {qx.event.type.Pointer} Pointer event
     * @param type {String ? null} type of the event
     * @param target {Element ? null} event target
     */
    checkAndFireGesture : function(pointerEvent) {
      this.__callBase("checkAndFireGesture",
        [pointerEvent.getNativeEvent(), pointerEvent.getType(), pointerEvent.getTarget()]
      );
    },


    /**
     * Removes native pointer event listeners.
     */
    _stopObserver : function() {
      qx.event.handler.Gesture.POINTER_EVENTS.forEach(function(type) {
        qx.event.Registration.removeListener(this.__root, type, this.__listener);
      }.bind(this));
    },


    /**
     * Fire a touch event with the given parameters
     *
     * @param domEvent {Event} DOM event
     * @param type {String ? null} type of the event
     * @param target {Element ? null} event target
     * @param eventTypeClass {Class ? qx.event.type.Touch} the event type class
     */
    _fireEvent : function(domEvent, type, target, eventTypeClass) {
      if (!target) {
        target = qx.bom.Event.getTarget(domEvent);
      }

      if (!type) {
        type = domEvent.type;
      }

      if (target && target.nodeType) {
        qx.event.Registration.fireEvent(
          target,
          type,
          eventTypeClass||qx.event.type.Pointer,
          [domEvent, target, null, true, true]
        );
      }

      // Fire user action event
      qx.event.Registration.fireEvent(this.__window, "useraction", qx.event.type.Data, [type]);
    },

    // overridden
    _onPointerEvent : function(domEvent) {
      this._fireEvent(domEvent, domEvent.type, qx.bom.Event.getTarget(domEvent));
    },


    /**
     * Dispose this object
     */
    dispose : function()
    {
      this._stopObserver();
      this.__callBase("dispose");
      this.__manager = this.__window = this.__root = null;
    },


    /**
     * Call overriden method.
     *
     * @param method {String} Name of the overriden method.
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
