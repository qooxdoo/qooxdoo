/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui.tree.Tree",
{
  extend : qx.ui.core.Widget,
  implement : qx.ui.core.ISelectionContainer,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._layout = new qx.ui.layout.VBox();
    this.setLayout(this._layout);

    this._root = new qx.ui.tree.TreeFolder();
    this._layout.add(this._root.getChildrenContainer());

    this._manager = new qx.ui.core.SelectionManager(this);

    this.addListener("mouseover", this._onmouseover);
    this.addListener("mousedown", this._onmousedown);
    this.addListener("mouseup", this._onmouseup);

    this.addListener("keydown", this._onkeydown);
    this.addListener("keypress", this._onkeypress);
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine: true,
      init: "tree"
    },


    focusable :
    {
      refine : true,
      init : true
    }
  },


  members :
  {
    getLevel : function() {
      return -1;
    },


    hasChildren : function() {
      return this._root.hasChildren();
    },


    add : function(varargs) {
      this._root.add.apply(this._root, arguments);
    },


    remove : function(treeItem) {
      this._root.remove(treeItem);
    },




    /*
    ---------------------------------------------------------------------------
      SELECTION MANAGER API
    ---------------------------------------------------------------------------
    */

    getNextSiblingOf : function(treeItem)
    {
      if (treeItem.getOpen() && treeItem.hasChildren()) {
        return treeItem.getChildren()[0];
      }

      while (treeItem)
      {
        var parent = treeItem.getParent();
        if (!parent) {
          return null;
        }

        var parentChildren = parent.getChildren();
        var index = parentChildren.indexOf(treeItem);
        if (index > -1 && index < parentChildren.length-1) {
          return parentChildren[index+1];
        }
        treeItem = parent;
      }
      return null;
    },


    getPreviousSiblingOf : function(treeItem)
    {
      var parent = treeItem.getParent();
      if (!parent) {
        return null;
      }

      if (parent == this._root) {
        if (parent.getChildren()[0] == treeItem) {
          return null;
        }
      }

      var parentChildren = parent.getChildren();
      var index = parentChildren.indexOf(treeItem);
      if (index > 0)
      {
        var folder = parentChildren[index-1];
        while (folder.isOpen() && folder.hasChildren())
        {
          var children = folder.getChildren();
          folder = children[children.length-1];
        }
        return folder;
      }
      else
      {
        return parent;
      }
    },


    getScrollTop : function() {
      return 0;
    },

    setScrollTop : function(scroll) {
      return;
    },


    forEachVisibleTreeItem : function(root, callback, context)
    {
      var children = root.getChildren();
      for (var i=0, l=children.length; i<l; i++)
      {
        var treeItem = children[i];
        callback.call(context, treeItem);
        if (treeItem.hasChildren() && treeItem.isOpen()) {
          this.forEachVisibleTreeItem(treeItem, callback, context);
        }
      }
    },


    getSelectableItems : function()
    {
      var items = [];

      this.forEachVisibleTreeItem(this._root, function(treeItem) {
        items.push(treeItem);
      }, this);

      return items;
    },


    getInnerHeight : function()
    {
      var computed = this.getComputedInnerSize();
      return computed ? computed.height : 0;
    },


    /*
    ---------------------------------------------------------------------------
      MOUSE EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    _getTreeItem : function(widget)
    {
      while (widget)
      {
        if (widget == this) {
          return null;
        }

        if (qx.Class.hasInterface(widget.constructor, qx.ui.tree.ITreeElement)) {
          return widget;
        }
        widget = widget.getLayoutParent();
      }
      return null;
    },


    /**
     * Delegates the event to the selection manager if a list item could be
     * resolved out of the event target.
     *
     * @type member
     * @param e {qx.event.type.Mouse} mouseOver event
     * @return {void}
     */
    _onmouseover : function(e)
    {
      var target = this._getTreeItem(e.getTarget());
      if (target) {
        this._manager.handleMouseOver(target, e);
      }
    },


    /**
     * Delegates the event to the selection manager if a list item could be
     * resolved out of the event target.
     *
     * @type member
     * @param e {qx.event.type.Mouse} mouseDown event
     * @return {void}
     */
    _onmousedown : function(e)
    {
      var target = this._getTreeItem(e.getTarget());
      if (target) {
        this._manager.handleMouseDown(target, e);
      }
    },


    /**
     * Delegates the event to the selection manager if a list item could be
     * resolved out of the event target.
     *
     * @type member
     * @param e {qx.event.type.Mouse} mouseUp event
     * @return {void}
     */
    _onmouseup : function(e)
    {
      var target = this._getTreeItem(e.getTarget());
      if (target) {
        this._manager.handleMouseUp(target, e);
      }
    },





    /*
    ---------------------------------------------------------------------------
      KEY EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Dispatches the "action" event on every selected list item
     * when the "Enter" key is pressed
     *
     * @type member
     * @param e {qx.event.type.KeyEvent} keyDown event
     * @return {void}
     */
    _onkeydown : function(e)
    {
      // Execute action on press <ENTER>
      if (e.getKeyIdentifier() == "Enter" && !e.isAltPressed())
      {
        var items = this.getSelectedItems();
        for (var i=0; i<items.length; i++) {
          items[i].fireEvent("action");
        }
      }
    },


    /**
     * Delegates the control of the event to selection manager
     *
     * @type member
     * @param e {qx.event.type.KeyEvent} keyPress event
     * @return {void}
     */
    _onkeypress : function(e)
    {
      var key = e.getKeyIdentifier();

      if (key == "Left" || key == "Right")
      {
        var target = e.getTarget();
        if (target !== this)
        {
          var treeItem = this._getTreeItem(target);

          if (treeItem)
          {
            if (key == "Left")
            {
              if (treeItem.isOpen()) {
                treeItem.setOpen(false);
                e.stopPropagation();
              }
            }
            else {
              if (!treeItem.isOpen()) {
                treeItem.setOpen(true);
                e.stopPropagation();
              }
            }
            return;
          }
        }
      }

      // Give control to selectionManager
      this._manager.handleKeyPress(e);
    }

  }
});
