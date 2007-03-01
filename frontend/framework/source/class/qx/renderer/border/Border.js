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

  construct : function(vWidth, vStyle, vColor)
  {
    this.base(arguments);

    this._themedEdges = {};
    this._initCache();

    if (vWidth != null)
    {
      this.setWidth(vWidth);

      if (vStyle != null) {
        this.setStyle(vStyle);
      }

      if (vColor != null) {
        this.setColor(vColor);
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
      var vBorder = new qx.renderer.border.Border;
      var vAllParts = vDefString.split(/\s+/);
      var vPart, vTemp;

      for (var i=0; i<vAllParts.length; i++)
      {
        switch(vPart = vAllParts[i])
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
            vBorder.setStyle(vPart);
            break;

          default:
            vTemp = parseFloat(vPart);

            if (vTemp == vPart || qx.lang.String.contains(vPart, "px")) {
              vBorder.setWidth(vTemp);
            }
            else
            {
              vPart = vPart.toLowerCase();
              vBorder.setColor(new qx.renderer.color.Color(vPart));
            }

            break;
        }
      }

      return vBorder;
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
     * @param o {var} TODOC
     * @return {void}
     */
    resetBorderX : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(o)
      {
        var s = o._style;
        s.borderLeft = s.borderRight = s.MozBorderLeftColors = s.MozBorderRightColors = "";
      },

      "default" : function(o)
      {
        var s = o._style;
        s.borderLeft = s.borderRight = "0px none";

        s = o._borderStyle;

        if (s) {
          s.borderLeft = s.borderRight = "0px none";
        }
      }
    }),


    /**
     * TODOC
     *
     * @type static
     * @param o {var} TODOC
     * @return {void}
     */
    resetBorderY : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(o)
      {
        var s = o._style;
        s.borderTop = s.borderBottom = s.MozBorderTopColors = s.MozBorderBottomColors = "";
      },

      "default" : function(o)
      {
        var s = o._style;
        s.borderTop = s.borderBottom = "0px none";

        s = o._borderStyle;

        if (s) {
          s.borderTop = s.borderBottom = "0px none";
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
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    topWidth :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 0,
      impl         : "borderTopProperty"
    },

    rightWidth :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 0,
      impl         : "borderRightProperty"
    },

    bottomWidth :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 0,
      impl         : "borderBottomProperty"
    },

    leftWidth :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 0,
      impl         : "borderLeftProperty"
    },

    topStyle :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "none",
      impl         : "borderTopProperty"
    },

    rightStyle :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "none",
      impl         : "borderRightProperty"
    },

    bottomStyle :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "none",
      impl         : "borderBottomProperty"
    },

    leftStyle :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "none",
      impl         : "borderLeftProperty"
    },

    topColor :
    {
      _legacy  : true,
      impl     : "borderTopProperty",
      type     : "object",
      instance : "qx.renderer.color.Color",
      convert  : qx.renderer.color.ColorCache.convert
    },

    rightColor :
    {
      _legacy  : true,
      impl     : "borderRightProperty",
      type     : "object",
      instance : "qx.renderer.color.Color",
      convert  : qx.renderer.color.ColorCache.convert
    },

    bottomColor :
    {
      _legacy  : true,
      impl     : "borderBottomProperty",
      type     : "object",
      instance : "qx.renderer.color.Color",
      convert  : qx.renderer.color.ColorCache.convert
    },

    leftColor :
    {
      _legacy  : true,
      impl     : "borderLeftProperty",
      type     : "object",
      instance : "qx.renderer.color.Color",
      convert  : qx.renderer.color.ColorCache.convert
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

    addListenerWidget : qx.lang.Function.returnTrue,
    removeListenerWidget : qx.lang.Function.returnTrue,

    _sync : qx.lang.Function.returnTrue,




    /*
    ---------------------------------------------------------------------------
      COMBINED SETTERS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vWidth {var} TODOC
     * @return {Boolean} TODOC
     */
    setWidth : function(vWidth)
    {
      this.setTopWidth(vWidth);
      this.setRightWidth(vWidth);
      this.setBottomWidth(vWidth);
      this.setLeftWidth(vWidth);

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vStyle {var} TODOC
     * @return {Boolean} TODOC
     */
    setStyle : function(vStyle)
    {
      this.setTopStyle(vStyle);
      this.setRightStyle(vStyle);
      this.setBottomStyle(vStyle);
      this.setLeftStyle(vStyle);

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vColor {var} TODOC
     * @return {Boolean} TODOC
     */
    setColor : function(vColor)
    {
      this.setTopColor(vColor);
      this.setRightColor(vColor);
      this.setBottomColor(vColor);
      this.setLeftColor(vColor);

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vWidth {var} TODOC
     * @param vStyle {var} TODOC
     * @param vColor {var} TODOC
     * @return {Boolean} TODOC
     */
    setTop : function(vWidth, vStyle, vColor)
    {
      this.setTopWidth(vWidth);
      this.setTopStyle(vStyle);
      this.setTopColor(vColor);

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vWidth {var} TODOC
     * @param vStyle {var} TODOC
     * @param vColor {var} TODOC
     * @return {Boolean} TODOC
     */
    setRight : function(vWidth, vStyle, vColor)
    {
      this.setRightWidth(vWidth);
      this.setRightStyle(vStyle);
      this.setRightColor(vColor);

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vWidth {var} TODOC
     * @param vStyle {var} TODOC
     * @param vColor {var} TODOC
     * @return {Boolean} TODOC
     */
    setBottom : function(vWidth, vStyle, vColor)
    {
      this.setBottomWidth(vWidth);
      this.setBottomStyle(vStyle);
      this.setBottomColor(vColor);

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vWidth {var} TODOC
     * @param vStyle {var} TODOC
     * @param vColor {var} TODOC
     * @return {Boolean} TODOC
     */
    setLeft : function(vWidth, vStyle, vColor)
    {
      this.setLeftWidth(vWidth);
      this.setLeftStyle(vStyle);
      this.setLeftColor(vColor);

      return true;
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




    /*
    ---------------------------------------------------------------------------
      BORDER MODIFIER AND SYNCER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vProp {var} TODOC
     * @return {void}
     */
    _addToThemed3DColors : function(vProp)
    {
      var needRegistering = qx.lang.Object.isEmpty(this._themedEdges);

      this._themedEdges[vProp] = true;

      if (needRegistering)
      {
        (new qx.renderer.color.ColorObject("ThreeDDarkShadow")).add(this);
        (new qx.renderer.color.ColorObject("ThreeDShadow")).add(this);
        (new qx.renderer.color.ColorObject("ThreeDLightShadow")).add(this);
        (new qx.renderer.color.ColorObject("ThreeDHighlight")).add(this);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vProp {var} TODOC
     * @return {void}
     */
    _removeFromThemed3DColors : function(vProp)
    {
      delete this._themedEdges[vProp];

      if (qx.lang.Object.isEmpty(this._themedEdges))
      {
        (new qx.renderer.color.ColorObject("ThreeDDarkShadow")).remove(this);
        (new qx.renderer.color.ColorObject("ThreeDShadow")).remove(this);
        (new qx.renderer.color.ColorObject("ThreeDLightShadow")).remove(this);
        (new qx.renderer.color.ColorObject("ThreeDHighlight")).remove(this);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vWidth {var} TODOC
     * @param vStyle {var} TODOC
     * @param vColor {var} TODOC
     * @return {string | var} TODOC
     */
    _generateDefString : function(vWidth, vStyle, vColor)
    {
      if (typeof vWidth !== "number" || vWidth < 0) {
        return "";
      }

      var vArr = [ vWidth + "px" ];

      if (vStyle != null) {
        vArr.push(vStyle);
      }

      if (vColor instanceof qx.renderer.color.Color) {
        vColor = vColor.getStyle();
      }

      if (vColor != null) {
        vArr.push(vColor);
      }

      return vArr.join(" ");
    },

    // TODO: Add more smartness ;)
    // Only update the border edges which depends on this color object
    /**
     * TODOC
     *
     * @type member
     * @param vColorObject {var} TODOC
     * @param vNewValue {var} TODOC
     * @return {void}
     */
    _updateColors : function(vColorObject, vNewValue)
    {
      this._needsCompilationTop = true;
      this._needsCompilationRight = true;
      this._needsCompilationBottom = true;
      this._needsCompilationLeft = true;

      this._sync("top");
      this._sync("right");
      this._sync("bottom");
      this._sync("left");
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {void}
     */
    _handleColorRegistration : function(propValue, propOldValue, propData)
    {
      if (qx.lang.String.contains(propData.name, "Style"))
      {
        switch(propValue)
        {
          case "outset":
          case "inset":
          case "groove":
          case "ridge":
            this._addToThemed3DColors(propData.name);
            break;

          default:
            this._removeFromThemed3DColors(propData.name);
        }
      }

      if (qx.lang.String.contains(propData.name, "Color"))
      {
        if (propOldValue instanceof qx.renderer.color.ColorObject)
        {
          // detect if there are no other deps anymore
          switch(propOldValue)
          {
            case this.getTopColor():
            case this.getRightColor():
            case this.getBottomColor():
            case this.getLeftColor():
              break;

            default:
              propOldValue.remove(this);
          }
        }

        if (propValue instanceof qx.renderer.color.ColorObject)
        {
          // simply add, internal storage is a hash key so
          // this is not a problem also if this is already
          // registered there.
          propValue.add(this);
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyBorderTopProperty : function(propValue, propOldValue, propData)
    {
      this._handleColorRegistration(propValue, propOldValue, propData);

      this._needsCompilationTop = true;
      this._useEnhancedCrossBrowserMode = null;

      this._sync("top");

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyBorderRightProperty : function(propValue, propOldValue, propData)
    {
      this._handleColorRegistration(propValue, propOldValue, propData);

      this._needsCompilationRight = true;
      this._useEnhancedCrossBrowserMode = null;

      this._sync("right");

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyBorderBottomProperty : function(propValue, propOldValue, propData)
    {
      this._handleColorRegistration(propValue, propOldValue, propData);

      this._needsCompilationBottom = true;
      this._useEnhancedCrossBrowserMode = null;

      this._sync("bottom");

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyBorderLeftProperty : function(propValue, propOldValue, propData)
    {
      this._handleColorRegistration(propValue, propOldValue, propData);

      this._needsCompilationLeft = true;
      this._useEnhancedCrossBrowserMode = null;

      this._sync("left");

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getUseEnhancedCrossBrowserMode : function()
    {
      if (this._useEnhancedCrossBrowserMode == null) {
        this._useEnhancedCrossBrowserMode = this._evalUseEnhancedCrossBrowserMode();
      }

      return this._useEnhancedCrossBrowserMode;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {Boolean} TODOC
     */
    _evalUseEnhancedCrossBrowserMode : function()
    {
      if (this.getTopWidth() == 2)
      {
        switch(this.getTopStyle())
        {
          case "outset":
          case "inset":
          case "groove":
          case "ridge":
            return true;
        }
      }

      if (this.getRightWidth() == 2)
      {
        switch(this.getRightStyle())
        {
          case "outset":
          case "inset":
          case "groove":
          case "ridge":
            return true;
        }
      }

      if (this.getBottomWidth() == 2)
      {
        switch(this.getBottomStyle())
        {
          case "outset":
          case "inset":
          case "groove":
          case "ridge":
            return true;
        }
      }

      if (this.getLeftWidth() == 2)
      {
        switch(this.getLeftStyle())
        {
          case "outset":
          case "inset":
          case "groove":
          case "ridge":
            return true;
        }
      }

      return false;
    },




    /*
    ---------------------------------------------------------------------------
      BORDER APPLY IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param o {Object} TODOC
     * @return {void}
     */
    _applyWidget : function(o)
    {
      this.applyWidgetX(o);
      this.applyWidgetY(o);
    },


    /**
     * TODOC
     *
     * @type member
     * @param o {Object} TODOC
     * @return {void}
     */
    _resetWidget : function(o)
    {
      this._resetWidgetX(o);
      this._resetWidgetY(o);
    },


    /**
     * TODOC
     *
     * @type member
     * @param o {Object} TODOC
     * @return {var} TODOC
     */
    _resetWidgetX : function(o) {
      return qx.renderer.border.Border.resetBorderX(o);
    },


    /**
     * TODOC
     *
     * @type member
     * @param o {Object} TODOC
     * @return {var} TODOC
     */
    _resetWidgetY : function(o) {
      return qx.renderer.border.Border.resetBorderY(o);
    },


    /**
     * TODOC
     *
     * @type member
     * @param vObject {var} TODOC
     * @return {void}
     */
    applyWidgetXCommon : function(vObject)
    {
      if (this._needsCompilationLeft) {
        this._compileLeft();
      }

      if (this._needsCompilationRight) {
        this._compileRight();
      }

      for (var i in this._defsX) {
        vObject._style[i] = this._defsX[i];
      }

      if (qx.core.Variant.isSet("qx.client", "gecko")) { /* empty */ } else
      {
        if (this.getUseEnhancedCrossBrowserMode()) {
          vObject._createElementForEnhancedBorder();
        }

        if (vObject._borderStyle)
        {
          for (var i in this._enhancedDefsX) {
            vObject._borderStyle[i] = this._enhancedDefsX[i];
          }
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vObject {var} TODOC
     * @return {void}
     */
    applyWidgetYCommon : function(vObject)
    {
      if (this._needsCompilationTop) {
        this._compileTop();
      }

      if (this._needsCompilationBottom) {
        this._compileBottom();
      }

      for (var i in this._defsY) {
        vObject._style[i] = this._defsY[i];
      }

      if (qx.core.Variant.isSet("qx.client", "gecko")) { /* empty */ } else
      {
        if (this.getUseEnhancedCrossBrowserMode()) {
          vObject._createElementForEnhancedBorder();
        }

        if (vObject._borderStyle)
        {
          for (var i in this._enhancedDefsY) {
            vObject._borderStyle[i] = this._enhancedDefsY[i];
          }
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vObject {var} TODOC
     * @return {void}
     */
    applyWidgetX : qx.core.Variant.select("qx.client",
    {
      //alias will be set in defer
      "gecko" : null,

      "default" : function(vObject)
      {
        this.applyWidgetXCommon(vObject);

        if (this.getUseEnhancedCrossBrowserMode()) {
          vObject._createElementForEnhancedBorder();
        }

        if (vObject._borderStyle)
        {
          for (var i in this._enhancedDefsX) {
            vObject._borderStyle[i] = this._enhancedDefsX[i];
          }
        }
      }
    }),


    /**
     * TODOC
     *
     * @type member
     * @param vObject {var} TODOC
     * @return {void}
     */
    applyWidgetY : qx.core.Variant.select("qx.client",
    {
      //alias will be set in defer
      "gecko" : null,

      "default" : function(vObject)
      {
        this.applyWidgetYCommon(vObject);

        if (this.getUseEnhancedCrossBrowserMode()) {
          vObject._createElementForEnhancedBorder();
        }

        if (vObject._borderStyle)
        {
          for (var i in this._enhancedDefsY) {
            vObject._borderStyle[i] = this._enhancedDefsY[i];
          }
        }
      }
    }),


    /**
     * TODOC
     *
     * @type member
     * @param vWidth {var} TODOC
     * @param vStyle {var} TODOC
     * @param vEdge {var} TODOC
     * @return {void}
     */
    _generateMozColorDefString : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(vWidth, vStyle, vEdge)
      {
        try
        {
          try {
            var a = qx.renderer.border.Border.data[vWidth][vStyle][vEdge];
          } catch(ex) {}

          if (typeof a === "object")
          {
            for (var i=0, s=[], l=a.length; i<l; i++) {
              s.push((new qx.renderer.color.ColorObject(a[i]).getStyle()));
            }

            return s.join(" ");
          }
        }
        catch(ex)
        {
          this.error("Failed to generate Mozilla Color Definition Strings", ex);
        }

        return "";
      },

      "default" : function() {}
    }),


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _compileTop : qx.core.Variant.select("qx.client",
    {
      "gecko" :  function()
      {
        var w = this.getTopWidth(), s = this.getTopStyle(), d = this._defsY;

        d.borderTop = this._generateDefString(w, s, this.getTopColor());
        d.MozBorderTopColors = this._generateMozColorDefString(w, s, "top");

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
                vTopColor = (new qx.renderer.color.ColorObject(qx.renderer.border.Border.data[vTopWidth][vTopStyle]["top"][0]));
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
                    vTopColor = (new qx.renderer.color.ColorObject(c[1]));

                    this._enhancedDefsY.borderTop = this._generateDefString(vTopWidth, vTopStyle, vTopColor);

                    vTopColor = (new qx.renderer.color.ColorObject(c[0]));
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
     */
    _compileRight : qx.core.Variant.select("qx.client",
    {
      "gecko" : function()
      {
        var w = this.getRightWidth(), s = this.getRightStyle(), d = this._defsX;

        d.borderRight = this._generateDefString(w, s, this.getRightColor());
        d.MozBorderRightColors = this._generateMozColorDefString(w, s, "right");

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
                vRightColor = (new qx.renderer.color.ColorObject(qx.renderer.border.Border.data[vRightWidth][vRightStyle]["right"][0]));
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
                    vRightColor = (new qx.renderer.color.ColorObject(c[1]));

                    this._enhancedDefsX.borderRight = this._generateDefString(vRightWidth, vRightStyle, vRightColor);

                    vRightColor = (new qx.renderer.color.ColorObject(c[0]));
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
     */
    _compileBottom : qx.core.Variant.select("qx.client",
    {
      "gecko" : function()
      {
        var w = this.getBottomWidth(), s = this.getBottomStyle(), d = this._defsY;

        d.borderBottom = this._generateDefString(w, s, this.getBottomColor());
        d.MozBorderBottomColors = this._generateMozColorDefString(w, s, "bottom");

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
                vBottomColor = (new qx.renderer.color.ColorObject(qx.renderer.border.Border.data[vBottomWidth][vBottomStyle]["bottom"][0]));
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
                    vBottomColor = (new qx.renderer.color.ColorObject(c[1]));

                    this._enhancedDefsY.borderBottom = this._generateDefString(vBottomWidth, vBottomStyle, vBottomColor);

                    vBottomColor = (new qx.renderer.color.ColorObject(c[0]));
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
     */
    _compileLeft : qx.core.Variant.select("qx.client",
    {
      "gecko" : function()
      {
        var w = this.getLeftWidth(), s = this.getLeftStyle(), d = this._defsX;

        d.borderLeft = this._generateDefString(w, s, this.getLeftColor());
        d.MozBorderLeftColors = this._generateMozColorDefString(w, s, "left");

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
                vLeftColor = (new qx.renderer.color.ColorObject(qx.renderer.border.Border.data[vLeftWidth][vLeftStyle]["left"][0]));
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
                    vLeftColor = (new qx.renderer.color.ColorObject(c[1]));

                    this._enhancedDefsX.borderLeft = this._generateDefString(vLeftWidth, vLeftStyle, vLeftColor);

                    vLeftColor = (new qx.renderer.color.ColorObject(c[0]));
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
    }),



    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      if (typeof this._defsX === "object")
      {
        for (var i in this._defsX) {
          delete this._defsX[i];
        }
      }

      delete this._defsX;

      if (typeof this._defsY === "object")
      {
        for (var i in this._defsY) {
          delete this._defsY[i];
        }
      }

      delete this._defsY;

      if (typeof this._enhancedDefsX === "object")
      {
        for (var i in this._enhancedDefsX) {
          delete this._enhancedDefsX[i];
        }
      }

      delete this._enhancedDefsX;

      if (typeof this._enhancedDefsY === "object")
      {
        for (var i in this._enhancedDefsY) {
          delete this._enhancedDefsY[i];
        }
      }

      delete this._enhancedDefsY;

      delete this._themedEdges;

      return this.base(arguments);
    }
  },

  defer : qx.core.Variant.select("qx.client",
  {
    "gecko": function(statics, members)
    {
      // set up alias
      members.applyWidgetX = members.applyWidgetXCommon;
      members.applyWidgetY = members.applyWidgetYCommon;
    },

    "default": function() {
    }
  })

});