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

#package(tree)
#post(QxHtml)
#post(QxImage)
#post(QxLabel)
#post(QxImageManager)

************************************************************************ */

function QxTreeElement(vLabel, vIcon, vIconSelected)
{
  if (this.classname == QxTreeElement.OMIT_CLASS) {
    throw new Error("Please omit the usage of QxTreeElement directly. Choose between QxTreeFolder and QxTreeFile instead!");
  };

  // Precreate subwidgets
  this._indentObject = new QxHtml;
  this._iconObject = new QxImage;
  this._labelObject = new QxLabel;

  // Make anonymous
  this._indentObject.setAnonymous(true);
  this._iconObject.setAnonymous(true);
  this._labelObject.setAnonymous(true);

  // Behaviour and Hard Styling
  this._labelObject.setSelectable(false);
  this._labelObject.setStyleProperty(QxConst.PROPERTY_LINEHEIGHT, QxConst.CORE_HUNDREDPERCENT);

  QxBoxLayout.call(this, QxConst.ORIENTATION_HORIZONTAL);

  if (QxUtil.isValid(vLabel)) {
    this.setLabel(vLabel);
  };

  // Prohibit selection
  this.setSelectable(false);

  // Base URL used for indent images
  this.BASE_URI = QxImageManager.buildUri("widgets/tree/");

  // Adding subwidgets
  this.add(this._indentObject, this._iconObject, this._labelObject);

  // Set Icons
  if ((vIcon != null) && (QxUtil.isValidString(vIcon))) {
    this.setIcon(vIcon);
    this.setIconSelected(vIcon);
  };
  if ((vIconSelected != null) && (QxUtil.isValidString(vIconSelected))) {
    this.setIconSelected(vIconSelected);
  };


  // Set Appearance
  this._iconObject.setAppearance("tree-element-icon");
  this._labelObject.setAppearance("tree-element-label");

  // Register event listeners
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onmousedown);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEUP, this._onmouseup);
};

QxTreeElement.extend(QxBoxLayout, "QxTreeElement");

QxTreeElement.OMIT_CLASS = "QxTreeElement";




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxTreeElement.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "tree-element" });

/*!
  The icons
*/
QxTreeElement.addProperty({ name : "icon", type : QxConst.TYPEOF_STRING });
QxTreeElement.addProperty({ name : "iconSelected", type : QxConst.TYPEOF_STRING });

/*!
  The label/caption/text of the QxAtom instance
*/
QxTreeElement.addProperty({ name : "label", type : QxConst.TYPEOF_STRING });

/*!
  Selected property
*/
QxTreeElement.addProperty({ name : "selected", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });






/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyLabel = function(propValue, propOldValue, propData)
{
  if (this._labelObject) {
    this._labelObject.setHtml(propValue);
  };

  return true;
};

proto._modifySelected = function(propValue, propOldValue, propData)
{
  propValue ? this.addState(QxConst.STATE_SELECTED) : this.removeState(QxConst.STATE_SELECTED);
  propValue ? this._labelObject.addState(QxConst.STATE_SELECTED) : this._labelObject.removeState(QxConst.STATE_SELECTED);

  var vTree = this.getTree();
  if (!vTree._fastUpdate || (propOldValue && vTree._oldItem == this)) {
    propValue ? this._iconObject.addState(QxConst.STATE_SELECTED) : this._iconObject.removeState(QxConst.STATE_SELECTED);
  };

  var vManager = this.getTree().getManager();

  if (propOldValue && vManager.getSelectedItem() == this)
  {
    vManager.deselectAll();
  }
  else if (propValue && vManager.getSelectedItem() != this)
  {
    vManager.setSelectedItem(this);
  };

  return true;
};






/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

proto.getParentFolder = function()
{
  try {
    return this.getParent().getParent();
  } catch(ex) {};

  return null;
};

proto.getLevel = function()
{
  var vParentFolder = this.getParentFolder();
  return vParentFolder ? vParentFolder.getLevel() + 1 : null;
};

proto.getTree = function()
{
  var vParentFolder = this.getParentFolder();
  return vParentFolder ? vParentFolder.getTree() : null;
};

proto.getIndentObject = function() {
  return this._indentObject;
};

proto.getIconObject = function() {
  return this._iconObject;
};

proto.getLabelObject = function() {
  return this._labelObject;
};






/*
---------------------------------------------------------------------------
  QUEUE HANDLING
---------------------------------------------------------------------------
*/

proto.addToTreeQueue = function()
{
  var vTree = this.getTree();
  if (vTree) {
    vTree.addChildToTreeQueue(this);
  };
};

proto.removeFromTreeQueue = function()
{
  var vTree = this.getTree();
  if (vTree) {
    vTree.removeChildFromTreeQueue(this);
  };
};

proto.addToCustomQueues = function(vHint)
{
  this.addToTreeQueue();

  QxBoxLayout.prototype.addToCustomQueues.call(this, vHint);
};

proto.removeFromCustomQueues = function(vHint)
{
  this.removeFromTreeQueue();

  QxBoxLayout.prototype.removeFromCustomQueues.call(this, vHint);
};








/*
---------------------------------------------------------------------------
  DISPLAYBLE HANDLING
---------------------------------------------------------------------------
*/

proto._modifyParent = function(propValue, propOldValue, propData)
{
  QxBoxLayout.prototype._modifyParent.call(this, propValue, propOldValue, propData);

  // Be sure to update previous folder also if it is closed currently (plus/minus symbol)
  if (propOldValue && !propOldValue.isDisplayable() && propOldValue.getParent() && propOldValue.getParent().isDisplayable()) {
    propOldValue.getParent().addToTreeQueue();
  };

  // Be sure to update new folder also if it is closed currently (plus/minus symbol)
  if (propValue && !propValue.isDisplayable() && propValue.getParent() && propValue.getParent().isDisplayable()) {
    propValue.getParent().addToTreeQueue();
  };

  return true;
};

proto._handleDisplayableCustom = function(vDisplayable, vParent, vHint)
{
  QxBoxLayout.prototype._handleDisplayableCustom.call(this, vDisplayable, vParent, vHint);

  if (vHint)
  {
    var vParentFolder = this.getParentFolder();
    var vPreviousParentFolder = this._previousParentFolder;

    if (vPreviousParentFolder)
    {
      if (this._wasLastVisibleChild)
      {
        vPreviousParentFolder._updateIndent();
      }
      else if (!vPreviousParentFolder.hasContent())
      {
        vPreviousParentFolder.addToTreeQueue();
      };
    };

    if (vParentFolder && vParentFolder.isDisplayable() && vParentFolder._initialLayoutDone) {
      vParentFolder.addToTreeQueue();
    };

    if (this.isLastVisibleChild())
    {
      var vPrev = this.getPreviousVisibleSibling();

      if (vPrev && vPrev instanceof QxTreeElement) {
        vPrev._updateIndent();
      };
    };

    if (vDisplayable) {
      this._updateIndent();
    };
  };
};







/*
---------------------------------------------------------------------------
  EVENT LISTENERS
---------------------------------------------------------------------------
*/

proto._onmousedown = function(e)
{
  this.getTree().getManager().handleMouseDown(this, e);
  e.stopPropagation();
};

proto._onmouseup = QxUtil.returnTrue;





/*
---------------------------------------------------------------------------
  TREE FLUSH
---------------------------------------------------------------------------
*/

QxTreeElement.INDENT_CODE_1 = "<img style=\"position:absolute;top:0px;left:";
QxTreeElement.INDENT_CODE_2 = "px\" src=\"";
QxTreeElement.INDENT_CODE_3 = "\" />";

QxTreeElement.IMG_EXTENSION = "gif";

proto.flushTree = function()
{
  // store informations for update process
  this._previousParentFolder = this.getParentFolder();
  this._wasLastVisibleChild = this.isLastVisibleChild();

  // generate html for indent area
  var vLevel = this.getLevel();
  var vTree = this.getTree();
  var vImage;
  var vHtml = [];
  var vCurrentObject = this;

  for (var i=0; i<vLevel; i++)
  {
    vImage = vCurrentObject.getIndentSymbol(vTree.getUseTreeLines(), i==0);

    if (vImage)
    {
      vHtml.push(QxTreeElement.INDENT_CODE_1);
      vHtml.push((vLevel-i-1) * 19);
      vHtml.push(QxTreeElement.INDENT_CODE_2);
      vHtml.push(this.BASE_URI);
      vHtml.push(vImage);
      vHtml.push(QxConst.CORE_DOT);
      vHtml.push(QxTreeElement.IMG_EXTENSION);
      vHtml.push(QxTreeElement.INDENT_CODE_3);
    };

    vCurrentObject = vCurrentObject.getParentFolder();
  };

  this._indentObject.setHtml(vHtml.join(QxConst.CORE_EMPTY));
  this._indentObject.setWidth(vLevel * 19);
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

  if (this._indentObject)
  {
    this._indentObject.dispose();
    this._indentObject = null;
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

  this._previousParentFolder = null;

  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onmousedown);
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEUP, this._onmouseup);

  return QxBoxLayout.prototype.dispose.call(this);
};
