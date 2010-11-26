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

  members :
  {
    // overridden
    stop : function()
    {
      this.stopPropagation();
      this.preventDefault();
    },


    /**
     * Get the amount the wheel has been scrolled
     *
     * @signature function()
     * @return {Integer} Scroll wheel movement
     */
    getWheelDelta : qx.core.Variant.select("qx.client",
    {
      "default" : function() {
        return -(this._native.wheelDelta / 40);
      },

      "gecko" : function() {
        return this._native.detail;
      },

      "webkit" : function()
      {
        if (qx.bom.client.Browser.NAME == "chrome") {
          // mac has a much higher sppedup during scrolling
          if (qx.bom.client.Platform.MAC) {
            return -(this._native.wheelDelta / 1200);
          } else {
            return -(this._native.wheelDelta / 120);
          }


        } else {
          // windows safaris behave different than on OSX
          if (qx.bom.client.Platform.WIN) {
            var factor = 120;
            // safari 5.0 and not 5.0.1
            if (qx.bom.client.Engine.VERSION == 533.16) {
              factor = 1200;
            }
          } else {
            factor = 40;
            // Safari 5.0 or 5.0.1
            if (
              qx.bom.client.Engine.VERSION == 533.16 ||
              qx.bom.client.Engine.VERSION == 533.17 ||
              qx.bom.client.Engine.VERSION == 533.18
            ) {
              factor = 1200;
            }
          }
          return -(this._native.wheelDelta / factor);
        }
      }
    })
  }
});