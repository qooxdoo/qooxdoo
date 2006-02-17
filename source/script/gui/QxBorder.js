/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(border)
#require(QxColorObject)
#post(QxBorderPresets)

************************************************************************ */

/*!
  Border implementation for QxWidget instances.
*/
function QxBorder(vWidth, vStyle, vColor)
{
  QxObject.call(this);

  this._themedEdges = {};
  this._initCache();

  if (QxUtil.isValidNumber(vWidth))
  {
    this.setWidth(vWidth);

    if (QxUtil.isValidString(vStyle)) {
      this.setStyle(vStyle);
    };

    if (QxUtil.isValid(vColor)) {
      this.setColor(vColor);
    };
  };
};

QxBorder.extend(QxObject, "QxBorder");

QxBorder.enhancedCrossBrowserMode = true;
QxBorder.baseColor = "threedlightshadow";
QxBorder.stylePart = "Style";
QxBorder.colorPart = "Color";

proto._needsCompilationTop = true;
proto._needsCompilationRight = true;
proto._needsCompilationBottom = true;
proto._needsCompilationLeft = true;



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxBorder.addProperty({ name : "topWidth", type : QxConst.TYPEOF_NUMBER, defaultValue : 0, impl : "borderTopProperty" });
QxBorder.addProperty({ name : "rightWidth", type : QxConst.TYPEOF_NUMBER, defaultValue : 0, impl : "borderRightProperty" });
QxBorder.addProperty({ name : "bottomWidth", type : QxConst.TYPEOF_NUMBER, defaultValue : 0, impl : "borderBottomProperty" });
QxBorder.addProperty({ name : "leftWidth", type : QxConst.TYPEOF_NUMBER, defaultValue : 0, impl : "borderLeftProperty" });

QxBorder.addProperty({ name : "topStyle", type : QxConst.TYPEOF_STRING, defaultValue : QxConst.CORE_NONE, impl : "borderTopProperty" });
QxBorder.addProperty({ name : "rightStyle", type : QxConst.TYPEOF_STRING, defaultValue : QxConst.CORE_NONE, impl : "borderRightProperty" });
QxBorder.addProperty({ name : "bottomStyle", type : QxConst.TYPEOF_STRING, defaultValue : QxConst.CORE_NONE, impl : "borderBottomProperty" });
QxBorder.addProperty({ name : "leftStyle", type : QxConst.TYPEOF_STRING, defaultValue : QxConst.CORE_NONE, impl : "borderLeftProperty" });

QxBorder.addProperty({ name : "topColor", impl : "borderTopProperty", type : QxConst.TYPEOF_OBJECT, instance : "QxColor", convert : QxColorCache });
QxBorder.addProperty({ name : "rightColor", impl : "borderRightProperty", type : QxConst.TYPEOF_OBJECT, instance : "QxColor", convert : QxColorCache });
QxBorder.addProperty({ name : "bottomColor", impl : "borderBottomProperty", type : QxConst.TYPEOF_OBJECT, instance : "QxColor", convert : QxColorCache });
QxBorder.addProperty({ name : "leftColor", impl : "borderLeftProperty", type : QxConst.TYPEOF_OBJECT, instance : "QxColor", convert : QxColorCache });




/*
---------------------------------------------------------------------------
  UTILITY
---------------------------------------------------------------------------
*/

QxBorder.fromString = function(vDefString)
{
  var vBorder = new QxBorder;
  var vAllParts = vDefString.split(/\s+/);
  var vPart, vTemp;

  for (var i=0; i<vAllParts.length; i++)
  {
    switch(vPart = vAllParts[i])
    {
      case QxConst.BORDER_STYLE_GROOVE:
      case QxConst.BORDER_STYLE_RIDGE:
      case QxConst.BORDER_STYLE_INSET:
      case QxConst.BORDER_STYLE_OUTSET:
      case QxConst.BORDER_STYLE_SOLID:
      case QxConst.BORDER_STYLE_DOTTED:
      case QxConst.BORDER_STYLE_DASHED:
      case QxConst.BORDER_STYLE_DOUBLE:
      case QxConst.BORDER_STYLE_NONE:
        vBorder.setStyle(vPart);
        break;

      default:
        vTemp = parseFloat(vPart);

        if(vTemp == vPart || vPart.contains(QxConst.CORE_PIXEL))
        {
          vBorder.setWidth(vTemp);
        }
        else
        {
          vPart = vPart.toLowerCase();
          vBorder.setColor(new QxColor(vPart));
        };

        break;
    };
  };

  return vBorder;
};





/*
---------------------------------------------------------------------------
  COMPATIBILITY TO QXBORDEROBJECT
---------------------------------------------------------------------------
*/

proto.addListenerWidget = QxUtil.returnTrue;
proto.removeListenerWidget = QxUtil.returnTrue;

proto._sync = QxUtil.returnTrue;





/*
---------------------------------------------------------------------------
  COMBINED SETTERS
---------------------------------------------------------------------------
*/

proto.setWidth = function(vWidth)
{
  this.setTopWidth(vWidth);
  this.setRightWidth(vWidth);
  this.setBottomWidth(vWidth);
  this.setLeftWidth(vWidth);

  return true;
};

proto.setStyle = function(vStyle)
{
  this.setTopStyle(vStyle);
  this.setRightStyle(vStyle);
  this.setBottomStyle(vStyle);
  this.setLeftStyle(vStyle);

  return true;
};

proto.setColor = function(vColor)
{
  this.setTopColor(vColor);
  this.setRightColor(vColor);
  this.setBottomColor(vColor);
  this.setLeftColor(vColor);

  return true;
};




proto.setTop = function(vWidth, vStyle, vColor)
{
  this.setTopWidth(vWidth);
  this.setTopStyle(vStyle);
  this.setTopColor(vColor);

  return true;
};

proto.setRight = function(vWidth, vStyle, vColor)
{
  this.setRightWidth(vWidth);
  this.setRightStyle(vStyle);
  this.setRightColor(vColor);

  return true;
};

proto.setBottom = function(vWidth, vStyle, vColor)
{
  this.setBottomWidth(vWidth);
  this.setBottomStyle(vStyle);
  this.setBottomColor(vColor);

  return true;
};

proto.setLeft = function(vWidth, vStyle, vColor)
{
  this.setLeftWidth(vWidth);
  this.setLeftStyle(vStyle);
  this.setLeftColor(vColor);

  return true;
};





/*
---------------------------------------------------------------------------
  INITIALISATION OF CACHE
---------------------------------------------------------------------------
*/


if (QxClient.isGecko())
{
  proto._initCache = function()
  {
    this._defsX =
    {
      borderLeft : QxConst.CORE_EMPTY,
      borderRight : QxConst.CORE_EMPTY,

      MozBorderLeftColors : QxConst.CORE_EMPTY,
      MozBorderRightColors : QxConst.CORE_EMPTY
    };

    this._defsY =
    {
      borderTop : QxConst.CORE_EMPTY,
      borderBottom : QxConst.CORE_EMPTY,

      MozBorderTopColors : QxConst.CORE_EMPTY,
      MozBorderBottomColors : QxConst.CORE_EMPTY
    };
  };
}
else
{
  proto._initCache = function()
  {
    this._defsX =
    {
      borderLeft : QxConst.CORE_EMPTY,
      borderRight : QxConst.CORE_EMPTY
    };

    this._defsY =
    {
      borderTop : QxConst.CORE_EMPTY,
      borderBottom : QxConst.CORE_EMPTY
    };

    if (QxBorder.enhancedCrossBrowserMode)
    {
      this._enhancedDefsX =
      {
        borderLeft : QxConst.CORE_EMPTY,
        borderRight : QxConst.CORE_EMPTY
      };

      this._enhancedDefsY =
      {
        borderTop : QxConst.CORE_EMPTY,
        borderBottom : QxConst.CORE_EMPTY
      };
    };
  };
};


/*
---------------------------------------------------------------------------
  BORDER MODIFIER AND SYNCER
---------------------------------------------------------------------------
*/

if (QxClient.isGecko() || QxBorder.enhancedCrossBrowserMode)
{
  proto._addToThemed3DColors = function(vProp)
  {
    var needRegistering = QxUtil.isObjectEmpty(this._themedEdges);

    this._themedEdges[vProp] = true;

    if (needRegistering)
    {
      (new QxColorObject("ThreeDDarkShadow")).add(this);
      (new QxColorObject("ThreeDShadow")).add(this);
      (new QxColorObject("ThreeDLightShadow")).add(this);
      (new QxColorObject("ThreeDHighlight")).add(this);
    };
  };

  proto._removeFromThemed3DColors = function(vProp)
  {
    delete this._themedEdges[vProp];

    if (QxUtil.isObjectEmpty(this._themedEdges))
    {
      (new QxColorObject("ThreeDDarkShadow")).remove(this);
      (new QxColorObject("ThreeDShadow")).remove(this);
      (new QxColorObject("ThreeDLightShadow")).remove(this);
      (new QxColorObject("ThreeDHighlight")).remove(this);
    };
  };
}
else
{
  proto._addToThemed3DColors = function(vProp)
  {
    var needRegistering = QxUtil.isObjectEmpty(this._themedEdges);

    this._themedEdges[vProp] = true;

    if (needRegistering)
    {
      (new QxColorObject("ThreeDLightShadow")).add(this);
    };
  };

  proto._removeFromThemed3DColors = function(vProp)
  {
    delete this._themedEdges[vProp];

    if (QxUtil.isObjectEmpty(this._themedEdges))
    {
      (new QxColorObject("ThreeDLightShadow")).remove(this);
    };
  };
};





QxBorder.data =
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
};





proto._generateDefString = function(vWidth, vStyle, vColor)
{
  if (typeof vWidth !== QxConst.TYPEOF_NUMBER || vWidth < 0) {
    return QxConst.CORE_EMPTY;
  };

  var vArr = [ vWidth + QxConst.CORE_PIXEL ];

  if (QxUtil.isValidString(vStyle)) {
    vArr.push(vStyle);
  };

  if (QxUtil.isValidObject(vColor) && vColor instanceof QxColor) {
    vColor = vColor.getStyle();
  };

  if (QxUtil.isValidString(vColor)) {
    vArr.push(vColor);
  };

  return vArr.join(QxConst.CORE_SPACE);
};




// TODO: Add more smartness ;)
// Only update the border edges which depends on this color object
proto._updateColors = function(vColorObject, vNewValue)
{
  this._needsCompilationTop = true;
  this._needsCompilationRight = true;
  this._needsCompilationBottom = true;
  this._needsCompilationLeft = true;

  this._sync(QxConst.PROPERTY_TOP);
  this._sync(QxConst.PROPERTY_RIGHT);
  this._sync(QxConst.PROPERTY_BOTTOM);
  this._sync(QxConst.PROPERTY_LEFT);
};







proto._handleColorRegistration = function(propValue, propOldValue, propData)
{
  if (propData.name.contains(QxBorder.stylePart))
  {
    switch(propValue)
    {
      case QxConst.BORDER_STYLE_OUTSET:
      case QxConst.BORDER_STYLE_INSET:
      case QxConst.BORDER_STYLE_GROOVE:
      case QxConst.BORDER_STYLE_RIDGE:
        this._addToThemed3DColors(propData.name);
        break;

      default:
        this._removeFromThemed3DColors(propData.name);
    };
  };

  if (propData.name.contains(QxBorder.colorPart))
  {
    if (propOldValue instanceof QxColorObject)
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
      };
    };

    if (propValue instanceof QxColorObject)
    {
      // simply add, internal storage is a hash key so
      // this is not a problem also if this is already
      // registered there.
      propValue.add(this);
    };
  };
};








proto._modifyBorderTopProperty = function(propValue, propOldValue, propData)
{
  this._handleColorRegistration(propValue, propOldValue, propData);

  this._needsCompilationTop = true;
  this._useEnhancedCrossBrowserMode = null;

  this._sync("top");

  return true;
};

proto._modifyBorderRightProperty = function(propValue, propOldValue, propData)
{
  this._handleColorRegistration(propValue, propOldValue, propData);

  this._needsCompilationRight = true;
  this._useEnhancedCrossBrowserMode = null;

  this._sync("right");

  return true;
};

proto._modifyBorderBottomProperty = function(propValue, propOldValue, propData)
{
  this._handleColorRegistration(propValue, propOldValue, propData);

  this._needsCompilationBottom = true;
  this._useEnhancedCrossBrowserMode = null;

  this._sync("bottom");

  return true;
};

proto._modifyBorderLeftProperty = function(propValue, propOldValue, propData)
{
  this._handleColorRegistration(propValue, propOldValue, propData);

  this._needsCompilationLeft = true;
  this._useEnhancedCrossBrowserMode = null;

  this._sync("left");

  return true;
};









proto.getUseEnhancedCrossBrowserMode = function()
{
  if (this._useEnhancedCrossBrowserMode == null) {
    this._useEnhancedCrossBrowserMode = this._evalUseEnhancedCrossBrowserMode();
  };

  return this._useEnhancedCrossBrowserMode;
};

proto._evalUseEnhancedCrossBrowserMode = function()
{
  if (this.getTopWidth() == 2) {
    switch(this.getTopStyle()) {
      case QxConst.BORDER_STYLE_OUTSET: case QxConst.BORDER_STYLE_INSET: case QxConst.BORDER_STYLE_GROOVE: case QxConst.BORDER_STYLE_RIDGE: return true;
    };
  };

  if (this.getRightWidth() == 2) {
    switch(this.getRightStyle()) {
      case QxConst.BORDER_STYLE_OUTSET: case QxConst.BORDER_STYLE_INSET: case QxConst.BORDER_STYLE_GROOVE: case QxConst.BORDER_STYLE_RIDGE: return true;
    };
  };

  if (this.getBottomWidth() == 2) {
    switch(this.getBottomStyle()) {
      case QxConst.BORDER_STYLE_OUTSET: case QxConst.BORDER_STYLE_INSET: case QxConst.BORDER_STYLE_GROOVE: case QxConst.BORDER_STYLE_RIDGE: return true;
    };
  };

  if (this.getLeftWidth() == 2) {
    switch(this.getLeftStyle()) {
      case QxConst.BORDER_STYLE_OUTSET: case QxConst.BORDER_STYLE_INSET: case QxConst.BORDER_STYLE_GROOVE: case QxConst.BORDER_STYLE_RIDGE: return true;
    };
  };

  return false;
};






/*
---------------------------------------------------------------------------
  BORDER APPLY IMPLEMENTATION
---------------------------------------------------------------------------
*/

proto._applyWidget = function(o)
{
  this._applyWidgetX(o);
  this._applyWidgetY(o);
};

proto._resetWidget = function(o)
{
  this._resetWidgetX(o);
  this._resetWidgetY(o);
};

proto._resetWidgetX = function(o) {
  return QxBorder._resetBorderX(o);
};

proto._resetWidgetY = function(o) {
  return QxBorder._resetBorderY(o);
};

proto._applyWidgetXCommon = function(vObject)
{
  if (this._needsCompilationLeft) {
    this._compileLeft();
  };

  if (this._needsCompilationRight) {
    this._compileRight();
  };

  for (i in this._defsX) {
    vObject._style[i] = this._defsX[i];
  };

  if (!QxClient.isGecko() && QxBorder.enhancedCrossBrowserMode)
  {
    if (this.getUseEnhancedCrossBrowserMode()) {
      vObject._createElementForEnhancedBorder();
    };

    if (vObject._borderStyle)
    {
      for (i in this._enhancedDefsX) {
        vObject._borderStyle[i] = this._enhancedDefsX[i];
      };
    };
  };
};

proto._applyWidgetYCommon = function(vObject)
{
  if (this._needsCompilationTop) {
    this._compileTop();
  };

  if (this._needsCompilationBottom) {
    this._compileBottom();
  };

  for (i in this._defsY) {
    vObject._style[i] = this._defsY[i];
  };

  if (!QxClient.isGecko() && QxBorder.enhancedCrossBrowserMode)
  {
    if (this.getUseEnhancedCrossBrowserMode()) {
      vObject._createElementForEnhancedBorder();
    };

    if (vObject._borderStyle)
    {
      for (i in this._enhancedDefsY) {
        vObject._borderStyle[i] = this._enhancedDefsY[i];
      };
    };
  };
};

if (QxClient.isGecko())
{
  proto._applyWidgetX = proto._applyWidgetXCommon;
  proto._applyWidgetY = proto._applyWidgetYCommon;

  proto._generateMozColorDefString = function(vWidth, vStyle, vEdge)
  {
    try
    {
      try {
        var a = QxBorder.data[vWidth][vStyle][vEdge];
      } catch(ex) {};

      if (typeof a === QxConst.TYPEOF_OBJECT)
      {
        for (var i=0, s=[], l=a.length; i<l; i++) {
          s.push((new QxColorObject(a[i]).getStyle()));
        };

        return s.join(QxConst.CORE_SPACE);
      };
    }
    catch(ex) {
      this.error("Failed to generate Mozilla Color Definition Strings: " + ex, "_generateMozColorDefString");
    };

    return QxConst.CORE_EMPTY;
  };

  proto._compileTop = function()
  {
    var w=this.getTopWidth(), s=this.getTopStyle(), d=this._defsY;

    d.borderTop = this._generateDefString(w, s, this.getTopColor());
    d.MozBorderTopColors = this._generateMozColorDefString(w, s, QxConst.PROPERTY_TOP);

    this._needsCompilationTop = false;
  };

  proto._compileRight = function()
  {
    var w=this.getRightWidth(), s=this.getRightStyle(), d=this._defsX;

    d.borderRight = this._generateDefString(w, s, this.getRightColor());
    d.MozBorderRightColors = this._generateMozColorDefString(w, s, QxConst.PROPERTY_RIGHT);

    this._needsCompilationRight = false;
  };

  proto._compileBottom = function()
  {
    var w=this.getBottomWidth(), s=this.getBottomStyle(), d=this._defsY;

    d.borderBottom = this._generateDefString(w, s, this.getBottomColor());
    d.MozBorderBottomColors = this._generateMozColorDefString(w, s, QxConst.PROPERTY_BOTTOM);

    this._needsCompilationBottom = false;
  };

  proto._compileLeft = function()
  {
    var w=this.getLeftWidth(), s=this.getLeftStyle(), d=this._defsX;

    d.borderLeft = this._generateDefString(w, s, this.getLeftColor());
    d.MozBorderLeftColors = this._generateMozColorDefString(w, s, QxConst.PROPERTY_LEFT);

    this._needsCompilationLeft = false;
  };

  QxBorder._resetBorderX = function(o)
  {
    s = o._style;
    s.borderLeft = s.borderRight = s.MozBorderLeftColors = s.MozBorderRightColors = QxConst.CORE_EMPTY;
  };

  QxBorder._resetBorderY = function(o)
  {
    s = o._style;
    s.borderTop = s.borderBottom = s.MozBorderTopColors = s.MozBorderBottomColors = QxConst.CORE_EMPTY;
  };
}
else
{
  proto._applyWidgetX = function(vObject)
  {
    this._applyWidgetXCommon(vObject);

    if (QxBorder.enhancedCrossBrowserMode)
    {
      if (this.getUseEnhancedCrossBrowserMode()) {
        vObject._createElementForEnhancedBorder();
      };

      if (vObject._borderStyle)
      {
        for (i in this._enhancedDefsX) {
          vObject._borderStyle[i] = this._enhancedDefsX[i];
        };
      };
    };
  };

  proto._applyWidgetY = function(vObject)
  {
    this._applyWidgetYCommon(vObject);

    if (QxBorder.enhancedCrossBrowserMode)
    {
      if (this.getUseEnhancedCrossBrowserMode()) {
        vObject._createElementForEnhancedBorder();
      };

      if (vObject._borderStyle)
      {
        for (i in this._enhancedDefsY) {
          vObject._borderStyle[i] = this._enhancedDefsY[i];
        };
      };
    };
  };

  proto._compileTop = function()
  {
    var vTopWidth = this.getTopWidth();
    var vTopStyle = this.getTopStyle();
    var vTopColor = this.getTopColor();

    switch(vTopWidth)
    {
      case 1:
        switch(vTopStyle)
        {
          case QxConst.BORDER_STYLE_OUTSET:
          case QxConst.BORDER_STYLE_INSET:
            vTopColor = (new QxColorObject(QxBorder.data[vTopWidth][vTopStyle][QxConst.PROPERTY_TOP][0]));
            vTopStyle = QxConst.BORDER_STYLE_SOLID;
        };

        break;

      case 2:
        switch(vTopStyle)
        {
          case QxConst.BORDER_STYLE_OUTSET:
          case QxConst.BORDER_STYLE_INSET:
          case QxConst.BORDER_STYLE_GROOVE:
          case QxConst.BORDER_STYLE_RIDGE:
            if (QxBorder.enhancedCrossBrowserMode)
            {
              try
              {
                var c = QxBorder.data[vTopWidth][vTopStyle][QxConst.PROPERTY_TOP];

                if (typeof c === QxConst.TYPEOF_OBJECT)
                {
                  vTopStyle = QxConst.BORDER_STYLE_SOLID;
                  vTopWidth = 1;
                  vTopColor = (new QxColorObject(c[1]));

                  this._enhancedDefsY.borderTop = this._generateDefString(vTopWidth, vTopStyle, vTopColor);

                  vTopColor = (new QxColorObject(c[0]));
                };
              }
              catch(ex)
              {
                this.error("Failed to compile top border: " + ex, "_compileTop");
                this.warn("Details: Width=" + vTopWidth + ", Style=" + vTopStyle);
              };
            }
            else
            {
              vTopColor = (new QxColorObject(QxBorder.baseColor));
            };
        };

        break;
    };

    this._defsY.borderTop = this._generateDefString(vTopWidth, vTopStyle, vTopColor);
    this._needsCompilationTop = false;
  };

  proto._compileRight = function()
  {
    var vRightWidth = this.getRightWidth();
    var vRightStyle = this.getRightStyle();
    var vRightColor = this.getRightColor();

    switch(vRightWidth)
    {
      case 1:
        switch(vRightStyle)
        {
          case QxConst.BORDER_STYLE_OUTSET:
          case QxConst.BORDER_STYLE_INSET:
            vRightColor = (new QxColorObject(QxBorder.data[vRightWidth][vRightStyle][QxConst.PROPERTY_RIGHT][0]));
            vRightStyle = QxConst.BORDER_STYLE_SOLID;
        };

        break;

      case 2:
        switch(vRightStyle)
        {
          case QxConst.BORDER_STYLE_OUTSET:
          case QxConst.BORDER_STYLE_INSET:
          case QxConst.BORDER_STYLE_GROOVE:
          case QxConst.BORDER_STYLE_RIDGE:
            if (QxBorder.enhancedCrossBrowserMode)
            {
              try
              {
                var c = QxBorder.data[vRightWidth][vRightStyle][QxConst.PROPERTY_RIGHT];

                if (typeof c === QxConst.TYPEOF_OBJECT)
                {
                  vRightStyle = QxConst.BORDER_STYLE_SOLID;
                  vRightWidth = 1;
                  vRightColor = (new QxColorObject(c[1]));

                  this._enhancedDefsX.borderRight = this._generateDefString(vRightWidth, vRightStyle, vRightColor);

                  vRightColor = (new QxColorObject(c[0]));
                };
              }
              catch(ex)
              {
                this.error("Failed to compile right border: " + ex, "_compileRight");
                this.warn("Details: Width=" + vRightWidth + ", Style=" + vRightStyle);
              };
            }
            else
            {
              vRightColor = (new QxColorObject(QxBorder.baseColor));
            };
        };

        break;
    };

    this._defsX.borderRight = this._generateDefString(vRightWidth, vRightStyle, vRightColor);
    this._needsCompilationRight = false;
  };

  proto._compileBottom = function()
  {
    var vBottomWidth = this.getBottomWidth();
    var vBottomStyle = this.getBottomStyle();
    var vBottomColor = this.getBottomColor();

    switch(vBottomWidth)
    {
      case 1:
        switch(vBottomStyle)
        {
          case QxConst.BORDER_STYLE_OUTSET:
          case QxConst.BORDER_STYLE_INSET:
            vBottomColor = (new QxColorObject(QxBorder.data[vBottomWidth][vBottomStyle][QxConst.PROPERTY_BOTTOM][0]));
            vBottomStyle = QxConst.BORDER_STYLE_SOLID;
        };

        break;

      case 2:
        switch(vBottomStyle)
        {
          case QxConst.BORDER_STYLE_OUTSET:
          case QxConst.BORDER_STYLE_INSET:
          case QxConst.BORDER_STYLE_GROOVE:
          case QxConst.BORDER_STYLE_RIDGE:
            if (QxBorder.enhancedCrossBrowserMode)
            {
              try
              {
                var c = QxBorder.data[vBottomWidth][vBottomStyle][QxConst.PROPERTY_BOTTOM];

                if (typeof c === QxConst.TYPEOF_OBJECT)
                {
                  vBottomStyle = QxConst.BORDER_STYLE_SOLID;
                  vBottomWidth = 1;
                  vBottomColor = (new QxColorObject(c[1]));

                  this._enhancedDefsY.borderBottom = this._generateDefString(vBottomWidth, vBottomStyle, vBottomColor);

                  vBottomColor = (new QxColorObject(c[0]));
                };
              }
              catch(ex) {
                this.error("Failed to compile bottom border: " + ex, "_compileBottom");
                this.warn("Details: Width=" + vBottomWidth + ", Style=" + vBottomStyle);
              };
            }
            else
            {
              vBottomColor = (new QxColorObject(QxBorder.baseColor));
            };
        };

        break;
    };

    this._defsY.borderBottom = this._generateDefString(vBottomWidth, vBottomStyle, vBottomColor);
    this._needsCompilationBottom = false;
  };

  proto._compileLeft = function()
  {
    var vLeftWidth = this.getLeftWidth();
    var vLeftStyle = this.getLeftStyle();
    var vLeftColor = this.getLeftColor();

    switch(vLeftWidth)
    {
      case 1:
        switch(vLeftStyle)
        {
          case QxConst.BORDER_STYLE_OUTSET:
          case QxConst.BORDER_STYLE_INSET:
            vLeftColor = (new QxColorObject(QxBorder.data[vLeftWidth][vLeftStyle][QxConst.PROPERTY_LEFT][0]));
            vLeftStyle = QxConst.BORDER_STYLE_SOLID;
        };

        break;

      case 2:
        switch(vLeftStyle)
        {
          case QxConst.BORDER_STYLE_OUTSET:
          case QxConst.BORDER_STYLE_INSET:
          case QxConst.BORDER_STYLE_GROOVE:
          case QxConst.BORDER_STYLE_RIDGE:
            if (QxBorder.enhancedCrossBrowserMode)
            {
              try
              {
                var c = QxBorder.data[vLeftWidth][vLeftStyle][QxConst.PROPERTY_LEFT];

                if (typeof c === QxConst.TYPEOF_OBJECT)
                {
                  vLeftStyle = QxConst.BORDER_STYLE_SOLID;
                  vLeftWidth = 1;
                  vLeftColor = (new QxColorObject(c[1]));

                  this._enhancedDefsX.borderLeft = this._generateDefString(vLeftWidth, vLeftStyle, vLeftColor);

                  vLeftColor = (new QxColorObject(c[0]));
                };
              }
              catch(ex) {
                this.error("Failed to compile left border: " + ex, "_compileLeft");
                this.warn("Details: Width=" + vLeftWidth + ", Style=" + vLeftStyle);
              };
            }
            else
            {
              vLeftColor = (new QxColorObject(QxBorder.baseColor));
            };
        };

        break;
    };

    this._defsX.borderLeft = this._generateDefString(vLeftWidth, vLeftStyle, vLeftColor);
    this._needsCompilationLeft = false;
  };

  QxBorder._resetBorderX = function(o)
  {
    s = o._style;
    s.borderLeft = s.borderRight = QxConst.CORE_EMPTY;

    if (QxBorder.enhancedCrossBrowserMode)
    {
      s = o._borderStyle;
      if (s) {
        s.borderLeft = s.borderRight = QxConst.CORE_EMPTY;
      };
    };
  };

  QxBorder._resetBorderY = function(o)
  {
    s = o._style;
    s.borderTop = s.borderBottom = QxConst.CORE_EMPTY;

    if (QxBorder.enhancedCrossBrowserMode)
    {
      s = o._borderStyle;
      if (s) {
        s.borderTop = s.borderBottom = QxConst.CORE_EMPTY;
      };
    };
  };
};











/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  if (typeof this._defsX === QxConst.TYPEOF_OBJECT) {
    for (var i in this._defsX) {
      delete this._defsX[i];
    };
  };

  delete this._defsX;

  if (typeof this._defsY === QxConst.TYPEOF_OBJECT) {
    for (var i in this._defsY) {
      delete this._defsY[i];
    };
  };

  delete this._defsY;

  if (QxBorder.enhancedCrossBrowserMode)
  {
    if (typeof this._enhancedDefsX === QxConst.TYPEOF_OBJECT) {
      for (var i in this._enhancedDefsX) {
        delete this._enhancedDefsX[i];
      };
    };

    delete this._enhancedDefsX;

    if (typeof this._enhancedDefsY === QxConst.TYPEOF_OBJECT) {
      for (var i in this._enhancedDefsY) {
        delete this._enhancedDefsY[i];
      };
    };

    delete this._enhancedDefsY;
  };

  delete this._themedEdges;

  return QxObject.prototype.dispose.call(this);
};