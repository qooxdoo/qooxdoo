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
 * Low-level pointer event handler.
 *
 * @require(qx.bom.client.Event)
 * @require(qx.bom.client.Device)
 */
qx.Bootstrap.define("qx.event.handler.PointerCore", {

  extend : Object,
  implement: [ qx.core.IDisposable ],

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
      pointercancel : "gesturecancel",
      pointermove : "gesturemove"
    },

    LEFT_BUTTON : (qx.core.Environment.get("engine.name") == "mshtml" &&
      qx.core.Environment.get("browser.documentmode") <= 8) ? 1 : 0,

    SIM_MOUSE_DISTANCE : 25,

    SIM_MOUSE_DELAY : 2500,

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
    this.__activeTouches = [];
    this._processedFlag = "$$qx" +
      this.classname.substr(this.classname.lastIndexOf(".") + 1) +
      "Processed";

    var engineName = qx.core.Environment.get("engine.name");
    var docMode = parseInt(qx.core.Environment.get("browser.documentmode"), 10);
    if (engineName == "mshtml" && docMode == 10) {
      // listen to native prefixed events and custom unprefixed (see bug #8921)
      this.__eventNames = [
        "MSPointerDown", "MSPointerMove", "MSPointerUp", "MSPointerCancel", "MSPointerOver", "MSPointerOut",
        "pointerdown", "pointermove", "pointerup", "pointercancel", "pointerover", "pointerout"
      ];
      this._initPointerObserver();
    } else {
      if (qx.core.Environment.get("event.mspointer")) {
        this.__nativePointerEvents = true;
      }
      this.__eventNames = [
        "pointerdown", "pointermove", "pointerup", "pointercancel", "pointerover", "pointerout"
      ];
      this._initPointerObserver();
    }
    if (!qx.core.Environment.get("event.mspointer")) {
      if (qx.core.Environment.get("device.touch")) {
        this.__eventNames = ["touchstart", "touchend", "touchmove", "touchcancel"];
        this._initObserver(this._onTouchEvent);
      }

      this.__eventNames = [
        "mousedown", "mouseup", "mousemove", "mouseover", "mouseout", "contextmenu"
      ];
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
    __activeTouches : null,
    _processedFlag : null,

    /**
     * Adds listeners to native pointer events if supported
     */
    _initPointerObserver : function() {
      this._initObserver(this._onPointerEvent);
    },


    /**
     * Register native event listeners
     * @param callback {Function} listener callback
     * @param useEmitter {Boolean} attach listener to Emitter instead of
     * native event
     */
    _initObserver : function(callback, useEmitter) {
      this.__wrappedListener = qx.lang.Function.listener(callback, this);
      this.__eventNames.forEach(function(type) {
        if (useEmitter && qx.dom.Node.isDocument(this.__defaultTarget)) {
          if (!this.__defaultTarget.$$emitter) {
            this.__defaultTarget.$$emitter = new qx.event.Emitter();
          }
          this.__defaultTarget.$$emitter.on(type, this.__wrappedListener);
        } else {
          qx.bom.Event.addNativeListener(this.__defaultTarget, type, this.__wrappedListener);
        }
      }.bind(this));
    },

    /**
     * Handler for native pointer events
     * @param domEvent {Event}  Native DOM event
     */
    _onPointerEvent : function(domEvent) {
      if (!qx.core.Environment.get("event.mspointer") ||
          // workaround for bug #8533
          (qx.core.Environment.get("browser.documentmode") === 10 && domEvent.type.toLowerCase().indexOf("ms") == -1)
        )
      {
        return;
      }
      if (!this.__nativePointerEvents) {
        domEvent.stopPropagation();
      }
      var type = qx.event.handler.PointerCore.MSPOINTER_TO_POINTER_MAPPING[domEvent.type] || domEvent.type;
      var target = qx.bom.Event.getTarget(domEvent);
      var evt = new qx.event.type.dom.Pointer(type, domEvent);
      this._fireEvent(evt, type, target);
    },


    /**
     * Handler for touch events
     * @param domEvent {Event} Native DOM event
     */
    _onTouchEvent: function(domEvent) {
      if (domEvent[this._processedFlag]) {
        return;
      }
      domEvent[this._processedFlag] = true;
      var type = qx.event.handler.PointerCore.TOUCH_TO_POINTER_MAPPING[domEvent.type];
      var changedTouches = domEvent.changedTouches;

      this._determineActiveTouches(domEvent.type, changedTouches);

      // Detecting vacuum touches. (Touches which are not active anymore, but did not fire a touchcancel event)
      if (domEvent.touches.length < this.__activeTouches.length) {
        // Firing pointer cancel for previously active touches.
        for (var i = this.__activeTouches.length - 1; i >= 0; i--) {
          var cancelEvent = new qx.event.type.dom.Pointer("pointercancel", domEvent, {
            identifier: this.__activeTouches[i].identifier,
            target: domEvent.target,
            pointerType: "touch",
            pointerId: this.__activeTouches[i].identifier + 2
          });

          this._fireEvent(cancelEvent, "pointercancel", domEvent.target);
        }

        // Reset primary identifier
        this.__primaryIdentifier = null;

        // cleanup of active touches array.
        this.__activeTouches = [];

        // Do nothing after pointer cancel.
        return;
      }

      if (domEvent.type == "touchstart" && this.__primaryIdentifier === null) {
        this.__primaryIdentifier = changedTouches[0].identifier;
      }

      for (var i = 0, l = changedTouches.length; i < l; i++) {
        var touch = changedTouches[i];

        var touchTarget = domEvent.view.document.elementFromPoint(touch.clientX,touch.clientY) || domEvent.target;

        var touchProps = {
          clientX: touch.clientX,
          clientY: touch.clientY,
          pageX: touch.pageX,
          pageY: touch.pageY,
          identifier: touch.identifier,
          screenX: touch.screenX,
          screenY: touch.screenY,
          target: touchTarget,
          pointerType: "touch",
          pointerId: touch.identifier + 2
        };

        if (domEvent.type == "touchstart") {
          // Fire pointerenter before pointerdown
          var overEvt = new qx.event.type.dom.Pointer("pointerover", domEvent, touchProps);
          this._fireEvent(overEvt, "pointerover", touchProps.target);
        }

        if (touch.identifier == this.__primaryIdentifier) {
          touchProps.isPrimary = true;
          // always simulate left click on touch interactions for primary pointer
          touchProps.button = 0;
          touchProps.buttons = 1;
          qx.event.handler.PointerCore.__lastTouch = {
            "x": touch.clientX,
            "y": touch.clientY,
            "time": new Date().getTime()
          };
        }

        var evt = new qx.event.type.dom.Pointer(type, domEvent, touchProps);

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
      if (domEvent[this._processedFlag]) {
        return;
      }
      domEvent[this._processedFlag] = true;

      if (this._isSimulatedMouseEvent(domEvent.clientX, domEvent.clientY)) {
        /*
          Simulated MouseEvents are fired by browsers directly after TouchEvents
          for improving compatibility. They should not trigger PointerEvents.
        */
        return;
      }

      if (domEvent.type == "mousedown") {
        this.__buttonStates[domEvent.which] = 1;
      } else if (domEvent.type == "mouseup") {
        if (qx.core.Environment.get("os.name") == "osx" && qx.core.Environment.get("engine.name") == "gecko") {
          if (this.__buttonStates[domEvent.which] != 1 && domEvent.ctrlKey) {
            this.__buttonStates[1] = 0;
          }
        }

        this.__buttonStates[domEvent.which] = 0;
      }

      var type = qx.event.handler.PointerCore.MOUSE_TO_POINTER_MAPPING[domEvent.type];
      var target = qx.bom.Event.getTarget(domEvent);

      var buttonsPressed = qx.lang.Array.sum(this.__buttonStates);

      var mouseProps = {pointerType : "mouse", pointerId: 1};

      // if the button state changes but not from or to zero
      if (this.__lastButtonState != buttonsPressed && buttonsPressed !== 0 && this.__lastButtonState !== 0) {
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
     * Determines the current active touches.
     * @param type {String} the DOM event type.
     * @param changedTouches {Array} the current changed touches.
     */
    _determineActiveTouches: function(type, changedTouches) {
      if (type == "touchstart") {
        for (var i = 0; i < changedTouches.length; i++) {
          this.__activeTouches.push(changedTouches[i]);
        }
      } else if (type == "touchend" || type == "touchcancel") {
        var updatedActiveTouches = [];

        for (var i = 0; i < this.__activeTouches.length; i++) {
          var add = true;
          for (var j = 0; j < changedTouches.length; j++) {
            if (this.__activeTouches[i].identifier == changedTouches[j].identifier) {
              add = false;
              break;
            }
          }

          if (add) {
            updatedActiveTouches.push(this.__activeTouches[i]);
          }
        }
        this.__activeTouches = updatedActiveTouches;
      }
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
     * @return {qx.Promise?} a promise, if one was returned by event handlers
     */
    _fireEvent : function(domEvent, type, target)
    {
      target = target || domEvent.target;
      type = type || domEvent.type;

      var gestureEvent;
      if ((domEvent.pointerType !== "mouse" ||
           domEvent.button <= qx.event.handler.PointerCore.LEFT_BUTTON) &&
        (type == "pointerdown" || type == "pointerup" || type == "pointermove"))
      {
        gestureEvent = new qx.event.type.dom.Pointer(
          qx.event.handler.PointerCore.POINTER_TO_GESTURE_MAPPING[type],
          domEvent);
        qx.event.type.dom.Pointer.normalize(gestureEvent);
        try {
          gestureEvent.srcElement = target;
        }catch(ex) {
          // Nothing - strict mode prevents writing to read only properties
        }
      }

      if (qx.core.Environment.get("event.dispatchevent")) {
        var tracker = {};
        if (!this.__nativePointerEvents) {
          qx.event.Utils.then(tracker, function() {
            return target.dispatchEvent(domEvent);
          });
        }
        if (gestureEvent) {
          qx.event.Utils.then(tracker, function() {
            return target.dispatchEvent(gestureEvent);
          });
        }
        return tracker.promise;
      } else {
        // ensure compatibility with native events for IE8
        try {
          domEvent.srcElement = target;
        }catch(ex) {
          // Nothing - strict mode prevents writing to read only properties
        }

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
