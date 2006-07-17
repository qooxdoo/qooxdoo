/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#module(border)
#require(qx.renderer.color.ColorObject)
#require(qx.lang.Object)

************************************************************************ */

/*!
  Border implementation for qx.ui.core.Widget instances.
*/
qx.OO.defineClass("qx.renderer.border.Border", qx.core.Object,
function(vWidth, vStyle, vColor)
{
  qx.core.Object.call(this);

  this._themedEdges = {}
  this._initCache();

  if (qx.util.Validation.isValidNumber(vWidth))
  {
    this.setWidth(vWidth);

    if (qx.util.Validation.isValidString(vStyle)) {
      this.setStyle(vStyle);
    }

    if (qx.util.Validation.isValid(vColor)) {
      this.setColor(vColor);
    }
  }
});

qx.Class.STYLE_GROOVE = "groove";
qx.Class.STYLE_RIDGE = "ridge";
qx.Class.STYLE_INSET = "inset";
qx.Class.STYLE_OUTSET = "outset";
qx.Class.STYLE_SOLID = "solid";
qx.Class.STYLE_DOTTED = "dotted";
qx.Class.STYLE_DASHED = "dashed";
qx.Class.STYLE_DOUBLE = "double";
qx.Class.STYLE_NONE = "none";

qx.Class.POSITION_TOP = "top";
qx.Class.POSITION_RIGHT = "right";
qx.Class.POSITION_BOTTOM = "bottom";
qx.Class.POSITION_LEFT = "left";

qx.Class.enhancedCrossBrowserMode = true;
qx.Class.baseColor = "threedlightshadow";
qx.Class.stylePart = "Style";
qx.Class.colorPart = "Color";

qx.Proto._needsCompilationTop = true;
qx.Proto._needsCompilationRight = true;
qx.Proto._needsCompilationBottom = true;
qx.Proto._needsCompilationLeft = true;




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.addProperty({ name : "topWidth", type : qx.constant.Type.NUMBER, defaultValue : 0, impl : "borderTopProperty" });
qx.OO.addProperty({ name : "rightWidth", type : qx.constant.Type.NUMBER, defaultValue : 0, impl : "borderRightProperty" });
qx.OO.addProperty({ name : "bottomWidth", type : qx.constant.Type.NUMBER, defaultValue : 0, impl : "borderBottomProperty" });
qx.OO.addProperty({ name : "leftWidth", type : qx.constant.Type.NUMBER, defaultValue : 0, impl : "borderLeftProperty" });

qx.OO.addProperty({ name : "topStyle", type : qx.constant.Type.STRING, defaultValue : qx.constant.Core.NONE, impl : "borderTopProperty" });
qx.OO.addProperty({ name : "rightStyle", type : qx.constant.Type.STRING, defaultValue : qx.constant.Core.NONE, impl : "borderRightProperty" });
qx.OO.addProperty({ name : "bottomStyle", type : qx.constant.Type.STRING, defaultValue : qx.constant.Core.NONE, impl : "borderBottomProperty" });
qx.OO.addProperty({ name : "leftStyle", type : qx.constant.Type.STRING, defaultValue : qx.constant.Core.NONE, impl : "borderLeftProperty" });

qx.OO.addProperty({ name : "topColor", impl : "borderTopProperty", type : qx.constant.Type.OBJECT, instance : "qx.renderer.color.Color", convert : qx.renderer.color.ColorCache });
qx.OO.addProperty({ name : "rightColor", impl : "borderRightProperty", type : qx.constant.Type.OBJECT, instance : "qx.renderer.color.Color", convert : qx.renderer.color.ColorCache });
qx.OO.addProperty({ name : "bottomColor", impl : "borderBottomProperty", type : qx.constant.Type.OBJECT, instance : "qx.renderer.color.Color", convert : qx.renderer.color.ColorCache });
qx.OO.addProperty({ name : "leftColor", impl : "borderLeftProperty", type : qx.constant.Type.OBJECT, instance : "qx.renderer.color.Color", convert : qx.renderer.color.ColorCache });




/*
---------------------------------------------------------------------------
  UTILITY
---------------------------------------------------------------------------
*/

qx.renderer.border.Border.fromString = function(vDefString)
{
  var vBorder = new qx.renderer.border.Border;
  var vAllParts = vDefString.split(/\s+/);
  var vPart, vTemp;

  for (var i=0; i<vAllParts.length; i++)
  {
    switch(vPart = vAllParts[i])
    {
      case qx.renderer.border.Border.STYLE_GROOVE:
      case qx.renderer.border.Border.STYLE_RIDGE:
      case qx.renderer.border.Border.STYLE_INSET:
      case qx.renderer.border.Border.STYLE_OUTSET:
      case qx.renderer.border.Border.STYLE_SOLID:
      case qx.renderer.border.Border.STYLE_DOTTED:
      case qx.renderer.border.Border.STYLE_DASHED:
      case qx.renderer.border.Border.STYLE_DOUBLE:
      case qx.renderer.border.Border.STYLE_NONE:
        vBorder.setStyle(vPart);
        break;

      default:
        vTemp = parseFloat(vPart);

        if(vTemp == vPart || qx.lang.String.contains(vPart, qx.constant.Core.PIXEL))
        {
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
}





/*
---------------------------------------------------------------------------
  COMPATIBILITY TO qx.renderer.border.BorderOBJECT
---------------------------------------------------------------------------
*/

qx.Proto.addListenerWidget = qx.util.Return.returnTrue;
qx.Proto.removeListenerWidget = qx.util.Return.returnTrue;

qx.Proto._sync = qx.util.Return.returnTrue;





/*
---------------------------------------------------------------------------
  COMBINED SETTERS
---------------------------------------------------------------------------
*/

qx.Proto.setWidth = function(vWidth)
{
  this.setTopWidth(vWidth);
  this.setRightWidth(vWidth);
  this.setBottomWidth(vWidth);
  this.setLeftWidth(vWidth);

  return true;
}

qx.Proto.setStyle = function(vStyle)
{
  this.setTopStyle(vStyle);
  this.setRightStyle(vStyle);
  this.setBottomStyle(vStyle);
  this.setLeftStyle(vStyle);

  return true;
}

qx.Proto.setColor = function(vColor)
{
  this.setTopColor(vColor);
  this.setRightColor(vColor);
  this.setBottomColor(vColor);
  this.setLeftColor(vColor);

  return true;
}




qx.Proto.setTop = function(vWidth, vStyle, vColor)
{
  this.setTopWidth(vWidth);
  this.setTopStyle(vStyle);
  this.setTopColor(vColor);

  return true;
}

qx.Proto.setRight = function(vWidth, vStyle, vColor)
{
  this.setRightWidth(vWidth);
  this.setRightStyle(vStyle);
  this.setRightColor(vColor);

  return true;
}

qx.Proto.setBottom = function(vWidth, vStyle, vColor)
{
  this.setBottomWidth(vWidth);
  this.setBottomStyle(vStyle);
  this.setBottomColor(vColor);

  return true;
}

qx.Proto.setLeft = function(vWidth, vStyle, vColor)
{
  this.setLeftWidth(vWidth);
  this.setLeftStyle(vStyle);
  this.setLeftColor(vColor);

  return true;
}





/*
---------------------------------------------------------------------------
  INITIALISATION OF CACHE
---------------------------------------------------------------------------
*/


if (qx.sys.Client.isGecko())
{
  qx.Proto._initCache = function()
  {
    this._defsX =
    {
      borderLeft : qx.constant.Core.EMPTY,
      borderRight : qx.constant.Core.EMPTY,

      MozBorderLeftColors : qx.constant.Core.EMPTY,
      MozBorderRightColors : qx.constant.Core.EMPTY
    }

    this._defsY =
    {
      borderTop : qx.constant.Core.EMPTY,
      borderBottom : qx.constant.Core.EMPTY,

      MozBorderTopColors : qx.constant.Core.EMPTY,
      MozBorderBottomColors : qx.constant.Core.EMPTY
    }
  }
}
else
{
  qx.Proto._initCache = function()
  {
    this._defsX =
    {
      borderLeft : qx.constant.Core.EMPTY,
      borderRight : qx.constant.Core.EMPTY
    }

    this._defsY =
    {
      borderTop : qx.constant.Core.EMPTY,
      borderBottom : qx.constant.Core.EMPTY
    }

    if (qx.renderer.border.Border.enhancedCrossBrowserMode)
    {
      this._enhancedDefsX =
      {
        borderLeft : qx.constant.Core.EMPTY,
        borderRight : qx.constant.Core.EMPTY
      }

      this._enhancedDefsY =
      {
        borderTop : qx.constant.Core.EMPTY,
        borderBottom : qx.constant.Core.EMPTY
      }
    }
  }
}


/*
---------------------------------------------------------------------------
  BORDER MODIFIER AND SYNCER
---------------------------------------------------------------------------
*/

if (qx.sys.Client.isGecko() || qx.renderer.border.Border.enhancedCrossBrowserMode)
{
  qx.Proto._addToThemed3DColors = function(vProp)
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
  }

  qx.Proto._removeFromThemed3DColors = function(vProp)
  {
    delete this._themedEdges[vProp];

    if (qx.lang.Object.isEmpty(this._themedEdges))
    {
      (new qx.renderer.color.ColorObject("ThreeDDarkShadow")).remove(this);
      (new qx.renderer.color.ColorObject("ThreeDShadow")).remove(this);
      (new qx.renderer.color.ColorObject("ThreeDLightShadow")).remove(this);
      (new qx.renderer.color.ColorObject("ThreeDHighlight")).remove(this);
    }
  }
}
else
{
  qx.Proto._addToThemed3DColors = function(vProp)
  {
    var needRegistering = qx.lang.Object.isEmpty(this._themedEdges);

    this._themedEdges[vProp] = true;

    if (needRegistering)
    {
      (new qx.renderer.color.ColorObject("ThreeDLightShadow")).add(this);
    }
  }

  qx.Proto._removeFromThemed3DColors = function(vProp)
  {
    delete this._themedEdges[vProp];

    if (qx.lang.Object.isEmpty(this._themedEdges))
    {
      (new qx.renderer.color.ColorObject("ThreeDLightShadow")).remove(this);
    }
  }
}





qx.renderer.border.Border.data =
{
  1 :
  {
    outset :
    {
      top : [ "threedhighlight" ],
      right : [ "threedshadow" ],
      bottom : [ "threedshadow" ],
      left : [ "threedhighlight" ]
    },

    inset :
    {
      top : [ "threedshadow" ],
      right : [ "threedhighlight" ],
      bottom : [ "threedhighlight" ],
      left : [ "threedshadow" ]
    }
  },

  2 :
  {
    outset :
    {
      top : [ "threedlightshadow", "threedhighlight" ],
      right : [ "threeddarkshadow", "threedshadow" ],
      bottom : [ "threeddarkshadow", "threedshadow" ],
      left : [ "threedlightshadow", "threedhighlight" ]
    },

    inset :
    {
      top : [ "threedshadow", "threeddarkshadow" ],
      right : [ "threedhighlight", "threedlightshadow" ],
      bottom : [ "threedhighlight", "threedlightshadow" ],
      left : [ "threedshadow", "threeddarkshadow" ]
    },

    ridge :
    {
      top : [ "threedhighlight", "threedshadow" ],
      right : [ "threedshadow", "threedhighlight" ],
      bottom : [ "threedshadow", "threedhighlight" ],
      left : [ "threedhighlight", "threedshadow" ]
    },

    groove :
    {
      top : [ "threedshadow", "threedhighlight" ],
      right : [ "threedhighlight", "threedshadow" ],
      bottom : [ "threedhighlight", "threedshadow" ],
      left : [ "threedshadow", "threedhighlight" ]
    }
  }
}





qx.Proto._generateDefString = function(vWidth, vStyle, vColor)
{
  if (typeof vWidth !== qx.constant.Type.NUMBER || vWidth < 0) {
    return qx.constant.Core.EMPTY;
  }

  var vArr = [ vWidth + qx.constant.Core.PIXEL ];

  if (qx.util.Validation.isValidString(vStyle)) {
    vArr.push(vStyle);
  }

  if (qx.util.Validation.isValidObject(vColor) && vColor instanceof qx.renderer.color.Color) {
    vColor = vColor.getStyle();
  }

  if (qx.util.Validation.isValidString(vColor)) {
    vArr.push(vColor);
  }

  return vArr.join(qx.constant.Core.SPACE);
}




// TODO: Add more smartness ;)
// Only update the border edges which depends on this color object
qx.Proto._updateColors = function(vColorObject, vNewValue)
{
  this._needsCompilationTop = true;
  this._needsCompilationRight = true;
  this._needsCompilationBottom = true;
  this._needsCompilationLeft = true;

  this._sync(qx.renderer.border.Border.POSITION_TOP);
  this._sync(qx.renderer.border.Border.POSITION_RIGHT);
  this._sync(qx.renderer.border.Border.POSITION_BOTTOM);
  this._sync(qx.renderer.border.Border.POSITION_LEFT);
}







qx.Proto._handleColorRegistration = function(propValue, propOldValue, propData)
{
  if (qx.lang.String.contains(propData.name, qx.renderer.border.Border.stylePart))
  {
    switch(propValue)
    {
      case qx.renderer.border.Border.STYLE_OUTSET:
      case qx.renderer.border.Border.STYLE_INSET:
      case qx.renderer.border.Border.STYLE_GROOVE:
      case qx.renderer.border.Border.STYLE_RIDGE:
        this._addToThemed3DColors(propData.name);
        break;

      default:
        this._removeFromThemed3DColors(propData.name);
    }
  }

  if (qx.lang.String.contains(propData.name, qx.renderer.border.Border.colorPart))
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
}








qx.Proto._modifyBorderTopProperty = function(propValue, propOldValue, propData)
{
  this._handleColorRegistration(propValue, propOldValue, propData);

  this._needsCompilationTop = true;
  this._useEnhancedCrossBrowserMode = null;

  this._sync("top");

  return true;
}

qx.Proto._modifyBorderRightProperty = function(propValue, propOldValue, propData)
{
  this._handleColorRegistration(propValue, propOldValue, propData);

  this._needsCompilationRight = true;
  this._useEnhancedCrossBrowserMode = null;

  this._sync("right");

  return true;
}

qx.Proto._modifyBorderBottomProperty = function(propValue, propOldValue, propData)
{
  this._handleColorRegistration(propValue, propOldValue, propData);

  this._needsCompilationBottom = true;
  this._useEnhancedCrossBrowserMode = null;

  this._sync("bottom");

  return true;
}

qx.Proto._modifyBorderLeftProperty = function(propValue, propOldValue, propData)
{
  this._handleColorRegistration(propValue, propOldValue, propData);

  this._needsCompilationLeft = true;
  this._useEnhancedCrossBrowserMode = null;

  this._sync("left");

  return true;
}









qx.Proto.getUseEnhancedCrossBrowserMode = function()
{
  if (this._useEnhancedCrossBrowserMode == null) {
    this._useEnhancedCrossBrowserMode = this._evalUseEnhancedCrossBrowserMode();
  }

  return this._useEnhancedCrossBrowserMode;
}

qx.Proto._evalUseEnhancedCrossBrowserMode = function()
{
  if (this.getTopWidth() == 2) {
    switch(this.getTopStyle()) {
      case qx.renderer.border.Border.STYLE_OUTSET: case qx.renderer.border.Border.STYLE_INSET: case qx.renderer.border.Border.STYLE_GROOVE: case qx.renderer.border.Border.STYLE_RIDGE: return true;
    }
  }

  if (this.getRightWidth() == 2) {
    switch(this.getRightStyle()) {
      case qx.renderer.border.Border.STYLE_OUTSET: case qx.renderer.border.Border.STYLE_INSET: case qx.renderer.border.Border.STYLE_GROOVE: case qx.renderer.border.Border.STYLE_RIDGE: return true;
    }
  }

  if (this.getBottomWidth() == 2) {
    switch(this.getBottomStyle()) {
      case qx.renderer.border.Border.STYLE_OUTSET: case qx.renderer.border.Border.STYLE_INSET: case qx.renderer.border.Border.STYLE_GROOVE: case qx.renderer.border.Border.STYLE_RIDGE: return true;
    }
  }

  if (this.getLeftWidth() == 2) {
    switch(this.getLeftStyle()) {
      case qx.renderer.border.Border.STYLE_OUTSET: case qx.renderer.border.Border.STYLE_INSET: case qx.renderer.border.Border.STYLE_GROOVE: case qx.renderer.border.Border.STYLE_RIDGE: return true;
    }
  }

  return false;
}






/*
---------------------------------------------------------------------------
  BORDER APPLY IMPLEMENTATION
---------------------------------------------------------------------------
*/

qx.Proto._applyWidget = function(o)
{
  this._applyWidgetX(o);
  this._applyWidgetY(o);
}

qx.Proto._resetWidget = function(o)
{
  this._resetWidgetX(o);
  this._resetWidgetY(o);
}

qx.Proto._resetWidgetX = function(o) {
  return qx.renderer.border.Border._resetBorderX(o);
}

qx.Proto._resetWidgetY = function(o) {
  return qx.renderer.border.Border._resetBorderY(o);
}

qx.Proto._applyWidgetXCommon = function(vObject)
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

  if (!qx.sys.Client.isGecko() && qx.renderer.border.Border.enhancedCrossBrowserMode)
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
}

qx.Proto._applyWidgetYCommon = function(vObject)
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

  if (!qx.sys.Client.isGecko() && qx.renderer.border.Border.enhancedCrossBrowserMode)
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
}

if (qx.sys.Client.isGecko())
{
  qx.Proto._applyWidgetX = qx.Proto._applyWidgetXCommon;
  qx.Proto._applyWidgetY = qx.Proto._applyWidgetYCommon;

  qx.Proto._generateMozColorDefString = function(vWidth, vStyle, vEdge)
  {
    try
    {
      try {
        var a = qx.renderer.border.Border.data[vWidth][vStyle][vEdge];
      } catch(ex) {}

      if (typeof a === qx.constant.Type.OBJECT)
      {
        for (var i=0, s=[], l=a.length; i<l; i++) {
          s.push((new qx.renderer.color.ColorObject(a[i]).getStyle()));
        }

        return s.join(qx.constant.Core.SPACE);
      }
    }
    catch(ex) {
      this.error("Failed to generate Mozilla Color Definition Strings", ex);
    }

    return qx.constant.Core.EMPTY;
  }

  qx.Proto._compileTop = function()
  {
    var w=this.getTopWidth(), s=this.getTopStyle(), d=this._defsY;

    d.borderTop = this._generateDefString(w, s, this.getTopColor());
    d.MozBorderTopColors = this._generateMozColorDefString(w, s, qx.renderer.border.Border.POSITION_TOP);

    this._needsCompilationTop = false;
  }

  qx.Proto._compileRight = function()
  {
    var w=this.getRightWidth(), s=this.getRightStyle(), d=this._defsX;

    d.borderRight = this._generateDefString(w, s, this.getRightColor());
    d.MozBorderRightColors = this._generateMozColorDefString(w, s, qx.renderer.border.Border.POSITION_RIGHT);

    this._needsCompilationRight = false;
  }

  qx.Proto._compileBottom = function()
  {
    var w=this.getBottomWidth(), s=this.getBottomStyle(), d=this._defsY;

    d.borderBottom = this._generateDefString(w, s, this.getBottomColor());
    d.MozBorderBottomColors = this._generateMozColorDefString(w, s, qx.renderer.border.Border.POSITION_BOTTOM);

    this._needsCompilationBottom = false;
  }

  qx.Proto._compileLeft = function()
  {
    var w=this.getLeftWidth(), s=this.getLeftStyle(), d=this._defsX;

    d.borderLeft = this._generateDefString(w, s, this.getLeftColor());
    d.MozBorderLeftColors = this._generateMozColorDefString(w, s, qx.renderer.border.Border.POSITION_LEFT);

    this._needsCompilationLeft = false;
  }

  qx.renderer.border.Border._resetBorderX = function(o)
  {
    var s = o._style;
    s.borderLeft = s.borderRight = s.MozBorderLeftColors = s.MozBorderRightColors = qx.constant.Core.EMPTY;
  }

  qx.renderer.border.Border._resetBorderY = function(o)
  {
    var s = o._style;
    s.borderTop = s.borderBottom = s.MozBorderTopColors = s.MozBorderBottomColors = qx.constant.Core.EMPTY;
  }
}
else
{
  qx.Proto._applyWidgetX = function(vObject)
  {
    this._applyWidgetXCommon(vObject);

    if (qx.renderer.border.Border.enhancedCrossBrowserMode)
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
  }

  qx.Proto._applyWidgetY = function(vObject)
  {
    this._applyWidgetYCommon(vObject);

    if (qx.renderer.border.Border.enhancedCrossBrowserMode)
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
  }

  qx.Proto._compileTop = function()
  {
    var vTopWidth = this.getTopWidth();
    var vTopStyle = this.getTopStyle();
    var vTopColor = this.getTopColor();

    switch(vTopWidth)
    {
      case 1:
        switch(vTopStyle)
        {
          case qx.renderer.border.Border.STYLE_OUTSET:
          case qx.renderer.border.Border.STYLE_INSET:
            vTopColor = (new qx.renderer.color.ColorObject(qx.renderer.border.Border.data[vTopWidth][vTopStyle][qx.renderer.border.Border.POSITION_TOP][0]));
            vTopStyle = qx.renderer.border.Border.STYLE_SOLID;
        }

        break;

      case 2:
        switch(vTopStyle)
        {
          case qx.renderer.border.Border.STYLE_OUTSET:
          case qx.renderer.border.Border.STYLE_INSET:
          case qx.renderer.border.Border.STYLE_GROOVE:
          case qx.renderer.border.Border.STYLE_RIDGE:
            if (qx.renderer.border.Border.enhancedCrossBrowserMode)
            {
              try
              {
                var c = qx.renderer.border.Border.data[vTopWidth][vTopStyle][qx.renderer.border.Border.POSITION_TOP];

                if (typeof c === qx.constant.Type.OBJECT)
                {
                  vTopStyle = qx.renderer.border.Border.STYLE_SOLID;
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
            else
            {
              vTopColor = (new qx.renderer.color.ColorObject(qx.renderer.border.Border.baseColor));
            }
        }

        break;
    }

    this._defsY.borderTop = this._generateDefString(vTopWidth, vTopStyle, vTopColor);
    this._needsCompilationTop = false;
  }

  qx.Proto._compileRight = function()
  {
    var vRightWidth = this.getRightWidth();
    var vRightStyle = this.getRightStyle();
    var vRightColor = this.getRightColor();

    switch(vRightWidth)
    {
      case 1:
        switch(vRightStyle)
        {
          case qx.renderer.border.Border.STYLE_OUTSET:
          case qx.renderer.border.Border.STYLE_INSET:
            vRightColor = (new qx.renderer.color.ColorObject(qx.renderer.border.Border.data[vRightWidth][vRightStyle][qx.renderer.border.Border.POSITION_RIGHT][0]));
            vRightStyle = qx.renderer.border.Border.STYLE_SOLID;
        }

        break;

      case 2:
        switch(vRightStyle)
        {
          case qx.renderer.border.Border.STYLE_OUTSET:
          case qx.renderer.border.Border.STYLE_INSET:
          case qx.renderer.border.Border.STYLE_GROOVE:
          case qx.renderer.border.Border.STYLE_RIDGE:
            if (qx.renderer.border.Border.enhancedCrossBrowserMode)
            {
              try
              {
                var c = qx.renderer.border.Border.data[vRightWidth][vRightStyle][qx.renderer.border.Border.POSITION_RIGHT];

                if (typeof c === qx.constant.Type.OBJECT)
                {
                  vRightStyle = qx.renderer.border.Border.STYLE_SOLID;
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
            else
            {
              vRightColor = (new qx.renderer.color.ColorObject(qx.renderer.border.Border.baseColor));
            }
        }

        break;
    }

    this._defsX.borderRight = this._generateDefString(vRightWidth, vRightStyle, vRightColor);
    this._needsCompilationRight = false;
  }

  qx.Proto._compileBottom = function()
  {
    var vBottomWidth = this.getBottomWidth();
    var vBottomStyle = this.getBottomStyle();
    var vBottomColor = this.getBottomColor();

    switch(vBottomWidth)
    {
      case 1:
        switch(vBottomStyle)
        {
          case qx.renderer.border.Border.STYLE_OUTSET:
          case qx.renderer.border.Border.STYLE_INSET:
            vBottomColor = (new qx.renderer.color.ColorObject(qx.renderer.border.Border.data[vBottomWidth][vBottomStyle][qx.renderer.border.Border.POSITION_BOTTOM][0]));
            vBottomStyle = qx.renderer.border.Border.STYLE_SOLID;
        }

        break;

      case 2:
        switch(vBottomStyle)
        {
          case qx.renderer.border.Border.STYLE_OUTSET:
          case qx.renderer.border.Border.STYLE_INSET:
          case qx.renderer.border.Border.STYLE_GROOVE:
          case qx.renderer.border.Border.STYLE_RIDGE:
            if (qx.renderer.border.Border.enhancedCrossBrowserMode)
            {
              try
              {
                var c = qx.renderer.border.Border.data[vBottomWidth][vBottomStyle][qx.renderer.border.Border.POSITION_BOTTOM];

                if (typeof c === qx.constant.Type.OBJECT)
                {
                  vBottomStyle = qx.renderer.border.Border.STYLE_SOLID;
                  vBottomWidth = 1;
                  vBottomColor = (new qx.renderer.color.ColorObject(c[1]));

                  this._enhancedDefsY.borderBottom = this._generateDefString(vBottomWidth, vBottomStyle, vBottomColor);

                  vBottomColor = (new qx.renderer.color.ColorObject(c[0]));
                }
              }
              catch(ex) {
                this.error("Failed to compile bottom border", ex);
                this.warn("Details: Width=" + vBottomWidth + ", Style=" + vBottomStyle);
              }
            }
            else
            {
              vBottomColor = (new qx.renderer.color.ColorObject(qx.renderer.border.Border.baseColor));
            }
        }

        break;
    }

    this._defsY.borderBottom = this._generateDefString(vBottomWidth, vBottomStyle, vBottomColor);
    this._needsCompilationBottom = false;
  }

  qx.Proto._compileLeft = function()
  {
    var vLeftWidth = this.getLeftWidth();
    var vLeftStyle = this.getLeftStyle();
    var vLeftColor = this.getLeftColor();

    switch(vLeftWidth)
    {
      case 1:
        switch(vLeftStyle)
        {
          case qx.renderer.border.Border.STYLE_OUTSET:
          case qx.renderer.border.Border.STYLE_INSET:
            vLeftColor = (new qx.renderer.color.ColorObject(qx.renderer.border.Border.data[vLeftWidth][vLeftStyle][qx.renderer.border.Border.POSITION_LEFT][0]));
            vLeftStyle = qx.renderer.border.Border.STYLE_SOLID;
        }

        break;

      case 2:
        switch(vLeftStyle)
        {
          case qx.renderer.border.Border.STYLE_OUTSET:
          case qx.renderer.border.Border.STYLE_INSET:
          case qx.renderer.border.Border.STYLE_GROOVE:
          case qx.renderer.border.Border.STYLE_RIDGE:
            if (qx.renderer.border.Border.enhancedCrossBrowserMode)
            {
              try
              {
                var c = qx.renderer.border.Border.data[vLeftWidth][vLeftStyle][qx.renderer.border.Border.POSITION_LEFT];

                if (typeof c === qx.constant.Type.OBJECT)
                {
                  vLeftStyle = qx.renderer.border.Border.STYLE_SOLID;
                  vLeftWidth = 1;
                  vLeftColor = (new qx.renderer.color.ColorObject(c[1]));

                  this._enhancedDefsX.borderLeft = this._generateDefString(vLeftWidth, vLeftStyle, vLeftColor);

                  vLeftColor = (new qx.renderer.color.ColorObject(c[0]));
                }
              }
              catch(ex) {
                this.error("Failed to compile left border", ex);
                this.warn("Details: Width=" + vLeftWidth + ", Style=" + vLeftStyle);
              }
            }
            else
            {
              vLeftColor = (new qx.renderer.color.ColorObject(qx.renderer.border.Border.baseColor));
            }
        }

        break;
    }

    this._defsX.borderLeft = this._generateDefString(vLeftWidth, vLeftStyle, vLeftColor);
    this._needsCompilationLeft = false;
  }

  qx.renderer.border.Border._resetBorderX = function(o)
  {
    var s = o._style;
    s.borderLeft = s.borderRight = qx.constant.Core.EMPTY;

    if (qx.renderer.border.Border.enhancedCrossBrowserMode)
    {
      s = o._borderStyle;
      if (s) {
        s.borderLeft = s.borderRight = qx.constant.Core.EMPTY;
      }
    }
  }

  qx.renderer.border.Border._resetBorderY = function(o)
  {
    var s = o._style;
    s.borderTop = s.borderBottom = qx.constant.Core.EMPTY;

    if (qx.renderer.border.Border.enhancedCrossBrowserMode)
    {
      s = o._borderStyle;
      if (s) {
        s.borderTop = s.borderBottom = qx.constant.Core.EMPTY;
      }
    }
  }
}











/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  if (typeof this._defsX === qx.constant.Type.OBJECT) {
    for (var i in this._defsX) {
      delete this._defsX[i];
    }
  }

  delete this._defsX;

  if (typeof this._defsY === qx.constant.Type.OBJECT) {
    for (var i in this._defsY) {
      delete this._defsY[i];
    }
  }

  delete this._defsY;

  if (qx.renderer.border.Border.enhancedCrossBrowserMode)
  {
    if (typeof this._enhancedDefsX === qx.constant.Type.OBJECT) {
      for (var i in this._enhancedDefsX) {
        delete this._enhancedDefsX[i];
      }
    }

    delete this._enhancedDefsX;

    if (typeof this._enhancedDefsY === qx.constant.Type.OBJECT) {
      for (var i in this._enhancedDefsY) {
        delete this._enhancedDefsY[i];
      }
    }

    delete this._enhancedDefsY;
  }

  delete this._themedEdges;

  return qx.core.Object.prototype.dispose.call(this);
}








/*
---------------------------------------------------------------------------
  PRESETS
---------------------------------------------------------------------------
*/

qx.Class.presets =
{
  black : new qx.Class(1, qx.renderer.border.Border.STYLE_SOLID, "black"),
  white : new qx.Class(1, qx.renderer.border.Border.STYLE_SOLID, "white"),
  none : new qx.Class(0, qx.renderer.border.Border.STYLE_NONE)
}
