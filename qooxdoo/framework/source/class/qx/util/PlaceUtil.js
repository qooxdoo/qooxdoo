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

************************************************************************ */

/**
 * Contains methods to compute a position for any object which should
 * be positioned to any other object.
 */
qx.Class.define("qx.util.PlaceUtil",
{
  statics :
  {
    /**
     * DOM and widget independent method to compute the location
     * of a object to make it relative to any other object.
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
      var left = 0;
      var top = 0;
      var fixedRatingX, fixedRatingY;

      // Split position string
      var splitted = position.split("-");
      var edge = splitted[0];
      var align = splitted[1];

      // Compute offsets
      var offsetLeft=0, offsetTop=0, offsetRight=0, offsetBottom=0;
      if (offsets)
      {
        offsetLeft += offsets.left || 0;
        offsetTop += offsets.top || 0;
        offsetRight += offsets.right || 0;
        offsetBottom += offsets.bottom || 0;
      }

      // Process edge part
      switch(edge)
      {
        case "left":
          left = target.left - size.width - offsetLeft;
          break;

        case "top":
          top = target.top - size.height - offsetTop;
          break;

        case "right":
          left = target.right + offsetRight;
          break;

        case "bottom":
          top = target.bottom + offsetBottom;
          break;
      }

      // Process align part
      switch(align)
      {
        case "left":
          left = target.left;
          break;

        case "top":
          top = target.top;
          break;

        case "right":
          left = target.right - size.width;
          break;

        case "bottom":
          top = target.bottom - size.height;
          break;
      }

      if (smart === false)
      {
        return {
          left : left,
          top : top
        };
      }
      else
      {
        var ratingX = Math.min(left, area.width-left-size.width);
        if (ratingX < 0)
        {
          var fixedLeft = left;

          if (left < 0)
          {
            if (edge == "left") {
              fixedLeft = target.right + offsetRight;
            } else if (align == "right") {
              fixedLeft = target.left;
            }
          }
          else
          {
            if (edge == "right") {
              fixedLeft = target.left - size.width - offsetLeft;
            } else if (align == "left") {
              fixedLeft = target.right - size.width;
            }
          }

          // Review fixed rating result
          fixedRatingX = Math.min(fixedLeft, area.width-fixedLeft-size.width);
          if (fixedRatingX > ratingX)
          {
            left = fixedLeft;
            ratingX = fixedRatingX;
          }
        }

        var ratingY = Math.min(top, area.height-top-size.height);
        if (ratingY < 0)
        {
          var fixedTop = top;

          if (top < 0)
          {
            if (edge == "top") {
              fixedTop = target.bottom + offsetBottom;
            } else if (align == "bottom") {
              fixedTop = target.top;
            }
          }
          else
          {
            if (edge == "bottom") {
              fixedTop = target.top - size.height - offsetTop;
            } else if (align == "top") {
              fixedTop = target.bottom - size.height;
            }
          }

          // Review fixed rating result
          fixedRatingY = Math.min(fixedTop, area.height-fixedTop-size.height);
          if (fixedRatingY > ratingY)
          {
            top = fixedTop;
            ratingY = fixedRatingY;
          }
        }

        return {
          left : left,
          top : top,
          ratingX : ratingX,
          ratingY : ratingY
        }
      }
    }
  }
});
