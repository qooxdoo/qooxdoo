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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The background class contains methods to compute and set the background CSS
 * of a DOM element. It handles transparent PNGs in IE6 and fixes a background
 * position issue in Firefox 2.
 */
qx.Class.define("qx.bom.element.Background",
{
  statics :
  {
    /**
     * Compiles the background into a CSS compatible string.
     *
     * @param color {String?null} A CSS color string as background color
     * @param image {String?null} The URL of the background image
     * @param repeat {String?null} The background repeat property. valid values
     *     are <code>repeat</code>, <code>repeat-x</code>,
     *     <code>repeat-y</code>, <code>no-repeat</code>
     * @param positionX {Integer?null} The horizontal offset of the image inside of
     *     the image element.
     * @param positionY {Integer?null} The vertical offset of the image inside of
     *     the image element.
     * @param attachment {String?null} Sets whether a background image is fixed or
     *   scrolls with the rest of the page. Valid calues are <code>scroll</code>
     *   <code>fixed</code>.
     * @return {String} CSS string
     */
    compile : function(color, image, repeat, positionX, positionY, attachment)
    {
      var styles = this.getStyles(color, image, repeat, positionX, positionY, attachment);

      var cssStr = ["background:"];
      if (color) {
        cssStr.push(color, " ");
      }

      if (styles.backgroundImage) {
        cssStr.push(styles.backgroundImage, " ");
      }

      if (repeat) {
        cssStr.push(repeat, " ");
      }

      if (attachment) {
        cssStr.push(attachment);
      }

      if (styles.backgroundPosition) {
        cssStr.push(styles.backgroundPosition, " ");
      }

      if (styles.filter) {
        cssStr.push(";filter:", styles.filter);
      }

      cssStr.push(";");

      return cssStr.join("");
    },


    /**
     * Get the CSS styles to display the image. The arguments
     * <code>positionX</code> and <code>positionY</code> have no effect for
     * PNG files in IE6. All parameters are optional.
     *
     * @static
     * @signature function(color, image, repeat, positionX, positionY, attachment)
     * @param color {String?null} A CSS color string as background color
     * @param image {String?null} The URL of the background image
     * @param repeat {String?null} The background repeat property. valid values
     *     are <code>repeat</code>, <code>repeat-x</code>,
     *     <code>repeat-y</code>, <code>no-repeat</code>
     * @param positionX {Integer?null} The horizontal offset of the image inside of
     *     the image element.
     * @param positionY {Integer?null} The vertical offset of the image inside of
     *     the image element.
     * @param attachment {String?null} Sets whether a background image is fixed or
     *   scrolls with the rest of the page. Valid calues are <code>scroll</code>
     *   <code>fixed</code>.
     * @return {Map} a mapping of CSS property names to CSS values
     */
    getStyles : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(color, image, repeat, positionX, positionY, attachment)
      {
        var filter = "";

        var styles = this.__getStylesStandardCss(color, image, repeat, positionX, positionY, attachment);

        var isPng = qx.lang.String.endsWith(source, ".png");
        var isIE6 = qx.bom.client.Engine.VERSION < 7;

        // IE 6 can display PNGs with alpha channel only using the
        // alpha image loader. Since the alpha image loader has no offset
        // property the IconManager will map all images to themself in IE6.

        if (isPng && isIE6)
        {
          filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + source + "',sizingMethod='crop')";
          delete styles.backgroundImage;
          delete styles.backgroundPosition;
        }

        return styles;
      },

      "gecko" : function(color, image, repeat, positionX, positionY, attachment)
      {
        var styles = this.__getStylesStandardCss(color, image, repeat, positionX, positionY, attachment);

        // work around FF2 background-position bug
        // (switches to “50%” default when x and y offsets are equal)
        // https://bugzilla.mozilla.org/show_bug.cgi?id=258080
        if (qx.bom.client.Engine.VERSION < 1.9 && styles.backgroundPosition)
        {
          if (positionX == positionY) {
            styles.backgroundPosition = positionX + "px " + (positionY + 0.01) + "px";
          }
        }
        return styles;
      },


      "default" : function(color, image, repeat, positionX, positionY, attachment) {
        return this.__getStylesStandardCss(color, image, repeat, positionX, positionY, attachment);
      }
    }),


    /**
     * Get standard css background styles
     *
     * @param color {String?null} A CSS color string as background color
     * @param image {String?null} The URL of the background image
     * @param repeat {String?null} The background repeat property. valid values
     *     are <code>repeat</code>, <code>repeat-x</code>,
     *     <code>repeat-y</code>, <code>no-repeat</code>
     * @param positionX {Integer?null} The horizontal offset of the image inside of
     *     the image element.
     * @param positionY {Integer?null} The vertical offset of the image inside of
     *     the image element.
     * @param attachment {String?null} Sets whether a background image is fixed or
     *   scrolls with the rest of the page. Valid calues are <code>scroll</code>
     *   <code>fixed</code>.
     */
    __getStylesStandardCss : function(color, image, repeat, positionX, positionY, attachment)
    {
      var hasOffset = !(
        positionX === undefined ||
        positionY === undefined ||
        (positionX === 0 && positionY === 0)
      );

      var styles = {
        backgroundColor: color || "",
        backgroundImage: image ? "url(" + image + ")" : "",
        backgroundPosition: hasOffset ? positionX + "px " + positionY + "px" : "",
        backgroundRepeat: repeat || "",
        backgroundAttachment: attachment || ""
      };

      return styles;
    },


    /**
     * Set the background on the given DOM element
     *
     * @param element {Element} The element to modify
     * @param color {String?null} A CSS color string as background color
     * @param image {String?null} The URL of the background image
     * @param repeat {String?null} The background repeat property. valid values
     *     are <code>repeat</code>, <code>repeat-x</code>,
     *     <code>repeat-y</code>, <code>no-repeat</code>
     * @param positionX {Integer?null} The horizontal offset of the image inside of
     *     the image element.
     * @param positionY {Integer?null} The vertical offset of the image inside of
     *     the image element.
     * @param attachment {String?null} Sets whether a background image is fixed or
     *   scrolls with the rest of the page. Valid calues are <code>scroll</code>
     *   <code>fixed</code>.
     */
    set : function(element, color, image, repeat, positionX, positionY, attachment)
    {
      var styles = this.getStyles(color, image, repeat, positionX, positionY, attachment);

      for (var key in styles)
      {
        var value = styles[key];
        element.style[key] = value;
      }
    }
  }
});