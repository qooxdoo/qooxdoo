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
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * The Tree class implements a tree widget, with collapsable and expandable
 * container nodes and terminal leaf nodes. You instantiate a Tree object and
 * then assign the tree a root folder using the {@link #root} property.
 *
 * If you don't want to show the root item, you can hide it with the
 * {@link #hideRoot} property.
 *
 * The handling of <b>selections</b> within a tree is somewhat distributed
 * between the root tree object and the attached {@link
 * qx.ui.tree.SelectionManager TreeSelectionManager}. To get the
 * currently selected element of a tree use the tree {@link #getSelectedItem
 * getSelectedItem} method and tree {@link #setSelectedItem
 * setSelectedItem} to set it. The TreeSelectionManager handles more
 * coars-grained issues like providing selectAll()/deselectAll() methods.
 */
qx.Class.define("qx.ui.tree.Tree",
{
  extend : qx.ui.core.AbstractScrollArea,
  include : [
    qx.ui.core.MSelectionHandling,
    qx.ui.core.MContentPadding
  ],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.__content = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
      allowShrinkY: false,
      allowGrowX: true
    });

    this._getChildControl("pane").add(this.__content);

    this.initOpenMode();
    this.initRootOpenClose();
  },



  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * This event is fired after a tree item was added to the tree. The
     * {@link qx.event.type.Data#getData} method of the event returns the
     * added item.
     */
    addItem : "qx.event.type.Data",


    /**
     * This event is fired after a tree item has been removed from the tree.
     * The {@link qx.event.type.Data#getData} method of the event returns the
     * removed item.
     */
    removeItem : "qx.event.type.Data"
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Control whether clicks or double clicks should open or close the clicked
     * folder.
     */
    openMode :
    {
      check : ["click", "dblclick", "none"],
      init : "dblclick",
      apply : "_applyOpenMode",
      event : "changeOpenMode",
      themeable : true
    },


    /**
     * The root tree item of the tree to display
     */
    root :
    {
      check : "qx.ui.tree.AbstractTreeItem",
      init : null,
      nullable : true,
      event : "changeRoot",
      apply : "_applyRoot"
    },


    /**
     * Hide the root (Tree) node.  This differs from the visibility property in
     * that this property hides *only* the root node, not the node's children.
     */
    hideRoot :
    {
      check : "Boolean",
      init : false,
      apply :"_applyHideRoot"
    },


    /**
     * Whether the Root should have an open/close button.  This may also be
     *  used in conjunction with the hideNode property to provide for virtual root
     *  nodes.  In the latter case, be very sure that the virtual root nodes are
     *  expanded programatically, since there will be no open/close button for the
     *  user to open them.
     */
    rootOpenClose :
    {
      check : "Boolean",
      init : false,
      apply : "_applyRootOpenClose"
    },

    // overridden
    appearance :
    {
      refine: true,
      init: "tree"
    },

    // overridden
    focusable :
    {
      refine : true,
      init : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __content : null,


    /*
    ---------------------------------------------------------------------------
      SELECTION API
    ---------------------------------------------------------------------------
    */

    /** {Class} Pointer to the selection manager to use */
    SELECTION_MANAGER : qx.ui.tree.SelectionManager,


    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    /**
     * Get the widget, which containes the root tree item. This widget must
     * have a vertical box layout.
     *
     * @return {qx.ui.core.Widget} the children container
     */
    getChildrenContainer : function() {
      return this.__content;
    },


    // property apply
    _applyRoot : function(value, old)
    {
      var container = this.getChildrenContainer();

      if (old)
      {
        container.remove(old);
        if (old.hasChildren()) {
          container.remove(old.getChildrenContainer());
        }
      }

      if (value)
      {
        container.add(value);
        if (value.hasChildren()) {
          container.add(value.getChildrenContainer());
        }

        value.setVisibility(this.getHideRoot() ? "excluded" : "visible");
        value.recursiveAddToWidgetQueue();
      }
    },


    // property apply
    _applyHideRoot : function(value, old)
    {
      var root = this.getRoot();
      if (!root) {
        return;
      }

      root.setVisibility(value ? "excluded" : "visible");
      root.recursiveAddToWidgetQueue();
    },


    // property apply
    _applyRootOpenClose : function(value, old)
    {
      var root = this.getRoot();
      if (!root) {
        return;
      }
      root.recursiveAddToWidgetQueue();
    },


    /**
     * Returns the element, to which the content padding should be applied.
     *
     * @return {qx.ui.core.Widget} The content padding target.
     */
    _getContentPaddingTarget : function() {
      return this.__content;
    },


    /*
    ---------------------------------------------------------------------------
      SELECTION MANAGER API
    ---------------------------------------------------------------------------
    */

    /**
     * Get the tree item after the given item
     *
     * @param treeItem {AbstractTreeItem} The tree item to get the item after
     * @param invisible {Boolean?true} Whether invisible/closed tree items
     *     should be returned as well.
     * @return {AbstractTreeItem?null} The item after the given item. May be
     *     <code>null</code> if the item is the last item.
     */
    getNextSiblingOf : function(treeItem, invisible)
    {
      if ((invisible !== false || treeItem.isOpen()) && treeItem.hasChildren()) {
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


    /**
     * Get the tree item before the given item
     *
     * @param treeItem {AbstractTreeItem} The tree item to get the item before
     * @param invisible {Boolean?true} Whether invisible/closed tree items
     *     should be returned as well.
     * @return {AbstractTreeItem?null} The item before the given item. May be
     *     <code>null</code> if the item is the first item.
     */
    getPreviousSiblingOf : function(treeItem, invisible)
    {
      var parent = treeItem.getParent();
      if (!parent) {
        return null;
      }

      if (this.getHideRoot())
      {
        if (parent == this.getRoot())
        {
          if (parent.getChildren()[0] == treeItem) {
            return null;
          }
        }
      }
      else
      {
        if (treeItem == this.getRoot()) {
          return null;
        }
      }

      var parentChildren = parent.getChildren();
      var index = parentChildren.indexOf(treeItem);
      if (index > 0)
      {
        var folder = parentChildren[index-1];
        while ((invisible !== false || folder.isOpen()) && folder.hasChildren())
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


    /**
     * Returns all children of the tree.
     *
     * @param recursive {Boolean ? false} whether children of subfolder should be
     *     included
     * @param invisible {Boolean ? true} whether invisible children should be
     *     included
     * @return {AbstractTreeItem[]} list of children
     */
    getItems : function(recursive, invisible) {
      return this.getRoot().getItems(recursive, invisible, this.getHideRoot());
    },


    // overridden
    scrollChildIntoViewY : function(child, align, direct)
    {
      // if the last item is selected the content should be scrolled down to
      // the end including the content paddings
      if (!this.getNextSiblingOf(child, false)) {
        this.scrollToY(1000000);
      } else {
        this.base(arguments, child, align, direct);
      }
    },



    /*
    ---------------------------------------------------------------------------
      MOUSE EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the tree item, which contains the given widget.
     *
     * @param widget {qx.ui.core.Widget} The widget to get the containing tree
     *   item for.
     * @return {AbstractTreeItem|null} The tree item containing the widget. If the
     *     widget is not inside of any tree item <code>null</code> is returned.
     */
    getTreeItem : function(widget)
    {
      while (widget)
      {
        if (widget == this) {
          return null;
        }

        if (widget instanceof qx.ui.tree.AbstractTreeItem) {
          return widget;
        }

        widget = widget.getLayoutParent();
      }

      return null;
    },


    // property apply
    _applyOpenMode : function(value, old)
    {
      if (old == "click") {
        this.removeListener("click", this._onOpen, this);
      } else if (old == "dblclick") {
        this.removeListener("dblclick", this._onOpen, this);
      }

      if (value == "click") {
        this.addListener("click", this._onOpen, this);
      } else if (value == "dblclick") {
        this.addListener("dblclick", this._onOpen, this);
      }
    },


    /**
     * Event hander for click events, which could change a tree item's open
     * state.
     *
     * @param e {qx.event.type.Mouse} The mouse click event object
     */
    _onOpen : function(e)
    {
      var treeItem = this.getTreeItem(e.getTarget());
      if (!treeItem ||!treeItem.isOpenable()) {
        return;
      }

      treeItem.setOpen(!treeItem.isOpen());
      e.stopPropagation();
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("__content");
  }
});
