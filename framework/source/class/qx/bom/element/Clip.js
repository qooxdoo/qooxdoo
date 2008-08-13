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
 * Contains methods to control and query the element's clip property
 */
qx.Class.define("qx.bom.element.Clip",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Compiles the given clipping into a CSS compatible string. This
     * is a simple square which describes the visible area of an DOM element.
     * Changing the clipping does not change the dimensions of
     * an element.
     *
     * @param map {Map}  Map which contains <code>left</code>, <code>top</code>
     *   <code>width</code> and <code>height</code> of the clipped area.
     * @return {String} CSS compatible string
     */
    compile : function(map)
    {
      if (!map) {
        return "clip:auto;";
      }

      var left = map.left;
      var top = map.top;
      var width = map.width;
      var height = map.height;

      var right, bottom;

      if (left == null)
      {
        right = (width == null ? "auto" : width + "px");
        left = "auto";
      }
      else
      {
        right = (width == null ? "auto" : left + width + "px");
        left = left + "px";
      }

      if (top == null)
      {
        bottom = (height == null ? "auto" : height + "px");
        top = "auto";
      }
      else
      {
        bottom = (height == null ? "auto" : top + height + "px");
        top = top + "px";
      }

      return "clip:rect(" + top + "," + right + "," + bottom + "," + left + ");";
    },


    /**
     * Gets the clipping of the given element.
     *
     * @param element {Element} DOM element to query
     * @param mode {Number} Choose one of the modes {@link qx.bom.element.Style#COMPUTED_MODE},
     *   {@link qx.bom.element.Style#CASCADED_MODE}, {@link qx.bom.element.Style#LOCAL_MODE}.
     *   The computed mode is the default one.
     * @return {Map} Map which contains <code>left</code>, <code>top</code>
     *   <code>width</code> and <code>height</code> of the clipped area.
     *   Each one could be null or any integer value.
     */
    get : function(element, mode)
    {
      var clip = qx.bom.element.Style.get(element, "clip", mode, false);

      var left, top, width, height;
      var right, bottom;

      if (typeof clip === "string" && clip !== "auto" && clip !== "")
      {
        clip = qx.lang.String.trim(clip);

        // Do not use "global" here. This will break Firefox because of
        // an issue that the lastIndex will not be resetted on separate calls.
        if (/\((.*)\)/.test(clip))
        {
          // Process result
          var split = RegExp.$1.split(",");

          top = qx.lang.String.trim(split[0]);
          right = qx.lang.String.trim(split[1]);
          bottom = qx.lang.String.trim(split[2]);
          left = qx.lang.String.trim(split[3]);

          // Normalize "auto" to null
          if (left === "auto") {
            left = null;
          }

          if (top === "auto") {
            top = null;
          }

          if (right === "auto") {
            right = null;
          }

          if (bottom === "auto") {
            bottom = null;
          }

          // Convert to integer values
          if (top != null) {
            top = parseInt(top, 10);
          }

          if (right != null) {
            right = parseInt(right, 10);
          }

          if (bottom != null) {
            bottom = parseInt(bottom, 10);
          }

          if (left != null) {
            left = parseInt(left, 10);
          }

          // Compute width and height
          if (right != null && left != null) {
            width = right - left;
          } else if (right != null) {
            width = right;
          }

          if (bottom != null && top != null) {
            height = bottom - top;
          } else if (bottom != null) {
            height = bottom;
          }
        }
        else
        {
          throw new Error("Could not parse clip string: " + clip);
        }
      }

      // Return map when any value is available.
      return {
        left : left || null,
        top : top || null,
        width : width || null,
        height : height || null
      };
    },


    /**
     * Sets the clipping of the given element. This is a simple
     * square which describes the visible area of an DOM element.
     * Changing the clipping does not change the dimensions of
     * an element.
     *
     * @param element {Element} DOM element to modify
     * @param map {Map} A map with one or more of these available keys:
     *   <code>left</code>, <code>top</code>, <code>width</code>, <code>height</code>.
     * @return {void}
     */
    set : function(element, map)
    {
      if (!map)
      {
        element.style.clip = "rect(auto,auto,auto,auto)";
        return;
      }

      var left = map.left;
      var top = map.top;
      var width = map.width;
      var height = map.height;

      var right, bottom;

      if (left == null)
      {
        right = (width == null ? "auto" : width + "px");
        left = "auto";
      }
      else
      {
        right = (width == null ? "auto" : left + width + "px");
        left = left + "px";
      }

      if (top == null)
      {
        bottom = (height == null ? "auto" : height + "px");
        top = "auto";
      }
      else
      {
        bottom = (height == null ? "auto" : top + height + "px");
        top = top + "px";
      }

      element.style.clip = "rect(" + top + "," + right + "," + bottom + "," + left + ")";
    },


    /**
     * Resets the clipping of the given DOM element.
     *
     * @param element {Element} DOM element to modify
     * @return {void}
     */
    reset : function(element) {
      element.style.clip = "";
    }
  }
});
