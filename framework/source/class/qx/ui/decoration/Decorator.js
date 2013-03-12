/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Decorator including all decoration possibilities from mixins:
 *
 * <ul>
 * <li>Background color</li>
 * <li>Background image</li>
 * <li>Background gradient</li>
 * <li>Single and double borders</li>
 * <li>Border radius</li>
 * <li>Box shadow</li>
 * </ul>
 *
 * TODO: Border image, HBox/VBox
 */
qx.Class.define("qx.ui.decoration.Decorator", {

  extend : qx.ui.decoration.DynamicDecorator,

  implement : [qx.ui.decoration.IDecorator],

  include : [
    qx.ui.decoration.MBackgroundColor,
    qx.ui.decoration.MBorderRadius,
    qx.ui.decoration.MBoxShadow,
    qx.ui.decoration.MDoubleBorder,
    qx.ui.decoration.MLinearBackgroundGradient,
    qx.ui.decoration.MBorderImage
  ],

  members :
  {

    /**
     * Returns the configured padding minus the border width.
     * @return {Map} Map of top, right, bottom and left padding values
     */
    getPadding : function()
    {
      var left = this.getInsetLeft();
      var right = this.getInsetRight();
      var top = this.getInsetTop();
      var bottom = this.getInsetBottom();

      var slices = this._getDefaultInsetsForBorderImage();

      var borderTop = top - (slices.top ? slices.top : this.getWidthTop());
      var borderRight = right - (slices.right ? slices.right : this.getWidthRight());
      var borderBottom = bottom - (slices.bottom ? slices.bottom : this.getWidthBottom());
      var borderLeft = left - (slices.left ? slices.left : this.getWidthLeft());

      return {
        top : top ? borderTop : this.getInnerWidthTop(),
        right : right ? borderRight : this.getInnerWidthRight(),
        bottom : bottom ? borderBottom : this.getInnerWidthBottom(),
        left : left ? borderLeft : this.getInnerWidthLeft()
      };
    },


    /**
     * Returns the styles of the decorator as a map with property names written
     * in javascript style (e.g. <code>fontWeight</code> instead of <code>font-weight</code>).
     *
     * @return {Map} style information
     */
    getStyles : function(css)
    {
      if (css) {
        return this._getStyles();
      }

      var jsStyles = {};
      var cssStyles = this._getStyles();

      for (var property in cssStyles)
      {
        jsStyles[qx.lang.String.camelCase(property)] = cssStyles[property];
      }

      return jsStyles;
    },


    /**
     * Collects all the style information from the decorators.
     *
     * @return {Map} style information
     */
    _getStyles : function()
    {
      var styles = {};

      for (var name in this) {
        if (name.indexOf("_style") == 0 && this[name] instanceof Function) {
          this[name](styles);
        }
      }

      return styles;
    }
  }
});
