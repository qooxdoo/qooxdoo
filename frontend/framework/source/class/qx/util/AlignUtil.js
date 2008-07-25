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
 * Contains methods to compute a position for any element which should
 * be positioned to any other element.
 */
qx.Class.define("qx.util.AlignUtil",
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
     * @param coords {Map} Location of the object to align the object to. This map
     *   should have the keys <code>left</code>, <code>top</code>, <code>right</code>
     *   and <code>bottom</code>.
     * @param value {String} Alignment of the object on the target
     * @param correct {Boolean?true} Whether the position should be automatically
     *   corrected when not enough room is available in the given area.
     * @return {Map} A map with the final location stored in the keys
     *   <code>left</code> and <code>top</code>.
     */
    compute : function(size, area, coords, value, correct)
    {
      var left = 0;
      var top = 0;

      var edge = value.split("-")[0];
      var align = value.split("-")[1];

      // Process edge part
      switch(edge)
      {
        case "left":
          left = coords.left - size.width;
          break;

        case "top":
          top = coords.top - size.height;
          break;

        case "right":
          left = coords.right;
          break;

        case "bottom":
          top = coords.bottom;
          break;
      }

      // Process align part
      switch(align)
      {
        case "left":
          left = coords.left;
          break;

        case "top":
          top = coords.top;
          break;

        case "right":
          left = coords.right - size.width;
          break;

        case "bottom":
          top = coords.bottom - size.height;
          break;
      }

      if (correct === false)
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
              fixedLeft = coords.right;
            } else if (align == "right") {
              fixedLeft = coords.left;
            }
          }
          else
          {
            if (edge == "right") {
              fixedLeft = coords.left - size.width;
            } else if (align == "left") {
              fixedLeft = coords.right - size.width;
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
              fixedTop = coords.bottom;
            } else if (align == "bottom") {
              fixedTop = coords.top;
            }
          }
          else
          {
            if (edge == "bottom") {
              fixedTop = coords.top - size.height;
            } else if (align == "top") {
              fixedTop = coords.bottom - size.height;
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
