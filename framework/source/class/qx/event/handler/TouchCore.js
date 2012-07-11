/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Tino Butz (tbtz)
     * Christian Hagendorn (chris_schmidt)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/* ************************************************************************
#ignore(qx.event.type.Tap)
#ignore(qx.event.type.Swipe)
#ignore(qx.event.type)
#ignore(qx.event)
************************************************************************ */

/**
 * Listens for native touch events and fires composite events like "tap" and
 * "swipe"
 */
qx.Bootstrap.define("qx.event.handler.TouchCore", {

  extend : Object,

  statics :
  {
    /** {Integer} The maximum distance of a tap. Only if the x or y distance of
     *      the performed tap is less or equal the value of this constant, a tap
     *      event is fired.
     */
    TAP_MAX_DISTANCE : qx.core.Environment.get("os.name") != "android" ? 10 : 40,


    /** {Map} The direction of a swipe relative to the axis */
    SWIPE_DIRECTION :
    {
      x : ["left", "right"],
      y : ["up", "down"]
    },


    /** {Integer} The minimum distance of a swipe. Only if the x or y distance
     *      of the performed swipe is greater as or equal the value of this
     *      constant, a swipe event is fired.
     */
    SWIPE_MIN_DISTANCE : qx.core.Environment.get("os.name") != "android" ? 11 : 41,

    /** {Integer} The minimum velocity of a swipe. Only if the velocity of the
     *      performed swipe is greater as or equal the value of this constant, a
     *      swipe event is fired.
     */
    SWIPE_MIN_VELOCITY : 0
  },


  /**
   * Create a new instance
   *
   * @param target {Element} element on which to listen for native touch events
   * @param emitter {qx.event.Emitter} Event emitter object
   */
  construct : function(target, emitter)
  {
    this.__target = target;
    this.__emitter = emitter;
    this._initTouchObserver();
  },


  members :
  {
    __target : null,
    __emitter : null,
    __onTouchEventWrapper : null,

    __originalTarget : null,

    __startPageX : null,
    __startPageY : null,
    __startTime : null,
    __isSingleTouchGesture : null,

    /*
    ---------------------------------------------------------------------------
      OBSERVER INIT
    ---------------------------------------------------------------------------
    */

    /**
     * Initializes the native touch event listeners.
     */
    _initTouchObserver : function()
    {
      this.__onTouchEventWrapper = qx.lang.Function.listener(this._onTouchEvent, this);

      var Event = qx.bom.Event;

      Event.addNativeListener(this.__target, "touchstart", this.__onTouchEventWrapper);
      Event.addNativeListener(this.__target, "touchmove", this.__onTouchEventWrapper);
      Event.addNativeListener(this.__target, "touchend", this.__onTouchEventWrapper);
      Event.addNativeListener(this.__target, "touchcancel", this.__onTouchEventWrapper);
    },



    /*
    ---------------------------------------------------------------------------
      OBSERVER STOP
    ---------------------------------------------------------------------------
    */

    /**
     * Disconnects the native touch event listeners.
     */
    _stopTouchObserver : function()
    {
      var Event = qx.bom.Event;

      Event.removeNativeListener(this.__target, "touchstart", this.__onTouchEventWrapper);
      Event.removeNativeListener(this.__target, "touchmove", this.__onTouchEventWrapper);
      Event.removeNativeListener(this.__target, "touchend", this.__onTouchEventWrapper);
      Event.removeNativeListener(this.__target, "touchcancel", this.__onTouchEventWrapper);
    },



    /*
    ---------------------------------------------------------------------------
      NATIVE EVENT OBSERVERS
    ---------------------------------------------------------------------------
    */

    /**
     * Handler for native touch events.
     *
     * @param domEvent {Event} The touch event from the browser.
     */
    _onTouchEvent : function(domEvent)
    {
      this._commonTouchEventHandler(domEvent);
    },


    /**
     * Called by an event handler.
     *
     * @param domEvent {Event} DOM event
     * @param type {String ? null} type of the event
     */
    _commonTouchEventHandler : function(domEvent, type)
    {
      var type = type || domEvent.type;
      if (type == "touchstart") {
        this.__originalTarget = this._getTarget(domEvent);
      }
      this._fireEvent(domEvent, type);
      this.__checkAndFireGesture(domEvent, type);
    },



    /*
    ---------------------------------------------------------------------------
      HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Return the target of the event.
     *
     * @param domEvent {Event} DOM event
     * @return {Element} Event target
     */
    _getTarget : function(domEvent)
    {
      var target = qx.bom.Event.getTarget(domEvent);
      // Text node. Fix Safari Bug, see http://www.quirksmode.org/js/events_properties.html
      if ((qx.core.Environment.get("engine.name") == "webkit"))
      {
        if (target && target.nodeType == 3) {
          target = target.parentNode;
        }
      }
      return target;
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
      if (!target) {
        target = this._getTarget(domEvent);
      }

      var type = type || domEvent.type;

      if (target && target.nodeType && this.__emitter)
      {
        this.__emitter.emit(type, domEvent);
      }
    },


    /**
     * Checks if a gesture was made and fires the gesture event.
     *
     * @param domEvent {Event} DOM event
     * @param type {String ? null} type of the event
     * @param target {Element ? null} event target
     */
    __checkAndFireGesture : function(domEvent, type, target)
    {
      if (!target) {
        target = this._getTarget(domEvent);
      }
      var type = type || domEvent.type;

      if (type == "touchstart")
      {
        this.__gestureStart(domEvent, target);
      }
      else if (type == "touchmove") {
        this.__gestureChange(domEvent, target);
      }
      else if (type == "touchend")
      {
        this.__gestureEnd(domEvent, target);
      }
    },


    /**
     * Helper method for gesture start.
     *
     * @param domEvent {Event} DOM event
     * @param target {Element} event target
     */
    __gestureStart : function(domEvent, target)
    {
      var touch = domEvent.changedTouches[0];
      this.__startPageX = touch.screenX;
      this.__startPageY = touch.screenY;
      this.__startTime = new Date().getTime();
      this.__isSingleTouchGesture = domEvent.changedTouches.length === 1;
    },


    /**
     * Helper method for gesture change.
     *
     * @param domEvent {Event} DOM event
     * @param target {Element} event target
     */
    __gestureChange : function(domEvent, target)
    {
      // Abort a single touch gesture when another touch occurs.
      if (this.__isSingleTouchGesture && domEvent.changedTouches.length > 1) {
        this.__isSingleTouchGesture = false;
      }
    },


    /**
     * Helper method for gesture end.
     *
     * @param domEvent {Event} DOM event
     * @param target {Element} event target
     */
    __gestureEnd : function(domEvent, target)
    {
      if (this.__isSingleTouchGesture)
      {
        var touch = domEvent.changedTouches[0];

        var deltaCoordinates = {
            x : touch.screenX - this.__startPageX,
            y : touch.screenY - this.__startPageY
        };

        var clazz = qx.event.handler.TouchCore;
        var eventType;
        if (this.__originalTarget == target
            && Math.abs(deltaCoordinates.x) <= clazz.TAP_MAX_DISTANCE
            && Math.abs(deltaCoordinates.y) <= clazz.TAP_MAX_DISTANCE) {
          if (qx.event && qx.event.type && qx.event.type.Tap) {
            eventType = qx.event.type.Tap;
          }

          this._fireEvent(domEvent, "tap", target,eventType);
        }
        else
        {
          var swipe = this.__getSwipeGesture(domEvent, target, deltaCoordinates);
          if (swipe) {
            if (qx.event && qx.event.type && qx.event.type.Swipe) {
              eventType = qx.event.type.Swipe;
            }
            domEvent.swipe = swipe;
            this._fireEvent(domEvent, "swipe", target, eventType);
          }
        }
      }
    },


    /**
     * Returns the swipe gesture when the user performed a swipe.
     *
     * @param domEvent {Event} DOM event
     * @param target {Element} event target
     * @param deltaCoordinates {Map} delta x/y coordinates since the gesture started.
     * @return {Map} returns the swipe data when the user performed a swipe, null if the gesture was no swipe.
     */
    __getSwipeGesture : function(domEvent, target, deltaCoordinates)
    {
      var clazz = qx.event.handler.TouchCore;
      var duration = new Date().getTime() - this.__startTime;
      var axis = (Math.abs(deltaCoordinates.x) >= Math.abs(deltaCoordinates.y)) ? "x" : "y";
      var distance = deltaCoordinates[axis];
      var direction = clazz.SWIPE_DIRECTION[axis][distance < 0 ? 0 : 1]
      var velocity = (duration !== 0) ? distance/duration : 0;

      var swipe = null;
      if (Math.abs(velocity) >= clazz.SWIPE_MIN_VELOCITY
          && Math.abs(distance) >= clazz.SWIPE_MIN_DISTANCE)
      {
        swipe = {
            startTime : this.__startTime,
            duration : duration,
            axis : axis,
            direction : direction,
            distance : distance,
            velocity : velocity
        };
      }
      return swipe;
    },


    /**
     * Dispose this object
     */
    dispose : function()
    {
      this._stopTouchObserver();
      this.__originalTarget = this.__target = this.__emitter = null;
    }
  }
});