/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#module(html2)

************************************************************************ */

/**
 * Contains methods to control and query the element's clip property
 */
qx.Class.define("qx.html2.element.Clip",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    get : function(element)
    {
      var clip = qx.html2.element.Style.getComputed(element, "clip");

      var left = "auto";
      var top = "auto";
      var width = "auto";
      var height = "auto";

      var right, bottom;

      if (typeof clip === "string" && clip !== "auto")
      {
        clip = qx.lang.String.trim(clip);

        // Do not use "global" here. This will break Firefox because of
        // an issue that the lastIndex will not be resetted on separate calls.
        if (/\((.*)\)/.test(clip))
        {
          var split = RegExp.$1.split(",");

          top = qx.lang.String.trim(split[0]);
          right = qx.lang.String.trim(split[1]);
          bottom = qx.lang.String.trim(split[2]);
          left = qx.lang.String.trim(split[3]);

          if (top != "auto") {
            top = parseInt(top);
          }

          if (right != "auto") {
            right = parseInt(right);
          }

          if (bottom != "auto") {
            bottom = parseInt(bottom);
          }

          if (left != "auto") {
            left = parseInt(left);
          }

          if (right != "auto" && left != "auto") {
            width = right - left;
          }

          if (bottom != "auto" && top != "auto") {
            height = bottom - top;
          }
        }
        else
        {
          throw new Error("Could not parse clip string: " + clip);
        }
      }

      return {
        left : left,
        top : top,
        width : width,
        height : height
      };
    },

    set : function(element, left, top, width, height)
    {
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

      return qx.html2.element.Style.set(element, "clip", "rect(" + top + "," + right + "," + bottom + "," + left + ")");
    },

    reset : function(element) {
      qx.html2.element.Style.set(element, "clip", "auto");
    }
  }
});
