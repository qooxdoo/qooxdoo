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
qx.Mixin.define("qx.ui.decoration.MDoubleBorder", 
{
  include : [qx.ui.decoration.MSingleBorder, qx.ui.decoration.MBackgroundImage],
  
  construct : function() {
    // override the methods of single border and background image
    this._getDefaultInsetsForBorder = this.__getDefaultInsetsForDoubleBorder;
    this._resizeBorder = this.__resizeDoubleBorder;
    this._getMarkupBorder = this.__getMarkupDoubleBorder;
    this._generateMarkup = this._generateMarkupDoubleBorder;
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
  
  
  members :
  {
    __ownMarkup : null,
    
    __getMarkupDoubleBorder : function(styles)
    {
      var Color = qx.theme.manager.Color.getInstance();

      // Inner styles
      // Inner image must be relative to be compatible with qooxdoo 0.8.x
      // See http://bugzilla.qooxdoo.org/show_bug.cgi?id=3450 for details
      styles.position = "relative";

      // Add inner borders
      var width = this.getInnerWidthTop();
      if (width > 0) {
        styles["border-top"] = width + "px " + this.getStyleTop() + " " + Color.resolve(this.getInnerColorTop());
      }

      var width = this.getInnerWidthRight();
      if (width > 0) {
        styles["border-right"] = width + "px " + this.getStyleRight() + " " + Color.resolve(this.getInnerColorRight());
      }

      var width = this.getInnerWidthBottom();
      if (width > 0) {
        styles["border-bottom"] = width + "px " + this.getStyleBottom() + " " + Color.resolve(this.getInnerColorBottom());
      }

      var width = this.getInnerWidthLeft();
      if (width > 0) {
        styles["border-left"] = width + "px " + this.getStyleLeft() + " " + Color.resolve(this.getInnerColorLeft());
      }

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (styles.length === 0) {
          throw new Error("Invalid Double decorator (zero inner border width). Use qx.ui.decoration.Single instead!");
        }
      }
    },
    
    
    _generateMarkupDoubleBorder : function(innerStyles) {
      var innerHtml = this._generateBackgroundMarkup(innerStyles);
      var Color = qx.theme.manager.Color.getInstance();

      // Generate outer HTML
      var outerStyles = 'line-height:0;';

      // Do not set the line-height on IE6, IE7, IE8 in Quirks Mode and IE8 in IE7 Standard Mode
      // See http://bugzilla.qooxdoo.org/show_bug.cgi?id=3450 for details
      if ((qx.bom.client.Engine.MSHTML && qx.bom.client.Engine.VERSION < 8) ||
          (qx.bom.client.Engine.MSHTML && qx.bom.client.Engine.DOCUMENT_MODE < 8)) {
        outerStyles = '';
      }

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
      return this.__ownMarkup = '<div style="position:absolute;top:0;left:0;' + outerStyles + '">' + innerHtml + '</div>';
    },
    
    



    __resizeDoubleBorder : function(element, width, height)
    {
      var insets = this.getInsets();
      width -= insets.left + insets.right;
      height -= insets.top + insets.bottom;

      var left =
        (parseInt(element.style.left, 10) +
        insets.left -
        this.getWidthLeft() -
        this.getInnerWidthLeft());
      var top =
        (parseInt(element.style.top, 10) +
        insets.top -
        this.getWidthTop() -
        this.getInnerWidthTop());
        
      return {
        left: left,
        top: top,
        width: width,
        height: height,
        elementToApplyDimensions : element.firstChild
      };
    },   
   
   
    __getDefaultInsetsForDoubleBorder : function()
    {
      return {
        top : this.getWidthTop() + this.getInnerWidthTop(),
        right : this.getWidthRight() + this.getInnerWidthRight(),
        bottom : this.getWidthBottom() + this.getInnerWidthBottom(),
        left : this.getWidthLeft() + this.getInnerWidthLeft()
      };
    }
  }
});
