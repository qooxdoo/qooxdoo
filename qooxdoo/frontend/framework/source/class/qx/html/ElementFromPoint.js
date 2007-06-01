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
      return this.getElementFromPointHandler(document.body, x, y);
    },


    /**
     * TODOC
     *
     * @type static
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
              x - ret[0] - qx.html.Style.getBorderLeft(childNode),
              y - ret[2] - qx.html.Style.getBorderTop(childNode),
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
     * @type static
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

      xstart = qx.html.Offset.getLeft(element);

      if (x > xstart)
      {
        ystart = qx.html.Offset.getTop(element);

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
     * @type static
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

      xstart = qx.html.Location.getPageBoxLeft(element);

      if (x > xstart)
      {
        ystart = qx.html.Location.getPageBoxTop(element);

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
