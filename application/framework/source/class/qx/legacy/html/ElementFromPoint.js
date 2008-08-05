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
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************


************************************************************************ */

/**
 * @deprecated: No replacement. Only needed for historic gecko support
 *
 */
qx.Class.define("qx.legacy.html.ElementFromPoint",
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
     * @param x {var} TODOC
     * @param y {var} TODOC
     * @return {var} TODOC
     */
    getElementFromPoint : function(x, y) {
      return this.getElementFromPointHandler(document.body, x, y);
    },


    /**
     * TODOC
     *
     * @param node {Node} TODOC
     * @param x {var} TODOC
     * @param y {var} TODOC
     * @param recursive {Boolean ? true} TODOC
     * @return {null | var} TODOC
     */
    getElementFromPointHandler : function(node, x, y, recursive)
    {
      var ch = node.childNodes;
      var childNodesLength = ch.length - 1;

      if (childNodesLength < 0) {
        return null;
      }

      var childNode, subres, ret;

      do
      {
        childNode = ch[childNodesLength];
        ret = this.getElementFromPointChecker(childNode, x, y);

        if (ret)
        {
          if (typeof recursive === "boolean" && recursive == false) {
            return childNode;
          }
          else
          {
            subres = this.getElementFromPointHandler(
              childNode,
              x - ret[0] - qx.legacy.html.Style.getBorderLeft(childNode),
              y - ret[2] - qx.legacy.html.Style.getBorderTop(childNode),
              true
            );
            return subres ? subres : childNode;
          }
        }
      }
      while (childNodesLength--);

      return null;
    },


    /**
     * TODOC
     *
     * @param element {var} TODOC
     * @param x {var} TODOC
     * @param y {var} TODOC
     * @return {boolean | Array} TODOC
     */
    getElementFromPointChecker : function(element, x, y)
    {
      var xstart, ystart, xstop, ystop;

      if (element.nodeType != qx.dom.Node.ELEMENT) {
        return false;
      }

      xstart = qx.legacy.html.Offset.getLeft(element);

      if (x > xstart)
      {
        ystart = qx.legacy.html.Offset.getTop(element);

        if (y > ystart)
        {
          xstop = xstart + element.offsetWidth;

          if (x < xstop)
          {
            ystop = ystart + element.offsetHeight;

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
     * @param element {var} TODOC
     * @param x {var} TODOC
     * @param y {var} TODOC
     * @return {boolean | Array} TODOC
     */
    getElementAbsolutePointChecker : function(element, x, y)
    {
      var xstart, ystart, xstop, ystop;

      if (!element || element.nodeType != qx.dom.Node.ELEMENT) {
        return false;
      }

      xstart = qx.legacy.html.Location.getPageBoxLeft(element);

      if (x > xstart)
      {
        ystart = qx.legacy.html.Location.getPageBoxTop(element);

        if (y > ystart)
        {
          xstop = xstart + element.offsetWidth;

          if (x < xstop)
          {
            ystop = ystart + element.offsetHeight;

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
