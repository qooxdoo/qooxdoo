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

/* ************************************************************************

#module(bom)

************************************************************************ */

/**
 * Cross browser abstractions to work with images.
 */
qx.Class.define("qx.bom.Image",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Creates a image.
     *
     * @type static
     * @param source {String} Image source to show
     * @param win {Window?null} Window to create the element for
     * @return {Element} The created image node
     */
    create : function(source, win)
    {
      if (!win) {
        win = window;
      }

      var el = win.document.createElement("img");


      if (source) {
        el.source = source;
      }

      return el;
    },

    setSource : function(element, value) {
      element.src = value;
    },

    getSource : function(element) {
      return element.src;
    }
  }
});
