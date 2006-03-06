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
#require(QxImage)
#require(QxLabel)

************************************************************************ */

/*!
  A multi-prupose widget used by many more complex widgets.

  The intended purpose of QxAtom is to easily align the common icon-text combination in different ways.
  This is useful for all types of buttons, menuentires, tooltips, ...
*/
function QxAtom(vLabel, vIcon, vIconWidth, vIconHeight, vFlash)
{
  QxBoxLayout.call(this);

  if (this.getOrientation() == null) {
    this.setOrientation(QxConst.ORIENTATION_HORIZONTAL);
  };

  // Prohibit selection
  this.setSelectable(false);

  // Disable flex support
  this.getLayoutImpl().setEnableFlexSupport(false);

  // Apply constructor arguments
  if (QxUtil.isValidString(vLabel)) {
    this.setLabel(vLabel);
  };

  // Simple flash wrapper
  if (QxUtil.isValidString(vFlash) && QxUtil.isValidNumber(vIconWidth) && QxUtil.isValidNumber(vIconHeight) && QxFlash && QxFlash.getPlayerVersion().getMajor() > 0)
  {
    this._flashMode = true;

    this.setIcon(vFlash);

    // flash needs explicit dimensions!
    this.setIconWidth(vIconWidth);
    this.setIconHeight(vIconHeight);
  }
  else if (QxUtil.isValidString(vIcon))
  {
    this.setIcon(vIcon);

    if (QxUtil.isValidNumber(vIconWidth)) {
      this.setIconWidth(vIconWidth);
    };

    if (QxUtil.isValidNumber(vIconHeight)) {
      this.setIconHeight(vIconHeight);
    };
  };
};

QxAtom.extend(QxBoxLayout, "QxAtom");

QxAtom.SHOW_LABEL = "label";
QxAtom.SHOW_ICON = "icon";
QxAtom.SHOW_BOTH = "both";


/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  The label/caption/text of the QxAtom instance
*/
QxAtom.addProperty({ name : "label", type : QxConst.TYPEOF_STRING });

/*!
  Any URI String supported by QxImage to display a icon
*/
QxAtom.addProperty({ name : "icon", type : QxConst.TYPEOF_STRING });

/*!
  Configure the visibility of the sub elements/widgets.
  Possible values: both, text, icon, none
*/
QxAtom.addProperty({ name : "show", type : QxConst.TYPEOF_STRING, defaultValue : "both", possibleValues : [ "both", "label", "icon", QxConst.CORE_NONE, null ] });

/*!
  The position of the icon in relation to the text.
  Only useful/needed if text and icon is configured and 'show' is configured as 'both' (default)
*/
QxAtom.addProperty({ name : "iconPosition", type : QxConst.TYPEOF_STRING, defaultValue : "left", possibleValues : [ "top", "right", "bottom", "left" ] });

/*!
  The width of the icon.
  If configured, this makes QxAtom a little bit faster as it does not need to wait until the image loading is finished.
*/
QxAtom.addProperty({ name : "iconWidth", type : QxConst.TYPEOF_NUMBER });

/*!
  The height of the icon
  If configured, this makes QxAtom a little bit faster as it does not need to wait until the image loading is finished.
*/
QxAtom.addProperty({ name : "iconHeight", type : QxConst.TYPEOF_NUMBER });

QxAtom.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "atom" });





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
  var l = this._labelObject = new QxLabel(this.getLabel());

  l.setAnonymous(true);
  l.setEnabled(this.getEnabled());
  l.setSelectable(false);

  this.addAt(l, this._iconObject ? 1 : 0);
};

proto._createIcon = function()
{
  if (this._flashMode)
  {
    var i = this._iconObject = new QxFlash(this.getIcon());
  }
  else
  {
    var i = this._iconObject = new QxImage(this.getIcon());
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

  return QxBoxLayout.prototype._modifyEnabled.call(this, propValue, propOldValue, propData);
};

proto._modifyIconPosition = function(propValue, propOldValue, propData)
{
  switch(propValue)
  {
    case QxConst.ALIGN_TOP:
    case QxConst.ALIGN_BOTTOM:
      this.setOrientation(QxConst.ORIENTATION_VERTICAL);
      this.setReverseChildrenOrder(propValue == QxConst.ALIGN_BOTTOM);
      break;

    default:
      this.setOrientation(QxConst.ORIENTATION_HORIZONTAL);
      this.setReverseChildrenOrder(propValue == QxConst.ALIGN_RIGHT);
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
    case QxAtom.SHOW_LABEL:
    case QxAtom.SHOW_BOTH:
      this._labelIsVisible = QxUtil.isValidString(this.getLabel());
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
    case QxAtom.SHOW_ICON:
    case QxAtom.SHOW_BOTH:
      this._iconIsVisible = QxUtil.isValidString(this.getIcon());
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
proto._cloneRecursive = QxUtil.returnTrue;







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

  return QxBoxLayout.prototype.dispose.call(this);
};