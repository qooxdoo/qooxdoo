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
#require(QxFontCache)

************************************************************************ */

function QxHtml(vHtml)
{
  QxTerminator.call(this);

  if (QxUtil.isValidString(vHtml)) {
    this.setHtml(vHtml);
  };
};

QxHtml.extend(QxTerminator, "QxHtml");




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  Any text string which can contain HTML, too
*/
QxHtml.addProperty({ name : "html", type : QxConst.TYPEOF_STRING });

/*!
  The font property describes how to paint the font on the widget.
*/
QxHtml.addProperty({ name : "font", type : QxConst.TYPEOF_OBJECT, instance : "QxFont", convert : QxFontCache, allowMultipleArguments : true });

/*!
  Wrap the text?
*/
QxHtml.addProperty({ name : "wrap", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });




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
  this.setStyleProperty(QxConst.PROPERTY_WHITESPACE, propValue ? "normal" : "nowrap");
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
