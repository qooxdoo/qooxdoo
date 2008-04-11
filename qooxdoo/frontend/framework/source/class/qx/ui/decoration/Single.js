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
 * A basic decorator featuring background colors and simple borders based on
 * CSS styles.
 */
qx.Class.define("qx.ui.decoration.Single",
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

    /** The background color */
    backgroundColor :
    {
      nullable : true,
      init : "inherit",
      check : "Color",
      apply : "_applyBackgroundColor"
    },



    /*
    ---------------------------------------------------------------------------
      PROPERTY: BACKGROUND IMAGE
    ---------------------------------------------------------------------------
    */

    /** The URL of the background image */
    backgroundImage :
    {
      check : "String",
      nullable : true,
      apply : "_applyBorderChange"
    },

    /** How the background should be repeated */
    backgroundRepeat :
    {
      check : ["repeat", "repeat-x", "repeat-y", "no-repeat", "scale"],
      init : "repeat",
      apply : "_applyBorderChange"
    },


    stretchedImage :
    {
      check : "String",
      nullable : true,
      apply : "_applyBorderChange"
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
     * Get the CSS style map for the decoration
     *
     * @param width {Integer} The widget's width
     * @param height {Integer} The widget's height
     */
    _getStyles : function(width, height)
    {
      if (this.getBackgroundRepeat() !== "scale") {
        var bgImage = qx.io.Alias.getInstance().resolve(this.getBackgroundImage());
      } else {
        bgImage = "";
      }

      var styles =
      {
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
        "borderLeftColor": this.__colorLeft,
        "backgroundImage": bgImage ? "url(" + bgImage + ")" : null,
        "backgroundRepeat": this.getBackgroundRepeat()
      };

      return styles;
    },


    _updateScaledImage : function(el, width, height)
    {
      var bgImage = qx.io.Alias.getInstance().resolve(this.getBackgroundImage());
      if (!bgImage || this.getBackgroundRepeat() !== "scale")
      {
        el.removeAll();
        return;
      }

      var img = el.getChild(0);
      if (!img)
      {
        img = new qx.html.Image();
        el.add(img);
      }

      img.setSource(bgImage);
      img.setStyle("height", "100%");
      img.setStyle("width", "100%");
    },


    // interface implementation
    render : function(element, width, height, backgroundColor, updateSize, updateStyles)
    {
      if (updateStyles) {
        element.setStyles(this._getStyles());

        this._updateScaledImage(element, width, height);
      }

      element.setStyle("backgroundColor", backgroundColor || this.__bgColor || null);

      if (updateSize) {
        qx.ui.decoration.Util.updateSize(
          element,
          width, height,
          this.getWidthLeft() + this.getWidthRight(),
          this.getWidthTop() + this.getWidthBottom()
        );
      }
    },


    _emptyStyles :
    {
      borderTopWidth: null,
      borderTopStyle: null,
      borderTopColor: null,
      borderRightWidth: null,
      borderRightStyle: null,
      borderRightColor: null,
      borderBottomWidth: null,
      borderBottomStyle: null,
      borderBottomColor: null,
      borderLeftWidth: null,
      borderLeftStyle: null,
      borderLeftColor: null,
      backgroundColor: null,
      backgroundImage: null,
      backgroundRepeat: null
    },


    // interface implementation
    reset : function(element) {
      element.setStyles(this._emptyStyles);
      el.removeAll();
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
      qx.ui.core.queue.Decorator.add(this);
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
      qx.ui.core.queue.Decorator.add(this);
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
      qx.ui.core.queue.Decorator.add(this);
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
      qx.ui.core.queue.Decorator.add(this);
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
      qx.ui.core.queue.Decorator.add(this);
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
      qx.ui.core.queue.Decorator.add(this);
    }
  }
});
