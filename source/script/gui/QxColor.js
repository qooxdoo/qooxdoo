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
#require(QxColorManager)
#post(QxColorCore)

************************************************************************ */

function QxColor(vValue)
{
  if (QxUtil.isValid(vValue)) {
    this.setValue(vValue);
  };

  QxObject.call(this);
};

QxColor.extend(QxObject, "QxColor");



/*
---------------------------------------------------------------------------
  UTILITY
---------------------------------------------------------------------------
*/

QxColor.fromString = function(vDefString) {
  return new QxColor(vDefString);
};

QxColor.fromRandom = function() {
  return new QxColor([Math.round(255*Math.random()), Math.round(255*Math.random()), Math.round(255*Math.random())]);
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

proto.add = QxUtil.returnTrue;
proto.remove = QxUtil.returnTrue;






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
    throw new Error("Please use QxColorObject for themed colors!");
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
    this._style = QxColor.rgb2style(this._red, this._green, this._blue);
  }
  else if (this._isThemedColor)
  {
    this._applyThemedValue();
  }
  else if (this._isHtmlColor)
  {
    this._style = this._value;
  }
  else if (QxUtil.isValid(this._value))
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
    a.push(QxColor.m_hex[Math.floor(r/16)]);
    a.push(QxColor.m_hex[Math.floor(r%16)]);

    var g = this.getGreen();
    a.push(QxColor.m_hex[Math.floor(g/16)]);
    a.push(QxColor.m_hex[Math.floor(g%16)]);

    var b = this.getBlue();
    a.push(QxColor.m_hex[Math.floor(b/16)]);
    a.push(QxColor.m_hex[Math.floor(b%16)]);

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
    var a = QxColor.htmlNames[this._value];

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

      if (QxColor.htmlNames[vInValue])
      {
        this._isHtmlColor = true;
      }
      else if (QxColor.themedNames[vInValue])
      {
        this._isThemedColor = true;
      }
      else if (QxColor.r_cssrgb.test(vInValue))
      {
        this._red   = RegExp.$1;
        this._green = RegExp.$2;
        this._blue  = RegExp.$3;

        this._isRgbColor = true;
      }
      else if (QxColor.r_hex3.test(vInValue))
      {
        this._hex = vInValue;

        this._red   = (QxColor.m_rgb[RegExp.$1] * 16) + QxColor.m_rgb[RegExp.$1];
        this._green = (QxColor.m_rgb[RegExp.$2] * 16) + QxColor.m_rgb[RegExp.$2];
        this._blue  = (QxColor.m_rgb[RegExp.$3] * 16) + QxColor.m_rgb[RegExp.$3];

        this._isRgbColor = true;
      }
      else if (QxColor.r_hex6.test(vInValue))
      {
        this._hex = vInValue;

        this._red   = (QxColor.m_rgb[RegExp.$1] * 16) + QxColor.m_rgb[RegExp.$2];
        this._green = (QxColor.m_rgb[RegExp.$3] * 16) + QxColor.m_rgb[RegExp.$4];
        this._blue  = (QxColor.m_rgb[RegExp.$5] * 16) + QxColor.m_rgb[RegExp.$6];

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
      if (QxUtil.isValidArray(vInValue) && vInValue.length == 3)
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

  return QxObject.prototype.dispose.call(this);
};
