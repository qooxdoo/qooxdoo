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


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._manager = new qx.ui.core.SelectionManager(this);

    this._layout = new qx.ui.layout.VBox();
    this.setLayout(this._layout);

    this._model = {};
    this._model[this.toHashCode()] = {
      widget: this,
      children: []
    }

    this.addListener("mouseover", this._onmouseover);
    this.addListener("mousedown", this._onmousedown);
    this.addListener("mouseup", this._onmouseup);

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

    /** Controls whether the leading item should be marked especially or not */
    markLeadingItem :
    {
      check : "Boolean",
      init : false
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


    setFolderOpened : function(treeItem, opened)
    {
      var visibility = opened ? "visible" : "excluded";

      var folderData = this._model[treeItem.toHashCode()];
      if (!folderData) {
        return;
      }

      var children = folderData.children;
      for (var i=0, l=children.length; i<l; i++)
      {
        var item = children[i];
        item.setVisibility(visibility);

        if (item.isOpen()) {
          this.setFolderOpened(item, opened);
        }
      }
    },


    addAt : function(treeItem, parentFolder, index)
    {
      var parent = parentFolder || this;
      if (index == undefined) {
        index = -1;
      }
      var parentData = this._model[parent.toHashCode()];

      if (!parentData) {
        throw new Error("Unknown parent folder: '" + parent + "'");
      }

      var parentChildren = parentData.children;

      if (index == 0)
      {
        var after = parent;
      }
      else
      {
        var after =
          parentChildren[index-1] ||
          parentChildren[parentChildren.length] ||
          parent;
      }

      if (after == this) {
        this._layout.addAtBegin(treeItem, {});
      } else {
        this._layout.addAfter(treeItem, after, {});
      }

      treeItem.set({
        level: parent.getLevel() + 1,
        tree: this
      });

      parentChildren.push(treeItem);
      this._model[treeItem.toHashCode()] = {
        widget: treeItem,
        children: []
      }
    },


    add : function(treeItem, parentFolder) {
      this.addAt(treeItem, parentFolder, -1);
    },






    /*
    ---------------------------------------------------------------------------
      SELECTION MANAGER API
    ---------------------------------------------------------------------------
    */

    getNextSiblingOf : function(treeItem) {
      return this.getLayout().getNextSibling(treeItem);
    },

    getPreviousSiblingOf : function(treeItem) {
      return this.getLayout().getPreviousSibling(treeItem);
    },

    getScrollTop : function() {
      return 0;
    },

    setScrollTop : function(scroll) {
      return;
    },

    getChildren : function() {
      return this.getLayoutChildren();
    },

    getInnerHeight : function()
    {
      var computed = this.getComputedInnerSize();
      return computed ? computed.height : 0;
    },





    /*
    ---------------------------------------------------------------------------
      MANAGER BINDING
    ---------------------------------------------------------------------------
    */

    /**
     * Accessor method for the selection manager
     *
     * @type member
     * @return {qx.ui.selection.SelectionManager} The tree's selection manager
     */
    getManager : function() {
      return this._manager;
    },


    /**
     * Returns the first selected tree item.
     *
     * @type member
     * @return {qx.ui.tree.ITreeElement|null} Selected item or null
     */
    getSelectedItem : function() {
      return this.getSelectedItems()[0] || null;
    },


    /**
     * Returns all selected list items (uses the selection manager).
     *
     * @type member
     * @return {Array} Returns all selected list items.
     */
    getSelectedItems : function() {
      return this._manager.getSelectedItems();
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
      var target = e.getTarget();

      // Only react on mouseover of the list-items:
      // The list itself is not interesting for selection handling
      if (target === this) {
        return;
      }

      this._manager.handleMouseOver(this._getTreeItem(target), e);
    },


    /**
     * Delegates the event to the selection manager if a list item could be
     * resolved out of the event target.
     *
     * @type member
     * @param e {qx.event.type.Mouse} mouseDown event
     * @return {void}
     */
    _onmousedown : function(e) {
      this._manager.handleMouseDown(this._getTreeItem(e.getTarget()), e);
    },


    /**
     * Delegates the event to the selection manager if a list item could be
     * resolved out of the event target.
     *
     * @type member
     * @param e {qx.event.type.Mouse} mouseUp event
     * @return {void}
     */
    _onmouseup : function(e) {
      this._manager.handleMouseUp(this._getTreeItem(e.getTarget()), e);
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
