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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Border implementation with two CSS borders. Both borders can be styled
 * independent of each other. This decorator is used to create 3D effects like
 * <code>inset</code>, <code>outset</code>, <code>ridge</code> or <code>groove</code>.
 */
qx.Class.define("qx.ui.decoration.Double",
{
  extend : qx.ui.decoration.Abstract,
  include : [
    qx.ui.decoration.MBackgroundColor,
    qx.ui.decoration.MDoubleBorder
  ],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param width {Integer} Width of the border
   * @param style {String} Any supported border style
   * @param color {Color} The border color
   * @param innerWidth {String} Width of the inner border
   * @param innerColor {Color} The inner border color
   */
  construct : function(width, style, color, innerWidth, innerColor)
  {
    this.base(arguments);

    // Initialize properties
    if (width != null) {
      this.setWidth(width);
    }

    if (style != null) {
      this.setStyle(style);
    }

    if (color != null) {
      this.setColor(color);
    }

    if (innerWidth != null) {
      this.setInnerWidth(innerWidth);
    }

    if (innerColor != null) {
      this.setInnerColor(innerColor);
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __markup : null,


    // overridden
    _getDefaultInsets : function()
    {
      return this._getDefaultInsetsForBorder();
    },


    // overridden
    _isInitialized: function() {
      return !!this.__markup;
    },


    /*
    ---------------------------------------------------------------------------
      INTERFACE IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    // interface implementation
    getMarkup : function()
    {
      if (this.__markup) {
        return this.__markup;
      }

      var innerStyles = {};
      this._styleBorder(innerStyles);

      return this.__markup = this._generateMarkup(innerStyles);
    },


    // interface implementation
    resize : function(element, width, height)
    {
      // Fix box model
      // Note: Scaled images are always using content box
      var scaledImage = this.getBackgroundImage() && this.getBackgroundRepeat() == "scale";
      var insets = this.getInsets();

      if (scaledImage || qx.core.Environment.get("css.boxmodel") == "content")
      {
        var innerWidth = width - insets.left - insets.right;
        var innerHeight = height - insets.top - insets.bottom;
      }
      else
      {
        // inset usually inner + outer border
        var topInset = insets.top - this.getInnerWidthTop();
        var bottomInset = insets.bottom - this.getInnerWidthBottom();
        var leftInset = insets.left - this.getInnerWidthLeft();
        var rightInset = insets.right - this.getInnerWidthRight();

        // Substract outer border
        var innerWidth = width - leftInset - rightInset;
        var innerHeight = height - topInset - bottomInset;
      }

      // Fix to keep applied size above zero
      // Makes issues in IE7 when applying value like '-4px'
      if (innerWidth < 0) {
        innerWidth = 0;
      }

      if (innerHeight < 0) {
        innerHeight = 0;
      }

      if (element.firstChild) {
        element.firstChild.style.width = innerWidth + "px";
        element.firstChild.style.height = innerHeight + "px";
      }

      element.style.left =
        (insets.left -
        this.getWidthLeft() -
        this.getInnerWidthLeft()) + "px";
      element.style.top =
        (insets.top -
        this.getWidthTop() -
        this.getInnerWidthTop()) + "px";
    },

    // interface implementation
    tint : function(element, bgcolor) {
      this._tintBackgroundColor(element, bgcolor, element.style);
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.__markup = null;
  }
});
