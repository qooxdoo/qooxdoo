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
        el.src = source;
      }

      return el;
    },


    /**
     * Sets the source to the given value.
     *
     * @param element {Element} DOM element to modify
     * @param value {String} Image URL to use
     * @return {void}
     */
    setSource : function(element, value) {
      element.src = value;
    },


    /**
     * Returns the configured source
     *
     * @param element {Element} DOM element to query
     * @return {String} Current image
     */
    getSource : function(element) {
      return element.src;
    }
  }
});
