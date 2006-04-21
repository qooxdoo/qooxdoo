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

#package(simpleterminators)
#require(qx.renderer.font.FontCache)

************************************************************************ */

qx.ui.embed.HtmlEmbed = function(vHtml)
{
  qx.ui.basic.Terminator.call(this);

  if (qx.util.Validation.isValidString(vHtml)) {
    this.setHtml(vHtml);
  };
};

qx.ui.embed.HtmlEmbed.extend(qx.ui.basic.Terminator, "qx.ui.embed.HtmlEmbed");




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  Any text string which can contain HTML, too
*/
qx.ui.embed.HtmlEmbed.addProperty({ name : "html", type : qx.Const.TYPEOF_STRING });

/*!
  The font property describes how to paint the font on the widget.
*/
qx.ui.embed.HtmlEmbed.addProperty({ name : "font", type : qx.Const.TYPEOF_OBJECT, instance : "qx.renderer.font.Font", convert : qx.renderer.font.FontCache, allowMultipleArguments : true });

/*!
  Wrap the text?
*/
qx.ui.embed.HtmlEmbed.addProperty({ name : "wrap", type : qx.Const.TYPEOF_BOOLEAN, defaultValue : true });




/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyHtml = function()
{
  if (this._isCreated) {
    this._syncHtml();
  };

  return true;
};

proto._modifyFont = function(propValue, propOldValue, propData)
{
  if (propValue) {
    propValue.applyWidget(this);
  } else if (propOldValue) {
    propOldValue.resetWidget(this);
  };

  return true;
};

proto._modifyWrap = function(propValue, propOldValue, propData)
{
  this.setStyleProperty(qx.Const.PROPERTY_WHITESPACE, propValue ? "normal" : "nowrap");
  return true;
};





/*
---------------------------------------------------------------------------
  ELEMENT HANDLING
---------------------------------------------------------------------------
*/

proto._applyElementData = function() {
  this._syncHtml();
};

proto._syncHtml = function() {
  this.getElement().innerHTML = this.getHtml();
};
