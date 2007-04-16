/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project'style top-level directory for details.

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

  construct : function(width, style, color)
  {
    this.base(arguments);

    this._themedEdges = {};
    this._initCache();

    if (width != null)
    {
      this.setWidth(width);

      if (style != null) {
        this.setStyle(style);
      }

      if (color != null) {
        this.setColor(color);
      }
    }
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    nativeStyles :
    {
      "groove" : 1,
      "ridge" : 1,
      "inset" : 1,
      "outset" : 1,
      "solid" : 1,
      "dotted" : 1,
      "dashed" : 1,
      "double" : 1,
      "none" : 1
    },

    themedStyles :
    {
      "outset" : 1,
      "inset" : 1,
      "groove" : 1,
      "ridge" : 1
    },



    /*
    ---------------------------------------------------------------------------
      UTILITY
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type static
     * @param vDefString {var} TODOC
     * @return {var} TODOC
     */
    fromString : function(vDefString)
    {
      var border = new qx.renderer.border.Border;
      var parts = vDefString.split(/\style+/);
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


    data :
    {
      1 :
      {
        outset :
        {
          top    : [ "threedhighlight" ],
          right  : [ "threedshadow" ],
          bottom : [ "threedshadow" ],
          left   : [ "threedhighlight" ]
        },

        inset :
        {
          top    : [ "threedshadow" ],
          right  : [ "threedhighlight" ],
          bottom : [ "threedhighlight" ],
          left   : [ "threedshadow" ]
        }
      },

      2 :
      {
        outset :
        {
          top    : [ "threedlightshadow", "threedhighlight" ],
          right  : [ "threeddarkshadow", "threedshadow" ],
          bottom : [ "threeddarkshadow", "threedshadow" ],
          left   : [ "threedlightshadow", "threedhighlight" ]
        },

        inset :
        {
          top    : [ "threedshadow", "threeddarkshadow" ],
          right  : [ "threedhighlight", "threedlightshadow" ],
          bottom : [ "threedhighlight", "threedlightshadow" ],
          left   : [ "threedshadow", "threeddarkshadow" ]
        },

        ridge :
        {
          top    : [ "threedhighlight", "threedshadow" ],
          right  : [ "threedshadow", "threedhighlight" ],
          bottom : [ "threedshadow", "threedhighlight" ],
          left   : [ "threedhighlight", "threedshadow" ]
        },

        groove :
        {
          top    : [ "threedshadow", "threedhighlight" ],
          right  : [ "threedhighlight", "threedshadow" ],
          bottom : [ "threedhighlight", "threedshadow" ],
          left   : [ "threedshadow", "threedhighlight" ]
        }
      }
    },


    /**
     * TODOC
     *
     * @type static
     * @param obj {var} TODOC
     * @return {void}
     * @signature function(obj)
     */
    resetBorderX : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(obj)
      {
        var style = obj._style;
        style.borderLeft = style.borderRight = style.MozBorderLeftColors = style.MozBorderRightColors = "";
      },

      "default" : function(obj)
      {
        var style = obj._style;
        style.borderLeft = style.borderRight = "0px none";

        style = obj._innerStyle;
        if (style) {
          style.borderLeft = style.borderRight = "0px none";
        }
      }
    }),


    /**
     * TODOC
     *
     * @type static
     * @param obj {var} TODOC
     * @return {void}
     * @signature function(obj)
     */
    resetBorderY : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(obj)
      {
        var style = obj._style;
        style.borderTop = style.borderBottom = style.MozBorderTopColors = style.MozBorderBottomColors = "";
      },

      "default" : function(obj)
      {
        var style = obj._style;
        style.borderTop = style.borderBottom = "0px none";

        style = obj._innerStyle;
        if (style) {
          style.borderTop = style.borderBottom = "0px none";
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




    topStyle :
    {
      nullable : true,
      apply : "_applyTopStyle"
    },

    rightStyle :
    {
      nullable : true,
      apply : "_applyRightStyle"
    },

    bottomStyle :
    {
      nullable : true,
      apply : "_applyBottomStyle"
    },

    leftStyle :
    {
      nullable : true,
      apply : "_applyLeftStyle"
    },





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




    width : {
      group : [ "topWidth", "rightWidth", "bottomWidth", "leftWidth" ],
      mode : "shorthand"
    },

    style : {
      group : [ "topStyle", "rightStyle", "bottomStyle", "leftStyle" ],
      mode : "shorthand"
    },

    color : {
      group : [ "topColor", "rightColor", "bottomColor", "leftColor" ],
      mode : "shorthand"
    },

    innerColor : {
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
    _needsCompilationTop : true,
    _needsCompilationRight : true,
    _needsCompilationBottom : true,
    _needsCompilationLeft : true,




    /*
    ---------------------------------------------------------------------------
      COMPATIBILITY TO qx.renderer.border.BorderOBJECT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param obj {Object} TODOC
     * @return {void}
     */
    addListenerWidget : function(obj)
    {
      if (!this._dependentObjects) {
        this._dependentObjects = {};
      }

      this._dependentObjects[obj.toHashCode()] = obj;
    },


    /**
     * TODOC
     *
     * @type member
     * @param obj {Object} TODOC
     * @return {void}
     */
    removeListenerWidget : function(obj)
    {
      if (this._dependentObjects) {
        delete this._dependentObjects[obj.toHashCode()];
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param edge {var} TODOC
     * @return {void}
     */
    _sync : function(edge)
    {
      var deps = this._dependentObjects;

      if (!deps) {
        return;
      }

      var current;

      for (key in deps)
      {
        current = deps[key];

        if (current.isCreated()) {
          current._updateBorder(edge);
        }
      }
    },






    /*
    ---------------------------------------------------------------------------
      INITIALISATION OF CACHE
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     * @signature function()
     */
    _initCache : qx.core.Variant.select("qx.client",
    {
      "gecko" : function()
      {
        this._defsX =
        {
          borderLeft           : "",
          borderRight          : "",
          MozBorderLeftColors  : "",
          MozBorderRightColors : ""
        };

        this._defsY =
        {
          borderTop             : "",
          borderBottom          : "",
          MozBorderTopColors    : "",
          MozBorderBottomColors : ""
        };
      },

      "default" : function()
      {
        this._defsX =
        {
          borderLeft  : "",
          borderRight : ""
        };

        this._defsY =
        {
          borderTop    : "",
          borderBottom : ""
        };

        this._enhancedDefsX =
        {
          borderLeft  : "",
          borderRight : ""
        };

        this._enhancedDefsY =
        {
          borderTop    : "",
          borderBottom : ""
        };
      }
    }),

    /**
     * TODOC
     *
     * @type member
     * @param width {var} TODOC
     * @param style {var} TODOC
     * @param color {var} TODOC
     * @return {string | var} TODOC
     */
    _generateDefString : function(width, style, color)
    {
      if (typeof width !== "number" || width < 0) {
        return "";
      }

      var vArr = [ width + "px" ];

      if (style != null) {
        vArr.push(style);
      }

      if (color != null) {
        vArr.push(color);
      }

      return vArr.join(" ");
    },






    /*
    ---------------------------------------------------------------------------
      MODIFIER
    ---------------------------------------------------------------------------
    */

    _applyTopWidth : function(value, old) {
      this._updateTop();
    },

    _applyRightWidth : function(value, old) {
      this._updateRight();
    },

    _applyBottomWidth : function(value, old) {
      this._updateBottom();
    },

    _applyLeftWidth : function(value, old) {
      this._updateLeft();
    },

    _applyTopColor : function(value, old) {
      qx.manager.object.ColorManager.getInstance().process(this, "_updateTop", value);
    },

    _applyRightColor : function(value, old) {
      qx.manager.object.ColorManager.getInstance().process(this, "_updateRight", value);
    },

    _applyBottomColor : function(value, old) {
      qx.manager.object.ColorManager.getInstance().process(this, "_updateBottom", value);
    },

    _applyLeftColor : function(value, old) {
      qx.manager.object.ColorManager.getInstance().process(this, "_updateLeft", value);
    },

    _applyTopInnerColor : function(value, old) {
      qx.manager.object.ColorManager.getInstance().process(this, "_updateTop", value);
    },

    _applyRightInnerColor : function(value, old) {
      qx.manager.object.ColorManager.getInstance().process(this, "_updateRight", value);
    },

    _applyBottomInnerColor : function(value, old) {
      qx.manager.object.ColorManager.getInstance().process(this, "_updateBottom", value);
    },

    _applyLeftInnerColor : function(value, old) {
      qx.manager.object.ColorManager.getInstance().process(this, "_updateLeft", value);
    },

    _applyTopStyle : function() {
      this._updateTop();
    },

    _applyRightStyle : function() {
      this._updateRight();
    },

    _applyBottomStyle : function() {
      this._updateBottom();
    },

    _applyLeftStyle : function() {
      this._updateLeft();
    },





    /*
    ---------------------------------------------------------------------------
      UPDATE ROUTINES
    ---------------------------------------------------------------------------
    */

    _updateTop : function()
    {
      this._needsCompilationTop = true;
      this._sync("top");
    },

    _updateRight : function()
    {
      this._needsCompilationRight = true;
      this._sync("right");
    },

    _updateBottom : function()
    {
      this._needsCompilationBottom = true;
      this._sync("bottom");
    },

    _updateLeft : function()
    {
      this._needsCompilationLeft = true;
      this._sync("left");
    },

















    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getUseEnhancedCrossBrowserMode : function() {
      return this.getTopInnerColor() || this.getRightInnerColor() || this.getLeftInnerColor() || this.getBottomInnerColor();
    },







    /*
    ---------------------------------------------------------------------------
      APPLY/RESET IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param obj {Object} TODOC
     * @return {void}
     */
    _applyWidget : function(obj)
    {
      this.applyWidgetX(obj);
      this.applyWidgetY(obj);
    },


    /**
     * TODOC
     *
     * @type member
     * @param obj {Object} TODOC
     * @return {void}
     */
    _resetWidget : function(obj)
    {
      this._resetWidgetX(obj);
      this._resetWidgetY(obj);
    },


    /**
     * TODOC
     *
     * @type member
     * @param obj {Object} TODOC
     * @return {var} TODOC
     */
    _resetWidgetX : function(obj) {
      return qx.renderer.border.Border.resetBorderX(obj);
    },


    /**
     * TODOC
     *
     * @type member
     * @param obj {Object} TODOC
     * @return {var} TODOC
     */
    _resetWidgetY : function(obj) {
      return qx.renderer.border.Border.resetBorderY(obj);
    },


    /**
     * TODOC
     *
     * @type member
     * @param obj {var} TODOC
     * @return {void}
     */
    applyWidgetX : function(obj)
    {
      if (this._needsCompilationLeft) {
        this._compileLeft();
      }

      if (this._needsCompilationRight) {
        this._compileRight();
      }

      for (var i in this._defsX) {
        obj._style[i] = this._defsX[i];
      }

      if (qx.core.Variant.isSet("qx.client", "gecko")) { /* empty */ } else
      {
        if (this.getUseEnhancedCrossBrowserMode()) {
          obj._createElementForEnhancedBorder();
        }

        if (obj._innerStyle)
        {
          for (var i in this._enhancedDefsX) {
            obj._innerStyle[i] = this._enhancedDefsX[i];
          }
        }
      }

      if (qx.core.Variant.isSet("qx.client", "mshtml|opera|webkit"))
      {
        if (this.getUseEnhancedCrossBrowserMode()) {
          obj._createElementForEnhancedBorder();
        }

        if (obj._innerStyle)
        {
          for (var i in this._enhancedDefsX) {
            obj._innerStyle[i] = this._enhancedDefsX[i];
          }
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param obj {var} TODOC
     * @return {void}
     */
    applyWidgetY : function(obj)
    {
      if (this._needsCompilationTop) {
        this._compileTop();
      }

      if (this._needsCompilationBottom) {
        this._compileBottom();
      }

      for (var i in this._defsY) {
        obj._style[i] = this._defsY[i];
      }

      if (qx.core.Variant.isSet("qx.client", "gecko")) { /* empty */ } else
      {
        if (this.getUseEnhancedCrossBrowserMode()) {
          obj._createElementForEnhancedBorder();
        }

        if (obj._innerStyle)
        {
          for (var i in this._enhancedDefsY) {
            obj._innerStyle[i] = this._enhancedDefsY[i];
          }
        }
      }

      if (qx.core.Variant.isSet("qx.client", "mshtml|opera|webkit"))
      {
        if (this.getUseEnhancedCrossBrowserMode()) {
          obj._createElementForEnhancedBorder();
        }

        if (obj._innerStyle)
        {
          for (var i in this._enhancedDefsY) {
            obj._innerStyle[i] = this._enhancedDefsY[i];
          }
        }
      }
    },





    /**
     * TODOC
     *
     * @type member
     * @return {void}
     * @signature function()
     */
    _compileTop : qx.core.Variant.select("qx.client",
    {
      "gecko" :  function()
      {
        var width = this.getTopWidth(), style = this.getTopStyle(), def = this._defsY;

        def.borderTop = this._generateDefString(width, style, this.getTopColor());

        if (this.getTopInnerColor()) {
          def.MozBorderTopColors += this.getTopColor() + " " + this.getTopInnerColor();
        } else {
          def.MozBorderTopColors = null;
        }

        this._needsCompilationTop = false;
      },

      "default" : function()
      {
        var vTopWidth = this.getTopWidth();
        var vTopStyle = this.getTopStyle();
        var vTopColor = this.getTopColor();

        switch(vTopWidth)
        {
          case 1:
            switch(vTopStyle)
            {
              case "outset":
              case "inset":
                vTopColor = qx.renderer.border.Border.data[vTopWidth][vTopStyle]["top"][0];
                vTopStyle = "solid";
            }

            break;

          case 2:
            switch(vTopStyle)
            {
              case "outset":
              case "inset":
              case "groove":
              case "ridge":
                try
                {
                  var c = qx.renderer.border.Border.data[vTopWidth][vTopStyle]["top"];

                  if (typeof c === "object")
                  {
                    vTopStyle = "solid";
                    vTopWidth = 1;
                    vTopColor = c[1];

                    this._enhancedDefsY.borderTop = this._generateDefString(vTopWidth, vTopStyle, vTopColor);

                    vTopColor = c[0];
                  }
                }
                catch(ex)
                {
                  this.error("Failed to compile top border", ex);
                  this.warn("Details: Width=" + vTopWidth + ", Style=" + vTopStyle);
                }
            }

            break;
        }

        this._defsY.borderTop = this._generateDefString(vTopWidth, vTopStyle, vTopColor);
        this._needsCompilationTop = false;
      }
    }),


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     * @signature function()
     */
    _compileRight : qx.core.Variant.select("qx.client",
    {
      "gecko" : function()
      {
        var width = this.getRightWidth(), style = this.getRightStyle(), def = this._defsX;

        def.borderRight = this._generateDefString(width, style, this.getRightColor());

        if (this.getRightInnerColor()) {
          def.MozBorderRightColors += this.getRightColor() + " " + this.getRightInnerColor();
        } else {
          def.MozBorderRightColors = null;
        }

        this._needsCompilationRight = false;
      },

      "default" : function()
      {
        var vRightWidth = this.getRightWidth();
        var vRightStyle = this.getRightStyle();
        var vRightColor = this.getRightColor();

        switch(vRightWidth)
        {
          case 1:
            switch(vRightStyle)
            {
              case "outset":
              case "inset":
                vRightColor = qx.renderer.border.Border.data[vRightWidth][vRightStyle]["right"][0];
                vRightStyle = "solid";
            }

            break;

          case 2:
            switch(vRightStyle)
            {
              case "outset":
              case "inset":
              case "groove":
              case "ridge":
                try
                {
                  var c = qx.renderer.border.Border.data[vRightWidth][vRightStyle]["right"];

                  if (typeof c === "object")
                  {
                    vRightStyle = "solid";
                    vRightWidth = 1;
                    vRightColor = c[1];

                    this._enhancedDefsX.borderRight = this._generateDefString(vRightWidth, vRightStyle, vRightColor);

                    vRightColor = c[0];
                  }
                }
                catch(ex)
                {
                  this.error("Failed to compile right border", ex);
                  this.warn("Details: Width=" + vRightWidth + ", Style=" + vRightStyle);
                }
            }

            break;
        }

        this._defsX.borderRight = this._generateDefString(vRightWidth, vRightStyle, vRightColor);
        this._needsCompilationRight = false;
      }
    }),


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     * @signature function()
     */
    _compileBottom : qx.core.Variant.select("qx.client",
    {
      "gecko" : function()
      {
        var width = this.getBottomWidth(), style = this.getBottomStyle(), def = this._defsY;

        def.borderBottom = this._generateDefString(width, style, this.getBottomColor());

        if (this.getBottomInnerColor()) {
          def.MozBorderBottomColors += this.getBottomColor() + " " + this.getBottomInnerColor();
        } else {
          def.MozBorderBottomColors = null;
        }

        this._needsCompilationBottom = false;
      },

      "default" : function()
      {
        var vBottomWidth = this.getBottomWidth();
        var vBottomStyle = this.getBottomStyle();
        var vBottomColor = this.getBottomColor();

        switch(vBottomWidth)
        {
          case 1:
            switch(vBottomStyle)
            {
              case "outset":
              case "inset":
                vBottomColor = qx.renderer.border.Border.data[vBottomWidth][vBottomStyle]["bottom"][0];
                vBottomStyle = "solid";
            }

            break;

          case 2:
            switch(vBottomStyle)
            {
              case "outset":
              case "inset":
              case "groove":
              case "ridge":
                try
                {
                  var c = qx.renderer.border.Border.data[vBottomWidth][vBottomStyle]["bottom"];

                  if (typeof c === "object")
                  {
                    vBottomStyle = "solid";
                    vBottomWidth = 1;
                    vBottomColor = c[1];

                    this._enhancedDefsY.borderBottom = this._generateDefString(vBottomWidth, vBottomStyle, vBottomColor);

                    vBottomColor = c[0];
                  }
                }
                catch(ex)
                {
                  this.error("Failed to compile bottom border", ex);
                  this.warn("Details: Width=" + vBottomWidth + ", Style=" + vBottomStyle);
                }
            }

            break;
        }

        this._defsY.borderBottom = this._generateDefString(vBottomWidth, vBottomStyle, vBottomColor);
        this._needsCompilationBottom = false;
      }
    }),


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     * @signature function()
     */
    _compileLeft : qx.core.Variant.select("qx.client",
    {
      "gecko" : function()
      {
        var width = this.getLeftWidth(), style = this.getLeftStyle(), def = this._defsX;

        def.borderLeft = this._generateDefString(width, style, this.getLeftColor());

        if (this.getLeftInnerColor()) {
          def.MozBorderLeftColors += this.getLeftColor() + " " + this.getLeftInnerColor();
        } else {
          def.MozBorderLeftColors = null;
        }

        this._needsCompilationLeft = false;
      },

      "default" : function()
      {
        var vLeftWidth = this.getLeftWidth();
        var vLeftStyle = this.getLeftStyle();
        var vLeftColor = this.getLeftColor();

        switch(vLeftWidth)
        {
          case 1:
            switch(vLeftStyle)
            {
              case "outset":
              case "inset":
                vLeftColor = qx.renderer.border.Border.data[vLeftWidth][vLeftStyle]["left"][0];
                vLeftStyle = "solid";
            }

            break;

          case 2:
            switch(vLeftStyle)
            {
              case "outset":
              case "inset":
              case "groove":
              case "ridge":
                try
                {
                  var c = qx.renderer.border.Border.data[vLeftWidth][vLeftStyle]["left"];

                  if (typeof c === "object")
                  {
                    vLeftStyle = "solid";
                    vLeftWidth = 1;
                    vLeftColor = c[1];

                    this._enhancedDefsX.borderLeft = this._generateDefString(vLeftWidth, vLeftStyle, vLeftColor);

                    vLeftColor = c[0];
                  }
                }
                catch(ex)
                {
                  this.error("Failed to compile left border", ex);
                  this.warn("Details: Width=" + vLeftWidth + ", Style=" + vLeftStyle);
                }
            }

            break;
        }

        this._defsX.borderLeft = this._generateDefString(vLeftWidth, vLeftStyle, vLeftColor);
        this._needsCompilationLeft = false;
      }
    })
  },






  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_defsX", "_defsY", "_enhancedDefsX", "_enhancedDefsY", "_themedEdges");
  }
});
