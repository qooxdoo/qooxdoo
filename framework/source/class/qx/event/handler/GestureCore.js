qx.Bootstrap.define("qx.event.handler.GestureCore", {
  extend : Object,

  statics : {

    TAP_MAX_DISTANCE : qx.core.Environment.get("os.name") != "android" ? 10 : 40,

    /** @type {Map} The direction of a swipe relative to the axis */
    SWIPE_DIRECTION :
    [
      ["left", "right"],
      ["up", "down"]
    ],

    /** @type {Integer} The minimum distance of a swipe. Only if the x or y distance
     *      of the performed swipe is greater as or equal the value of this
     *      constant, a swipe event is fired.
     */
    SWIPE_MIN_DISTANCE : qx.core.Environment.get("os.name") != "android" ? 11 : 41,

    /** @type {Integer} The minimum velocity of a swipe. Only if the velocity of the
     *      performed swipe is greater as or equal the value of this constant, a
     *      swipe event is fired.
     */
    SWIPE_MIN_VELOCITY : 0,

    /**
     * @type {Integer} The time delta in milliseconds to fire a long tap event.
     */
    LONGTAP_TIME : 500
  },

  construct : function(target, emitter) {
    this.__defaultTarget = target;
    this.__emitter = emitter;
    this.__gestureStartPosition = {};
  },

  members : {
    __defaultTarget : null,
    __emitter : null,
    __onMove : null,
    __gestureStartPosition : null,
    __startTime : null,
    __longTapTimer : null,
    __originalTarget : null,
    __isTapGesture : null,
    __eventName : null,


    /**
     * Checks if a gesture was made and fires the gesture event.
     *
     * @param domEvent {Event} DOM event
     * @param type {String ? null} type of the event
     * @param target {Element ? null} event target
     */
    checkAndFireGesture : function(domEvent, type, target) {
      if (!target) {
        target = qx.bom.Event.getTarget(domEvent);
      }
      if (!type) {
        type = domEvent.type;
      }

      if (type == "pointerdown") {
        this.__isTapGesture = true;
        this.gestureStart(domEvent, target);
      }
      else if (type == "pointermove") {
        this.gestureChange(domEvent, target);
      }
      else if (type == "pointerup") {
        this.gestureEnd(domEvent, target);
      }
    },

    /**
     * Helper method for gesture start.
     *
     * @param domEvent {Event} DOM event
     * @param target {Element} event target
     */
    gestureStart : function(domEvent, target) {
      this.__onMove = true;

      this.__gestureStartPosition[this._getIdentifier(domEvent)] = [domEvent.clientX, domEvent.clientY];

      this.__startTime = new Date().getTime();

      // start the long tap timer
      this.__longTapTimer = window.setTimeout(
        this.__fireLongTap.bind(this, domEvent, target),
        qx.event.handler.GestureCore.LONGTAP_TIME
      );
      // } else {
      //   this.__stopLongTapTimer();
      // }
    },

    /**
     * Helper method for gesture change.
     *
     * @param domEvent {Event} DOM event
     * @param target {Element} event target
     */
    gestureChange : function(domEvent, target) {
      // abort long tap timer if the distance is too big
      if (this.__isTapGesture) {
        this.__isTapGesture = this._isBelowTapMaxDistance(domEvent);
      }
      if (this.__isTapGesture && !this._isBelowTapMaxDistance(domEvent)) {
        this.__stopLongTapTimer();
      }
    },

    _getIdentifier : function(domEvent) {
      if (domEvent.changedTouches) {
        //TODO
      } else {
        return 0;
      }
    },

    /**
     * Checks if the distance between the x/y coordinates of "touchstart" and "touchmove" event
     * exceeds TAP_MAX_DISTANCE and returns the result.
     *
     * @param domEvent {Event} The "touchmove" event from the browser.
     * @return {Boolean} true if distance is below TAP_MAX_DISTANCE.
     */
    _isBelowTapMaxDistance: function(domEvent) {
      var delta = this._getDeltaCoordinates(domEvent);
      if (!delta) {
        return null;
      }
      var clazz = qx.event.handler.GestureCore;

      return (Math.abs(delta[0]) <= clazz.TAP_MAX_DISTANCE &&
              Math.abs(delta[1]) <= clazz.TAP_MAX_DISTANCE);
    },

    _getDeltaCoordinates : function(domEvent) {
      var position = this.__gestureStartPosition[this._getIdentifier(domEvent)];
      if (!position) {
        return null;
      }
      return [
        position[0] - domEvent.clientX,
        position[1] - domEvent.clientY
      ];
    },


    /**
     * Helper method for gesture end.
     *
     * @param domEvent {Event} DOM event
     * @param target {Element} event target
     */
    gestureEnd : function(domEvent, target) {
      this.__onMove = false;

      // delete the long tap
      this.__stopLongTapTimer();
      var eventType;

      if (this.__isTapGesture) {
        if (qx.event && qx.event.type && qx.event.type.Tap) {
          eventType = qx.event.type.Tap;
        }
        this._fireEvent(domEvent, "tap", target, eventType);
      }
      else {
        var swipe = this.__getSwipeGesture(domEvent, target);
        if (swipe) {
          if (qx.event && qx.event.type && qx.event.type.Swipe) {
            eventType = qx.event.type.Swipe;
          }
          domEvent.swipe = swipe;
          this._fireEvent(domEvent, "swipe", target, eventType);
        }
      }

      delete this.__gestureStartPosition[this._getIdentifier(domEvent)];
    },

    /**
     * Fire a gesture event with the given parameters
     *
     * @param domEvent {Event} DOM event
     * @param type {String} type of the event
     * @param target {Element ? null} event target
     */
    _fireEvent : function(domEvent, type, target) {
      target = target || domEvent.target;

      var evt = document.createEvent('Event');
      evt.initEvent(type, true, true);

      if (target && target.nodeType && this.__emitter) {
        this.__emitter.emit(type, evt);
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
    __getSwipeGesture : function(domEvent, target) {
      var clazz = qx.event.handler.GestureCore;
      var deltaCoordinates = this._getDeltaCoordinates(domEvent);
      var duration = new Date().getTime() - this.__startTime;
      var axis = (Math.abs(deltaCoordinates[0]) >= Math.abs(deltaCoordinates[1])) ? 0 : 1;
      var distance = deltaCoordinates[axis];
      var direction = clazz.SWIPE_DIRECTION[axis][distance < 0 ? 0 : 1];
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
     * Fires the long tap event.
     *
     * @param domEvent {Event} DOM event
     * @param target {Element} event target
     */
    __fireLongTap : function(domEvent, target) {
      this._fireEvent(domEvent, "longtap", target, qx.event.type.Tap);
      this.__longTapTimer = null;
      // prevent the tap event
      this.__isTapGesture = false;
    },


    /**
     * Stops the time for the long tap event.
     */
    __stopLongTapTimer : function() {
      if (this.__longTapTimer) {
        window.clearTimeout(this.__longTapTimer);
        this.__longTapTimer = null;
      }
    },

    /**
     * Checks if the distance between the x/y coordinates of touchstart/mousedown and touchmove/mousemove event
     * exceeds TAP_MAX_DISTANCE and returns the result.
     *
     * @param event {Event} The event from the browser.
     * @return {Boolean} true if distance is below TAP_MAX_DISTANCE.
     */
    isBelowTapMaxDistance: function(event) {
      var deltaCoordinates = this._calcDelta(event);
      var clazz = qx.event.handler.GestureCore;

      return (Math.abs(deltaCoordinates.x) <= clazz.TAP_MAX_DISTANCE &&
              Math.abs(deltaCoordinates.y) <= clazz.TAP_MAX_DISTANCE);
    },

    dispose : function() {
      this.__originalTarget = this.__emitter = this.__defaultTarget = null;
      this.__stopLongTapTimer();
    }
  }
});
