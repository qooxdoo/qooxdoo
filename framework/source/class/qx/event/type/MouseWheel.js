/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
     * @param axis {String?} Optional parameter which defines the scroll axis.
     *   The value can either be <code>"x"</code> or <code>"y"</code>.
     * @return {Integer} Scroll wheel movement for the given axis. If no axis
     *   is given, the y axis is used.
     */
    getWheelDelta : function(axis) {
      return qx.util.Wheel.getDelta(this._native, axis);
    }
  }
});
