/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * The background class contains methods to compute and set the background image
 * of a DOM element.
 *
 * It fixes a background position issue in Firefox 2.
 */
qx.Class.define("qx.bom.element.Background",
{
  statics :
  {
    /** @type {Array} Internal helper to improve compile performance */
    __tmpl :
    [
      "background-image:url(", null, ");",
      "background-position:", null, ";",
      "background-repeat:", null, ";"
    ],


    /** @type {Map} Empty styles when no image is given */
    __emptyStyles :
    {
      backgroundImage : null,
      backgroundPosition : null,
      backgroundRepeat : null
    },


    /**
     * Computes the background position CSS value
     *
     * @param left {Integer|String} either an integer pixel value or a CSS
     *    string value
     * @param top {Integer|String} either an integer pixel value or a CSS
     *    string value
     * @return {String} The background position CSS value
     */
    __computePosition : function(left, top)
    {
      // Correcting buggy Firefox background-position implementation
      // Have problems with identical values
      var engine = qx.core.Environment.get("engine.name");
      var version = qx.core.Environment.get("engine.version");
      if (engine == "gecko" && version < 1.9 && left == top && typeof left == "number") {
        top += 0.01;
      }

      if (left) {
        var leftCss = (typeof left == "number") ? left + "px" : left;
      } else {
        leftCss = "0";
      }
      if (top) {
        var topCss = (typeof top == "number") ? top + "px" : top;
      } else {
        topCss = "0";
      }

      return leftCss + " " + topCss;
    },


    /**
     * Compiles the background into a CSS compatible string.
     *
     * @param source {String?null} The URL of the background image
     * @param repeat {String?null} The background repeat property. valid values
     *     are <code>repeat</code>, <code>repeat-x</code>,
     *     <code>repeat-y</code>, <code>no-repeat</code>
     * @param left {Integer|String?null} The horizontal offset of the image
     *      inside of the image element. If the value is an integer it is
     *      interpreted as pixel value otherwise the value is taken as CSS value.
     *      CSS the values are "center", "left" and "right"
     * @param top {Integer|String?null} The vertical offset of the image
     *      inside of the image element. If the value is an integer it is
     *      interpreted as pixel value otherwise the value is taken as CSS value.
     *      CSS the values are "top", "bottom" and "center"
     * @return {String} CSS string
     */
    compile : function(source, repeat, left, top)
    {
      var position = this.__computePosition(left, top);
      var backgroundImageUrl = qx.util.ResourceManager.getInstance().toUri(source);

      // Updating template
      var tmpl = this.__tmpl;

      tmpl[1] = "'" + backgroundImageUrl + "'";  // Put in quotes so spaces work
      tmpl[4] = position;
      tmpl[7] = repeat;

      return tmpl.join("");
    },


    /**
     * Get standard css background styles
     *
     * @param source {String} The URL of the background image
     * @param repeat {String?null} The background repeat property. valid values
     *     are <code>repeat</code>, <code>repeat-x</code>,
     *     <code>repeat-y</code>, <code>no-repeat</code>
     * @param left {Integer|String?null} The horizontal offset of the image
     *      inside of the image element. If the value is an integer it is
     *      interpreted as pixel value otherwise the value is taken as CSS value.
     *      CSS the values are "center", "left" and "right"
     * @param top {Integer|String?null} The vertical offset of the image
     *      inside of the image element. If the value is an integer it is
     *      interpreted as pixel value otherwise the value is taken as CSS value.
     *      CSS the values are "top", "bottom" and "center"
     * @return {Map} A map of CSS styles
     */
    getStyles : function(source, repeat, left, top)
    {
      if (!source) {
        return this.__emptyStyles;
      }

      var position = this.__computePosition(left, top);
      var backgroundImageUrl = qx.util.ResourceManager.getInstance().toUri(source);

      var backgroundImageCssString = "url('" + backgroundImageUrl + "')"; // Put in quotes so spaces work
      var map = {
        backgroundPosition : position,
        backgroundImage : backgroundImageCssString
      };

      if (repeat != null) {
        map.backgroundRepeat = repeat;
      }
      return map;
    },


    /**
     * Set the background on the given DOM element
     *
     * @param element {Element} The element to modify
     * @param source {String?null} The URL of the background image
     * @param repeat {String?null} The background repeat property. valid values
     *     are <code>repeat</code>, <code>repeat-x</code>,
     *     <code>repeat-y</code>, <code>no-repeat</code>
     * @param left {Integer?null} The horizontal offset of the image inside of
     *     the image element.
     * @param top {Integer?null} The vertical offset of the image inside of
     *     the image element.
     */
    set : function(element, source, repeat, left, top)
    {
      var styles = this.getStyles(source, repeat, left, top);
      for (var prop in styles) {
        element.style[prop] = styles[prop];
      }
    }
  }
});
