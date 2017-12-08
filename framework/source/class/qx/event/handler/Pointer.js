/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Unified pointer event handler.
 * @require(qx.event.dispatch.DomBubbling)
 * @require(qx.event.type.Pointer) // load-time dependency for early native events
 * @require(qx.event.type.dom.Pointer)
 */
qx.Class.define("qx.event.handler.Pointer",
{
  extend : qx.event.handler.PointerCore,
  implement : [ qx.event.IEventHandler, qx.core.IDisposable ],

  statics : {

    /** @type {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL,

    /** @type {Map} Supported event types */
    SUPPORTED_TYPES : {
      pointermove : 1,
      pointerover : 1,
      pointerout : 1,
      pointerdown : 1,
      pointerup : 1,
      pointercancel : 1,

      gesturebegin : 1,
      gesturemove : 1,
      gesturefinish : 1,
      gesturecancel : 1
    },

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

    qx.event.handler.PointerCore.apply(this, [this.__root]);
  },

  members : {
    __manager : null,
    __window : null,
    __root : null,


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
    _initPointerObserver : function() {
      var useEmitter = false;
      if (qx.core.Environment.get("engine.name") == "mshtml" &&
        qx.core.Environment.get("browser.documentmode") < 9) {
        // Workaround for bug #8293: Use an emitter to listen to the
        // pointer events fired by a pointer handler attached by qxWeb.
        useEmitter = true;
      }
      this._initObserver(this._onPointerEvent, useEmitter);
    },


    /**
     * Fire a pointer event with the given parameters
     *
     * @param domEvent {Event} DOM event
     * @param type {String ? null} type of the event
     * @param target {Element ? null} event target
     */
    _fireEvent : function(domEvent, type, target)
    {
      if (!target) {
        target = qx.bom.Event.getTarget(domEvent);
      }

      // respect anonymous elements
      while (target && target.getAttribute && target.getAttribute("qxanonymous")) {
        target = target.parentNode;
      }

      if (!type) {
        type = domEvent.type;
      }

      type = qx.event.handler.PointerCore.MSPOINTER_TO_POINTER_MAPPING[type] || type;

      if (target && target.nodeType)
      {
        qx.event.type.dom.Pointer.normalize(domEvent);
        // ensure compatibility with native events for IE8
        try {
          domEvent.srcElement = target;
        }catch(ex) {
          // Nothing - cannot change properties in strict mode
        }

        qx.event.Registration.fireEvent(
          target,
          type,
          qx.event.type.Pointer,
          [domEvent, target, null, true, true]
        );

        if ((domEvent.getPointerType() !== "mouse" ||
             domEvent.button <= qx.event.handler.PointerCore.LEFT_BUTTON) &&
          (type == "pointerdown" || type == "pointerup" || type == "pointermove" || type == "pointercancel"))
        {
          qx.event.Registration.fireEvent(
            this.__root,
            qx.event.handler.PointerCore.POINTER_TO_GESTURE_MAPPING[type],
            qx.event.type.Pointer,
            [domEvent, target, null, false, false]
          );
        }

        // Fire user action event
        qx.event.Registration.fireEvent(this.__window, "useraction", qx.event.type.Data, [type]);
      }
    },

    // overridden
    _onPointerEvent : function(domEvent) {
      if (domEvent._original && domEvent._original[this._processedFlag]) {
        return;
      }

      var type = qx.event.handler.PointerCore.MSPOINTER_TO_POINTER_MAPPING[domEvent.type] || domEvent.type;
      this._fireEvent(domEvent, type, qx.bom.Event.getTarget(domEvent));
    },


    /**
     * Dispose this object
     */
    dispose : function()
    {
      this.__callBase("dispose");
      this.__manager = this.__window = this.__root = null;
    },


    /**
     * Call overridden method.
     *
     * @param method {String} Name of the overridden method.
     * @param args {Array} Arguments.
     */
    __callBase: function(method, args) {
      qx.event.handler.PointerCore.prototype[method].apply(this, args || []);
    }
  },

  defer : function(statics) {
    qx.event.Registration.addHandler(statics);
    qx.event.Registration.getManager(document).getHandler(statics);
  }
});
