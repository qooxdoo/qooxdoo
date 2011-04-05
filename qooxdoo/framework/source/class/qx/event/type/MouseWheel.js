/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Mouse wheel event object.
 */
qx.Class.define("qx.event.type.MouseWheel",
{
  extend : qx.event.type.Mouse,

  statics : {
    /**
     * The maximal mesured scroll wheel delta.
     * @internal
     */
    MAXSCROLL : null,

    /**
     * The minimal mesured scroll wheel delta.
     * @internal
     */
    MINSCROLL : null,

    /**
     * The normalization factor for the speed calculation.
     * @internal
     */
    FACTOR : 1
  },

  members :
  {
    // overridden
    stop : function()
    {
      this.stopPropagation();
      this.preventDefault();
    },


    /**
     * Normalizer for the mouse wheel data.
     *
     * @param delta {Number} The mouse delta.
     */
    __normalize : function(delta) {
      var absDelta = Math.abs(delta);

      // store the min value
      if (
        qx.event.type.MouseWheel.MINSCROLL == null ||
        qx.event.type.MouseWheel.MINSCROLL > absDelta
      ) {
        qx.event.type.MouseWheel.MINSCROLL = absDelta;
        this.__recalculateMultiplicator();
      }

      // store the max value
      if (
        qx.event.type.MouseWheel.MAXSCROLL == null ||
        qx.event.type.MouseWheel.MAXSCROLL < absDelta
      ) {
        qx.event.type.MouseWheel.MAXSCROLL = absDelta;
        this.__recalculateMultiplicator();
      }

      // special case for systems not speeding up
      if (
        qx.event.type.MouseWheel.MAXSCROLL === absDelta &&
        qx.event.type.MouseWheel.MINSCROLL === absDelta
      ) {
        return 2 * (delta / absDelta);
      }

      var range =
        qx.event.type.MouseWheel.MAXSCROLL - qx.event.type.MouseWheel.MINSCROLL;
      var ret = (delta / range) * Math.log(range) * qx.event.type.MouseWheel.FACTOR;

      // return at least 1 or -1
      return ret < 0 ? Math.min(ret, -1) : Math.max(ret, 1);
    },


    /**
     * Recalculates the factor with which the calculated delta is normalized.
     */
    __recalculateMultiplicator : function() {
      var max = qx.event.type.MouseWheel.MAXSCROLL || 0;
      var min = qx.event.type.MouseWheel.MINSCROLL || max;
      if (max <= min) {
        return;
      }
      var range = max - min;
      var maxRet = (max / range) * Math.log(range);
      if (maxRet == 0) {
        maxRet = 1;
      }
      qx.event.type.MouseWheel.FACTOR = 6 / maxRet;
    },


    /**
     * Get the amount the wheel has been scrolled
     *
     * @return {Integer} Scroll wheel movement
     */
    getWheelDelta : function() {
      // new feature detectiong behavior
      if (qx.core.Environment.get("qx.dynamicmousewheel")) {
        if (this._native.detail) {
          return this.__normalize(this._native.detail);
        }
        return this.__normalize(-this._native.wheelDelta);

      // old, browser detecting behavior
      } else {
        var handler = qx.core.Environment.select("engine.name", {
          "default" : function() {
            return -(this._native.wheelDelta / 40);
          },

          "gecko" : function() {
            return this._native.detail;
          },

          "webkit" : function()
          {
            if (qx.core.Environment.get("browser.name") == "chrome") {
              // mac has a much higher sppedup during scrolling
              if (qx.core.Environment.get("os.name") == "osx") {
                return -(this._native.wheelDelta / 60);
              } else {
                return -(this._native.wheelDelta / 120);
              }

            } else {
              // windows safaris behave different than on OSX
              if (qx.core.Environment.get("os.name") == "win") {
                var factor = 120;
                // safari 5.0 and not 5.0.1
                if (parseFloat(qx.core.Environment.get("engine.version")) == 533.16) {
                  factor = 1200;
                }
              } else {
                factor = 40;
                // Safari 5.0 or 5.0.1
                if (
                  parseFloat(qx.core.Environment.get("engine.version")) == 533.16 ||
                  parseFloat(qx.core.Environment.get("engine.version")) == 533.17 ||
                  parseFloat(qx.core.Environment.get("engine.version")) == 533.18
                ) {
                  factor = 1200;
                }
              }
              return -(this._native.wheelDelta / factor);
            }
          }
        });
        return handler.call(this);
      }
    }
  }
});