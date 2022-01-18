/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * Swipe is a single pointer gesture fired when a pointer is moved in one direction.
 * It contains some additional data like the primary axis, the velocity and the distance.
 */
qx.Class.define("qx.event.type.Swipe", {
  extend: qx.event.type.Pointer,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    // overridden
    _cloneNativeEvent(nativeEvent, clone) {
      var clone = super._cloneNativeEvent(nativeEvent, clone);

      clone.swipe = nativeEvent.swipe;

      return clone;
    },

    /**
     * Returns the start time of the performed swipe.
     *
     * @return {Integer} the start time
     */
    getStartTime() {
      return this._native.swipe.startTime;
    },

    /**
     * Returns the duration the performed swipe took.
     *
     * @return {Integer} the duration
     */
    getDuration() {
      return this._native.swipe.duration;
    },

    /**
     * Returns whether the performed swipe was on the x or y axis.
     *
     * @return {String} "x"/"y" axis
     */
    getAxis() {
      return this._native.swipe.axis;
    },

    /**
     * Returns the direction of the performed swipe in reference to the axis.
     * y = up / down
     * x = left / right
     *
     * @return {String} the direction
     */
    getDirection() {
      return this._native.swipe.direction;
    },

    /**
     * Returns the velocity of the performed swipe.
     *
     * @return {Number} the velocity
     */
    getVelocity() {
      return this._native.swipe.velocity;
    },

    /**
     * Returns the distance of the performed swipe.
     *
     * @return {Integer} the distance
     */
    getDistance() {
      return this._native.swipe.distance;
    }
  }
});
