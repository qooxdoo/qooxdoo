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
  extend : qx.ui.decoration.Single,




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
    this.base(arguments, width, style, color, innerWidth, innerColor);

    // Initialize properties
    if (innerWidth != null) {
      this.setInnerWidth(innerWidth);
    }

    if (innerColor != null) {
      this.setInnerColor(innerColor);
    }
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTY: INNER WIDTH
    ---------------------------------------------------------------------------
    */

    /** top width of border */
    innerWidthTop :
    {
      check : "Number",
      init : 0
    },

    /** right width of border */
    innerWidthRight :
    {
      check : "Number",
      init : 0
    },

    /** bottom width of border */
    innerWidthBottom :
    {
      check : "Number",
      init : 0
    },

    /** left width of border */
    innerWidthLeft :
    {
      check : "Number",
      init : 0
    },

    /** Property group to set the inner border width of all sides */
    innerWidth :
    {
      group : [ "innerWidthTop", "innerWidthRight", "innerWidthBottom", "innerWidthLeft" ],
      mode : "shorthand"
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY: INNER COLOR
    ---------------------------------------------------------------------------
    */

    /** top inner color of border */
    innerColorTop :
    {
      nullable : true,
      check : "Color"
    },

    /** right inner color of border */
    innerColorRight :
    {
      nullable : true,
      check : "Color"
    },

    /** bottom inner color of border */
    innerColorBottom :
    {
      nullable : true,
      check : "Color"
    },

    /** left inner color of border */
    innerColorLeft :
    {
      nullable : true,
      check : "Color"
    },

    /**
     * Property group for the inner color properties.
     */
    innerColor :
    {
      group : [ "innerColorTop", "innerColorRight", "innerColorBottom", "innerColorLeft" ],
      mode : "shorthand"
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
    __insets : null,



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

      var Color = qx.theme.manager.Color.getInstance();


      // Inner styles
      var innerStyles = "";

      // Add inner borders
      var width = this.getInnerWidthTop();
      if (width > 0) {
        innerStyles += "border-top:" + width + "px " + this.getStyleTop() + " " + Color.resolve(this.getInnerColorTop()) + ";";
      }

      var width = this.getInnerWidthRight();
      if (width > 0) {
        innerStyles += "border-right:" + width + "px " + this.getStyleRight() + " " + Color.resolve(this.getInnerColorRight()) + ";";
      }

      var width = this.getInnerWidthBottom();
      if (width > 0) {
        innerStyles += "border-bottom:" + width + "px " + this.getStyleBottom() + " " + Color.resolve(this.getInnerColorBottom()) + ";";
      }

      var width = this.getInnerWidthLeft();
      if (width > 0) {
        innerStyles += "border-left:" + width + "px " + this.getStyleLeft() + " " + Color.resolve(this.getInnerColorLeft()) + ";";
      }

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (innerStyles.length === 0) {
          throw new Error("Invalid Double decorator (zero inner border width). Use qx.ui.decoration.Single instead!");
        }
      }

      // Generate inner HTML
      var innerHtml = qx.ui.decoration.Util.generateBackgroundMarkup(this.getBackgroundImage(), this.getBackgroundRepeat(), innerStyles);


      // Generate outer HTML
      var outerStyles = '';

      var width = this.getWidthTop();
      if (width > 0) {
        outerStyles += "border-top:" + width + "px " + this.getStyleTop() + " " + Color.resolve(this.getColorTop()) + ";";
      }

      var width = this.getWidthRight();
      if (width > 0) {
        outerStyles += "border-right:" + width + "px " + this.getStyleRight() + " " + Color.resolve(this.getColorRight()) + ";";
      }

      var width = this.getWidthBottom();
      if (width > 0) {
        outerStyles += "border-bottom:" + width + "px " + this.getStyleBottom() + " " + Color.resolve(this.getColorBottom()) + ";";
      }

      var width = this.getWidthLeft();
      if (width > 0) {
        outerStyles += "border-left:" + width + "px " + this.getStyleLeft() + " " + Color.resolve(this.getColorLeft()) + ";";
      }

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (outerStyles.length === 0) {
          throw new Error("Invalid Double decorator (zero outer border width). Use qx.ui.decoration.Single instead!");
        }
      }


      // Store
      return this.__markup = '<div style="position:absolute;top:0;left:0;' + outerStyles + '">' + innerHtml + '</div>';
    },


    // interface implementation
    resize : function(element, width, height)
    {
      // Fix box model
      // Note: Scaled images are always using content box
      var scaledImage = this.getBackgroundImage() && this.getBackgroundRepeat() == "scale";
      if (scaledImage || qx.bom.client.Feature.CONTENT_BOX)
      {
        var insets = this.getInsets();
        var innerWidth = width - insets.left - insets.right;
        var innerHeight = height - insets.top - insets.bottom;
      }
      else
      {
        // Substract outer border
        var innerWidth = width - this.getWidthLeft() - this.getWidthRight();
        var innerHeight = height - this.getWidthTop() - this.getWidthBottom();
      }

      // Fix to keep applied size above zero
      // Makes issues in IE7 when applying value like '-4px'
      if (innerWidth < 0) {
        innerWidth = 0;
      }

      if (innerHeight < 0) {
        innerHeight = 0;
      }

      var dom = element.getDomElement();
      dom.firstChild.style.width = innerWidth + "px";
      dom.firstChild.style.height = innerHeight + "px";
    },


    // interface implementation
    getInsets : function()
    {
      if (this.__insets) {
        return this.__insets;
      }

      this.__insets =
      {
        top : this.getWidthTop() + this.getInnerWidthTop(),
        right : this.getWidthRight() + this.getInnerWidthRight(),
        bottom : this.getWidthBottom() + this.getInnerWidthBottom(),
        left : this.getWidthLeft() + this.getInnerWidthLeft()
      };

      return this.__insets;
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__markup", "__insets");
  }
});
