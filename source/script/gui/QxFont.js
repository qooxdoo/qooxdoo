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

#package(font)

************************************************************************ */

/*!
  Font implementation for QxWidget instances.
*/

function QxFont(vSize, vName)
{
  QxObject.call(this);

  this._defs = {};

  if (QxUtil.isValidNumber(vSize)) {
    this.setSize(vSize);
  };

  if (QxUtil.isValidString(vName)) {
    this.setName(vName);
  };
};

QxFont.extend(QxObject, "QxFont");



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxFont.addProperty({ name : "size", type : QxConst.TYPEOF_NUMBER, impl : "style" });
QxFont.addProperty({ name : "name", type : QxConst.TYPEOF_STRING, impl : "style" });
QxFont.addProperty({ name : "bold", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false, impl : "style" });
QxFont.addProperty({ name : "italic", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false, impl : "style" });
QxFont.addProperty({ name : "underline", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false, impl : "style" });
QxFont.addProperty({ name : "strikeout", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false, impl : "style" });



/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyStyle = function(propValue, propOldValue, propData)
{
  this._needsCompilation = true;
  return true;
};




/*
---------------------------------------------------------------------------
  UTILITY
---------------------------------------------------------------------------
*/

QxFont.fromString = function(s)
{
  var vFont = new QxFont;
  var vAllParts = s.split(/\s+/);
  var vName = [];
  var vPart;

  for (var i = 0; i < vAllParts.length; i++)
  {
    switch(vPart = vAllParts[i])
    {
      case QxConst.FONT_STYLE_BOLD:
        vFont.setBold(true);
        break;

      case QxConst.FONT_STYLE_ITALIC:
        vFont.setItalic(true);
        break;

      case QxConst.FONT_STYLE_UNDERLINE:
        vFont.setUnderline(true);
        break;

      case QxConst.FONT_STYLE_STRIKEOUT:
        vFont.setStrikeout(true);
        break;

      default:
        var vTemp = parseFloat(vPart);

        if(vTemp == vPart || vPart.contains(QxConst.CORE_PIXEL))
        {
          vFont.setSize(vTemp);
        }
        else
        {
          vName.push(vPart);
        };

        break;
    };
  };

  if(vName.length > 0) {
    vFont.setName(vName.join(QxConst.CORE_SPACE));
  };

  return vFont;
};




/*
---------------------------------------------------------------------------
  UTILITY
---------------------------------------------------------------------------
*/

QxFont.PROPERTY_FAMILY = "fontFamily";
QxFont.PROPERTY_SIZE = "fontSize";
QxFont.PROPERTY_WEIGHT = "fontWeight";
QxFont.PROPERTY_STYLE = "fontStyle";
QxFont.PROPERTY_DECORATION = "textDecoration";

proto._needsCompilation = true;

proto._compile = function()
{
  var vName = this.getName();
  var vSize = this.getSize();
  var vBold = this.getBold();
  var vItalic = this.getItalic();
  var vUnderline = this.getUnderline();
  var vStrikeout = this.getStrikeout();
  var vDecoration = QxConst.CORE_EMPTY;

  if (this.getUnderline()) {
    vDecoration = QxConst.FONT_STYLE_UNDERLINE;
  };

  if (this.getStrikeout()) {
    vDecoration += QxConst.CORE_SPACE + QxConst.FONT_STYLE_STRIKEOUT;
  };

  this._defs.fontFamily = QxUtil.isValidString(vName) ? vName : QxConst.CORE_EMPTY;
  this._defs.fontSize = QxUtil.isValidNumber(vSize) ? vSize + QxConst.CORE_PIXEL : QxConst.CORE_EMPTY;
  this._defs.fontWeight = this.getBold() ? QxConst.FONT_STYLE_BOLD : QxConst.FONT_STYLE_NORMAL;
  this._defs.fontStyle = this.getItalic() ? QxConst.FONT_STYLE_ITALIC : QxConst.FONT_STYLE_NORMAL;
  this._defs.textDecoration = QxUtil.isValidString(vDecoration) ? vDecoration : QxConst.CORE_EMPTY;

  this._needsCompilation = false;
};

proto.applyWidget = function(vWidget)
{
  if (this._needsCompilation) {
    this._compile();
  };

  vWidget.setStyleProperty(QxFont.PROPERTY_FAMILY, this._defs.fontFamily);
  vWidget.setStyleProperty(QxFont.PROPERTY_SIZE, this._defs.fontSize);
  vWidget.setStyleProperty(QxFont.PROPERTY_WEIGHT, this._defs.fontWeight);
  vWidget.setStyleProperty(QxFont.PROPERTY_STYLE, this._defs.fontStyle);
  vWidget.setStyleProperty(QxFont.PROPERTY_DECORATION, this._defs.textDecoration);
};

proto.resetWidget = function(vWidget)
{
  vWidget.removeStyleProperty(QxFont.PROPERTY_FAMILY);
  vWidget.removeStyleProperty(QxFont.PROPERTY_SIZE);
  vWidget.removeStyleProperty(QxFont.PROPERTY_WEIGHT);
  vWidget.removeStyleProperty(QxFont.PROPERTY_STYLE);
  vWidget.removeStyleProperty(QxFont.PROPERTY_DECORATION);
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

  delete this._defs;

  return QxObject.prototype.dispose.call(this);
};
