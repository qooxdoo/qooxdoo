/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

 ************************************************************************ */

/**
 * Util for mouse wheel normalization.
 */
qx.Bootstrap.define("qx.util.Wheel", {
  statics: {
    /**
     * The maximal measured scroll wheel delta.
     * @internal
     */
    MAXSCROLL: null,

    /**
     * The minimal measured scroll wheel delta.
     * @internal
     */
    MINSCROLL: null,

    /**
     * The normalization factor for the speed calculation.
     * @internal
     */
    FACTOR: 1,

    /**
     * Is the Wheel actually a touchpad ?
     * @internal
     */
    IS_TOUCHPAD: false,

    /**
     * Get the amount the wheel has been scrolled
     *
     * @param domEvent {Event} The native wheel event.
     * @param axis {String?} Optional parameter which defines the scroll axis.
     *   The value can either be <code>"x"</code> or <code>"y"</code>.
     * @return {Integer} Scroll wheel movement for the given axis. If no axis
     *   is given, the y axis is used.
     */
    getDelta: function (domEvent, axis) {
      // default case
      if (axis === undefined) {
        // default case
        var delta = 0;
        if (domEvent.wheelDelta !== undefined) {
          delta = -domEvent.wheelDelta;
        } else if (domEvent.detail !== 0) {
          delta = domEvent.detail;
        } else if (domEvent.deltaY !== undefined) {
          // use deltaY as default for firefox
          delta = domEvent.deltaY;
        }
        return this.__normalize(delta);
      }

      // get the x scroll delta
      if (axis === "x") {
        var x = 0;
        if (domEvent.wheelDelta !== undefined) {
          if (domEvent.wheelDeltaX !== undefined) {
            x = domEvent.wheelDeltaX ? this.__normalize(-domEvent.wheelDeltaX) : 0;
          }
        } else {
          if (domEvent.axis && domEvent.axis == domEvent.HORIZONTAL_AXIS &&
            (domEvent.detail !== undefined) && (domEvent.detail > 0)
          ) {
            x = this.__normalize(domEvent.detail);
          } else if (domEvent.deltaX !== undefined) {
            x = this.__normalize(domEvent.deltaX);
          }
        }
        return x;
      }

      // get the y scroll delta
      if (axis === "y") {
        var y = 0;
        if (domEvent.wheelDelta !== undefined) {
          if (domEvent.wheelDeltaY !== undefined) {
            y = domEvent.wheelDeltaY ? this.__normalize(-domEvent.wheelDeltaY) : 0;
          } else {
            y = this.__normalize(-domEvent.wheelDelta);
          }
        } else {
          if (!(domEvent.axis && domEvent.axis == domEvent.HORIZONTAL_AXIS) &&
            (domEvent.detail !== undefined) && (domEvent.detail > 0)
          ) {
            y = this.__normalize(domEvent.detail);
          } else if (domEvent.deltaY !== undefined) {
            y = this.__normalize(domEvent.deltaY);
          }
        }
        return y;
      }
      // default case, return 0
      return 0;
    },


    /**
     * Normalizer for the mouse wheel data.
     *
     * @param delta {Number} The mouse delta.
     * @return {Number} The normalized delta value
     */
    __normalize: function (delta) {
      if (qx.util.Wheel.IS_TOUCHPAD) {
        // Reset normalization values that may be re-computed once a real mouse is plugged.
        qx.util.Wheel.MINSCROLL = null;
        qx.util.Wheel.MAXSCROLL = null;
        qx.util.Wheel.FACTOR = 1;
        return delta;
      }
      var absDelta = Math.abs(delta);

      if (absDelta === 0) {
        return 0;
      }

      // store the min value
      if (
        qx.util.Wheel.MINSCROLL == null ||
        qx.util.Wheel.MINSCROLL > absDelta
        ) {
        qx.util.Wheel.MINSCROLL = absDelta;
        this.__recalculateMultiplicator();
      }

      // store the max value
      if (
        qx.util.Wheel.MAXSCROLL == null ||
        qx.util.Wheel.MAXSCROLL < absDelta
        ) {
        qx.util.Wheel.MAXSCROLL = absDelta;
        this.__recalculateMultiplicator();
      }

      // special case for systems not speeding up
      if (
        qx.util.Wheel.MAXSCROLL === absDelta &&
        qx.util.Wheel.MINSCROLL === absDelta
        ) {
        return 2 * (delta / absDelta);
      }

      var range =
        qx.util.Wheel.MAXSCROLL - qx.util.Wheel.MINSCROLL;
      var ret = (delta / range) * Math.log(range) * qx.util.Wheel.FACTOR;

      // return at least 1 or -1
      return ret < 0 ? Math.min(ret, -1) : Math.max(ret, 1);
    },


    /**
     * Recalculates the factor with which the calculated delta is normalized.
     */
    __recalculateMultiplicator: function () {
      var max = qx.util.Wheel.MAXSCROLL || 0;
      var min = qx.util.Wheel.MINSCROLL || max;
      if (max <= min) {
        return;
      }
      var range = max - min;
      var maxRet = (max / range) * Math.log(range);
      if (maxRet == 0) {
        maxRet = 1;
      }
      qx.util.Wheel.FACTOR = 6 / maxRet;
      if (qx.core.Environment.get("qx.debug.touchpad.detection")) {
        qx.log.Logger.debug(this, "FACTOR : " + qx.util.Wheel.FACTOR);
      }
    }
  }
});
