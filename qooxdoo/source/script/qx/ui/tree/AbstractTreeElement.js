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

#module(tree)
#use(qx.ui.embed.HtmlEmbed)
#use(qx.ui.basic.Image)
#use(qx.ui.basic.Label)
#use(qx.manager.object.ImageManager)

************************************************************************ */

qx.OO.defineClass("qx.ui.tree.AbstractTreeElement", qx.ui.layout.BoxLayout, 
function(vLabel, vIcon, vIconSelected)
{
  if (this.classname == qx.ui.tree.AbstractTreeElement.ABSTRACT_CLASS) {
    throw new Error("Please omit the usage of qx.ui.tree.AbstractTreeElement directly. Choose between qx.ui.tree.TreeFolder and qx.ui.tree.TreeFile instead!");
  }

  // Precreate subwidgets
  this._indentObject = new qx.ui.embed.HtmlEmbed;
  this._iconObject = new qx.ui.basic.Image;
  this._labelObject = new qx.ui.basic.Label;

  // Make anonymous
  this._indentObject.setAnonymous(true);
  this._iconObject.setAnonymous(true);
  this._labelObject.setAnonymous(true);

  // Behaviour and Hard Styling
  this._labelObject.setSelectable(false);
  this._labelObject.setStyleProperty(qx.constant.Style.PROPERTY_LINEHEIGHT, qx.constant.Core.HUNDREDPERCENT);

  qx.ui.layout.BoxLayout.call(this, qx.constant.Layout.ORIENTATION_HORIZONTAL);

  if (qx.util.Validation.isValid(vLabel)) {
    this.setLabel(vLabel);
  }

  // Prohibit selection
  this.setSelectable(false);

  // Base URL used for indent images
  this.BASE_URI = qx.manager.object.ImageManager.buildUri("widgets/tree/");

  // Adding subwidgets
  this.add(this._indentObject, this._iconObject, this._labelObject);

  // Set Icons
  if ((vIcon != null) && (qx.util.Validation.isValidString(vIcon))) {
    this.setIcon(vIcon);
    this.setIconSelected(vIcon);
  }
  if ((vIconSelected != null) && (qx.util.Validation.isValidString(vIconSelected))) {
    this.setIconSelected(vIconSelected);
  }


  // Set Appearance
  this._iconObject.setAppearance("tree-element-icon");
  this._labelObject.setAppearance("tree-element-label");

  // Register event listeners
  this.addEventListener(qx.constant.Event.MOUSEDOWN, this._onmousedown);
  this.addEventListener(qx.constant.Event.MOUSEUP, this._onmouseup);
});

qx.ui.tree.AbstractTreeElement.ABSTRACT_CLASS = "qx.ui.tree.AbstractTreeElement";




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "tree-element" });

/*!
  The icons
*/
qx.OO.addProperty({ name : "icon", type : qx.constant.Type.STRING });
qx.OO.addProperty({ name : "iconSelected", type : qx.constant.Type.STRING });

/*!
  The label/caption/text of the qx.ui.basic.Atom instance
*/
qx.OO.addProperty({ name : "label", type : qx.constant.Type.STRING });

/*!
  Selected property
*/
qx.OO.addProperty({ name : "selected", type : qx.constant.Type.BOOLEAN, defaultValue : false });






/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyLabel = function(propValue, propOldValue, propData)
{
  if (this._labelObject) {
    this._labelObject.setHtml(propValue);
  }

  return true;
}

qx.Proto._modifySelected = function(propValue, propOldValue, propData)
{
  propValue ? this.addState(qx.manager.selection.SelectionManager.STATE_SELECTED) : this.removeState(qx.manager.selection.SelectionManager.STATE_SELECTED);
  propValue ? this._labelObject.addState(qx.manager.selection.SelectionManager.STATE_SELECTED) : this._labelObject.removeState(qx.manager.selection.SelectionManager.STATE_SELECTED);

  var vTree = this.getTree();
  if (!vTree._fastUpdate || (propOldValue && vTree._oldItem == this)) {
    propValue ? this._iconObject.addState(qx.manager.selection.SelectionManager.STATE_SELECTED) : this._iconObject.removeState(qx.manager.selection.SelectionManager.STATE_SELECTED);
  }

  var vManager = this.getTree().getManager();

  if (propOldValue && vManager.getSelectedItem() == this)
  {
    vManager.deselectAll();
  }
  else if (propValue && vManager.getSelectedItem() != this)
  {
    vManager.setSelectedItem(this);
  }

  return true;
}






/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

qx.Proto.getParentFolder = function()
{
  try {
    return this.getParent().getParent();
  } catch(ex) {}

  return null;
}

qx.Proto.getLevel = function()
{
  var vParentFolder = this.getParentFolder();
  return vParentFolder ? vParentFolder.getLevel() + 1 : null;
}

qx.Proto.getTree = function()
{
  var vParentFolder = this.getParentFolder();
  return vParentFolder ? vParentFolder.getTree() : null;
}

qx.Proto.getIndentObject = function() {
  return this._indentObject;
}

qx.Proto.getIconObject = function() {
  return this._iconObject;
}

qx.Proto.getLabelObject = function() {
  return this._labelObject;
}






/*
---------------------------------------------------------------------------
  QUEUE HANDLING
---------------------------------------------------------------------------
*/

qx.Proto.addToTreeQueue = function()
{
  var vTree = this.getTree();
  if (vTree) {
    vTree.addChildToTreeQueue(this);
  }
}

qx.Proto.removeFromTreeQueue = function()
{
  var vTree = this.getTree();
  if (vTree) {
    vTree.removeChildFromTreeQueue(this);
  }
}

qx.Proto.addToCustomQueues = function(vHint)
{
  this.addToTreeQueue();

  qx.ui.layout.BoxLayout.prototype.addToCustomQueues.call(this, vHint);
}

qx.Proto.removeFromCustomQueues = function(vHint)
{
  this.removeFromTreeQueue();

  qx.ui.layout.BoxLayout.prototype.removeFromCustomQueues.call(this, vHint);
}








/*
---------------------------------------------------------------------------
  DISPLAYBLE HANDLING
---------------------------------------------------------------------------
*/

qx.Proto._modifyParent = function(propValue, propOldValue, propData)
{
  qx.ui.layout.BoxLayout.prototype._modifyParent.call(this, propValue, propOldValue, propData);

  // Be sure to update previous folder also if it is closed currently (plus/minus symbol)
  if (propOldValue && !propOldValue.isDisplayable() && propOldValue.getParent() && propOldValue.getParent().isDisplayable()) {
    propOldValue.getParent().addToTreeQueue();
  }

  // Be sure to update new folder also if it is closed currently (plus/minus symbol)
  if (propValue && !propValue.isDisplayable() && propValue.getParent() && propValue.getParent().isDisplayable()) {
    propValue.getParent().addToTreeQueue();
  }

  return true;
}

qx.Proto._handleDisplayableCustom = function(vDisplayable, vParent, vHint)
{
  qx.ui.layout.BoxLayout.prototype._handleDisplayableCustom.call(this, vDisplayable, vParent, vHint);

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
      }
    }

    if (vParentFolder && vParentFolder.isDisplayable() && vParentFolder._initialLayoutDone) {
      vParentFolder.addToTreeQueue();
    }

    if (this.isLastVisibleChild())
    {
      var vPrev = this.getPreviousVisibleSibling();

      if (vPrev && vPrev instanceof qx.ui.tree.AbstractTreeElement) {
        vPrev._updateIndent();
      }
    }

    if (vDisplayable) {
      this._updateIndent();
    }
  }
}







/*
---------------------------------------------------------------------------
  EVENT LISTENERS
---------------------------------------------------------------------------
*/

qx.Proto._onmousedown = function(e)
{
  this.getTree().getManager().handleMouseDown(this, e);
  e.stopPropagation();
}

qx.Proto._onmouseup = qx.util.Return.returnTrue;





/*
---------------------------------------------------------------------------
  TREE FLUSH
---------------------------------------------------------------------------
*/

qx.ui.tree.AbstractTreeElement.INDENT_CODE_1 = "<img style=\"position:absolute;top:0px;left:";
qx.ui.tree.AbstractTreeElement.INDENT_CODE_2 = "px\" src=\"";
qx.ui.tree.AbstractTreeElement.INDENT_CODE_3 = "\" />";

qx.ui.tree.AbstractTreeElement.IMG_EXTENSION = "gif";

qx.Proto.flushTree = function()
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
      vHtml.push(qx.ui.tree.AbstractTreeElement.INDENT_CODE_1);
      vHtml.push((vLevel-i-1) * 19);
      vHtml.push(qx.ui.tree.AbstractTreeElement.INDENT_CODE_2);
      vHtml.push(this.BASE_URI);
      vHtml.push(vImage);
      vHtml.push(qx.constant.Core.DOT);
      vHtml.push(qx.ui.tree.AbstractTreeElement.IMG_EXTENSION);
      vHtml.push(qx.ui.tree.AbstractTreeElement.INDENT_CODE_3);
    }

    vCurrentObject = vCurrentObject.getParentFolder();
  }

  this._indentObject.setHtml(vHtml.join(qx.constant.Core.EMPTY));
  this._indentObject.setWidth(vLevel * 19);
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

  if (this._indentObject)
  {
    this._indentObject.dispose();
    this._indentObject = null;
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

  this._previousParentFolder = null;

  this.removeEventListener(qx.constant.Event.MOUSEDOWN, this._onmousedown);
  this.removeEventListener(qx.constant.Event.MOUSEUP, this._onmouseup);

  return qx.ui.layout.BoxLayout.prototype.dispose.call(this);
}
