/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Contains methods to compute a position for any object which should
 * be positioned to any other object.
 *
 * @deprecated Please use {@link qx.util.placement.Placement}
 */
qx.Class.define("qx.util.PlaceUtil",
{
  statics :
  {
    /**
     * DOM and widget independent method to compute the location
     * of a object to make it relative to any other object.
     *
     * @deprecated Please use {@link qx.util.placement.Placement#compute}
     *
     * @param size {Map} With the keys <code>width</code> and <code>height</code>
     *   of the object to align
     * @param area {Map} Available area to position the object. Has the keys
     *   <code>width</code> and <code>height</code>. Normally this is the parent
     *   object of the one to align.
     * @param target {Map} Location of the object to align the object to. This map
     *   should have the keys <code>left</code>, <code>top</code>, <code>right</code>
     *   and <code>bottom</code>.
     * @param position {String} Alignment of the object on the target, any of
     *   "top-left", "top-right", "bottom-left", "bottom-right", "left-top",
     *   "left-bottom", "right-top", "right-bottom".
     * @param smart {Boolean?true} Whether the position should be automatically
     *   corrected when not enough room is available in the given area.
     * @param offsets {Map?null} Map with all offsets for each direction.
     *   Comes with the keys <code>left</code>, <code>top</code>,
     *   <code>right</code> and <code>bottom</code>. Defaults to zero.
     * @return {Map} A map with the final location stored in the keys
     *   <code>left</code> and <code>top</code>.
     */
    compute : function(size, area, target, position, smart, offsets)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        qx.log.Logger.deprecatedMethodWarning(
          arguments.callee,
          "Please use 'qx.util.placement.Placement.compute'"
        );
      }

      var mode = smart ? "keep-align" : "direct"
      var offsets = offsets || this.__defaultOffsets;

      return qx.util.placement.Placement.compute(
        size, area, target, offsets,
        position, mode, mode
      );
    },

    __defaultOffsets : {
      left: 0,
      top: 0,
      bottom: 0,
      right: 0
    }
  }
});
