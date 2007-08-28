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

#module(bom)

************************************************************************ */

/**
 *
 */
qx.Class.define("qx.bom.Element",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      CREATION
    ---------------------------------------------------------------------------
    */

    /**
     * Creates an DOM element
     *
     * @type static
     * @param name {String} Tag name of the element
     * @param win {Window} Window to create document for
     * @param xhtml {Boolean ? false} Enable XHTML
     * @return {Element} the created element node
     */
    create : function(name, win, xhtml)
    {
      if (!win) {
        win = window;
      }

      if (xhtml) {
        return win.document.createElementNS("http://www.w3.org/1999/xhtml", name);
      } else {
        return win.document.createElement(name);
      }
    },


    /**
     * Removes all content from the given element
     *
     * @type static
     * @param element {Element} element to clean
     * @return {String} empty string (new HTML content)
     */
    empty : function(element) {
      return element.innerHTML = "";
    }
  }
});
