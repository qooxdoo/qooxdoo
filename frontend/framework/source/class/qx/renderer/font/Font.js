/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(font)

************************************************************************ */

/*!
  Font implementation for qx.ui.core.Widget instances.
*/

qx.OO.defineClass("qx.renderer.font.Font", qx.core.Object,
function(vSize, vName)
{
  qx.core.Object.call(this);

  this._defs = {};

  if (qx.util.Validation.isValidNumber(vSize)) {
    this.setSize(vSize);
  }

  if (qx.util.Validation.isValidString(vName)) {
    this.setName(vName);
  }
});

qx.Class.STYLE_BOLD = "bold";
qx.Class.STYLE_NORMAL = "normal";
qx.Class.STYLE_ITALIC = "italic";
qx.Class.STYLE_UNDERLINE = "underline";
qx.Class.STYLE_STRIKEOUT = "strikeout";





/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.addProperty({ name : "size", type : qx.constant.Type.NUMBER, impl : "style" });
qx.OO.addProperty({ name : "name", type : qx.constant.Type.STRING, impl : "style" });
qx.OO.addProperty({ name : "bold", type : qx.constant.Type.BOOLEAN, defaultValue : false, impl : "style" });
qx.OO.addProperty({ name : "italic", type : qx.constant.Type.BOOLEAN, defaultValue : false, impl : "style" });
qx.OO.addProperty({ name : "underline", type : qx.constant.Type.BOOLEAN, defaultValue : false, impl : "style" });
qx.OO.addProperty({ name : "strikeout", type : qx.constant.Type.BOOLEAN, defaultValue : false, impl : "style" });





/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyStyle = function(propValue, propOldValue, propData)
{
  this._needsCompilation = true;
  return true;
}




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
      case qx.renderer.font.Font.STYLE_BOLD:
        vFont.setBold(true);
        break;

      case qx.renderer.font.Font.STYLE_ITALIC:
        vFont.setItalic(true);
        break;

      case qx.renderer.font.Font.STYLE_UNDERLINE:
        vFont.setUnderline(true);
        break;

      case qx.renderer.font.Font.STYLE_STRIKEOUT:
        vFont.setStrikeout(true);
        break;

      default:
        var vTemp = parseFloat(vPart);

        if(vTemp == vPart || qx.lang.String.contains(vPart, qx.constant.Core.PIXEL))
        {
          vFont.setSize(vTemp);
        }
        else
        {
          vName.push(vPart);
        }

        break;
    }
  }

  if(vName.length > 0) {
    vFont.setName(vName.join(qx.constant.Core.SPACE));
  }

  return vFont;
}




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

qx.Proto._needsCompilation = true;

qx.Proto._compile = function()
{
  var vName = this.getName();
  var vSize = this.getSize();
  var vBold = this.getBold();
  var vItalic = this.getItalic();
  var vUnderline = this.getUnderline();
  var vStrikeout = this.getStrikeout();
  var vDecoration = qx.constant.Core.EMPTY;

  if (this.getUnderline()) {
    vDecoration = qx.renderer.font.Font.STYLE_UNDERLINE;
  }

  if (this.getStrikeout()) {
    vDecoration += qx.constant.Core.SPACE + qx.renderer.font.Font.STYLE_STRIKEOUT;
  }

  this._defs.fontFamily = qx.util.Validation.isValidString(vName) ? vName : qx.constant.Core.EMPTY;
  this._defs.fontSize = qx.util.Validation.isValidNumber(vSize) ? vSize + qx.constant.Core.PIXEL : qx.constant.Core.EMPTY;
  this._defs.fontWeight = this.getBold() ? qx.renderer.font.Font.STYLE_BOLD : qx.renderer.font.Font.STYLE_NORMAL;
  this._defs.fontStyle = this.getItalic() ? qx.renderer.font.Font.STYLE_ITALIC : qx.renderer.font.Font.STYLE_NORMAL;
  this._defs.textDecoration = qx.util.Validation.isValidString(vDecoration) ? vDecoration : qx.constant.Core.EMPTY;

  this._needsCompilation = false;
}

qx.Proto.applyWidget = function(vWidget)
{
  if (this._needsCompilation) {
    this._compile();
  }

  vWidget.setStyleProperty(qx.renderer.font.Font.PROPERTY_FAMILY, this._defs.fontFamily);
  vWidget.setStyleProperty(qx.renderer.font.Font.PROPERTY_SIZE, this._defs.fontSize);
  vWidget.setStyleProperty(qx.renderer.font.Font.PROPERTY_WEIGHT, this._defs.fontWeight);
  vWidget.setStyleProperty(qx.renderer.font.Font.PROPERTY_STYLE, this._defs.fontStyle);
  vWidget.setStyleProperty(qx.renderer.font.Font.PROPERTY_DECORATION, this._defs.textDecoration);
}

qx.Proto.resetWidget = function(vWidget)
{
  vWidget.removeStyleProperty(qx.renderer.font.Font.PROPERTY_FAMILY);
  vWidget.removeStyleProperty(qx.renderer.font.Font.PROPERTY_SIZE);
  vWidget.removeStyleProperty(qx.renderer.font.Font.PROPERTY_WEIGHT);
  vWidget.removeStyleProperty(qx.renderer.font.Font.PROPERTY_STYLE);
  vWidget.removeStyleProperty(qx.renderer.font.Font.PROPERTY_DECORATION);
}






/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  }

  delete this._defs;

  return qx.core.Object.prototype.dispose.call(this);
}
