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

#package(color)
#require(qx.manager.object.ColorManager)
#post(qx.renderer.color.ColorCore)

************************************************************************ */

qx.renderer.color.Color = function(vValue)
{
  if (qx.util.validator.isValid(vValue)) {
    this.setValue(vValue);
  };

  qx.core.Object.call(this);
};

qx.renderer.color.Color.extend(qx.core.Object, "qx.renderer.color.Color");



/*
---------------------------------------------------------------------------
  UTILITY
---------------------------------------------------------------------------
*/

qx.renderer.color.Color.fromString = function(vDefString) {
  return new qx.renderer.color.Color(vDefString);
};

qx.renderer.color.Color.fromRandom = function() {
  return new qx.renderer.color.Color([Math.round(255*Math.random()), Math.round(255*Math.random()), Math.round(255*Math.random())]);
};



/*
---------------------------------------------------------------------------
  DATA
---------------------------------------------------------------------------
*/

proto._value = null;
proto._style = null;

proto._isRgbColor = false;
proto._isHtmlColor = false;
proto._isThemedColor = false;

proto._red = null;
proto._green = null;
proto._blue = null;

proto._hex = null;





/*
---------------------------------------------------------------------------
  COMPATIBILITY METHODS
---------------------------------------------------------------------------
*/

proto.add = qx.util.returns.returnTrue;
proto.remove = qx.util.returns.returnTrue;






/*
---------------------------------------------------------------------------
  PUBLIC METHODS
---------------------------------------------------------------------------
*/

proto.isRgbColor = function() {
  return this._isRgbColor;
};

proto.isHtmlColor = function() {
  return this._isHtmlColor;
};

proto.isThemedColor = function() {
  return this._isThemedColor;
};




proto.setValue = function(vValue)
{
  this._normalize(vValue);

  if (this._isThemedColor) {
    throw new Error("Please use qx.renderer.color.ColorObject for themed colors!");
  };
};

proto.getValue = function() {
  return this._value || QxConst.CORE_EMPTY;
};




proto.getStyle = function()
{
  if (this._style == null) {
    this._evalStyle();
  };

  return this._style;
};

proto._evalStyle = function()
{
  if (this._isRgbColor)
  {
    this._style = qx.renderer.color.Color.rgb2style(this._red, this._green, this._blue);
  }
  else if (this._isThemedColor)
  {
    this._applyThemedValue();
  }
  else if (this._isHtmlColor)
  {
    this._style = this._value;
  }
  else if (qx.util.validator.isValid(this._value))
  {
    throw new Error("_evalStyle could not handle non-rgb colors :" + this.getValue() + "!");
  };
};




proto.getHex = function()
{
  if (this._hex == null) {
    this._evalHex();
  };

  return this._hex;
};

proto._evalHex = function()
{
  if (this._isRgbColor)
  {
    var a = [QxConst.CORE_HASH];

    var r = this.getRed();
    a.push(qx.renderer.color.Color.m_hex[Math.floor(r/16)]);
    a.push(qx.renderer.color.Color.m_hex[Math.floor(r%16)]);

    var g = this.getGreen();
    a.push(qx.renderer.color.Color.m_hex[Math.floor(g/16)]);
    a.push(qx.renderer.color.Color.m_hex[Math.floor(g%16)]);

    var b = this.getBlue();
    a.push(qx.renderer.color.Color.m_hex[Math.floor(b/16)]);
    a.push(qx.renderer.color.Color.m_hex[Math.floor(b%16)]);

    this._hex = a.join(QxConst.CORE_EMPTY);
  }
  else
  {
    // TODO
  };
};




proto.getRed = function()
{
  if (this._red == null) {
    this._evalRgb();
  };

  return this._red;
};

proto.getGreen = function()
{
  if (this._green == null) {
    this._evalRgb();
  };

  return this._green;
};

proto.getBlue = function()
{
  if (this._blue == null) {
    this._evalRgb();
  };

  return this._blue;
};




proto._evalRgb = function()
{
  if (this._isThemedColor)
  {
    this._applyThemedValue();
  }
  else if (this._isHtmlColor)
  {
    var a = qx.renderer.color.Color.htmlNames[this._value];

    this._red = a[0];
    this._green = a[1];
    this._blue = a[2];
  }
  else
  {
    throw new Error("_evalRgb needs implementation!");
  };
};





/*
---------------------------------------------------------------------------
  PRIVATE METHODS
---------------------------------------------------------------------------
*/

proto._normalize = function(vInValue)
{
  this._isThemedColor = this._isRgbColor = this._isHtmlColor = false;
  this._hex = null;

  var invalid = new Error("Invalid color: " + vInValue);

  switch(typeof vInValue)
  {
    case QxConst.TYPEOF_STRING:
      vInValue = vInValue.toLowerCase();

      if (qx.renderer.color.Color.htmlNames[vInValue])
      {
        this._isHtmlColor = true;
      }
      else if (qx.renderer.color.Color.themedNames[vInValue])
      {
        this._isThemedColor = true;
      }
      else if (qx.renderer.color.Color.r_cssrgb.test(vInValue))
      {
        this._red   = RegExp.$1;
        this._green = RegExp.$2;
        this._blue  = RegExp.$3;

        this._isRgbColor = true;
      }
      else if (qx.renderer.color.Color.r_hex3.test(vInValue))
      {
        this._hex = vInValue;

        this._red   = (qx.renderer.color.Color.m_rgb[RegExp.$1] * 16) + qx.renderer.color.Color.m_rgb[RegExp.$1];
        this._green = (qx.renderer.color.Color.m_rgb[RegExp.$2] * 16) + qx.renderer.color.Color.m_rgb[RegExp.$2];
        this._blue  = (qx.renderer.color.Color.m_rgb[RegExp.$3] * 16) + qx.renderer.color.Color.m_rgb[RegExp.$3];

        this._isRgbColor = true;
      }
      else if (qx.renderer.color.Color.r_hex6.test(vInValue))
      {
        this._hex = vInValue;

        this._red   = (qx.renderer.color.Color.m_rgb[RegExp.$1] * 16) + qx.renderer.color.Color.m_rgb[RegExp.$2];
        this._green = (qx.renderer.color.Color.m_rgb[RegExp.$3] * 16) + qx.renderer.color.Color.m_rgb[RegExp.$4];
        this._blue  = (qx.renderer.color.Color.m_rgb[RegExp.$5] * 16) + qx.renderer.color.Color.m_rgb[RegExp.$6];

        this._isRgbColor = true;
      }
      else
      {
        throw invalid;
      };

      break;

    case QxConst.TYPEOF_NUMBER:
      if (vInValue >= 0 && vInValue <= 255)
      {
        this._red = this._green = this._blue = vInValue;
        this._isRgbColor = true;
      }
      else
      {
        throw invalid;
      };

      break;

    case QxConst.TYPEOF_OBJECT:
      if (qx.util.validator.isValidArray(vInValue) && vInValue.length == 3)
      {
        this._red = vInValue[0];
        this._green = vInValue[1];
        this._blue = vInValue[2];

        this._isRgbColor = true;
        break;
      };

    default:
      throw invalid;
  };

  if (!this._isRgbColor)
  {
    this._red = this._green = this._blue = null;
    this._style = this._isHtmlColor ? vInValue : null;
  }
  else
  {
    this._style = null;

    if (!(this._red >= 0 && this._red <= 255 && this._green >= 0 && this._green <= 255 && this._blue >= 0 && this._blue <= 255)) {
      throw invalid;
    };
  };

  return this._value = vInValue;
};






/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  };

  delete this._value;
  delete this._style;

  delete this._red;
  delete this._green;
  delete this._blue;

  delete this._isRgbColor;
  delete this._isHtmlColor;
  delete this._isThemedColor;

  return qx.core.Object.prototype.dispose.call(this);
};
