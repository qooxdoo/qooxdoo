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

#package(guicore)
#require(qx.ui.basic.Image)
#require(qx.ui.basic.Label)

************************************************************************ */

/*!
  A multi-prupose widget used by many more complex widgets.

  The intended purpose of qx.ui.basic.Atom is to easily align the common icon-text combination in different ways.
  This is useful for all types of buttons, menuentires, tooltips, ...
*/
qx.ui.basic.Atom = function(vLabel, vIcon, vIconWidth, vIconHeight, vFlash)
{
  qx.ui.layout.BoxLayout.call(this);

  if (this.getOrientation() == null) {
    this.setOrientation(qx.Const.ORIENTATION_HORIZONTAL);
  };

  // Prohibit selection
  this.setSelectable(false);

  // Disable flex support
  this.getLayoutImpl().setEnableFlexSupport(false);

  // Apply constructor arguments
  if (qx.util.Validation.isValidString(vLabel)) {
    this.setLabel(vLabel);
  };

  // Simple flash wrapper
  if (qx.util.Validation.isValidString(vFlash) && qx.util.Validation.isValidNumber(vIconWidth) && qx.util.Validation.isValidNumber(vIconHeight) && qx.ui.embed.FlashEmbed && qx.ui.embed.FlashEmbed.getPlayerVersion().getMajor() > 0)
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
    };

    if (qx.util.Validation.isValidNumber(vIconHeight)) {
      this.setIconHeight(vIconHeight);
    };
  };
};

qx.ui.basic.Atom.extend(qx.ui.layout.BoxLayout, "qx.ui.basic.Atom");

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
qx.ui.basic.Atom.addProperty({ name : "label", type : qx.Const.TYPEOF_STRING });

/*!
  Any URI String supported by qx.ui.basic.Image to display a icon
*/
qx.ui.basic.Atom.addProperty({ name : "icon", type : qx.Const.TYPEOF_STRING });

/*!
  Configure the visibility of the sub elements/widgets.
  Possible values: both, text, icon, none
*/
qx.ui.basic.Atom.addProperty({ name : "show", type : qx.Const.TYPEOF_STRING, defaultValue : "both", possibleValues : [ "both", "label", "icon", qx.Const.CORE_NONE, null ] });

/*!
  The position of the icon in relation to the text.
  Only useful/needed if text and icon is configured and 'show' is configured as 'both' (default)
*/
qx.ui.basic.Atom.addProperty({ name : "iconPosition", type : qx.Const.TYPEOF_STRING, defaultValue : "left", possibleValues : [ "top", "right", "bottom", "left" ] });

/*!
  The width of the icon.
  If configured, this makes qx.ui.basic.Atom a little bit faster as it does not need to wait until the image loading is finished.
*/
qx.ui.basic.Atom.addProperty({ name : "iconWidth", type : qx.Const.TYPEOF_NUMBER });

/*!
  The height of the icon
  If configured, this makes qx.ui.basic.Atom a little bit faster as it does not need to wait until the image loading is finished.
*/
qx.ui.basic.Atom.addProperty({ name : "iconHeight", type : qx.Const.TYPEOF_NUMBER });

qx.ui.basic.Atom.changeProperty({ name : "appearance", type : qx.Const.TYPEOF_STRING, defaultValue : "atom" });





/*
---------------------------------------------------------------------------
  SUB WIDGETS
---------------------------------------------------------------------------
*/

proto._flashMode = false;

proto._labelObject = null;
proto._iconObject = null;

proto._createLabel = function()
{
  var l = this._labelObject = new qx.ui.basic.Label(this.getLabel());

  l.setAnonymous(true);
  l.setEnabled(this.getEnabled());
  l.setSelectable(false);

  this.addAt(l, this._iconObject ? 1 : 0);
};

proto._createIcon = function()
{
  if (this._flashMode)
  {
    var i = this._iconObject = new qx.ui.embed.FlashEmbed(this.getIcon());
  }
  else
  {
    var i = this._iconObject = new qx.ui.basic.Image(this.getIcon());
  };

  i.setAnonymous(true);
  i.setEnabled(this.getEnabled());

  this.addAt(i, 0);
};

proto.getLabelObject = function() {
  return this._labelObject;
};

proto.getIconObject = function() {
  return this._iconObject;
};






/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

proto._modifyEnabled = function(propValue, propOldValue, propData)
{
  if (this._iconObject) {
    this._iconObject.setEnabled(propValue);
  };

  if (this._labelObject) {
    this._labelObject.setEnabled(propValue);
  };

  return qx.ui.layout.BoxLayout.prototype._modifyEnabled.call(this, propValue, propOldValue, propData);
};

proto._modifyIconPosition = function(propValue, propOldValue, propData)
{
  switch(propValue)
  {
    case qx.Const.ALIGN_TOP:
    case qx.Const.ALIGN_BOTTOM:
      this.setOrientation(qx.Const.ORIENTATION_VERTICAL);
      this.setReverseChildrenOrder(propValue == qx.Const.ALIGN_BOTTOM);
      break;

    default:
      this.setOrientation(qx.Const.ORIENTATION_HORIZONTAL);
      this.setReverseChildrenOrder(propValue == qx.Const.ALIGN_RIGHT);
      break;
  };

  return true;
};

proto._modifyShow = function(propValue, propOldValue, propData)
{
  this._handleIcon();
  this._handleLabel();

  return true;
};

proto._modifyLabel = function(propValue, propOldValue, propData)
{
  if (this._labelObject) {
    this._labelObject.setHtml(propValue);
  };

  this._handleLabel();

  return true;
};

proto._modifyIcon = function(propValue, propOldValue, propData)
{
  if (this._iconObject) {
    this._iconObject.setSource(propValue);
  };

  this._handleIcon();

  return true;
};

proto._modifyIconWidth = function(propValue, propOldValue, propData)
{
  this._iconObject.setWidth(propValue);
  return true;
};

proto._modifyIconHeight = function(propValue, propOldValue, propData)
{
  this._iconObject.setHeight(propValue);
  return true;
};






/*
---------------------------------------------------------------------------
  HANDLER
---------------------------------------------------------------------------
*/

proto._iconIsVisible = false;
proto._labelIsVisible = false;

proto._handleLabel = function()
{
  switch(this.getShow())
  {
    case qx.ui.basic.Atom.SHOW_LABEL:
    case qx.ui.basic.Atom.SHOW_BOTH:
      this._labelIsVisible = qx.util.Validation.isValidString(this.getLabel());
      break;

    default:
      this._labelIsVisible = false;
  };

  if (this._labelIsVisible)
  {
    this._labelObject ? this._labelObject.setDisplay(true) : this._createLabel();
  }
  else if (this._labelObject)
  {
    this._labelObject.setDisplay(false);
  };
};

proto._handleIcon = function()
{
  switch(this.getShow())
  {
    case qx.ui.basic.Atom.SHOW_ICON:
    case qx.ui.basic.Atom.SHOW_BOTH:
      this._iconIsVisible = qx.util.Validation.isValidString(this.getIcon());
      break;

    default:
      this._iconIsVisible = false;
  };

  if (this._iconIsVisible)
  {
    this._iconObject ? this._iconObject.setDisplay(true) : this._createIcon();
  }
  else if (this._iconObject)
  {
    this._iconObject.setDisplay(false);
  };
};






/*
---------------------------------------------------------------------------
  CLONE
---------------------------------------------------------------------------
*/

// Omit recursive cloning
proto._cloneRecursive = qx.util.Return.returnTrue;







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

  if (this._iconObject)
  {
    this._iconObject.dispose();
    this._iconObject = null;
  };

  if (this._labelObject)
  {
    this._labelObject.dispose();
    this._labelObject = null;
  };

  return qx.ui.layout.BoxLayout.prototype.dispose.call(this);
};