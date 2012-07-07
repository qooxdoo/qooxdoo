/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/* ************************************************************************
#require(qx.util.placement.KeepAlignAxis#computeStart)
#require(qx.util.placement.BestFitAxis#computeStart)
#require(qx.util.placement.DirectAxis#computeStart)
************************************************************************ */

/**
 * The Placement module provides a convenient way to align two elements relative
 * to each other using various pre-defined algorithms.
 */
q.define("qx.module.Placement", {

  statics: {

    /**
     * Moves the first element in the collection, aligning it with the given
     * target.
     *
     * @attach{q}
     * @param target {Element} Placement target
     * @param position {String} Alignment of the object with the target, any of
     * <code>"top-left"</code>, <code>"top-right"</code>, <code>"bottom-left"</code>,
     * <code>"bottom-right"</code>, <code>"left-top"</code>,
     * <code>"left-bottom"</code>, <code>"right-top"</code>,
     * <code>"right-bottom"</code>
     * @param offsets {Map?null} Map with the desired offsets between the two elements.
     * Must contain the keys <code>left</code>, <code>top</code>,
     * <code>right</code> and <code>bottom</code>
     * @param modeX {String?"direct"} Horizontal placement mode. Valid values are:
     *   <ul>
     *   <li><code>direct</code>: place the element directly at the given
     *   location.</li>
     *   <li><code>keep-align</code>: if the element is partially outside of the
     *   visible area, it is moved to the best fitting 'edge' and 'alignment' of
     *   the target.
     *   It is guaranteed the the new position attaches the object to one of the
     *   target edges and that it is aligned with a target edge.</li>
     *   <li><code>best-fit</code>: If the element is partially outside of the visible
     *   area, it is moved into the view port, ignoring any offset and position
     *   values.</li>
     *   </ul>
     * @param modeY {String?"direct"} Vertical placement mode. Accepts the same values as
     *   the 'modeX' argument.
     * @return {q} The collection for chaining
     */
    placeTo : function(target, position, offsets, modeX, modeY) {
      if (!this[0]) {
        return null;
      }

      var axes = {
        x : qx.module.Placement._getAxis(modeX),
        y : qx.module.Placement._getAxis(modeY)
      };

      var size = {
        width: this.getWidth(),
        height: this.getHeight()
      };

      var parent = this.getParents();
      var area = {
        width : parent.getWidth(),
        height : parent.getHeight()
      };

      var target = q(target).getOffset();

      var offsets = offsets || {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      };

      var splitted = position.split("-");
      var edge = splitted[0];
      var align = splitted[1];

      var position = {
        x : qx.module.Placement._getPositionX(edge,align),
        y : qx.module.Placement._getPositionY(edge,align)
      }

      var newLocation = qx.module.Placement._computePlacement(axes, size, area, target, offsets, position);

      this.setStyles({
        position: "absolute",
        left: newLocation.left + "px",
        top: newLocation.top + "px"
      });

      return this;
    },


    /**
     * Returns the appropriate axis implementation for the given placement
     * mode
     *
     * @param mode {String} Placement mode
     * @return {Object} Placement axis class
     */
    _getAxis : function(mode)
    {
      switch(mode)
      {
        case "keep-align":
          return qx.util.placement.KeepAlignAxis;

        case "best-fit":
          return qx.util.placement.BestFitAxis;

        case "direct":
        default:
          return qx.util.placement.DirectAxis;
      }
    },

    /**
     * Returns the computed coordinates for the element to be placed
     *
     * @param axes {Map} Map with the keys <code>x</code> and <code>y</code>. Values
     * are the axis implementations
     * @param size {Map} Map with the keys <code>width</code> and <code>height</code>
     * containing the size of the placement target
     * @param area {Map} Map with the keys <code>width</code> and <code>height</code>
     * containing the size of the two elements' common parent (available space for
     * placement)
     * @param target {q} Collection containing the placement target
     * @param offsets {Map} Map of offsets (top, right, bottom, left)
     * @param position {Map} Map with the keys <code>x</code> and <code>y</code>,
     * containing the type of positioning for each axis
     * @return {Map} Map with the keys <code>left</code> and <code>top</code>
     * containing the computed coordinates to which the element should be moved
     */
    _computePlacement : function(axes, size, area, target, offsets, position)
    {
      var left = axes.x.computeStart(
        size.width,
        {start: target.left, end: target.right},
        {start: offsets.left, end: offsets.right},
        area.width,
        position.x
      );

      var top = axes.y.computeStart(
        size.height,
        {start: target.top, end: target.bottom},
        {start: offsets.top, end: offsets.bottom},
        area.height,
        position.y
      );

      return {
        left: left,
        top: top
      }
    },


    /**
     * Returns the X axis positioning type for the given edge and alignment
     * values
     *
     * @param edge {String} edge value
     * @param align {String} align value
     * @return {String} X positioning type
     */
    _getPositionX : function(edge, align)
    {
      if (edge == "left") {
        return "edge-start";
      } else if (edge == "right") {
        return "edge-end";
      } else if (align == "left") {
        return "align-start";
      } else if (align == "right") {
        return "align-end";
      }
    },


    /**
     * Returns the Y axis positioning type for the given edge and alignment
     * values
     *
     * @param edge {String} edge value
     * @param align {String} align value
     * @return {String} Y positioning type
     */
    _getPositionY : function(edge, align)
    {
      if (edge == "top") {
        return "edge-start";
      } else if (edge == "bottom") {
        return "edge-end";
      } else if (align == "top") {
        return "align-start";
      } else if (align == "bottom") {
        return "align-end";
      }
    }

  },

  defer : function(statics)
  {
    q.$attach({
     "placeTo" : statics.placeTo
    });
  }
});