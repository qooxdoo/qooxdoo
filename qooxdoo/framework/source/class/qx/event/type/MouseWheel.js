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
    MAXSCROLL : 1,
    
    
    /**
     * Calculation factor for browsers with known problems with the
     * automatic calculation.
     * @internal
     */
    BROWSER_FACTOR : {
      "gecko" : 1
    }
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
      // special case for knwon browsers
      var id = qx.bom.client.Engine.NAME;
      if (qx.event.type.MouseWheel.BROWSER_FACTOR[id]) {
        return qx.event.type.MouseWheel.BROWSER_FACTOR[id] * delta;
      }
      
      // store the max value
      var absDelta = Math.abs(delta)
      if (qx.event.type.MouseWheel.MAXSCROLL < absDelta) {
        qx.event.type.MouseWheel.MAXSCROLL = absDelta;
      }
      
      // special case for systems not speeding up
      if (qx.event.type.MouseWheel.MAXSCROLL === absDelta) {
        return 2 * (delta / absDelta);
      }
      
      var ret = 
        (delta / qx.event.type.MouseWheel.MAXSCROLL) * 
        Math.log(qx.event.type.MouseWheel.MAXSCROLL) / 1.75;

      return ret;
    },


    /**
     * Get the amount the wheel has been scrolled
     *
     * @return {Integer} Scroll wheel movement
     */
    getWheelDelta : function() {
      if (this._native.detail) {
        return this.__normalize(this._native.detail);
      }
      return this.__normalize(-this._native.wheelDelta);
    }
  }
});