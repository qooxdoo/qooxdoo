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
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************


************************************************************************ */

qx.Class.define("qx.html.ElementFromPoint",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * TODOC
     *
     * @type static
     * @param x {var} TODOC
     * @param y {var} TODOC
     * @return {var} TODOC
     */
    getElementFromPoint : function(x, y) {
      return qx.html.ElementFromPoint.getElementFromPointHandler(document.body, x, y);
    },


    /**
     * TODOC
     *
     * @type static
     * @param node {Node} TODOC
     * @param x {var} TODOC
     * @param y {var} TODOC
     * @param recursive {var} TODOC
     * @return {null | var} TODOC
     */
    getElementFromPointHandler : function(node, x, y, recursive)
    {
      var ch = node.childNodes;
      var chl = ch.length - 1;

      if (chl < 0) {
        return null;
      }

      var chc, subres, ret;

      do
      {
        chc = ch[chl];
        ret = qx.html.ElementFromPoint.getElementFromPointChecker(chc, x, y);

        if (ret)
        {
          if (typeof recursive === "boolean" && recursive == false) {
            return chc;
          }
          else
          {
            subres = qx.html.ElementFromPoint.getElementFromPointHandler(chc, x - ret[0] - qx.html.Style.getBorderLeft(chc), y - ret[2] - qx.html.Style.getBorderTop(chc));
            return subres ? subres : chc;
          }
        }
      }
      while (chl--);

      return null;
    },


    /**
     * TODOC
     *
     * @type static
     * @param chc {var} TODOC
     * @param x {var} TODOC
     * @param y {var} TODOC
     * @return {boolean | Array} TODOC
     */
    getElementFromPointChecker : function(chc, x, y)
    {
      var xstart, ystart, xstop, ystop;

      if (chc.nodeType != 1) {
        return false;
      }

      xstart = qx.html.Offset.getLeft(chc);

      if (x > xstart)
      {
        ystart = qx.html.Offset.getTop(chc);

        if (y > ystart)
        {
          xstop = xstart + chc.offsetWidth;

          if (x < xstop)
          {
            ystop = ystart + chc.offsetHeight;

            if (y < ystop) {
              return [ xstart, xstop, ystart, ystop ];
            }
          }
        }
      }

      return false;
    },


    /**
     * TODOC
     *
     * @type static
     * @param chc {var} TODOC
     * @param x {var} TODOC
     * @param y {var} TODOC
     * @return {boolean | Array} TODOC
     */
    getElementAbsolutePointChecker : function(chc, x, y)
    {
      var xstart, ystart, xstop, ystop;

      if (!chc || chc.nodeType != 1) {
        return false;
      }

      xstart = qx.html.Location.getPageBoxLeft(chc);

      if (x > xstart)
      {
        ystart = qx.html.Location.getPageBoxTop(chc);

        if (y > ystart)
        {
          xstop = xstart + chc.offsetWidth;

          if (x < xstop)
          {
            ystop = ystart + chc.offsetHeight;

            if (y < ystop) {
              return [ xstart, xstop, ystart, ystop ];
            }
          }
        }
      }

      return false;
    }
  }
});
