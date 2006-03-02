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
#post(QxTreeSelectionManager)

************************************************************************ */

function QxTree(vLabel, vIcon, vIconSelected)
{
  QxTreeFolder.call(this, vLabel, vIcon, vIconSelected);

  // ************************************************************************
  //   INITILISIZE MANAGER
  // ************************************************************************
  this._manager = new QxTreeSelectionManager(this);


  this._iconObject.setAppearance("tree-icon");
  this._labelObject.setAppearance("tree-label");


  // ************************************************************************
  //   DEFAULT STATE
  // ************************************************************************
  // The tree should be open by default
  this.setOpen(true);

  // Fix vertical alignment of empty tree
  this.addToFolder();


  // ************************************************************************
  //   KEY EVENT LISTENER
  // ************************************************************************
  this.addEventListener(QxConst.EVENT_TYPE_KEYDOWN, this._onkeydown);
  this.addEventListener(QxConst.EVENT_TYPE_KEYUP, this._onkeyup);
};

QxTree.extend(QxTreeFolder, "QxTree");





/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxTree.addProperty({ name : "useDoubleClick", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false, getAlias : "useDoubleClick" });
QxTree.addProperty({ name : "useTreeLines", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true, getAlias : "useTreeLines" });






/*
---------------------------------------------------------------------------
  MANAGER BINDING
---------------------------------------------------------------------------
*/

proto.getManager = function() {
  return this._manager;
};

proto.getSelectedElement = function() {
  return this.getSelectedItems()[0];
};






/*
---------------------------------------------------------------------------
  QUEUE HANDLING
---------------------------------------------------------------------------
*/

proto.addChildToTreeQueue = function(vChild)
{
  if (!vChild._isInTreeQueue && !vChild._isDisplayable) {
    this.debug("Ignoring invisible child: " + vChild);
  };

  if (!vChild._isInTreeQueue && vChild._isDisplayable)
  {
    QxWidget.addToGlobalWidgetQueue(this);

    if (!this._treeQueue) {
      this._treeQueue = {};
    };

    this._treeQueue[vChild.toHashCode()] = vChild;

    vChild._isInTreeQueue = true;
  };
};

proto.removeChildFromTreeQueue = function(vChild)
{
  if (vChild._isInTreeQueue)
  {
    if (this._treeQueue) {
      delete this._treeQueue[vChild.toHashCode()];
    };

    delete vChild._isInTreeQueue;
  };
};

proto.flushWidgetQueue = function() {
  this.flushTreeQueue();
};

proto.flushTreeQueue = function()
{
  if (!QxUtil.isObjectEmpty(this._treeQueue))
  {
    for (vHashCode in this._treeQueue)
    {
      // this.debug("Flushing Tree Child: " + this._treeQueue[vHashCode]);
      this._treeQueue[vHashCode].flushTree();
      delete this._treeQueue[vHashCode]._isInTreeQueue;
    };

    delete this._treeQueue;
  };
};







/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyUseTreeLines = function(propValue, propOldValue, propData)
{
  if (this._initialLayoutDone) {
    this._updateIndent();
  };

  return true;
};







/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

proto.getTree = function() {
  return this;
};

proto.getParentFolder = function() {
  return null;
};

proto.getLevel = function() {
  return 0;
};








/*
---------------------------------------------------------------------------
  COMMON CHECKERS
---------------------------------------------------------------------------
*/

QxTree.isTreeFolder = function(vObject) {
  return vObject && vObject instanceof QxTreeFolder && !(vObject instanceof QxTree);
};

QxTree.isOpenTreeFolder = function(vObject) {
  return vObject instanceof QxTreeFolder && vObject.getOpen() && vObject.hasContent();
};







/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

proto._onkeydown = function(e)
{
  var vManager = this.getManager();
  var vSelectedItem = vManager.getSelectedItem();

  switch(e.getKeyCode())
  {
    case QxKeyEvent.keys.left:
      e.preventDefault();

      if (QxTree.isTreeFolder(vSelectedItem))
      {
        if (!vSelectedItem.getOpen())
        {
          var vParent = vSelectedItem.getParentFolder();
          if (vParent instanceof QxTreeFolder) {
            if (!(vParent instanceof QxTree)) {
              vParent.close();
            };

            this.setSelectedElement(vParent);
          };
        }
        else
        {
          return vSelectedItem.close();
        };
      }
      else if (vSelectedItem instanceof QxTreeFile)
      {
        var vParent = vSelectedItem.getParentFolder();
        if (vParent instanceof QxTreeFolder) {
          if (!(vParent instanceof QxTree)) {
            vParent.close();
          };

          this.setSelectedElement(vParent);
        };
      };

      break;

    case QxKeyEvent.keys.right:
      e.preventDefault();

      if (QxTree.isTreeFolder(vSelectedItem))
      {
        if (!vSelectedItem.getOpen())
        {
          return vSelectedItem.open();
        }
        else if (vSelectedItem.hasContent())
        {
          var vFirst = vSelectedItem.getFirstVisibleChildOfFolder();
          this.setSelectedElement(vFirst);
          vFirst.open();
          return;
        };
      };

      break;

    case QxKeyEvent.keys.enter:
      e.preventDefault();

      if (QxTree.isTreeFolder(vSelectedItem)) {
        return vSelectedItem.toggle();
      };

      break;

    default:
      if (!this._fastUpdate)
      {
        this._fastUpdate = true;
        this._oldItem = vSelectedItem;
      };

      vManager.handleKeyDown(e);
  };
};

proto._onkeyup = function(e)
{
  if (this._fastUpdate)
  {
    var vOldItem = this._oldItem;
    var vNewItem = this.getManager().getSelectedItem();

    vNewItem.getIconObject().addState(QxConst.STATE_SELECTED);

    delete this._fastUpdate;
    delete this._oldItem;
  };
};

proto.getLastTreeChild = function()
{
  var vLast = this;

  while (vLast instanceof QxTreeElement)
  {
    if (!(vLast instanceof QxTreeFolder) || !vLast.getOpen()) {
      return vLast;
    };

    vLast = vLast.getLastVisibleChildOfFolder();
  };

  return null;
};

proto.getFirstTreeChild = function() {
  return this;
};

proto.setSelectedElement = function(vElement)
{
  var vManager = this.getManager();

  vManager.setSelectedItem(vElement);
  vManager.setLeadItem(vElement);
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

  if (this._manager)
  {
    this._manager.dispose();
    this._manager = null;
  };

  delete this._oldItem;

  return QxTreeFolder.prototype.dispose.call(this);
};
