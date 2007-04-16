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
      var vBorder = new qx.renderer.border.Border;
      var vAllParts = vDefString.split(/\s+/);
      var vPart, vTemp;

      for (var i=0; i<vAllParts.length; i++)
      {
        vPart = vAllParts[i];

        switch(vPart)
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

            if (vTemp == vPart || qx.lang.String.contains(vPart, "px"))
            {
              vBorder.setWidth(vTemp);
            }
            else
            {
              vBorder.setColor(vPart);
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
     * @signature function(o)
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
     * @signature function(o)
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
     * @param o {Object} TODOC
     * @return {void}
     */
    addListenerWidget : function(o)
    {
      if (!this._dependentObjects) {
        this._dependentObjects = {};
      }

      this._dependentObjects[o.toHashCode()] = o;
    },


    /**
     * TODOC
     *
     * @type member
     * @param o {Object} TODOC
     * @return {void}
     */
    removeListenerWidget : function(o)
    {
      if (this._dependentObjects) {
        delete this._dependentObjects[o.toHashCode()];
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vEdge {var} TODOC
     * @return {void}
     */
    _sync : function(vEdge)
    {
      var vAll = this._dependentObjects;

      if (!vAll) {
        return;
      }

      var vCurrent;

      for (vKey in vAll)
      {
        vCurrent = vAll[vKey];

        if (vCurrent.isCreated()) {
          vCurrent._updateBorder(vEdge);
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

      if (vColor != null) {
        vArr.push(vColor);
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
     * @signature function(vObject)
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
     * @signature function(vObject)
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
     * @signature function(vWidth, vStyle, vEdge)
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
            var mgr = qx.manager.object.ColorManager.getInstance();

            for (var i=0, s=[], l=a.length; i<l; i++) {
              s.push(mgr.getThemedColorRGB(a[i]));
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
     * @signature function()
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

  defer : qx.core.Variant.select("qx.client",
  {
    "default" : function() {},
    "gecko" : function(statics, members)
    {
      // set up alias
      members.applyWidgetX = members.applyWidgetXCommon;
      members.applyWidgetY = members.applyWidgetYCommon;
    }
  }),




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_defsX", "_defsY", "_enhancedDefsX", "_enhancedDefsY", "_themedEdges");
  }
});
