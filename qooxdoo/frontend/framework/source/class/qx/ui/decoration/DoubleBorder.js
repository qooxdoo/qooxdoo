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
 * Border implementation with two CSS borders. both borders can be styled
 * independent from each other. This decorator is used to create 3D effects like
 * <code>inset</code>, <code>outset</code> or <code>ridge</code>.
 */
qx.Class.define("qx.ui.decoration.DoubleBorder",
{
  extend : qx.ui.decoration.Basic,




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
      init : 0,
      apply : "_applyBorderChange"
    },

    /** right width of border */
    innerWidthRight :
    {
      check : "Number",
      init : 0,
      apply : "_applyBorderChange"
    },

    /** bottom width of border */
    innerWidthBottom :
    {
      check : "Number",
      init : 0,
      apply : "_applyBorderChange"
    },

    /** left width of border */
    innerWidthLeft :
    {
      check : "Number",
      init : 0,
      apply : "_applyBorderChange"
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
      apply : "_applyInnerColorTop"
    },

    /** right inner color of border */
    innerColorRight :
    {
      nullable : true,
      apply : "_applyInnerColorRight"
    },

    /** bottom inner color of border */
    innerColorBottom :
    {
      nullable : true,
      apply : "_applyInnerColorBottom"
    },

    /** left inner color of border */
    innerColorLeft :
    {
      nullable : true,
      apply : "_applyInnerColorLeft"
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
    /**
     * Initialize the element's size
     *
     * @param decorationElement {qx.html.Element} The widget's decoration element.
     */
    _initSize : function(decorationElement)
    {
      var innerElement = decorationElement.getChild(0);

      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        if (qx.bom.client.Feature.CONTENT_BOX) {
          this._useContentBox = true;
          return;
        }
      }
      else
      {
        decorationElement.setStyle("boxSizing", "border-box");
        innerElement.setStyle("boxSizing", "border-box");
      }

      decorationElement.setStyle("width", "100%");
      decorationElement.setStyle("height", "100%");

      innerElement.setStyle("width", "100%");
      innerElement.setStyle("height", "100%");
    },


    /**
     * Update the element's size
     *
     * @param decorationElement {qx.html.Element} The widget's decoration element.
     * @param height {Integer} The widget's new height
     * @param width {Integer} The widget's new width
     */
    _updateSize : function(decorationElement, width, height)
    {
      if (!this._useContentBox) {
        return;
      }
      this.base(arguments, decorationElement, width, height)

      var borderWidth =
        this.getWidthLeft() + this.getWidthRight() +
        this.getInnerWidthLeft() + this.getInnerWidthRight();

      var borderHeight =
        this.getWidthTop() + this.getWidthBottom() +
        this.getInnerWidthTop() + this.getInnerWidthBottom();

      var innerElement = decorationElement.getChild(0);
      innerElement.setStyle("width", width - borderWidth);
      innerElement.setStyle("height", height - borderHeight);
    },


    // overridden
    init : function(decorationElement)
    {
      var innerElement = new qx.html.Element();

      innerElement.setStyles({
        position: "absolute",
        top: 0,
        left: 0
      });

      decorationElement.add(innerElement);

      this.base(arguments, decorationElement);
    },


    /**
     * Get the CSS style map for the decoration
     *
     * @param width {Integer} The widget's width
     * @param height {Integer} The widget's height
     * @return {Map} a map containing the computed CSS styles
     */
    _getInnerStyles : function(width, height)
    {
      var styles = {
        "borderTopWidth": this.getInnerWidthTop() + "px",
        "borderTopColor": this.__innerColorTop,
        "borderRightWidth": this.getInnerWidthRight() + "px",
        "borderRightColor": this.__innerColorRight,
        "borderBottomWidth": this.getInnerWidthBottom() + "px",
        "borderBottomColor": this.__innerColorBottom,
        "borderLeftWidth": this.getInnerWidthLeft() + "px",
        "borderLeftColor": this.__innerColorLeft,
        "backgroundColor": this.__bgColor,
        "borderStyle": "solid"
      }

      return styles;
    },


    // interface implementation
    update : function(decorationElement, width, height, backgroundColor, backgroundImage, backgroundRepeat)
    {
      if (this._needsUpdate)
      {
        var innerElement = decorationElement.getChild(0);
        innerElement.setStyles(this._getInnerStyles());
      }

      this.base(arguments, decorationElement, width, height, backgroundColor, backgroundImage, backgroundRepeat);
    },


    // interface implementation
    reset : function(decorationElement)
    {
      decorationElement.removeAt(0);
      this.base(arguments, decorationElement)
    },


		// interface implementation
    getInsets : function()
    {
      return {
        top : this.getWidthTop() + this.getInnerWidthTop(),
        right : this.getWidthRight() + this.getInnerWidthRight(),
        bottom : this.getWidthBottom() + this.getInnerWidthBottom(),
        left : this.getWidthLeft() + this.getInnerWidthLeft()
      }
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyInnerColorTop : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeInnerColorTop, this, value);
    },

    // property apply
    _applyInnerColorRight : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeInnerColorRight, this, value);
    },

    // property apply
    _applyInnerColorBottom : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeInnerColorBottom, this, value);
    },

    // property apply
    _applyInnerColorLeft : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeInnerColorLeft, this, value);
    },


    /**
     * Reacts on color changes reported by the connected ColorManager.
     *
     * @type member
     * @param value {Color} the color value to apply
     */
    _changeInnerColorTop : function(value)
    {
      this.__innerColorTop = value;
      this.__informManager();
    },


    /**
     * Reacts on color changes reported by the connected ColorManager.
     *
     * @type member
     * @param value {Color} the color value to apply
     */
    _changeInnerColorRight : function(value)
    {
      this.__innerColorRight = value;
      this.__informManager();
    },


    /**
     * Reacts on color changes reported by the connected ColorManager.
     *
     * @type member
     * @param value {Color} the color value to apply
     */
    _changeInnerColorBottom : function(value)
    {
      this.__innerColorBottom = value;
      this.__informManager();
    },


    /**
     * Reacts on color changes reported by the connected ColorManager.
     *
     * @type member
     * @param value {Color} the color value to apply
     */
    _changeInnerColorLeft : function(value)
    {
      this.__innerColorLeft = value;
      this.__informManager();
    }
  }
});