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
 * Listens for (native or synthetic) pointer events and fires events
 * for gestures like "tap" or "swipe"
 *
 * @ignore(qx.event.type.Tap.*)
 * @ignore(qx.event.type.Swipe.*)
 */
qx.Bootstrap.define("qx.event.handler.GestureCore", {
  extend : Object,

  statics : {

    TAP_MAX_DISTANCE : qx.core.Environment.get("os.name") != "android" ? 10 : 40,

    /** @type {Map} The direction of a swipe relative to the axis */
    SWIPE_DIRECTION :
    {
      x : ["left", "right"],
      y : ["up", "down"]
    },

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

  construct : function(target) {
    this.__defaultTarget = target;
    this.__gestureStartPosition = {};
  },

  members : {
    __defaultTarget : null,
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

      if(!domEvent.isPrimary) {
        return;
      }

      if (type == "pointerdown") {
        this.__isTapGesture = true;
        this.gestureStart(domEvent, target);
      } else if (type == "pointermove") {
        this.gestureChange(domEvent, target);
      } else if (type == "pointerup") {
        // If no start position is available for this pointerup event, cancel gesture recognition.
        if (Object.keys(this.__gestureStartPosition).length == 0) {
          return;
        }
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
      this.__gestureStartPosition[domEvent.pointerId] = [domEvent.clientX, domEvent.clientY];

      this.__startTime = new Date().getTime();

      // start the long tap timer
      this.__longTapTimer = window.setTimeout(
        this.__fireLongTap.bind(this, domEvent, target),
        qx.event.handler.GestureCore.LONGTAP_TIME
      );
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


    /**
     * Checks if the distance between the x/y coordinates of DOM event
     * exceeds TAP_MAX_DISTANCE and returns the result.
     *
     * @param domEvent {Event} The DOM event from the browser.
     * @return {Boolean} true if distance is below TAP_MAX_DISTANCE.
     */
    _isBelowTapMaxDistance: function(domEvent) {
      var delta = this._getDeltaCoordinates(domEvent);
      if (!delta) {
        return null;
      }
      var clazz = qx.event.handler.GestureCore;

      return (Math.abs(delta.x) <= clazz.TAP_MAX_DISTANCE &&
              Math.abs(delta.y) <= clazz.TAP_MAX_DISTANCE);
    },


    /**
    * Calculates the delta coordinates in relation to the position on <code>pointerstart</code> event.
    * @param domEvent {Event} The DOM event from the browser.
    * @return {Map} containing the deltaX as x, ans deltaY as y.
    */
    _getDeltaCoordinates : function(domEvent) {
      var startPosition = this.__gestureStartPosition[domEvent.pointerId];
      if (!startPosition) {
        return null;
      }

      return {
        "x":domEvent.clientX - startPosition[0],
        "y":domEvent.clientY - startPosition[1]
      };
    },


    /**
     * Helper method for gesture end.
     *
     * @param domEvent {Event} DOM event
     * @param target {Element} event target
     */
    gestureEnd : function(domEvent, target) {

      // delete the long tap
      this.__stopLongTapTimer();
      var eventType;

      if (this.__isTapGesture) {
        if (qx.event && qx.event.type && qx.event.type.Tap) {
          eventType = qx.event.type.Tap;
        }
        this._fireEvent(domEvent, "tap", domEvent.target || target, eventType);
      }
      else {
        var swipe = this.__getSwipeGesture(domEvent, target);
        if (swipe) {
          if (qx.event && qx.event.type && qx.event.type.Swipe) {
            eventType = qx.event.type.Swipe;
          }
          domEvent.swipe = swipe;
          this._fireEvent(domEvent, "swipe", domEvent.target || target, eventType);
        }
      }
      delete this.__gestureStartPosition[domEvent.pointerId];
    },

    /**
     * Fire a gesture event with the given parameters
     *
     * @param domEvent {Event} DOM event
     * @param type {String} type of the event
     * @param target {Element ? null} event target
     */
    _fireEvent : function(domEvent, type, target) {
      target = domEvent.target || target;

      var evt = new qx.event.type.native.Custom(type, domEvent);
      target.dispatchEvent(evt);
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
      var axis = (Math.abs(deltaCoordinates.x) >= Math.abs(deltaCoordinates.y)) ? "x" : "y";
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
      this._fireEvent(domEvent, "longtap", domEvent.target || target, qx.event.type.Tap);
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
      this.__originalTarget = this.__defaultTarget = null;
      this.__stopLongTapTimer();
    }
  }
});
