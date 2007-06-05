/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_core)

************************************************************************ */

/** Border implementation for qx.ui.core.Widget instances. */
qx.Class.define("qx.ui.core.Border",
{
  extend : qx.core.Object,




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
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      UTILITY
    ---------------------------------------------------------------------------
    */

    /**
     * Converts a typical CSS border definition string to an border object
     *
     * @type static
     * @param str {String} the CSS string
     * @return {qx.ui.core.Border} the created instance
     */
    fromString : function(str)
    {
      var border = new qx.ui.core.Border;
      var parts = str.split(/\s+/);
      var part, temp;

      for (var i=0, l=parts.length; i<l; i++)
      {
        part = parts[i];

        switch(part)
        {
          case "groove":
          case "ridge":
          case "inset":
          case "outset":
          case "solid":
          case "dotted":
          case "dashed":
          case "double":
          case "none":
            border.setStyle(part);
            break;

          default:
            temp = parseInt(part);

            if (temp === part || qx.lang.String.contains(part, "px")) {
              border.setWidth(temp);
            } else {
              border.setColor(part);
            }

            break;
        }
      }

      return border;
    },


    /**
     * Converts a map property definition into a border object.
     *
     * @type static
     * @param config {Map} map of property values
     * @return {qx.ui.core.Border} the created instance
     */
    fromConfig : function(config)
    {
      var border = new qx.ui.core.Border;
      border.set(config);
      return border;
    },


    /**
     * Removes a border from a widget
     *
     * @type static
     * @param widget {qx.ui.core.Widget} The widget from which the border should removed
     * @return {void}
     * @internal
     * @signature function(widget)
     */
    resetTop : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(widget)
      {
        var style = widget._style;
        if (style) {
          style.borderTopWidth = style.borderTopStyle = style.borderTopColor = style.MozBorderTopColors = "";
        }
      },

      "default" : function(widget)
      {
        var style = widget._style;
        if (style) {
          style.borderTopWidth = style.borderTopStyle = style.borderTopColor = "";
        }

        style = widget._innerStyle;
        if (style) {
          style.borderTopWidth = style.borderTopStyle = style.borderTopColor = "";
        }
      }
    }),


    /**
     * Removes a border from a widget
     *
     * @type static
     * @param widget {qx.ui.core.Widget} The widget from which the border should removed
     * @return {void}
     * @internal
     * @signature function(widget)
     */
    resetRight : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(widget)
      {
        var style = widget._style;
        if (style) {
          style.borderRightWidth = style.borderRightStyle = style.borderRightColor = style.MozBorderRightColors = "";
        }
      },

      "default" : function(widget)
      {
        var style = widget._style;
        if (style) {
          style.borderRightWidth = style.borderRightStyle = style.borderRightColor = "";
        }

        style = widget._innerStyle;
        if (style) {
          style.borderRightWidth = style.borderRightStyle = style.borderRightColor = "";
        }
      }
    }),


    /**
     * Removes a border from a widget
     *
     * @type static
     * @param widget {qx.ui.core.Widget} The widget from which the border should removed
     * @return {void}
     * @internal
     * @signature function(widget)
     */
    resetBottom : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(widget)
      {
        var style = widget._style;
        if (style) {
          style.borderBottomWidth = style.borderBottomStyle = style.borderBottomColor = style.MozBorderBottomColors = "";
        }
      },

      "default" : function(widget)
      {
        var style = widget._style;
        if (style) {
          style.borderBottomWidth = style.borderBottomStyle = style.borderBottomColor = "";
        }

        style = widget._innerStyle;
        if (style) {
          style.borderBottomWidth = style.borderBottomStyle = style.borderBottomColor = "";
        }
      }
    }),


    /**
     * Removes a border from a widget
     *
     * @type static
     * @param widget {qx.ui.core.Widget} The widget from which the border should removed
     * @return {void}
     * @internal
     * @signature function(widget)
     */
    resetLeft : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(widget)
      {
        var style = widget._style;
        if (style) {
          style.borderLeftWidth = style.borderLeftStyle = style.borderLeftColor = style.MozBorderLeftColors = "";
        }
      },

      "default" : function(widget)
      {
        var style = widget._style;
        if (style) {
          style.borderLeftWidth = style.borderLeftStyle = style.borderLeftColor = "";
        }

        style = widget._innerStyle;
        if (style) {
          style.borderLeftWidth = style.borderLeftStyle = style.borderLeftColor = "";
        }
      }
    })
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
      apply : "_applyWidthTop"
    },

    /** right width of border */
    widthRight :
    {
      check : "Number",
      init : 0,
      apply : "_applyWidthRight"
    },

    /** bottom width of border */
    widthBottom :
    {
      check : "Number",
      init : 0,
      apply : "_applyWidthBottom"
    },

    /** left width of border */
    widthLeft :
    {
      check : "Number",
      init : 0,
      apply : "_applyWidthLeft"
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
      check : [ "solid", "dotted", "dashed", "double", "outset", "inset", "ridge", "groove" ],
      init : "solid",
      apply : "_applyStyleTop"
    },

    /** right style of border */
    styleRight :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double", "outset", "inset", "ridge", "groove" ],
      init : "solid",
      apply : "_applyStyleRight"
    },

    /** bottom style of border */
    styleBottom :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double", "outset", "inset", "ridge", "groove" ],
      init : "solid",
      apply : "_applyStyleBottom"
    },

    /** left style of border */
    styleLeft :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double", "outset", "inset", "ridge", "groove" ],
      init : "solid",
      apply : "_applyStyleLeft"
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
      PROPERTY: INNER COLOR
    ---------------------------------------------------------------------------
    */

    /** top inner color of border */
    colorInnerTop :
    {
      nullable : true,
      check : "Color",
      apply : "_applyColorInnerTop"
    },

    /** right inner color of border */
    colorInnerRight :
    {
      nullable : true,
      check : "Color",
      apply : "_applyColorInnerRight"
    },

    /** bottom inner color of border */
    colorInnerBottom :
    {
      nullable : true,
      check : "Color",
      apply : "_applyColorInnerBottom"
    },

    /** left inner color of border */
    colorInnerLeft :
    {
      nullable : true,
      check : "Color",
      apply : "_applyColorInnerLeft"
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY GROUP: EDGE
    ---------------------------------------------------------------------------
    */

    left : {
      group : [ "widthLeft", "styleLeft", "colorLeft" ]
    },

    right : {
      group : [ "widthRight", "styleRight", "colorRight" ]
    },

    top : {
      group : [ "widthTop", "styleTop", "colorTop" ]
    },

    bottom : {
      group : [ "widthBottom", "styleBottom", "colorBottom" ]
    },



    /*
    ---------------------------------------------------------------------------
      PROPERTY GROUP: TYPE
    ---------------------------------------------------------------------------
    */

    width :
    {
      group : [ "widthTop", "widthRight", "widthBottom", "widthLeft" ],
      mode : "shorthand"
    },

    style :
    {
      group : [ "styleTop", "styleRight", "styleBottom", "styleLeft" ],
      mode : "shorthand"
    },

    color :
    {
      group : [ "colorTop", "colorRight", "colorBottom", "colorLeft" ],
      mode : "shorthand"
    },

    innerColor :
    {
      group : [ "colorInnerTop", "colorInnerRight", "colorInnerBottom", "colorInnerLeft" ],
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
    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    _applyWidthTop : function(value, old)
    {
      this.__widthTop = value == null ? "0px" : value + "px";
      this.__computeComplexTop();
      this.__informManager("top");
    },

    _applyWidthRight : function(value, old)
    {
      this.__widthRight = value == null ? "0px" : value + "px";
      this.__computeComplexRight();
      this.__informManager("right");
    },

    _applyWidthBottom : function(value, old)
    {
      this.__widthBottom = value == null ? "0px" : value + "px";
      this.__computeComplexBottom();
      this.__informManager("bottom");
    },

    _applyWidthLeft : function(value, old)
    {
      this.__widthLeft = value == null ? "0px" : value + "px";
      this.__computeComplexLeft();
      this.__informManager("left");
    },

    _applyColorTop : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorTop, this, value);
    },

    _applyColorRight : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorRight, this, value);
    },

    _applyColorBottom : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorBottom, this, value);
    },

    _applyColorLeft : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorLeft, this, value);
    },

    _applyColorInnerTop : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorInnerTop, this, value);
    },

    _applyColorInnerRight : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorInnerRight, this, value);
    },

    _applyColorInnerBottom : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorInnerBottom, this, value);
    },

    _applyColorInnerLeft : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorInnerLeft, this, value);
    },

    _applyStyleTop : function() {
      this.__informManager("top");
    },

    _applyStyleRight : function() {
      this.__informManager("right");
    },

    _applyStyleBottom : function() {
      this.__informManager("bottom");
    },

    _applyStyleLeft : function() {
      this.__informManager("left");
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
      this.__computeComplexTop();
      this.__informManager("top");
    },


    /**
     * Reacts on color changes reported by the connected ColorManager.
     *
     * @type member
     * @param value {Color} the color value to apply
     */
    _changeColorInnerTop : function(value)
    {
      this.__colorInnerTop = value;
      this.__computeComplexTop();
      this.__informManager("top");
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
      this.__computeComplexRight();
      this.__informManager("right");
    },


    /**
     * Reacts on color changes reported by the connected ColorManager.
     *
     * @type member
     * @param value {Color} the color value to apply
     */
    _changeColorInnerRight : function(value)
    {
      this.__colorInnerRight = value;
      this.__computeComplexRight();
      this.__informManager("right");
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
      this.__computeComplexBottom();
      this.__informManager("bottom");
    },


    /**
     * Reacts on color changes reported by the connected ColorManager.
     *
     * @type member
     * @param value {Color} the color value to apply
     */
    _changeColorInnerBottom : function(value)
    {
      this.__colorInnerBottom = value;
      this.__computeComplexBottom();
      this.__informManager("bottom");
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
      this.__computeComplexLeft();
      this.__informManager("left");
    },


    /**
     * Reacts on color changes reported by the connected ColorManager.
     *
     * @type member
     * @param value {Color} the color value to apply
     */
    _changeColorInnerLeft : function(value)
    {
      this.__colorInnerLeft = value;
      this.__computeComplexLeft();
      this.__informManager("left");
    },







    /*
    ---------------------------------------------------------------------------
      COMPLEX DETECTION AND CACHE
    ---------------------------------------------------------------------------
    */

    __computeComplexTop : function() {
      this.__complexTop = this.getWidthTop() === 2 && this.__colorInnerTop != null && this.__colorTop != this.__colorInnerTop;
    },

    __computeComplexRight : function() {
      this.__complexRight = this.getWidthRight() === 2 && this.__colorInnerRight != null && this.__colorRight != this.__colorInnerRight;
    },

    __computeComplexBottom : function() {
      this.__complexBottom = this.getWidthBottom() === 2 && this.__colorInnerBottom != null && this.__colorBottom != this.__colorInnerBottom;
    },

    __computeComplexLeft : function() {
      this.__complexLeft = this.getWidthLeft() === 2 && this.__colorInnerLeft != null && this.__colorLeft != this.__colorInnerLeft;
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
     * @param edge {String} the edge which was updated
     */
    __informManager : function(edge) {
      qx.theme.manager.Border.getInstance().updateObjectsEdge(this, edge);
    },







    /*
    ---------------------------------------------------------------------------
      APPLY IMPLEMENTATION
    ---------------------------------------------------------------------------
    */


    /**
     * Renders top border for given widget
     *
     * @signature function(obj)
     * @type member
     * @internal
     * @param obj {qx.ui.core.Widget} the widget which should get the border
     */
    renderTop : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(obj)
      {
        var style = obj._style;

        // Simple width & color update
        style.borderTopWidth = this.__widthTop || "0px";
        style.borderTopColor = this.__colorTop || "";

        // Complex border handling
        if (this.__complexTop)
        {
          // be sure to use "solid" even if defined different
          // otherwise the browser wins and don't respect the
          // configured color set
          style.borderTopStyle = "solid";

          // Apply geckos's proprietary style
          style.MozBorderTopColors = this.__colorTop + " " + this.__colorInnerTop;
        }
        else
        {
          // Simple style update
          style.borderTopStyle = this.getStyleTop() || "none";

          // Apply geckos's proprietary style
          style.MozBorderTopColors = "";
        }
      },

      "default" : function(obj)
      {
        var outer = obj._style;
        var inner = obj._innerStyle;

        if (this.__complexTop)
        {
          // Create required inner element
          if (!inner)
          {
            obj.prepareEnhancedBorder();
            inner = obj._innerStyle;
          }

          // Keep width and style of inner and outer in sync
          // Force both, 1px and solid. Even if the style is configured
          // in a different way. Otherwise the browser wins and don't respect
          // the configured color set.
          outer.borderTopWidth = inner.borderTopWidth = "1px";
          outer.borderTopStyle = inner.borderTopStyle = "solid";

          // Apply the different colors
          outer.borderTopColor = this.__colorTop;
          inner.borderTopColor = this.__colorInnerTop;
        }
        else
        {
          // Simple CSS value update
          outer.borderTopWidth = this.__widthTop || "0px";
          outer.borderTopStyle = this.getStyleTop() || "none";
          outer.borderTopColor = this.__colorTop || "";

          // Reset inner styles
          if (inner) {
            inner.borderTopWidth = inner.borderTopStyle = inner.borderTopColor = "";
          }
        }
      }
    }),


    /**
     * Renders right border for given widget
     *
     * @signature function(obj)
     * @type member
     * @internal
     * @param obj {qx.ui.core.Widget} the widget which should get the border
     */
    renderRight : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(obj)
      {
        var style = obj._style;

        // Simple width & color update
        style.borderRightWidth = this.__widthRight || "0px";
        style.borderRightColor = this.__colorRight || "";

        // Complex border handling
        if (this.__complexRight)
        {
          // be sure to use "solid" even if defined different
          // otherwise the browser wins and don't respect the
          // configured color set
          style.borderRightStyle = "solid";

          // Apply geckos's proprietary style
          style.MozBorderRightColors = this.__colorRight + " " + this.__colorInnerRight;
        }
        else
        {
          // Simple style update
          style.borderRightStyle = this.getStyleRight() || "none";

          // Apply geckos's proprietary style
          style.MozBorderRightColors = "";
        }
      },

      "default" : function(obj)
      {
        var outer = obj._style;
        var inner = obj._innerStyle;

        if (this.__complexRight)
        {
          // Create required inner element
          if (!inner)
          {
            obj.prepareEnhancedBorder();
            inner = obj._innerStyle;
          }

          // Keep width and style of inner and outer in sync
          // Force both, 1px and solid. Even if the style is configured
          // in a different way. Otherwise the browser wins and don't respect
          // the configured color set.
          outer.borderRightWidth = inner.borderRightWidth = "1px";
          outer.borderRightStyle = inner.borderRightStyle = "solid";

          // Apply the different colors
          outer.borderRightColor = this.__colorRight;
          inner.borderRightColor = this.__colorInnerRight;
        }
        else
        {
          // Simple CSS value update
          outer.borderRightWidth = this.__widthRight || "0px";
          outer.borderRightStyle = this.getStyleRight() || "none";
          outer.borderRightColor = this.__colorRight || "";

          // Reset inner styles
          if (inner) {
            inner.borderRightWidth = inner.borderRightStyle = inner.borderRightColor = "";
          }
        }
      }
    }),


    /**
     * Renders bottom border for given widget
     *
     * @signature function(obj)
     * @type member
     * @internal
     * @param obj {qx.ui.core.Widget} the widget which should get the border
     */
    renderBottom : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(obj)
      {
        var style = obj._style;

        // Simple width & color update
        style.borderBottomWidth = this.__widthBottom || "0px";
        style.borderBottomColor = this.__colorBottom || "";

        // Complex border handling
        if (this.__complexBottom)
        {
          // be sure to use "solid" even if defined different
          // otherwise the browser wins and don't respect the
          // configured color set
          style.borderBottomStyle = "solid";

          // Apply geckos's proprietary style
          style.MozBorderBottomColors = this.__colorBottom + " " + this.__colorInnerBottom;
        }
        else
        {
          // Simple style update
          style.borderBottomStyle = this.getStyleBottom() || "none";

          // Apply geckos's proprietary style
          style.MozBorderBottomColors = "";
        }
      },

      "default" : function(obj)
      {
        var outer = obj._style;
        var inner = obj._innerStyle;

        if (this.__complexBottom)
        {
          // Create required inner element
          if (!inner)
          {
            obj.prepareEnhancedBorder();
            inner = obj._innerStyle;
          }

          // Keep width and style of inner and outer in sync
          // Force both, 1px and solid. Even if the style is configured
          // in a different way. Otherwise the browser wins and don't respect
          // the configured color set.
          outer.borderBottomWidth = inner.borderBottomWidth = "1px";
          outer.borderBottomStyle = inner.borderBottomStyle = "solid";

          // Apply the different colors
          outer.borderBottomColor = this.__colorBottom;
          inner.borderBottomColor = this.__colorInnerBottom;
        }
        else
        {
          // Simple CSS value update
          outer.borderBottomWidth = this.__widthBottom || "0px";
          outer.borderBottomStyle = this.getStyleBottom() || "none";
          outer.borderBottomColor = this.__colorBottom || "";

          // Reset inner styles
          if (inner) {
            inner.borderBottomWidth = inner.borderBottomStyle = inner.borderBottomColor = "";
          }
        }
      }
    }),


    /**
     * Renders left border for given widget
     *
     * @signature function(obj)
     * @type member
     * @param obj {qx.ui.core.Widget} the widget which should get the border
     * @internal
     */
    renderLeft : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(obj)
      {
        var style = obj._style;

        // Simple width & color update
        style.borderLeftWidth = this.__widthLeft || "0px";
        style.borderLeftColor = this.__colorLeft || "";

        // Complex border handling
        if (this.__complexLeft)
        {
          // be sure to use "solid" even if defined different
          // otherwise the browser wins and don't respect the
          // configured color set
          style.borderLeftStyle = "solid";

          // Apply geckos's proprietary style
          style.MozBorderLeftColors = this.__colorLeft + " " + this.__colorInnerLeft;
        }
        else
        {
          // Simple style update
          style.borderLeftStyle = this.getStyleLeft() || "none";

          // Apply geckos's proprietary style
          style.MozBorderLeftColors = "";
        }
      },

      "default" : function(obj)
      {
        var outer = obj._style;
        var inner = obj._innerStyle;

        if (this.__complexLeft)
        {
          // Create required inner element
          if (!inner)
          {
            obj.prepareEnhancedBorder();
            inner = obj._innerStyle;
          }

          // Keep width and style of inner and outer in sync
          // Force both, 1px and solid. Even if the style is configured
          // in a different way. Otherwise the browser wins and don't respect
          // the configured color set.
          outer.borderLeftWidth = inner.borderLeftWidth = "1px";
          outer.borderLeftStyle = inner.borderLeftStyle = "solid";

          // Apply the different colors
          outer.borderLeftColor = this.__colorLeft;
          inner.borderLeftColor = this.__colorInnerLeft;
        }
        else
        {
          // Simple CSS value update
          outer.borderLeftWidth = this.__widthLeft || "0px";
          outer.borderLeftStyle = this.getStyleLeft() || "none";
          outer.borderLeftColor = this.__colorLeft || "";

          // Reset inner styles
          if (inner) {
            inner.borderLeftWidth = inner.borderLeftStyle = inner.borderLeftColor = "";
          }
        }
      }
    })
  }
});
