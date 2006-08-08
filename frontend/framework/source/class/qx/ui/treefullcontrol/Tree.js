/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org
     2006 by Derrell Lipman

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(tree)

************************************************************************ */

/**
 * @brief
 * qx.ui.treefullcontrol.Tree objects are tree root nodes but act like
 * TreeFolder.
 *
 * @param
 * treeRowStructure -
 *   An instance of qx.ui.treefullcontrol.TreeRowStructure, defining the
 *   structure of this tree row.
 */
qx.OO.defineClass("qx.ui.treefullcontrol.Tree", qx.ui.treefullcontrol.TreeFolder,
function(treeRowStructure)
{
  qx.ui.treefullcontrol.TreeFolder.call(this, treeRowStructure);

  // ************************************************************************
  //   INITILISIZE MANAGER
  // ************************************************************************
  this._manager = new qx.manager.selection.TreeFullControlSelectionManager(this);


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
  this.addEventListener(qx.constant.Event.KEYDOWN, this._onkeydown);
  this.addEventListener(qx.constant.Event.KEYUP, this._onkeyup);
});





/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.addProperty({ name : "useDoubleClick",
                    type : qx.constant.Type.BOOLEAN,
                    defaultValue : false,
                    getAlias : "useDoubleClick"
                  });

qx.OO.addProperty({ name : "useTreeLines",
                    type : qx.constant.Type.BOOLEAN,
                    defaultValue : true,
                    getAlias : "useTreeLines"
                  });

/*
 * Add a "hideNode" property.  This differs from the visibility property in
 * that this property hides *only* the current node, not the node's children.
 */
qx.OO.addProperty({ name : "hideNode",
                    type : qx.constant.Type.BOOLEAN,
                    defaultValue : false,
                    getAlias : "hideNode"
                  });




/*
---------------------------------------------------------------------------
  MANAGER BINDING
---------------------------------------------------------------------------
*/

qx.Proto.getManager = function() {
  return this._manager;
}

qx.Proto.getSelectedElement = function() {
  return this.getSelectedItems()[0];
}






/*
---------------------------------------------------------------------------
  QUEUE HANDLING
---------------------------------------------------------------------------
*/

qx.Proto.addChildToTreeQueue = function(vChild)
{
  if (!vChild._isInTreeQueue && !vChild._isDisplayable) {
    this.debug("Ignoring invisible child: " + vChild);
  }

  if (!vChild._isInTreeQueue && vChild._isDisplayable)
  {
    qx.ui.core.Widget.addToGlobalWidgetQueue(this);

    if (!this._treeQueue) {
      this._treeQueue = {};
    }

    this._treeQueue[vChild.toHashCode()] = vChild;

    vChild._isInTreeQueue = true;
  }
}

qx.Proto.removeChildFromTreeQueue = function(vChild)
{
  if (vChild._isInTreeQueue)
  {
    if (this._treeQueue) {
      delete this._treeQueue[vChild.toHashCode()];
    }

    delete vChild._isInTreeQueue;
  }
}

qx.Proto.flushWidgetQueue = function() {
  this.flushTreeQueue();
}

qx.Proto.flushTreeQueue = function()
{
  if (!qx.lang.Object.isEmpty(this._treeQueue))
  {
    for (var vHashCode in this._treeQueue)
    {
      // this.debug("Flushing Tree Child: " + this._treeQueue[vHashCode]);
      this._treeQueue[vHashCode].flushTree();
      delete this._treeQueue[vHashCode]._isInTreeQueue;
    }

    delete this._treeQueue;
  }
}







/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyUseTreeLines = function(propValue, propOldValue, propData)
{
  if (this._initialLayoutDone) {
    this._updateIndent();
  }

  return true;
}

qx.Proto._modifyHideNode = function(propValue, propOldValue, propData)
{
  if (! propValue) {
    this._horizontalLayout.setHeight(this._horizontalLayout.originalHeight);
    this._horizontalLayout.show();
  } else {
    this._horizontalLayout.originalHeight = this._horizontalLayout.getHeight();
    this._horizontalLayout.setHeight(0);
    this._horizontalLayout.hide();
  }

  if (this._initialLayoutDone) {
    this._updateIndent();
  }

  return true;
}






/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

qx.Proto.getTree = function() {
  return this;
}

qx.Proto.getParentFolder = function() {
  return null;
}

qx.Proto.getLevel = function() {
  return 0;
}








/*
---------------------------------------------------------------------------
  COMMON CHECKERS
---------------------------------------------------------------------------
*/

qx.ui.treefullcontrol.Tree.isTreeFolder = function(vObject) {
  return (vObject &&
          vObject instanceof qx.ui.treefullcontrol.TreeFolder &&
          !(vObject instanceof qx.ui.treefullcontrol.Tree));
}

qx.ui.treefullcontrol.Tree.isOpenTreeFolder = function(vObject) {
  return (vObject instanceof qx.ui.treefullcontrol.TreeFolder &&
          vObject.getOpen() &&
          vObject.hasContent());
}







/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onkeydown = function(e)
{
  var vManager = this.getManager();
  var vSelectedItem = vManager.getSelectedItem();

  switch(e.getKeyCode())
  {
    case qx.event.type.KeyEvent.keys.left:
      e.preventDefault();

      if (qx.ui.treefullcontrol.Tree.isTreeFolder(vSelectedItem))
      {
        if (!vSelectedItem.getOpen())
        {
          var vParent = vSelectedItem.getParentFolder();
          if (vParent instanceof qx.ui.treefullcontrol.TreeFolder) {
            if (!(vParent instanceof qx.ui.treefullcontrol.Tree)) {
              vParent.close();
            }

            this.setSelectedElement(vParent);
          }
        }
        else
        {
          return vSelectedItem.close();
        }
      }
      else if (vSelectedItem instanceof qx.ui.treefullcontrol.TreeFile)
      {
        var vParent = vSelectedItem.getParentFolder();
        if (vParent instanceof qx.ui.treefullcontrol.TreeFolder) {
          if (!(vParent instanceof qx.ui.treefullcontrol.Tree)) {
            vParent.close();
          }

          this.setSelectedElement(vParent);
        }
      }

      break;

    case qx.event.type.KeyEvent.keys.right:
      e.preventDefault();

      if (qx.ui.treefullcontrol.Tree.isTreeFolder(vSelectedItem))
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
        }
      }

      break;

    case qx.event.type.KeyEvent.keys.enter:
      e.preventDefault();

      if (qx.ui.treefullcontrol.Tree.isTreeFolder(vSelectedItem)) {
        return vSelectedItem.toggle();
      }

      break;

    default:
      if (!this._fastUpdate)
      {
        this._fastUpdate = true;
        this._oldItem = vSelectedItem;
      }

      vManager.handleKeyDown(e);
  }
}

qx.Proto._onkeyup = function(e)
{
  if (this._fastUpdate)
  {
    var vNewItem = this.getManager().getSelectedItem();

    if (! vNewItem) {
      return;
    }

    vNewItem.getIconObject().addState(qx.manager.selection.SelectionManager.STATE_SELECTED);

    delete this._fastUpdate;
    delete this._oldItem;
  }
}

qx.Proto.getLastTreeChild = function()
{
  var vLast = this;

  while (vLast instanceof qx.ui.treefullcontrol.AbstractTreeElement)
  {
    if (!(vLast instanceof qx.ui.treefullcontrol.TreeFolder) ||
        !vLast.getOpen()) {
      return vLast;
    }

    vLast = vLast.getLastVisibleChildOfFolder();
  }

  return null;
}

qx.Proto.getFirstTreeChild = function() {
  return this;
}

qx.Proto.setSelectedElement = function(vElement)
{
  var vManager = this.getManager();

  vManager.setSelectedItem(vElement);
  vManager.setLeadItem(vElement);
}

/* Override getHierarchy: do not add label if root node is hidden */
qx.Proto.getHierarchy = function(vArr)
{
  if (! this.hideNode() && this._labelObject) {
    vArr.unshift(this._labelObject.getHtml());
  }
  return vArr;
}






/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  if (this._manager)
  {
    this._manager.dispose();
    this._manager = null;
  }

  delete this._oldItem;

  return qx.ui.treefullcontrol.TreeFolder.prototype.dispose.call(this);
}
