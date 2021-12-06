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
 * Normalization for the swipe gesture. This gesture is based on <a href="#Pointer">Pointer events</a>
 * meaning that it's available on all devices, no matter which input device type is used (e.g. mouse or
 * touchscreen).
 *
 * @require(qx.module.Event)
 *
 * @group (Event_Normalization)
 */
qx.Bootstrap.define("qx.module.event.Swipe", {
  statics :
  {
    /**
     * List of event types to be normalized
     */
    TYPES : ["swipe"],


    BIND_METHODS : [
      "getStartTime",
      "getDuration",
      "getAxis",
      "getDirection",
      "getVelocity",
      "getDistance"
    ],


    /**
     * Returns the start time of the performed swipe.
     *
     * @return {Integer} the start time
     */
    getStartTime : function() {
      return this._original.swipe.startTime;
    },


    /**
     * Returns the duration the performed swipe took.
     *
     * @return {Integer} the duration
     */
    getDuration : function() {
      return this._original.swipe.duration;
    },


    /**
     * Returns whether the performed swipe was on the x or y axis.
     *
     * @return {String} "x"/"y" axis
     */
    getAxis : function() {
      return this._original.swipe.axis;
    },


    /**
     * Returns the direction of the performed swipe in reference to the axis.
     * y = up / down
     * x = left / right
     *
     * @return {String} the direction
     */
    getDirection : function() {
      return this._original.swipe.direction;
    },


    /**
     * Returns the velocity of the performed swipe.
     *
     * @return {Number} the velocity
     */
    getVelocity : function() {
      return this._original.swipe.velocity;
    },


    /**
     * Returns the distance of the performed swipe.
     *
     * @return {Integer} the distance
     */
    getDistance : function() {
      return this._original.swipe.distance;
    },


    /**
     * Manipulates the native event object, adding methods if they're not
     * already present
     *
     * @param event {Event} Native event object
     * @param element {Element} DOM element the listener was attached to
     * @return {Event} Normalized event object
     * @internal
     */
    normalize : function(event, element)
    {
      if (!event) {
        return event;
      }
      // apply mouse event normalizations
      var bindMethods = qx.module.event.Swipe.BIND_METHODS;
      for (var i=0, l=bindMethods.length; i<l; i++) {
        if (typeof event[bindMethods[i]] != "function") {
          event[bindMethods[i]] = qx.module.event.Swipe[bindMethods[i]].bind(event);
        }
      }

      return event;
    }
  },

  defer : function(statics) {
    qxWeb.$registerEventNormalization(qx.module.event.Swipe.TYPES, statics.normalize);
  }
});
