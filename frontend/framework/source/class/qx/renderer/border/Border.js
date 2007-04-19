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
qx.Class.define("qx.renderer.border.Border",
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
     * @return {qx.renderer.border.Border} the created instance
     */
    fromString : function(str)
    {
      var border = new qx.renderer.border.Border;
      var parts = str.split(/\s+/);
      var part, temp;

      for (var i=0; i<parts.length; i++)
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
            temp = parseFloat(part);

            if (temp == part || qx.lang.String.contains(part, "px"))
            {
              border.setWidth(temp);
            }
            else
            {
              border.setColor(part);
            }

            break;
        }
      }

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

    topWidth :
    {
      check : "Number",
      init : 0,
      apply : "_applyTopWidth"
    },

    rightWidth :
    {
      check : "Number",
      init : 0,
      apply : "_applyRightWidth"
    },

    bottomWidth :
    {
      check : "Number",
      init : 0,
      apply : "_applyBottomWidth"
    },

    leftWidth :
    {
      check : "Number",
      init : 0,
      apply : "_applyLeftWidth"
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY: STYLE
    ---------------------------------------------------------------------------
    */

    topStyle :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double", "outset", "inset", "ridge", "groove" ],
      init : "solid",
      apply : "_applyTopStyle"
    },

    rightStyle :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double", "outset", "inset", "ridge", "groove" ],
      init : "solid",
      apply : "_applyRightStyle"
    },

    bottomStyle :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double", "outset", "inset", "ridge", "groove" ],
      init : "solid",
      apply : "_applyBottomStyle"
    },

    leftStyle :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double", "outset", "inset", "ridge", "groove" ],
      init : "solid",
      apply : "_applyLeftStyle"
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY: COLOR
    ---------------------------------------------------------------------------
    */

    topColor :
    {
      nullable : true,
      check : "Color",
      apply : "_applyTopColor"
    },

    rightColor :
    {
      nullable : true,
      check : "Color",
      apply : "_applyRightColor"
    },

    bottomColor :
    {
      nullable : true,
      check : "Color",
      apply : "_applyBottomColor"
    },

    leftColor :
    {
      nullable : true,
      check : "Color",
      apply : "_applyLeftColor"
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY: INNER COLOR
    ---------------------------------------------------------------------------
    */

    topInnerColor :
    {
      nullable : true,
      check : "Color",
      apply : "_applyTopInnerColor"
    },

    rightInnerColor :
    {
      nullable : true,
      check : "Color",
      apply : "_applyRightInnerColor"
    },

    bottomInnerColor :
    {
      nullable : true,
      check : "Color",
      apply : "_applyBottomInnerColor"
    },

    leftInnerColor :
    {
      nullable : true,
      check : "Color",
      apply : "_applyLeftInnerColor"
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY GROUP: EDGE
    ---------------------------------------------------------------------------
    */

    left : {
      group : [ "leftWidth", "leftStyle", "leftColor" ]
    },

    right : {
      group : [ "rightWidth", "rightStyle", "rightColor" ]
    },

    top : {
      group : [ "topWidth", "topStyle", "topColor" ]
    },

    bottom : {
      group : [ "bottomWidth", "bottomStyle", "bottomColor" ]
    },



    /*
    ---------------------------------------------------------------------------
      PROPERTY GROUP: TYPE
    ---------------------------------------------------------------------------
    */

    width :
    {
      group : [ "topWidth", "rightWidth", "bottomWidth", "leftWidth" ],
      mode : "shorthand"
    },

    style :
    {
      group : [ "topStyle", "rightStyle", "bottomStyle", "leftStyle" ],
      mode : "shorthand"
    },

    color :
    {
      group : [ "topColor", "rightColor", "bottomColor", "leftColor" ],
      mode : "shorthand"
    },

    innerColor :
    {
      group : [ "topInnerColor", "rightInnerColor", "bottomInnerColor", "leftInnerColor" ],
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

    _applyTopWidth : function(value, old)
    {
      this._computeUseComplexTop();
      this._informManager("top");
    },

    _applyRightWidth : function(value, old)
    {
      this._computeUseComplexRight();
      this._informManager("right");
    },

    _applyBottomWidth : function(value, old)
    {
      this._computeUseComplexBottom();
      this._informManager("bottom");
    },

    _applyLeftWidth : function(value, old)
    {
      this._computeUseComplexLeft();
      this._informManager("left");
    },

    _applyTopColor : function(value, old) {
      qx.manager.object.ColorManager.getInstance().connect(this, "_changeTopColor", value);
    },

    _applyRightColor : function(value, old) {
      qx.manager.object.ColorManager.getInstance().connect(this, "_changeRightColor", value);
    },

    _applyBottomColor : function(value, old) {
      qx.manager.object.ColorManager.getInstance().connect(this, "_changeBottomColor", value);
    },

    _applyLeftColor : function(value, old) {
      qx.manager.object.ColorManager.getInstance().connect(this, "_changeLeftColor", value);
    },

    _applyTopInnerColor : function(value, old) {
      qx.manager.object.ColorManager.getInstance().connect(this, "_changeTopInnerColor", value);
    },

    _applyRightInnerColor : function(value, old) {
      qx.manager.object.ColorManager.getInstance().connect(this, "_changeRightInnerColor", value);
    },

    _applyBottomInnerColor : function(value, old) {
      qx.manager.object.ColorManager.getInstance().connect(this, "_changeBottomInnerColor", value);
    },

    _applyLeftInnerColor : function(value, old) {
      qx.manager.object.ColorManager.getInstance().connect(this, "_changeLeftInnerColor", value);
    },

    _applyTopStyle : function() {
      this._informManager("top");
    },

    _applyRightStyle : function() {
      this._informManager("right");
    },

    _applyBottomStyle : function() {
      this._informManager("bottom");
    },

    _applyLeftStyle : function() {
      this._informManager("left");
    },






    /*
    ---------------------------------------------------------------------------
      COMPLEX DETECTION AND CACHE
    ---------------------------------------------------------------------------
    */

    _computeUseComplexTop : function() {
      this.__complexTop = this.getTopWidth() === 2 && this.__topInnerColor != null && this.__topColor != this.__topInnerColor;
    },

    _computeUseComplexRight : function() {
      this.__complexRight = this.getRightWidth() === 2 && this.__rightInnerColor != null && this.__rightColor != this.__rightInnerColor;
    },

    _computeUseComplexBottom : function() {
      this.__complexBottom = this.getBottomWidth() === 2 && this.__bottomInnerColor != null && this.__bottomColor != this.__bottomInnerColor;
    },

    _computeUseComplexLeft : function() {
      this.__complexLeft = this.getLeftWidth() === 2 && this.__leftInnerColor != null && this.__leftColor != this.__leftInnerColor;
    },





    /*
    ---------------------------------------------------------------------------
      COLOR MANAGER CONNECTION
    ---------------------------------------------------------------------------
    */

    _changeTopColor : function(value)
    {
      this.__topColor = value;
      this._computeUseComplexTop();
      this._informManager("top");
    },

    _changeTopInnerColor : function(value)
    {
      this.__topInnerColor = value;
      this._computeUseComplexTop();
      this._informManager("top");
    },

    _changeRightColor : function(value)
    {
      this.__rightColor = value;
      this._computeUseComplexRight();
      this._informManager("right");
    },

    _changeRightInnerColor : function(value)
    {
      this.__rightInnerColor = value;
      this._computeUseComplexRight();
      this._informManager("right");
    },

    _changeBottomColor : function(value)
    {
      this.__bottomColor = value;
      this._computeUseComplexBottom();
      this._informManager("bottom");
    },

    _changeBottomInnerColor : function(value)
    {
      this.__bottomInnerColor = value;
      this._computeUseComplexBottom();
      this._informManager("bottom");
    },

    _changeLeftColor : function(value)
    {
      this.__leftColor = value;
      this._computeUseComplexLeft();
      this._informManager("left");
    },

    _changeLeftInnerColor : function(value)
    {
      this.__leftInnerColor = value;
      this._computeUseComplexLeft();
      this._informManager("left");
    },





    /*
    ---------------------------------------------------------------------------
      BORDER MANAGER CONNECTION
    ---------------------------------------------------------------------------
    */

    /**
     * Send information to BorderManager
     *
     * @internal
     * @param edge {String} the edge which was updated
     */
    _informManager : function(edge) {
      qx.manager.object.BorderManager.getInstance().updateBorderAt(this, edge);
    },







    /*
    ---------------------------------------------------------------------------
      APPLY IMPLEMENTATION
    ---------------------------------------------------------------------------
    */


    /**
     * Renders top border for given widget
     *
     * @internal
     * @param obj {qx.ui.core.Widget} the widget which should get the border
     */
    renderTop : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(obj)
      {
        var style = obj._style;

        // Simple width & color update
        style.borderTopWidth = this.getTopWidth() || "0px";
        style.borderTopColor = this.__topColor || "";

        // Complex border handling
        if (this.__complexTop)
        {
          // be sure to use "solid" even if defined different
          // otherwise the browser wins and don't respect the
          // configured color set
          style.borderTopStyle = "solid";

          // Apply geckos's proprietary style
          style.MozBorderTopColors = this.__topColor + " " + this.__topInnerColor;
        }
        else
        {
          // Simple style update
          style.borderTopStyle = this.getTopStyle() || "none";

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
          outer.borderTopColor = this.__topColor;
          inner.borderTopColor = this.__topInnerColor;
        }
        else
        {
          // Simple CSS value update
          outer.borderTopWidth = this.getTopWidth() || "0px";
          outer.borderTopStyle = this.getTopStyle() || "none";
          outer.borderTopColor = this.__topColor || "";

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
     * @internal
     * @param obj {qx.ui.core.Widget} the widget which should get the border
     */
    renderRight : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(obj)
      {
        var style = obj._style;

        // Simple width & color update
        style.borderRightWidth = this.getRightWidth() || "0px";
        style.borderRightColor = this.__rightColor || "";

        // Complex border handling
        if (this.__complexRight)
        {
          // be sure to use "solid" even if defined different
          // otherwise the browser wins and don't respect the
          // configured color set
          style.borderRightStyle = "solid";

          // Apply geckos's proprietary style
          style.MozBorderRightColors = this.__rightColor + " " + this.__rightInnerColor;
        }
        else
        {
          // Simple style update
          style.borderRightStyle = this.getRightStyle() || "none";

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
          outer.borderRightColor = this.__rightColor;
          inner.borderRightColor = this.__rightInnerColor;
        }
        else
        {
          // Simple CSS value update
          outer.borderRightWidth = this.getRightWidth() || "0px";
          outer.borderRightStyle = this.getRightStyle() || "none";
          outer.borderRightColor = this.__rightColor || "";

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
     * @internal
     * @param obj {qx.ui.core.Widget} the widget which should get the border
     */
    renderBottom : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(obj)
      {
        var style = obj._style;

        // Simple width & color update
        style.borderBottomWidth = this.getBottomWidth() || "0px";
        style.borderBottomColor = this.__bottomColor || "";

        // Complex border handling
        if (this.__complexBottom)
        {
          // be sure to use "solid" even if defined different
          // otherwise the browser wins and don't respect the
          // configured color set
          style.borderBottomStyle = "solid";

          // Apply geckos's proprietary style
          style.MozBorderBottomColors = this.__bottomColor + " " + this.__bottomInnerColor;
        }
        else
        {
          // Simple style update
          style.borderBottomStyle = this.getBottomStyle() || "none";

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
          outer.borderBottomColor = this.__bottomColor;
          inner.borderBottomColor = this.__bottomInnerColor;
        }
        else
        {
          // Simple CSS value update
          outer.borderBottomWidth = this.getBottomWidth() || "0px";
          outer.borderBottomStyle = this.getBottomStyle() || "none";
          outer.borderBottomColor = this.__bottomColor || "";

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
     * @param obj {qx.ui.core.Widget} the widget which should get the border
     * @internal
     */
    renderLeft : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(obj)
      {
        var style = obj._style;

        // Simple width & color update
        style.borderLeftWidth = this.getLeftWidth() || "0px";
        style.borderLeftColor = this.__leftColor || "";

        // Complex border handling
        if (this.__complexLeft)
        {
          // be sure to use "solid" even if defined different
          // otherwise the browser wins and don't respect the
          // configured color set
          style.borderLeftStyle = "solid";

          // Apply geckos's proprietary style
          style.MozBorderLeftColors = this.__leftColor + " " + this.__leftInnerColor;
        }
        else
        {
          // Simple style update
          style.borderLeftStyle = this.getLeftStyle() || "none";

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
          outer.borderLeftColor = this.__leftColor;
          inner.borderLeftColor = this.__leftInnerColor;
        }
        else
        {
          // Simple CSS value update
          outer.borderLeftWidth = this.getLeftWidth() || "0px";
          outer.borderLeftStyle = this.getLeftStyle() || "none";
          outer.borderLeftColor = this.__leftColor || "";

          // Reset inner styles
          if (inner) {
            inner.borderLeftWidth = inner.borderLeftStyle = inner.borderLeftColor = "";
          }
        }
      }
    })
  }
});
