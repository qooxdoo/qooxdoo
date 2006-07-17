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

#module(guicore)
#require(qx.ui.basic.Image)
#require(qx.ui.basic.Label)

************************************************************************ */

/*!
  A multi-prupose widget used by many more complex widgets.

  The intended purpose of qx.ui.basic.Atom is to easily align the common icon-text combination in different ways.
  This is useful for all types of buttons, menuentires, tooltips, ...
*/
qx.OO.defineClass("qx.ui.basic.Atom", qx.ui.layout.BoxLayout,
function(vLabel, vIcon, vIconWidth, vIconHeight, vFlash)
{
  qx.ui.layout.BoxLayout.call(this);

  if (this.getOrientation() == null) {
    this.setOrientation(qx.constant.Layout.ORIENTATION_HORIZONTAL);
  }

  // Prohibit selection
  this.setSelectable(false);

  // Disable flex support
  this.getLayoutImpl().setEnableFlexSupport(false);

  // Apply constructor arguments
  if (qx.util.Validation.isValidString(vLabel)) {
    this.setLabel(vLabel);
  }

  // Simple flash wrapper
  if (qx.util.Validation.isValidString(vFlash) && qx.util.Validation.isValidNumber(vIconWidth) && qx.util.Validation.isValidNumber(vIconHeight) && qx.ui.embed.Flash && qx.ui.embed.Flash.getPlayerVersion().getMajor() > 0)
  {
    this._flashMode = true;

    this.setIcon(vFlash);

    // flash needs explicit dimensions!
    this.setIconWidth(vIconWidth);
    this.setIconHeight(vIconHeight);
  }
  else if (qx.util.Validation.isValidString(vIcon))
  {
    this.setIcon(vIcon);

    if (qx.util.Validation.isValidNumber(vIconWidth)) {
      this.setIconWidth(vIconWidth);
    }

    if (qx.util.Validation.isValidNumber(vIconHeight)) {
      this.setIconHeight(vIconHeight);
    }
  }
});

qx.ui.basic.Atom.SHOW_LABEL = "label";
qx.ui.basic.Atom.SHOW_ICON = "icon";
qx.ui.basic.Atom.SHOW_BOTH = "both";


/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  The label/caption/text of the qx.ui.basic.Atom instance
*/
qx.OO.addProperty({ name : "label", type : qx.constant.Type.STRING });

/*!
  Any URI String supported by qx.ui.basic.Image to display a icon
*/
qx.OO.addProperty({ name : "icon", type : qx.constant.Type.STRING });

/*!
  Configure the visibility of the sub elements/widgets.
  Possible values: both, text, icon, none
*/
qx.OO.addProperty({ name : "show", type : qx.constant.Type.STRING, defaultValue : "both", possibleValues : [ "both", "label", "icon", qx.constant.Core.NONE, null ] });

/*!
  The position of the icon in relation to the text.
  Only useful/needed if text and icon is configured and 'show' is configured as 'both' (default)
*/
qx.OO.addProperty({ name : "iconPosition", type : qx.constant.Type.STRING, defaultValue : "left", possibleValues : [ "top", "right", "bottom", "left" ] });

/*!
  The width of the icon.
  If configured, this makes qx.ui.basic.Atom a little bit faster as it does not need to wait until the image loading is finished.
*/
qx.OO.addProperty({ name : "iconWidth", type : qx.constant.Type.NUMBER });

/*!
  The height of the icon
  If configured, this makes qx.ui.basic.Atom a little bit faster as it does not need to wait until the image loading is finished.
*/
qx.OO.addProperty({ name : "iconHeight", type : qx.constant.Type.NUMBER });

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "atom" });





/*
---------------------------------------------------------------------------
  SUB WIDGETS
---------------------------------------------------------------------------
*/

qx.Proto._flashMode = false;

qx.Proto._labelObject = null;
qx.Proto._iconObject = null;

qx.Proto._createLabel = function()
{
  var l = this._labelObject = new qx.ui.basic.Label(this.getLabel());

  l.setAnonymous(true);
  l.setEnabled(this.getEnabled());
  l.setSelectable(false);

  this.addAt(l, this._iconObject ? 1 : 0);
}

qx.Proto._createIcon = function()
{
  if (this._flashMode)
  {
    var i = this._iconObject = new qx.ui.embed.Flash(this.getIcon());
  }
  else
  {
    var i = this._iconObject = new qx.ui.basic.Image(this.getIcon());
  }

  i.setAnonymous(true);
  i.setEnabled(this.getEnabled());

  this.addAt(i, 0);
}

qx.Proto.getLabelObject = function() {
  return this._labelObject;
}

qx.Proto.getIconObject = function() {
  return this._iconObject;
}






/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

qx.Proto._modifyEnabled = function(propValue, propOldValue, propData)
{
  if (this._iconObject) {
    this._iconObject.setEnabled(propValue);
  }

  if (this._labelObject) {
    this._labelObject.setEnabled(propValue);
  }

  return qx.ui.layout.BoxLayout.prototype._modifyEnabled.call(this, propValue, propOldValue, propData);
}

qx.Proto._modifyIconPosition = function(propValue, propOldValue, propData)
{
  switch(propValue)
  {
    case qx.constant.Layout.ALIGN_TOP:
    case qx.constant.Layout.ALIGN_BOTTOM:
      this.setOrientation(qx.constant.Layout.ORIENTATION_VERTICAL);
      this.setReverseChildrenOrder(propValue == qx.constant.Layout.ALIGN_BOTTOM);
      break;

    default:
      this.setOrientation(qx.constant.Layout.ORIENTATION_HORIZONTAL);
      this.setReverseChildrenOrder(propValue == qx.constant.Layout.ALIGN_RIGHT);
      break;
  }

  return true;
}

qx.Proto._modifyShow = function(propValue, propOldValue, propData)
{
  this._handleIcon();
  this._handleLabel();

  return true;
}

qx.Proto._modifyLabel = function(propValue, propOldValue, propData)
{
  if (this._labelObject) {
    this._labelObject.setHtml(propValue);
  }

  this._handleLabel();

  return true;
}

qx.Proto._modifyIcon = function(propValue, propOldValue, propData)
{
  if (this._iconObject) {
    this._iconObject.setSource(propValue);
  }

  this._handleIcon();

  return true;
}

qx.Proto._modifyIconWidth = function(propValue, propOldValue, propData)
{
  this._iconObject.setWidth(propValue);
  return true;
}

qx.Proto._modifyIconHeight = function(propValue, propOldValue, propData)
{
  this._iconObject.setHeight(propValue);
  return true;
}






/*
---------------------------------------------------------------------------
  HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._iconIsVisible = false;
qx.Proto._labelIsVisible = false;

qx.Proto._handleLabel = function()
{
  switch(this.getShow())
  {
    case qx.ui.basic.Atom.SHOW_LABEL:
    case qx.ui.basic.Atom.SHOW_BOTH:
      this._labelIsVisible = qx.util.Validation.isValidString(this.getLabel());
      break;

    default:
      this._labelIsVisible = false;
  }

  if (this._labelIsVisible)
  {
    this._labelObject ? this._labelObject.setDisplay(true) : this._createLabel();
  }
  else if (this._labelObject)
  {
    this._labelObject.setDisplay(false);
  }
}

qx.Proto._handleIcon = function()
{
  switch(this.getShow())
  {
    case qx.ui.basic.Atom.SHOW_ICON:
    case qx.ui.basic.Atom.SHOW_BOTH:
      this._iconIsVisible = qx.util.Validation.isValidString(this.getIcon());
      break;

    default:
      this._iconIsVisible = false;
  }

  if (this._iconIsVisible)
  {
    this._iconObject ? this._iconObject.setDisplay(true) : this._createIcon();
  }
  else if (this._iconObject)
  {
    this._iconObject.setDisplay(false);
  }
}






/*
---------------------------------------------------------------------------
  CLONE
---------------------------------------------------------------------------
*/

// Omit recursive cloning
qx.Proto._cloneRecursive = qx.util.Return.returnTrue;







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

  if (this._iconObject)
  {
    this._iconObject.dispose();
    this._iconObject = null;
  }

  if (this._labelObject)
  {
    this._labelObject.dispose();
    this._labelObject = null;
  }

  return qx.ui.layout.BoxLayout.prototype.dispose.call(this);
}