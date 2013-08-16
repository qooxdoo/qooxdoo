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
 */
qx.Class.define("qx.ui.decoration.Decorator", {

  extend : qx.ui.decoration.Abstract,

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
    __initialized : false,

    /**
     * Returns the configured padding minus the border width.
     * @return {Map} Map of top, right, bottom and left padding values
     */
    getPadding : function()
    {
      var insets = this.getInset();
      var slices = this._getDefaultInsetsForBorderImage();

      var borderTop = insets.top - (slices.top ? slices.top : this.getWidthTop());
      var borderRight = insets.right - (slices.right ? slices.right : this.getWidthRight());
      var borderBottom = insets.bottom - (slices.bottom ? slices.bottom : this.getWidthBottom());
      var borderLeft = insets.left - (slices.left ? slices.left : this.getWidthLeft());

      return {
        top : insets.top ? borderTop : this.getInnerWidthTop(),
        right : insets.right ? borderRight : this.getInnerWidthRight(),
        bottom : insets.bottom ? borderBottom : this.getInnerWidthBottom(),
        left : insets.left ? borderLeft : this.getInnerWidthLeft()
      };
    },


    /**
     * Returns the styles of the decorator as a map with property names written
     * in javascript style (e.g. <code>fontWeight</code> instead of <code>font-weight</code>).
     *
     * @param css {Boolean?} <code>true</code> if hyphenated CSS names should be returned.
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

      this.__initialized = true;
      return styles;
    },


    // overridden
    _getDefaultInsets : function() {
      var directions = ["top", "right", "bottom", "left"];
      var defaultInsets = {};

      for (var name in this) {
        if (name.indexOf("_getDefaultInsetsFor") == 0 && this[name] instanceof Function) {
          var currentInsets = this[name]();

          for (var i=0; i < directions.length; i++) {
            var direction = directions[i];
            // initialize with the first insets found
            if (defaultInsets[direction] == undefined) {
              defaultInsets[direction] = currentInsets[direction];
            }
            // take the largest inset
            if (currentInsets[direction] > defaultInsets[direction]) {
              defaultInsets[direction] = currentInsets[direction];
            }
          }
        }
      }

      // check if the mixins have created a default insets
      if (defaultInsets["top"] != undefined) {
        return defaultInsets;
      }
      // return a fallback which is 0 for all insets
      return {top: 0, right: 0, bottom: 0, left: 0};
    },


    // overridden
    _isInitialized: function() {
      return this.__initialized;
    }
  }
});
