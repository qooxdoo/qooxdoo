/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Mixin.define("qx.ui.decoration.MSingleBorder", 
{
  properties : 
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTY: WIDTH
    ---------------------------------------------------------------------------
    */

    /** top width of border */
    widthTop :
    {
      check : "Number",
      init : 0,
      apply : "_applyWidth"
    },

    /** right width of border */
    widthRight :
    {
      check : "Number",
      init : 0,
      apply : "_applyWidth"
    },

    /** bottom width of border */
    widthBottom :
    {
      check : "Number",
      init : 0,
      apply : "_applyWidth"
    },

    /** left width of border */
    widthLeft :
    {
      check : "Number",
      init : 0,
      apply : "_applyWidth"
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY: STYLE
    ---------------------------------------------------------------------------
    */

    /** top style of border */
    styleTop :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyStyle"
    },

    /** right style of border */
    styleRight :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyStyle"
    },

    /** bottom style of border */
    styleBottom :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyStyle"
    },

    /** left style of border */
    styleLeft :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyStyle"
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY: COLOR
    ---------------------------------------------------------------------------
    */

    /** top color of border */
    colorTop :
    {
      nullable : true,
      check : "Color",
      apply : "_applyStyle"
    },

    /** right color of border */
    colorRight :
    {
      nullable : true,
      check : "Color",
      apply : "_applyStyle"
    },

    /** bottom color of border */
    colorBottom :
    {
      nullable : true,
      check : "Color",
      apply : "_applyStyle"
    },

    /** left color of border */
    colorLeft :
    {
      nullable : true,
      check : "Color",
      apply : "_applyStyle"
    },

    /*
    ---------------------------------------------------------------------------
      PROPERTY GROUP: EDGE
    ---------------------------------------------------------------------------
    */

    /** Property group to configure the left border */
    left : {
      group : [ "widthLeft", "styleLeft", "colorLeft" ]
    },

    /** Property group to configure the right border */
    right : {
      group : [ "widthRight", "styleRight", "colorRight" ]
    },

    /** Property group to configure the top border */
    top : {
      group : [ "widthTop", "styleTop", "colorTop" ]
    },

    /** Property group to configure the bottom border */
    bottom : {
      group : [ "widthBottom", "styleBottom", "colorBottom" ]
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY GROUP: TYPE
    ---------------------------------------------------------------------------
    */

    /** Property group to set the border width of all sides */
    width :
    {
      group : [ "widthTop", "widthRight", "widthBottom", "widthLeft" ],
      mode : "shorthand"
    },

    /** Property group to set the border style of all sides */
    style :
    {
      group : [ "styleTop", "styleRight", "styleBottom", "styleLeft" ],
      mode : "shorthand"
    },

    /** Property group to set the border color of all sides */
    color :
    {
      group : [ "colorTop", "colorRight", "colorBottom", "colorLeft" ],
      mode : "shorthand"
    }
  },


  members :
  {
    _getMarkupSingleBorder : function(styles, element) {
      var Color = qx.theme.manager.Color.getInstance();

      // Add borders
      var width = this.getWidthTop();
      if (width > 0) {
        styles["border-top"] = width + "px " + this.getStyleTop() + " " + (Color.resolve(this.getColorTop()) || "");
      }

      var width = this.getWidthRight();
      if (width > 0) {
        styles["border-right"] = width + "px " + this.getStyleRight() + " " + (Color.resolve(this.getColorRight()) || "");
      }

      var width = this.getWidthBottom();
      if (width > 0) {
        styles["border-bottom"] = width + "px " + this.getStyleBottom() + " " + (Color.resolve(this.getColorBottom()) || "");
      }

      var width = this.getWidthLeft();
      if (width > 0) {
        styles["border-left"] = width + "px " + this.getStyleLeft() + " " + (Color.resolve(this.getColorLeft()) || "");
      }

      // Check if valid
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (styles.length === 0) {
          throw new Error("Invalid Single decorator (zero border width). Use qx.ui.decorator.Background instead!");
        }
      }

      // Add basic styles
      styles.position = "absolute";
      styles.top = 0;
      styles.left = 0;
    },
    
    
    _resizeSingleBorder : function(element, width, height) {
      var insets = this.getInsets();
      width -= insets.left + insets.right;
      height -= insets.top + insets.bottom;

      // Fix to keep applied size above zero
      // Makes issues in IE7 when applying value like '-4px'
      if (width < 0) {
        width = 0;
      }

      if (height < 0) {
        height = 0;
      }

      element.style.width = width + "px";
      element.style.height = height + "px";

      element.style.left =
        (parseInt(element.style.left, 10) +
        insets.left -
        this.getWidthLeft()) + "px";
      element.style.top =
        (parseInt(element.style.top, 10) +
        insets.top -
        this.getWidthTop()) + "px";      
    },
    
    
    
    // overridden
    _getDefaultInsets : function()
    {
      return {
        top : this.getWidthTop(),
        right : this.getWidthRight(),
        bottom : this.getWidthBottom(),
        left : this.getWidthLeft()
      };
    },
    
    
    // overridden
    _isInitialized: function() {
      return !!this._markup;
    },
    
    
    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyWidth : function()
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this._markup) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }

      this._resetInsets();
    },


    // property apply
    _applyStyle : function()
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this._markup) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }
    }
  }
});
