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

/* ************************************************************************

#require(qx.util.DeferredCall)

************************************************************************ */

/**
 * A basic decorator featuring background colors and simple borders based on
 * CSS styles.
 */
qx.Class.define("qx.ui.decoration.Basic",
{
  extend : qx.core.Object,
  implement : qx.ui.decoration.IDecorator,





  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param width {Integer} The border width, see also {@link #width}
   * @param style {String} The border style, see also {@link #style}
   * @param color {Color} The border color, see also {@link #color}
   */
  construct : function(width, style, color)
  {
    this.base(arguments);

    this._needUpdate = true;

    if (width !== undefined) {
      this.setWidth(width);
    }

    if (style !== undefined) {
      this.setStyle(style);
    }

    if (color !== undefined) {
      this.setColor(color);
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
      PROPERTY: WIDTH
    ---------------------------------------------------------------------------
    */

    /** top width of border */
    widthTop :
    {
      check : "Number",
      init : 0,
      apply : "_applyBorderChange"
    },

    /** right width of border */
    widthRight :
    {
      check : "Number",
      init : 0,
      apply : "_applyBorderChange"
    },

    /** bottom width of border */
    widthBottom :
    {
      check : "Number",
      init : 0,
      apply : "_applyBorderChange"
    },

    /** left width of border */
    widthLeft :
    {
      check : "Number",
      init : 0,
      apply : "_applyBorderChange"
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
      apply : "_applyBorderChange"
    },

    /** right style of border */
    styleRight :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyBorderChange"
    },

    /** bottom style of border */
    styleBottom :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyBorderChange"
    },

    /** left style of border */
    styleLeft :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyBorderChange"
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
      apply : "_applyColorTop"
    },

    /** right color of border */
    colorRight :
    {
      nullable : true,
      check : "Color",
      apply : "_applyColorRight"
    },

    /** bottom color of border */
    colorBottom :
    {
      nullable : true,
      check : "Color",
      apply : "_applyColorBottom"
    },

    /** left color of border */
    colorLeft :
    {
      nullable : true,
      check : "Color",
      apply : "_applyColorLeft"
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
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        if (qx.bom.client.Feature.CONTENT_BOX)
        {
          this._useContentBox = true;
          return;
        }
      }
      else
      {
        decorationElement.setStyle("boxSizing", "border-box");
      }

      // TODO
      // width, height 100% performs really bad in IE
      decorationElement.setStyle("width", "100%");
      decorationElement.setStyle("height", "100%");
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

      var borderWidth = this.getWidthLeft() + this.getWidthRight();
      var borderHeight = this.getWidthTop() + this.getWidthBottom();

      decorationElement.setStyle("width", width - borderWidth);
      decorationElement.setStyle("height", height - borderHeight);
    },


    // interface implementation
    init : function(decorationElement)
    {
      this._initSize(decorationElement);

      decorationElement.setStyles({
        "position": "absolute",
        "top": 0,
        "left": 0
      })
    },


    // interface implementation
    reuse : function(decorationElement) {
      this.init(decorationElement);
    },


    /**
     * Get the CSS style map for the decoration
     *
     * @param width {Integer} The widget's width
     * @param height {Integer} The widget's height
     */
    _getStyles : function(width, height)
    {
      var styles = {
        "borderTopWidth": this.getWidthTop() + "px",
        "borderTopStyle": this.getStyleTop() || "none",
        "borderTopColor": this.__colorTop,
        "borderRightWidth": this.getWidthRight() + "px",
        "borderRightStyle": this.getStyleRight() || "none",
        "borderRightColor": this.__colorRight,
        "borderBottomWidth": this.getWidthBottom() + "px",
        "borderBottomStyle": this.getStyleBottom() || "none",
        "borderBottomColor": this.__colorBottom,
        "borderLeftWidth": this.getWidthLeft() + "px",
        "borderLeftStyle": this.getStyleLeft() || "none",
        "borderLeftColor": this.__colorLeft
      }
      return styles;
    },


    _updateBackgroundImage : function(decorationElement, backgroundImage, backgroundRepeat)
    {
      var styles = qx.html.ClippedImage.getStyles(backgroundImage);

      switch (backgroundRepeat)
      {
        case "tile":
          styles.backgroundRepeat = "repeat";
          break;

        case "stretch":
          // TODO
          break;

        case "image":
          styles.backgroundRepeat = "no-repeat";
          break;
      }

      decorationElement.setStyles(styles);
    },


    // interface implementation
    update : function(decorationElement, width, height, backgroundColor)
    {
      if (this._needsUpdate)
      {
        decorationElement.setStyles(this._getStyles());
        this._needUpdate = false;
        qx.ui.core.DecoratorQueue.remove(this);
      }

      /*
      if (backgroundImage) {
        this._updateBackgroundImage(decorationElement, backgroundImage, backgroundRepeat || "tile");
      }
      */

      decorationElement.setStyle("backgroundColor", backgroundColor || null);

      this._updateSize(decorationElement, width, height);
    },


    // interface implementation
    reset : function(decorationElement)
    {
      decorationElement.setStyles({
        "borderTopWidth": null,
        "borderTopStyle": null,
        "borderTopColor": null,
        "borderRightWidth": null,
        "borderRightStyle": null,
        "borderRightColor": null,
        "borderBottomWidth": null,
        "borderBottomStyle": null,
        "borderBottomColor": null,
        "borderLeftWidth": null,
        "borderLeftStyle": null,
        "borderLeftColor": null,
        "backgroundColor": null,
        "width": null,
        "height": null,
        "position": "absolute",
        "top": 0,
        "left": 0
      });
    },


    // interface implementation
    getInsets : function()
    {
      return {
        top : this.getWidthTop(),
        right : this.getWidthRight(),
        bottom : this.getWidthBottom(),
        left : this.getWidthLeft()
      }
    },



    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyBorderChange : function(value, old, name) {
      this.__informManager();
    },

    // property apply
    _applyColorTop : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorTop, this, value);
    },

    // property apply
    _applyColorRight : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorRight, this, value);
    },

    // property apply
    _applyColorBottom : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorBottom, this, value);
    },

    // property apply
    _applyColorLeft : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorLeft, this, value);
    },

    // property apply
    _applyBackgroundColor : function(value) {
      qx.theme.manager.Color.getInstance().connect(this._changeBackgroundColor, this, value);
    },



    /*
    ---------------------------------------------------------------------------
      COLOR MANAGER CONNECTION
    ---------------------------------------------------------------------------
    */

    /**
     * Reacts on color changes reported by the connected ColorManager.
     *
     * @type member
     * @param value {Color} the color value to apply
     */
    _changeColorTop : function(value)
    {
      this.__colorTop = value;
      this.__informManager();
    },


    /**
     * Reacts on color changes reported by the connected ColorManager.
     *
     * @type member
     * @param value {Color} the color value to apply
     */
    _changeColorRight : function(value)
    {
      this.__colorRight = value;
      this.__informManager();
    },


    /**
     * Reacts on color changes reported by the connected ColorManager.
     *
     * @type member
     * @param value {Color} the color value to apply
     */
    _changeColorBottom : function(value)
    {
      this.__colorBottom = value;
      this.__informManager();
    },


    /**
     * Reacts on color changes reported by the connected ColorManager.
     *
     * @type member
     * @param value {Color} the color value to apply
     */
    _changeColorLeft : function(value)
    {
      this.__colorLeft = value;
      this.__informManager();
    },

    /**
     * Callback for color manager connection
     *
     * @type member
     * @param color {Color} any CSS acceptable color value
     * @return {void}
     */
    _changeBackgroundColor : function(color)
    {
      this.__bgColor = color;
      this.__informManager();
    },



    /*
    ---------------------------------------------------------------------------
      BORDER MANAGER CONNECTION
    ---------------------------------------------------------------------------
    */

    /**
     * Send information to BorderManager
     *
     * @type member
     */
    __informManager : function()
    {
      this._needsUpdate = true;
      qx.ui.core.DecoratorQueue.add(this);
    }
  }
});
