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

************************************************************************ */

qx.ui.embed.TextEmbed = function(vText)
{
  qx.ui.basic.Terminator.call(this);

  if (qx.util.Validation.isValidString(vText)) {
    this.setText(vText);
  };
};

qx.ui.embed.TextEmbed.extend(qx.ui.basic.Terminator, "qx.ui.embed.TextEmbed");




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  Any text string which can contain TEXT, too
*/
qx.ui.embed.TextEmbed.addProperty({ name : "text", type : qx.Const.TYPEOF_STRING });

/*!
  The font property describes how to paint the font on the widget.
*/
qx.ui.embed.TextEmbed.addProperty({ name : "font", type : qx.Const.TYPEOF_OBJECT, instance : "qx.renderer.font.Font", convert : qx.renderer.font.FontCache, allowMultipleArguments : true });

/*!
  Wrap the text?
*/
qx.ui.embed.TextEmbed.addProperty({ name : "wrap", type : qx.Const.TYPEOF_BOOLEAN, defaultValue : true });




/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyText = function()
{
  if (this._isCreated) {
    this._syncText();
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
  this.getElement().appendChild(document.createTextNode(this.getText()));
};

proto._syncText = function() {
  this.getElement().firstChild.nodeValue = this.getText();
};
