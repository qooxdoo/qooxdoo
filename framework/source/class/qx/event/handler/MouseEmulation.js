/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * This handler is responsible for emulating mouse events based on touch events.
 * The emulation is enabled by the environment key 'qx.emulatemouse' and the
 * availability of touch events. If that's the case, the regular mouse handler will
 * be disabled and this handler takes it's place. It fakes, based on 'touchstart', 'touchmove'
 * 'touchend' and 'tap' the events for 'mousedown', 'mousemove', 'mouseup' and 'click'.
 * As additional feature, it fakes 'mousewheel' events for swipe gestures including the
 * momentum scrolling.
 *
 * @require(qx.event.handler.Touch)
 * @require(qx.event.handler.TouchCore)
 */
qx.Class.define("qx.event.handler.MouseEmulation",
{
  extend : qx.core.Object,
  implement : qx.event.IEventHandler,

  /**
   * @param manager {qx.event.Manager} Event manager for the window to use.
   */
  construct : function(manager)
  {
    this.base(arguments);

    // Define shorthands
    this.__manager = manager;
    this.__window = manager.getWindow();
    this.__root = this.__window.document;

    // Initialize observers
    if (qx.event.handler.MouseEmulation.ON) {
      this._initObserver();
      document.documentElement.style.msTouchAction = "none";
    }
  },


  statics :
  {
    /** @type {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_FIRST,

    /** @type {Map} Supported event types */
    SUPPORTED_TYPES :
    {
      mousedown : 1,
      mouseup : 1,
      mousemove : 1,
      click : 1,
      contextmenu : 1
    },

    /** @type {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_DOMNODE + qx.event.IEventHandler.TARGET_DOCUMENT + qx.event.IEventHandler.TARGET_WINDOW,

    /** @type {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : true,


    /** @type {Boolean} Flag which indicates if the mouse emulation should be on */
    ON : qx.core.Environment.get("qx.emulatemouse") &&
         ((qx.core.Environment.get("event.mspointer") && qx.core.Environment.get("device.touch")) ||
         (qx.core.Environment.get("event.touch") && qx.core.Environment.get("os.name") !== "win"))
  },


  members :
  {
    __manager : null,
    __window : null,
    __root : null,

    __startPos : null,
    __lastPos : null,
    __impulseTimerId : null,
    __impulseRequestId : null,


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
     * Fire a mouse event with the given parameters
     *
     * @param evt {Event} qooxdoo touch event
     * @param type {String} type of the event
     * @param target {var} The target of the event.
     * @return {Boolean} <code>true</code>, if the event was stoped
     */
    __fireEvent : function(evt, type, target) {
      var mouseEvent = type == "mousewheel" ?
        new qx.event.type.MouseWheel() :
        new qx.event.type.Mouse();
      mouseEvent.init(evt, target, null, true, true);
      mouseEvent.setType(type);
      return qx.event.Registration.getManager(target).dispatchEvent(target, mouseEvent);
    },


    /**
     * Helper to fire a mouse wheel event.
     * @param deltaX {Number} The delta in x direction of the wheel event.
     * @param deltaY {Number} The delta in y direction of the wheel event.
     * @param finger {Map} The first item of the fingers array of a touch event.
     * @param target {var} The target of the event.
     */
    __fireWheelEvent : function(deltaX, deltaY, finger, target) {
      // change the native fake event to include the wheel delta's
      var wheelEvent = this.__getDefaultFakeEvent(target, finger);
      wheelEvent.wheelDelta = deltaX;
      wheelEvent.wheelDeltaY = deltaY;
      wheelEvent.wheelDeltaX = deltaX;

      this.__fireEvent(wheelEvent, "mousewheel", target);
    },


    /**
     * Helper for momentum scrolling.
     * @param deltaX {Number} The deltaX from the last scrolling.
     * @param deltaY {Number} The deltaY from the last scrolling.
     * @param finger {Map} The first item of the fingers array of a touch event.
     * @param target {var} The target of the event.
     * @param time {Number} The passed time since the impulse was handle the last time.
     */
    __handleScrollImpulse : function(deltaX, deltaY, finger, target, time) {
      // delete the old timer id
      this.__impulseTimerId = null;
      this.__impulseRequestId = null;

      // do nothing if we don't need to scroll
      if (deltaX == 0 && deltaY == 0) {
        return;
      }

      var change = parseInt((time || 20) / 10);

      // linear momentum calculation for X
      if (deltaX > 0) {
        deltaX = Math.max(0, deltaX - change);
      } else {
        deltaX = Math.min(0, deltaX + change);
      }

      // linear momentum calculation for Y
      if (deltaY > 0) {
        deltaY = Math.max(0, deltaY - change);
      } else {
        deltaY = Math.min(0, deltaY + change);
      }

      // set up a new timer with the new delta
      var start = +(new Date());
      this.__impulseRequestId = qx.bom.AnimationFrame.request(qx.lang.Function.bind(function(deltaX, deltaY, finger, target, time) {
        this.__handleScrollImpulse(deltaX, deltaY, finger, target, time - start);
      }, this, deltaX, deltaY, finger, target));

      // scroll the desired new delta
      this.__fireWheelEvent(deltaX, deltaY, finger, target);
    },


    /**
     * Helper to find out if there has been a move gesture or not.
     *
     * @param nativeEvent {var} The native touch event.
     * @return {Boolean} <code>true</code>, if a move has been detected.
     */
    __hasMoved : function(nativeEvent) {
      var endPos = {x: nativeEvent.screenX, y: nativeEvent.screenY};
      var moved = false;

      var offset = 20;
      if (Math.abs(endPos.x - this.__startPos.x) > offset) {
        moved = true;
      }
      if (Math.abs(endPos.y - this.__startPos.y) > offset) {
        moved = true;
      }
      return moved;
    },


    /**
     * Initializes the native mouse button event listeners.
     */
    _initObserver : function() {
      qx.event.Registration.addListener(this.__root, "touchstart", this.__onTouchStart, this);
      qx.event.Registration.addListener(this.__root, "touchmove", this.__onTouchMove, this);
      qx.event.Registration.addListener(this.__root, "touchend", this.__onTouchEnd, this);
      qx.event.Registration.addListener(this.__root, "tap", this.__onTap, this);
      qx.event.Registration.addListener(this.__root, "longtap", this.__onLongTap, this);

      qx.bom.Event.addNativeListener(this.__window, "touchstart", this.__stopScrolling);
    },


    /**
     * Disconnects the native mouse button event listeners.
     */
    _stopObserver : function() {
      qx.event.Registration.removeListener(this.__root, "touchstart", this.__onTouchStart, this);
      qx.event.Registration.removeListener(this.__root, "touchmove", this.__onTouchMove, this);
      qx.event.Registration.removeListener(this.__root, "touchend", this.__onTouchEnd, this);
      qx.event.Registration.removeListener(this.__root, "tap", this.__onTap, this);
      qx.event.Registration.removeListener(this.__root, "longtap", this.__onLongTap, this);

      qx.bom.Event.removeNativeListener(this.__window, "touchstart", this.__stopScrolling);
    },


    /**
     * Handler for the native 'touchstart' on the window which prevents
     * the native page scrolling.
     * @param e {qx.event.type.Touch} The qooxdoo touch event.
     */
    __stopScrolling : function(e) {
      e.preventDefault();
    },


    /**
     * Handler for 'touchstart' which converts the touch start event to a mouse down event.
     * @param e {qx.event.type.Touch} The qooxdoo touch event.
     */
    __onTouchStart : function(e) {
      var target = e.getTarget();
      var nativeEvent = this.__getDefaultFakeEvent(target, e.getAllTouches()[0]);
      // do not fake mousedown on IE (Mouse Handler can take original event)
      if (qx.core.Environment.get("event.touch")) {
        if (!this.__fireEvent(nativeEvent, "mousedown", target)) {
          e.preventDefault();
        }
      }
      this.__lastPos = {x: nativeEvent.screenX, y: nativeEvent.screenY};
      this.__startPos = {x: nativeEvent.screenX, y: nativeEvent.screenY};

      // stop scrolling if any is happening
      if (this.__impulseRequestId && window.cancelAnimationFrame) {
        window.cancelAnimationFrame(this.__impulseRequestId);
        this.__impulseRequestId = null;
      }
    },


    /**
     * Handler for 'touchmove' which converts the touch move event to a mouse move event.
     * Additionally, the mouse wheel events will be generated in this handler.
     * @param e {qx.event.type.Touch} The qooxdoo touch event.
     */
    __onTouchMove : function(e) {
      var target = e.getTarget();
      var nativeEvent = this.__getDefaultFakeEvent(target, e.getChangedTargetTouches()[0]);

      // do not fake mousemove on IE (Mouse Handler can take original event)
      if (qx.core.Environment.get("event.touch")) {
        if (!this.__fireEvent(nativeEvent, "mousemove", target)) {
          e.preventDefault();
        }
      }

      // calculate the delta for the wheel event
      var deltaY = -parseInt(this.__lastPos.y - nativeEvent.screenY);
      var deltaX = -parseInt(this.__lastPos.x - nativeEvent.screenX);

      // take a new position. wheel events require the delta to the last event
      this.__lastPos = {x: nativeEvent.screenX, y: nativeEvent.screenY};

      // only react on touch events
      // http://www.w3.org/Submission/pointer-events/#pointerevent-interface
      if (e.getNativeEvent().pointerType != 4) {
        var finger = e.getChangedTargetTouches()[0];
        this.__fireWheelEvent(deltaX, deltaY, finger, target);

        // if we have an old timeout for the current direction, clear it
        if (this.__impulseTimerId) {
          clearTimeout(this.__impulseTimerId);
          this.__impulseTimerId = null;
        }

        // set up a new timer for the current direction
        this.__impulseTimerId =
          setTimeout(qx.lang.Function.bind(function(deltaX, deltaY, finger, target) {
            this.__handleScrollImpulse(deltaX, deltaY, finger, target);
          }, this, deltaX, deltaY, finger, target), 100);
      }
    },


    /**
     * Handler for 'touchend' which converts the touch end event to a mouse up event.
     * @param e {qx.event.type.Touch} The qooxdoo touch event.
     */
    __onTouchEnd : function(e) {
      var target = e.getTarget();
      var nativeEvent = this.__getDefaultFakeEvent(target, e.getChangedTargetTouches()[0]);

      // do not fake mouseup on IE (Mouse Handler can take original event)
      if (qx.core.Environment.get("event.touch")) {
        if (!this.__fireEvent(nativeEvent, "mouseup", target)) {
          e.preventDefault();
        }
      }
    },


    /**
     * Handler for 'tap' which converts the tap event to a click event.
     * @param e {qx.event.type.Touch} The qooxdoo touch event.
     */
    __onTap : function(e) {
      var target = e.getTarget();
      var nativeEvent = this.__getDefaultFakeEvent(target, e.getChangedTargetTouches()[0]);

      if (!this.__hasMoved(nativeEvent)) {
        this.__fireEvent(nativeEvent, "click", target);
      }
    },


    /**
     * Handler for 'longtap' which converts the longtap event to a contextmenu event.
     * @param e {qx.event.type.Touch} The qooxdoo touch event.
     */
    __onLongTap : function(e) {
      var target = e.getTarget();
      var nativeEvent = this.__getDefaultFakeEvent(target, e.getChangedTargetTouches()[0]);

      this.__fireEvent(nativeEvent, "contextmenu", target);
    },


    /**
     * Returns a fake native mouse event, based on the the given target and finger.
     * @param target {var} The event target.
     * @param finger {Map} The first item of the native touch events fingers array.
     * @return {Map} A fake event as a simple Map containing the necessary keys and values.
     */
    __getDefaultFakeEvent : function(target, finger) {
      var nativeEvent = {};

      nativeEvent.button = 0; // for left button
      nativeEvent.wheelDelta = 0;
      nativeEvent.wheelDeltaX = 0;
      nativeEvent.wheelDeltaY = 0;
      nativeEvent.wheelX = 0;
      nativeEvent.wheelY = 0;
      nativeEvent.target = target;

      nativeEvent.clientX = finger.clientX;
      nativeEvent.clientY = finger.clientY;
      nativeEvent.pageX = finger.pageX;
      nativeEvent.pageY = finger.pageY;
      nativeEvent.screenX = finger.screenX;
      nativeEvent.screenY = finger.screenY;

      nativeEvent.shiftKey = false;
      nativeEvent.ctrlKey = false;
      nativeEvent.altKey = false;
      nativeEvent.metaKey = false;

      return nativeEvent;
    }
  },



  destruct : function()
  {
    if (qx.event.handler.MouseEmulation.ON) {
      this._stopObserver();
    }

    this.__manager = this.__window = this.__root = null;
  },



  defer : function(statics) {
    if (statics.ON) {
      qx.event.Registration.addHandler(statics);
    }
  }
});
