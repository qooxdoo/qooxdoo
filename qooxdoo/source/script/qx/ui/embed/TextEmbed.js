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

#module(simpleterminators)

************************************************************************ */

qx.OO.defineClass("qx.ui.embed.TextEmbed", qx.ui.basic.Terminator, 
function(vText)
{
  qx.ui.basic.Terminator.call(this);

  if (qx.util.Validation.isValidString(vText)) {
    this.setText(vText);
  }
});




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  Any text string which can contain TEXT, too
*/
qx.OO.addProperty({ name : "text", type : qx.constant.Type.STRING });

/*!
  The font property describes how to paint the font on the widget.
*/
qx.OO.addProperty({ name : "font", type : qx.constant.Type.OBJECT, instance : "qx.renderer.font.Font", convert : qx.renderer.font.FontCache, allowMultipleArguments : true });

/*!
  Wrap the text?
*/
qx.OO.addProperty({ name : "wrap", type : qx.constant.Type.BOOLEAN, defaultValue : true });

/** The horizontal alignment of the text. */
qx.OO.addProperty({ name : "textAlign", type : qx.constant.Type.STRING, defaultValue : "left", possibleValues : [ "left", "center", "right", "justify" ], allowNull : false });




/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyText = function()
{
  if (this._isCreated) {
    this._syncText();
  }

  return true;
}

qx.Proto._modifyFont = function(propValue, propOldValue, propData)
{
  if (propValue) {
    propValue.applyWidget(this);
  } else if (propOldValue) {
    propOldValue.resetWidget(this);
  }

  return true;
}

qx.Proto._modifyWrap = function(propValue, propOldValue, propData)
{
  this.setStyleProperty(qx.constant.Style.PROPERTY_WHITESPACE, propValue ? "normal" : "nowrap");
  return true;
}

// property modifier
qx.Proto._modifyTextAlign = function(propValue, propOldValue, propData) {
  this.setStyleProperty("textAlign", propValue);
  return true;
}





/*
---------------------------------------------------------------------------
  ELEMENT HANDLING
---------------------------------------------------------------------------
*/

qx.Proto._applyElementData = function() {
  this.getElement().appendChild(document.createTextNode(this.getText()));
}

qx.Proto._syncText = function() {
  this.getElement().firstChild.nodeValue = this.getText();
}
