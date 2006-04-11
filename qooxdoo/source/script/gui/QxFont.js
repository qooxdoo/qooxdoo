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

qx.renderer.font.Font = function(vSize, vName)
{
  qx.core.Object.call(this);

  this._defs = {};

  if (qx.util.validator.isValidNumber(vSize)) {
    this.setSize(vSize);
  };

  if (qx.util.validator.isValidString(vName)) {
    this.setName(vName);
  };
};

qx.renderer.font.Font.extend(qx.core.Object, "qx.renderer.font.Font");



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.renderer.font.Font.addProperty({ name : "size", type : QxConst.TYPEOF_NUMBER, impl : "style" });
qx.renderer.font.Font.addProperty({ name : "name", type : QxConst.TYPEOF_STRING, impl : "style" });
qx.renderer.font.Font.addProperty({ name : "bold", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false, impl : "style" });
qx.renderer.font.Font.addProperty({ name : "italic", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false, impl : "style" });
qx.renderer.font.Font.addProperty({ name : "underline", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false, impl : "style" });
qx.renderer.font.Font.addProperty({ name : "strikeout", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false, impl : "style" });



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

qx.renderer.font.Font.fromString = function(s)
{
  var vFont = new qx.renderer.font.Font;
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

qx.renderer.font.Font.PROPERTY_FAMILY = "fontFamily";
qx.renderer.font.Font.PROPERTY_SIZE = "fontSize";
qx.renderer.font.Font.PROPERTY_WEIGHT = "fontWeight";
qx.renderer.font.Font.PROPERTY_STYLE = "fontStyle";
qx.renderer.font.Font.PROPERTY_DECORATION = "textDecoration";

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

  this._defs.fontFamily = qx.util.validator.isValidString(vName) ? vName : QxConst.CORE_EMPTY;
  this._defs.fontSize = qx.util.validator.isValidNumber(vSize) ? vSize + QxConst.CORE_PIXEL : QxConst.CORE_EMPTY;
  this._defs.fontWeight = this.getBold() ? QxConst.FONT_STYLE_BOLD : QxConst.FONT_STYLE_NORMAL;
  this._defs.fontStyle = this.getItalic() ? QxConst.FONT_STYLE_ITALIC : QxConst.FONT_STYLE_NORMAL;
  this._defs.textDecoration = qx.util.validator.isValidString(vDecoration) ? vDecoration : QxConst.CORE_EMPTY;

  this._needsCompilation = false;
};

proto.applyWidget = function(vWidget)
{
  if (this._needsCompilation) {
    this._compile();
  };

  vWidget.setStyleProperty(qx.renderer.font.Font.PROPERTY_FAMILY, this._defs.fontFamily);
  vWidget.setStyleProperty(qx.renderer.font.Font.PROPERTY_SIZE, this._defs.fontSize);
  vWidget.setStyleProperty(qx.renderer.font.Font.PROPERTY_WEIGHT, this._defs.fontWeight);
  vWidget.setStyleProperty(qx.renderer.font.Font.PROPERTY_STYLE, this._defs.fontStyle);
  vWidget.setStyleProperty(qx.renderer.font.Font.PROPERTY_DECORATION, this._defs.textDecoration);
};

proto.resetWidget = function(vWidget)
{
  vWidget.removeStyleProperty(qx.renderer.font.Font.PROPERTY_FAMILY);
  vWidget.removeStyleProperty(qx.renderer.font.Font.PROPERTY_SIZE);
  vWidget.removeStyleProperty(qx.renderer.font.Font.PROPERTY_WEIGHT);
  vWidget.removeStyleProperty(qx.renderer.font.Font.PROPERTY_STYLE);
  vWidget.removeStyleProperty(qx.renderer.font.Font.PROPERTY_DECORATION);
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

  return qx.core.Object.prototype.dispose.call(this);
};
