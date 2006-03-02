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
#post(QxHorizontalBoxLayout)
#post(QxVerticalBoxLayout)

************************************************************************ */

function QxTreeFolder(vLabel, vIcon, vIconSelected)
{
  QxTreeElement.call(this, vLabel, vIcon, vIconSelected);

  this._iconObject.setAppearance("tree-folder-icon");
  this._labelObject.setAppearance("tree-folder-label");

  this.addEventListener(QxConst.EVENT_TYPE_DBLCLICK, this._ondblclick);

  // Remapping of add/remove methods
  this.add = this.addToFolder;
  this.addBefore = this.addBeforeToFolder;
  this.addAfter = this.addAfterToFolder;
  this.addAt = this.addAtToFolder;
  this.addAtBegin = this.addAtBeginToFolder;
  this.addAtEnd = this.addAtEndToFolder;
  this.remove = this.removeFromFolder;
};

QxTreeFolder.extend(QxTreeElement, "QxTreeFolder");



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/


QxTreeFolder.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "tree-folder" });
QxTreeFolder.changeProperty({ name : "icon", type : QxConst.TYPEOF_STRING });
QxTreeFolder.changeProperty({ name : "iconSelected", type : QxConst.TYPEOF_STRING });

QxTreeFolder.addProperty({ name : "open", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });
QxTreeFolder.addProperty({ name : "alwaysShowPlusMinusSymbol", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });




/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

proto.hasContent = function() {
  return this._containerObject && this._containerObject.getChildrenLength() > 0;
};

proto.open = function()
{
  if (this.getOpen()) {
    return;
  };

  if (this.hasContent())
  {
    this.getTopLevelWidget().setGlobalCursor(QxConst.CURSOR_PROGRESS);
    QxTimer.once(this._openCallback, this, 0);
  }
  else
  {
    this.setOpen(true);
  };
};

proto.close = function() {
  this.setOpen(false);
};

proto.toggle = function() {
  this.getOpen() ? this.close() : this.open();
};

proto._openCallback = function()
{
  this.setOpen(true);
  QxWidget.flushGlobalQueues();
  this.getTopLevelWidget().setGlobalCursor(null);
};








/*
---------------------------------------------------------------------------
  CHILDREN HANDLING
---------------------------------------------------------------------------
*/

proto._createChildrenStructure = function()
{
  this.setAppearance(this instanceof QxTree ? "tree-container" : "tree-folder-container");

  if (!this._horizontalLayout)
  {
    this.setOrientation(QxConst.ORIENTATION_VERTICAL);

    this._horizontalLayout = new QxHorizontalBoxLayout;
    this._horizontalLayout.setWidth(null);
    this._horizontalLayout.setParent(this);
    this._horizontalLayout.setAnonymous(true);
    this._horizontalLayout.setAppearance(this instanceof QxTree ? "tree" : "tree-folder");

    this._indentObject.setParent(this._horizontalLayout);
    this._iconObject.setParent(this._horizontalLayout);
    this._labelObject.setParent(this._horizontalLayout);
  };

  if (!this._containerObject)
  {
    this._containerObject = new QxVerticalBoxLayout;
    this._containerObject.setWidth(null);
    this._containerObject.setAnonymous(true);

    // it should be faster to first handle display,
    // because the default display value is true and if we first
    // setup the parent the logic do all to make the
    // widget first visible and then, if the folder is not
    // opened again invisible.
    this._containerObject.setDisplay(this.getOpen());
    this._containerObject.setParent(this);

    // remap remove* functions
    this.remapChildrenHandlingTo(this._containerObject);
  };
};

proto._handleChildMove = function(vChild, vRelationIndex, vRelationChild)
{
  if (vChild.isDisplayable())
  {
    var vChildren = this._containerObject.getChildren();
    var vOldChildIndex = vChildren.indexOf(vChild);

    if (vOldChildIndex != -1)
    {
      if (vRelationChild) {
        vRelationIndex = vChildren.indexOf(vRelationChild);
      };

      if (vRelationIndex == vChildren.length-1)
      {
        vChild._updateIndent();

        // Update indent of previous last child
        this._containerObject.getLastVisibleChild()._updateIndent();
      }
      else if (vChild._wasLastVisibleChild)
      {
        vChild._updateIndent();

        // Update indent for new last child
        var vPreviousSibling = vChild.getPreviousVisibleSibling();
        if (vPreviousSibling) {
          vPreviousSibling._updateIndent();
        };
      };
    };
  };
};

proto.addToFolder = function()
{
  this._createChildrenStructure();

  if (this._containerObject) {
    return this._containerObject.add.apply(this._containerObject, arguments);
  };
};

proto.addBeforeToFolder = function(vChild, vBefore)
{
  this._createChildrenStructure();

  if (this._containerObject)
  {
    this._handleChildMove(vChild, null, vBefore);
    return this._containerObject.addBefore.apply(this._containerObject, arguments);
  };
};

proto.addAfterToFolder = function(vChild, vAfter)
{
  this._createChildrenStructure();

  if (this._containerObject)
  {
    this._handleChildMove(vChild, null, vAfter);
    return this._containerObject.addAfter.apply(this._containerObject, arguments);
  };
};

proto.addAtToFolder = function(vChild, vIndex)
{
  this._createChildrenStructure();

  if (this._containerObject)
  {
    this._handleChildMove(vChild, vIndex);
    return this._containerObject.addAt.apply(this._containerObject, arguments);
  };
};

proto.addAtBeginToFolder = function(vChild) {
  return this.addAtToFolder(vChild, 0);
};

proto.addAtEndToFolder = function(vChild)
{
  this._createChildrenStructure();

  if (this._containerObject)
  {
    var vLast = this._containerObject.getLastChild();

    if (vLast)
    {
      this._handleChildMove(vChild, null, vLast);
      return this._containerObject.addAfter.call(this._containerObject, vChild, vLast);
    }
    else
    {
      return this.addAtBeginToFolder(vChild);
    };
  };
};

proto._remappingChildTable = [ "remove", "removeAt", "removeAll" ];






/*
---------------------------------------------------------------------------
  CHILDREN UTILITIES
---------------------------------------------------------------------------
*/

proto.getContainerObject = function() {
  return this._containerObject;
};

proto.getHorizontalLayout = function() {
  return this._horizontalLayout;
};

proto.getFirstVisibleChildOfFolder = function()
{
  if (this._containerObject) {
    return this._containerObject.getFirstChild();
  };
};

proto.getLastVisibleChildOfFolder = function()
{
  if (this._containerObject) {
    return this._containerObject.getLastChild();
  };
};

proto.getItems = function()
{
  var a = [this];

  if (this._containerObject)
  {
    var ch = this._containerObject.getVisibleChildren();

    for (var i=0, chl=ch.length; i<chl; i++) {
      a = a.concat(ch[i].getItems());
    };
  };

  return a;
};







/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyOpen = function(propValue, propOldValue, propData)
{
  this._updateLastColumn();

  if (this._containerObject) {
    this._containerObject.setDisplay(propValue);
  };

  return true;
};

proto._modifyAlwaysShowPlusMinusSymbol = function(propValue, propOldValue, propData)
{
  this._updateLastColumn();

  return true;
};

proto._updateLastColumn = function()
{
  if (this._indentObject)
  {
    var vElement = this._indentObject.getElement();

    if (vElement && vElement.firstChild) {
      vElement.firstChild.src = this.BASE_URI + this.getIndentSymbol(this.getTree().getUseTreeLines(), true) + ".gif";
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
  var vOriginalTarget = e.getOriginalTarget();

  switch(vOriginalTarget)
  {
    case this._indentObject:
      if (this._indentObject.getElement().firstChild == e.getDomTarget())
      {
        this.getTree().getManager().handleMouseDown(this, e);
        this.toggle();
      };

      break;

    case this._containerObject:
      break;

    case this:
      if (this._containerObject) {
        break;
      };

      // no break here

    default:
      this.getTree().getManager().handleMouseDown(this, e);
  };

  e.stopPropagation();
};

proto._onmouseup = function(e)
{
  var vOriginalTarget = e.getOriginalTarget();

  switch(vOriginalTarget)
  {
    case this._indentObject:
    case this._containerObject:
    case this:
      break;

    default:
      if (!this.getTree().getUseDoubleClick()) {
        this.open();
      };
  };
};

proto._ondblclick = function(e)
{
  if (!this.getTree().getUseDoubleClick()) {
    return;
  };

  this.toggle();
  e.stopPropagation();
};







/*
---------------------------------------------------------------------------
  INDENT HELPER
---------------------------------------------------------------------------
*/

proto.getIndentSymbol = function(vUseTreeLines, vIsLastColumn)
{
  if (vIsLastColumn)
  {
    if (this.hasContent() || this.getAlwaysShowPlusMinusSymbol())
    {
      if (!vUseTreeLines)
      {
        return this.getOpen() ? "minus" : "plus";
      }
      else if (this.isLastChild())
      {
        return this.getOpen() ? "end_minus" : "end_plus";
      }
      else
      {
        return this.getOpen() ? "cross_minus" : "cross_plus";
      };
    }
    else if (vUseTreeLines)
    {
      return this.isLastChild() ? "end" : "cross";
    };
  }
  else
  {
    return vUseTreeLines && !this.isLastChild() ? "line" : null;
  };
};

proto._updateIndent = function()
{
  QxTreeFile.prototype._updateIndent.call(this);

  if (!this._containerObject) {
    return;
  };

  var ch = this._containerObject.getVisibleChildren();
  for (var i=0, l=ch.length; i<l; i++) {
    ch[i]._updateIndent();
  };
};







/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  this.removeEventListener(QxConst.EVENT_TYPE_DBLCLICK, this._ondblclick);

  if (this._horizontalLayout)
  {
    this._horizontalLayout.dispose();
    this._horizontalLayout = null;
  };

  if (this._containerObject)
  {
    this._containerObject.dispose();
    this._containerObject = null;
  };

  return QxTreeElement.prototype.dispose.call(this);
};
