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

qx.Class.define("qx.bom.TextSize",
{
  statics :
  {
    /** {Map} Contains all supported styles */
    _styles :
    {
      fontFamily : 1,
      fontSize : 1,
      fontWeight : 1,
      fontStyle : 1,
      lineHeight : 1
    },


    /**
     * Generates the helper DOM element
     *
     * @type static
     * @return {Element} Helper DOM element
     */
    _prepare : function()
    {
      var el = qx.bom.Element.create("div");
      var style = el.style;

      style.width = style.height = "auto";
      style.left = style.top = 0;
      style.visibility = "hidden";
      style.position = "absolute";
      style.overflow = "visible";

      document.body.insertBefore(el, document.body.firstChild);

      return this._element = el;
    },


    /**
     * Returns the dimensions of the given content.
     *
     * @type static
     * @param markup {String} The HTML markup / text content to measure
     * @param styles {Map} Optional styles to apply
     * @param width {Integer} To support wrapping correctly: A static width.
     * @return {Map} A map with preferred <code>width</code> and <code>height</code>.
     */
    getDimension : function(markup, styles, width)
    {
      var element = this._element || this._prepare();

      // sync styles
      var keys = this._styles;

      if (!styles) {
        styles = {};
      }

      for (var key in keys) {
        element.style[key] = styles[key] || "";
      }

      // apply width
      element.style.width = width != null ? width + "px" : "";

      // insert markup
      element.innerHTML = markup;

      // compute size and return
      return {
        width : element.scrollWidth,
        height : element.scrollHeight
      }
    }
  }
});
