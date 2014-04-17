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
     * Christopher Zuendorf (czuendorf)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Low-level pointer event handler.
 *
 * @require(qx.bom.client.Event)
 */
qx.Bootstrap.define("qx.event.handler.PointerCore", {

  extend : Object,

  statics : {
    MOUSE_TO_POINTER_MAPPING: {
      mousedown: "pointerdown",
      mouseup: "pointerup",
      mousemove: "pointermove",
      mouseout: "pointerout",
      mouseover: "pointerover"
    },

    TOUCH_TO_POINTER_MAPPING: {
      touchstart: "pointerdown",
      touchend: "pointerup",
      touchmove: "pointermove",
      touchcancel: "pointercancel"
    },

    MSPOINTER_TO_POINTER_MAPPING: {
      MSPointerDown : "pointerdown",
      MSPointerMove : "pointermove",
      MSPointerUp : "pointerup",
      MSPointerCancel : "pointercancel",
      MSPointerLeave : "pointerleave",
      MSPointerEnter: "pointerenter",
      MSPointerOver : "pointerover",
      MSPointerOut : "pointerout"
    },

    POINTER_TO_GESTURE_MAPPING : {
      pointerdown : "gesturebegin",
      pointerup : "gesturefinish",
      pointermove : "gesturemove"
    },

    SIM_MOUSE_DISTANCE : 25,

    SIM_MOUSE_DELAY : 1000,

    /**
     * Coordinates of the last touch. This needs to be static because the target could
     * change between touch and simulated mouse events. Touch events will be detected
     * by one instance which moves the target. The simulated mouse events will be fired with
     * a delay which causes another target and with that, another instance of this handler.
     * last touch was.
     */
    __lastTouch : null
  },

  /**
   * Create a new instance
   *
   * @param target {Element} element on which to listen for native touch events
   * @param emitter {qx.event.Emitter?} Event emitter (used if dispatchEvent
   * is not supported, e.g. in IE8)
   */
  construct : function(target, emitter) {
    this.__defaultTarget = target;
    this.__emitter = emitter;
    this.__eventNames = [];
    this.__buttonStates = [];

    if (qx.core.Environment.get("event.mspointer")) {
      var engineName = qx.core.Environment.get("engine.name");
      var docMode = parseInt(qx.core.Environment.get("browser.documentmode"), 10);
      if (engineName == "mshtml" && docMode == 10) {
        this.__eventNames = ["MSPointerDown", "MSPointerMove", "MSPointerUp", "MSPointerCancel", "MSPointerOver", "MSPointerOut"];
        this._initPointerObserver();
      } else {
        this.__nativePointerEvents = true;
        this.__eventNames = ["pointerdown", "pointermove", "pointerup", "pointercancel", "pointerover", "pointerout"];
        this._initPointerObserver();
      }
    } else {
      if (qx.core.Environment.get("device.touch")) {
        this.__eventNames = ["touchstart", "touchend", "touchmove", "touchcancel"];
        this._initObserver(this._onTouchEvent);
      }

      this.__eventNames = ["mousedown", "mouseup", "mousemove", "mouseover", "mouseout", "contextmenu"];
      this._initObserver(this._onMouseEvent);
    }
  },

  members : {
    __defaultTarget : null,
    __emitter : null,
    __eventNames : null,
    __nativePointerEvents : false,
    __wrappedListener : null,
    __lastButtonState : 0,
    __buttonStates : null,
    __primaryIdentifier : null,

    /**
     * Adds listeners to native pointer events if supported
     */
    _initPointerObserver : function() {
      this._initObserver(this._onPointerEvent);
    },


    /**
     * Register native event listeners
     * @param callback {Function} listener callback
     */
    _initObserver : function(callback) {
      this.__wrappedListener = qx.lang.Function.listener(callback, this);
      this.__eventNames.forEach(function(type) {
        qx.bom.Event.addNativeListener(this.__defaultTarget, type, this.__wrappedListener);
      }.bind(this));
    },

    /**
     * Handler for native pointer events
     * @param domEvent {Event}  Native DOM event
     */
    _onPointerEvent : function(domEvent) {
      if (!this.__nativePointerEvents) {
        domEvent.stopPropagation();
      }
      var type = qx.event.handler.PointerCore.MSPOINTER_TO_POINTER_MAPPING[domEvent.type] || domEvent.type;
      var target = qx.bom.Event.getTarget(domEvent);
      domEvent.type = type;
      var evt = new qx.event.type.dom.Pointer(type, domEvent);
      this._fireEvent(evt, type, target);
    },

    /**
     * Handler for touch events
     * @param domEvent {Event} Native DOM event
     */
    _onTouchEvent: function(domEvent) {
      var type = qx.event.handler.PointerCore.TOUCH_TO_POINTER_MAPPING[domEvent.type];
      var changedTouches = domEvent.changedTouches;
      domEvent.stopPropagation();

      if (domEvent.type == "touchstart" && this.__primaryIdentifier === null) {
        this.__primaryIdentifier = changedTouches[0].identifier;
      }

      for (var i = 0, l = changedTouches.length; i < l; i++) {
        var touch = changedTouches[i];

        var touchProps = {
          clientX: touch.clientX,
          clientY: touch.clientY,
          pageX: touch.pageX,
          pageY: touch.pageY,
          identifier: touch.identifier,
          screenX: touch.screenX,
          screenY: touch.screenY,
          target: document.elementFromPoint(touch.clientX, touch.clientY),
          pointerType: "touch",
          pointerId: touch.identifier + 2
        };

        if (domEvent.type == "touchstart") {
          // Fire pointerenter before pointerdown
          var overEvt = new qx.event.type.dom.Pointer("pointerover", domEvent, touchProps);
          this._fireEvent(overEvt, "pointerover", touchProps.target);
        }

        var evt = new qx.event.type.dom.Pointer(type, domEvent, touchProps);
        if (touch.identifier == this.__primaryIdentifier) {
          evt.isPrimary = true;
          // always simulate left click on touch interactions for primary pointer
          evt.button = 0;
          evt.buttons = 1;
          qx.event.handler.PointerCore.__lastTouch = {
            "x": touch.clientX,
            "y": touch.clientY,
            "time": new Date().getTime()
          };
        }

        this._fireEvent(evt, type, touchProps.target);

        if (domEvent.type == "touchend" || domEvent.type == "touchcancel") {
          // Fire pointerout after pointerup
          var outEvt = new qx.event.type.dom.Pointer("pointerout", domEvent, touchProps);
          // fire on the original target to make sure over / out event are on the same target
          this._fireEvent(outEvt, "pointerout", domEvent.target);

          if (this.__primaryIdentifier == touch.identifier) {
            this.__primaryIdentifier = null;
          }
        }
      }
    },


    /**
    * Handler for touch events
    * @param domEvent {Event} Native DOM event
    */
    _onMouseEvent : function(domEvent) {
      qx.bom.Event.stopPropagation(domEvent);

      if (this._isSimulatedMouseEvent(domEvent.clientX, domEvent.clientY)) {
        /*
          Simulated MouseEvents are fired by browsers directly after TouchEvents
          for improving compatibility. They should not trigger PointerEvents.
        */
        domEvent.preventDefault();
        return;
      }

      if (domEvent.type == "mousedown") {
        this.__buttonStates[domEvent.which] = 1;
      } else if (domEvent.type == "mouseup") {
        this.__buttonStates[domEvent.which] = 0;
      }

      var type = qx.event.handler.PointerCore.MOUSE_TO_POINTER_MAPPING[domEvent.type];
      var target = qx.bom.Event.getTarget(domEvent);

      var buttonsPressed = qx.lang.Array.sum(this.__buttonStates);

      var mouseProps = {pointerType : "mouse", pointerId: 1};

      // if the button state changes but not from or to zero
      if (this.__lastButtonState != buttonsPressed && buttonsPressed != 0 && this.__lastButtonState != 0) {
        var moveEvt = new qx.event.type.dom.Pointer("pointermove", domEvent, mouseProps);
        this._fireEvent(moveEvt, "pointermove", target);
      }
      this.__lastButtonState = buttonsPressed;

      // pointerdown should only trigger form the first pressed button.
      if (domEvent.type == "mousedown" && buttonsPressed > 1) {
        return;
      }

      // pointerup should only trigger if user releases all buttons.
      if (domEvent.type == "mouseup" && buttonsPressed > 0) {
        return;
      }

      if (domEvent.type == "contextmenu") {
        this.__buttonStates[domEvent.which] = 0;
        return;
      }

      var evt = new qx.event.type.dom.Pointer(type, domEvent, mouseProps);
      this._fireEvent(evt, type, target);
    },


    /**
     * Detects whether the given MouseEvent position is identical to the previously fired TouchEvent position.
     * If <code>true</code> the corresponding event can be identified as simulated.
     * @param x {Integer} current mouse x
     * @param y {Integer} current mouse y
     * @return {Boolean} <code>true</code> if passed mouse position is a synthetic MouseEvent.
     */
    _isSimulatedMouseEvent: function(x, y) {
      var touch = qx.event.handler.PointerCore.__lastTouch;
      if (touch) {
        var timeSinceTouch = new Date().getTime() - touch.time;
        var dist = qx.event.handler.PointerCore.SIM_MOUSE_DISTANCE;
        var distX = Math.abs(x - qx.event.handler.PointerCore.__lastTouch.x);
        var distY = Math.abs(y - qx.event.handler.PointerCore.__lastTouch.y);
        if (timeSinceTouch < qx.event.handler.PointerCore.SIM_MOUSE_DELAY) {
          if (distX < dist || distY < dist) {
            return true;
          }
        }
      }
      return false;
    },


    /**
     * Removes native pointer event listeners.
     */
    _stopObserver : function() {
      for (var i = 0; i < this.__eventNames.length; i++) {
        qx.bom.Event.removeNativeListener(this.__defaultTarget, this.__eventNames[i], this.__wrappedListener);
      }
    },

    /**
     * Fire a touch event with the given parameters
     *
     * @param domEvent {Event} DOM event
     * @param type {String ? null} type of the event
     * @param target {Element ? null} event target
     */
    _fireEvent : function(domEvent, type, target)
    {
      target = target || domEvent.target;
      type = type || domEvent.type;

      var gestureEvent;
      if (type == "pointerdown" || type == "pointerup" || type == "pointermove") {
        gestureEvent = new qx.event.type.dom.Pointer(
          qx.event.handler.PointerCore.POINTER_TO_GESTURE_MAPPING[type],
          domEvent);
        gestureEvent = qx.module.event.Pointer.normalize(gestureEvent);
        gestureEvent.srcElement = target;
      }

      if (qx.core.Environment.get("event.dispatchevent")) {
        if (!this.__nativePointerEvents) {
          target.dispatchEvent(domEvent);
        }
        if (gestureEvent) {
          target.dispatchEvent(gestureEvent);
        }
      } else {
        // ensure compatibility with native events for IE8
        domEvent.srcElement = target;

        while (target) {
          if (target.$$emitter) {
            domEvent.currentTarget = target;
            if (!domEvent._stopped) {
              target.$$emitter.emit(type, domEvent);
            }
            if (gestureEvent && !gestureEvent._stopped) {
              gestureEvent.currentTarget = target;
              target.$$emitter.emit(gestureEvent.type, gestureEvent);
            }
          }
          target = target.parentNode;
        }
      }
    },

    /**
     * Dispose this object
     */
    dispose : function() {
      this._stopObserver();
      this.__defaultTarget = this.__emitter = null;
    }
  }
});
