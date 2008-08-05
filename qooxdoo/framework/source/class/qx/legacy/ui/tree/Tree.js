/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
     2006 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * The Tree class implements a tree widget, with collapsable and expandable
 * container nodes and terminal leaf nodes. You instantiate a Tree object as the
 * root of the tree, then add {@link TreeFolder} (node) and {@link TreeFile}
 * (leaf) objects as needed, using the (inherited) <code>add()</code> method.
 *
 * Beware though that the <b>tree structure</b> you are building is internally
 * augmented with other widgets to achieve the desired look and feel. So if you
 * later try to navigate the tree e.g. by using the
 * <code>getChildren()</code> method, you get more (and type-wise different)
 * children than you initially added. If this is inconvenient you may want to
 * maintain a tree model alongside the tree widget in your application.
 *
 * The handling of <b>selections</b> within a tree is somewhat distributed
 * between the root Tree object and the attached {@link
 * qx.legacy.ui.tree.SelectionManager TreeSelectionManager}. To get the
 * currently selected element of a tree use the Tree{@link #getSelectedElement
 * getSelectedElement} method and Tree{@link #setSelectedElement
 * setSelectedElement} to set it. The TreeSelectionManager handles more
 * coars-grained issues like providing selectAll()/deselectAll() methods.
 *
 * @appearance tree {qx.legacy.ui.layout.HorizontalBoxLayout}
 * @appearance tree-icon {qx.legacy.ui.basic.Image}
 * @appearance tree-label {qx.legacy.ui.basic.Label}
 */
qx.Class.define("qx.legacy.ui.tree.Tree",
{
  extend : qx.legacy.ui.tree.TreeFolder,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */


  /**
   * The tree constructor understands two signatures. One compatible with the
   * original qooxdoo tree and one compatible with the treefullcontrol widget.
   * If the first parameter if of type {@link TreeRowStructure} the tree
   * element is rendered using this structure. Otherwhise the all three
   * arguments are evaluated.
   *
   * @param labelOrTreeRowStructure {String|TreeRowStructure} Either the structure
   *     defining a tree row or the label text to display for the tree.
   * @param icon {String} the image URL to display for the tree
   * @param iconSelected {String} the image URL to display when the tree
   *     is selected
   */
  construct : function(labelOrTreeRowStructure, icon, iconSelected)
  {
    this.base(arguments, this._getRowStructure(labelOrTreeRowStructure, icon, iconSelected));

    // ************************************************************************
    //   INITILISIZE MANAGER
    // ************************************************************************
    this._manager = new qx.legacy.ui.tree.SelectionManager(this);

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
    this.addListener("keydown", this._onkeydown);
    this.addListener("keypress", this._onKeyPress);
    this.addListener("keyup", this._onkeyup);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      COMMON CHECKERS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns whether the passed object vObject is a TreeFolder.
     *
     * @param vObject {Object} an object
     */
    isTreeFolder : function(vObject) {
      return (vObject && vObject instanceof qx.legacy.ui.tree.TreeFolder && !(vObject instanceof qx.legacy.ui.tree.Tree));
    },


    /**
     * Returns whether vObject is a TreeFolder and is open and
     * has content.
     *
     * @param vObject {Object} an object
     */
    isOpenTreeFolder : function(vObject) {
      return (vObject instanceof qx.legacy.ui.tree.TreeFolder && vObject.getOpen() && vObject.hasContent());
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    /**
     * Controls whether to use double clicks to open folders.
     */
    useDoubleClick :
    {
      check : "Boolean",
      init : false
    },

    /**
     * Controls whether to use (usually dotted) lines when a folder is opened,
     * to indicate the levels of the hierarchy and the indentation.
     */
    useTreeLines :
    {
      check : "Boolean",
      init : true,
      apply : "_applyUseTreeLines"
    },

    tabIndex :
    {
      refine : true,
      init : 1
    },

    /**
     * In specific applications, it is desirable to omit tree lines for only
     *  certain indentation levels.  This property provides an array wherein the
     *  index of the array corresponds to the indentation level, counted from left
     *  to right; and the value of that element, if it contains, specifically, the
     *  boolean value <i>true</i>, indicates that tree lines at that indentation
     *  level are to be omitted.  Any value of that element other than <i>true</i>,
     *  or if an indentation level's index does not exist in the array, means that
     *  tree lines should be displayed for that indentation level.  (There are some
     *  minor code efficiencies that are realized if this array is empty, so after
     *  having set an element to <i>true</i> and desiring to reset the default
     *  behavior, you should 'delete' the element rather than setting it to some
     *  value other than <i>true</i>.)
     *
     *  If useTreeLines is <i>false</i>, then all tree lines are excluded and this
     *  property is ignored.
     */
    excludeSpecificTreeLines :
    {
      check  : "Array",
      init   : [],
      apply  : "_applyExcludeSpecificTreeLines"
    },


    /**
     * Hide the root (Tree) node.  This differs from the visibility property in
     *  that this property hides *only* the current node, not the node's children.
     */
    hideNode :
    {
      check : "Boolean",
      init : false,
      apply : "_applyHideNode"
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
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    /**
     * @deprecated better use {@link #getUseDoubleClick}.
     */
    useDoubleClick : function()
    {
      return this.getUseDoubleClick();
    },

    /**
     * @deprecated better use {@link #getUseTreeLines}.
     */
    useTreeLines : function()
    {
      return this.getUseTreeLines();
    },

    /**
     * @deprecated better use {@link #getHideNode}.
     */
    hideNode : function()
    {
      return this.getHideNode();
    },

    /*
    ---------------------------------------------------------------------------
      MANAGER BINDING
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the selection manager for this tree. The selection manager is
     * managing the whole tree, not just the root Tree element or some part of
     * it.
     *
     * @return {SelectionManager} the selection manager of the tree.
     */
    getManager : function() {
      return this._manager;
    },


    /**
     * Returns the currently selected element within the tree. This is a
     * descendant of the root tree element.
     *
     * @return {AbstractTreeElement} the currently selected element
     */
    getSelectedElement : function() {
      return this.getManager().getSelectedItems()[0];
    },


    /**
     * Returns all children of the folder.
     *
     * @param recursive {Boolean ? false} whether children of subfolder should be
     * included
     * @param invisible {Boolean ? false} whether invisible children should be included
     * @return {AbstractTreeElement[]} list of children
     */
    getItems : function(recursive, invisible)
    {
      var a = [];

      if (!this.getHideNode()) {
        a.push(this);
      }

      if (this._containerObject)
      {
        var ch = invisible == true ? this._containerObject.getChildren() : this._containerObject.getVisibleChildren();

        if (recursive == false)
        {
          a = a.concat(ch);
        }
        else
        {
          for (var i=0, chl=ch.length; i<chl; i++) {
            a = a.concat(ch[i].getItems(recursive, invisible));
          }
        }
      }

      return a;
    },




    /*
    ---------------------------------------------------------------------------
      QUEUE HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Adds vChild to the tree queue.
     *
     * @param vChild {AbstractTreeElement} child to add
     * @return {void}
     */
    addChildToTreeQueue : function(vChild)
    {
      if (!vChild._isInTreeQueue && !vChild._isDisplayable) {
        // this.debug("Ignoring invisible child: " + vChild);
        return;
      }

      if (!vChild._isInTreeQueue && vChild._isDisplayable)
      {
        qx.legacy.ui.core.Widget.addToGlobalWidgetQueue(this);

        if (!this._treeQueue) {
          this._treeQueue = {};
        }

        this._treeQueue[vChild.toHashCode()] = vChild;

        vChild._isInTreeQueue = true;
      }
    },


    /**
     * Removes vChild from the tree queue.
     *
     * @param vChild {AbstractTreeElement} child to remove
     * @return {void}
     */
    removeChildFromTreeQueue : function(vChild)
    {
      if (vChild._isInTreeQueue)
      {
        if (this._treeQueue) {
          delete this._treeQueue[vChild.toHashCode()];
        }

        delete vChild._isInTreeQueue;
      }
    },


    /**
     * Flushes the tree queue.
     *
     * @return {void}
     */
    flushWidgetQueue : function() {
      this.flushTreeQueue();
    },


    /**
     * Flushes the tree queue.
     *
     * @return {void}
     */
    flushTreeQueue : function()
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
    },




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyUseTreeLines : function(value, old)
    {
      if (this._initialLayoutDone) {
        this._updateIndent();
      }
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyHideNode : function(value, old)
    {
      if (!value)
      {
        this._horizontalLayout.setHeight(this._horizontalLayout.originalHeight);
        this._horizontalLayout.show();
      }
      else
      {
        this._horizontalLayout.originalHeight = this._horizontalLayout.getHeight();
        this._horizontalLayout.setHeight(0);
        this._horizontalLayout.hide();
      }

      if (this._initialLayoutDone) {
        this._updateIndent();
      }
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyRootOpenClose : function(value, old)
    {
      if (this._initialLayoutDone) {
        this._updateIndent();
      }
    },

    // Override getter so we can return a clone of the array.  Otherwise, the
    // setter finds the identical array (after user modifications) and the
    // modify function doesn't get called.
    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getExcludeSpecificTreeLines : function()
    {
      return qx.lang.Array.clone(this["__user$excludeSpecificTreeLines"]);
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyExcludeSpecificTreeLines : function(value, old)
    {
      if (this._initialLayoutDone) {
        this._updateIndent();
      }
    },


    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the current tree instance, i.e. itself.
     *
     * @return {Tree} the current tree instance
     */
    getTree : function() {
      return this;
    },


    /**
     * Always returns null since a Tree instance is always the root of a tree,
     * and therefore has no parent.
     *
     * @return {qx.legacy.ui.tree.TreeFolder} returns null
     */
    getParentFolder : function() {
      return null;
    },


    /**
     * Always returns 0 since a Tree instance is always the root of a tree, and
     * therefore is on level 0.
     *
     * @return {Integer} returns 0
     */
    getLevel : function() {
      return 0;
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {var} TODOC
     */
    _onkeydown : function(e)
    {
      var vManager = this.getManager();
      vManager.getSelectedItem();
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {var | void} TODOC
     */
    _onKeyPress : function(e)
    {
      var vManager = this.getManager();
      var vSelectedItem = vManager.getSelectedItem();

      switch(e.getKeyIdentifier())
      {
        case "Enter":
          e.preventDefault();

          if (qx.legacy.ui.tree.Tree.isTreeFolder(vSelectedItem)) {
            return vSelectedItem.toggle();
          }
          break;

        case "Left":
          e.preventDefault();

          if (qx.legacy.ui.tree.Tree.isTreeFolder(vSelectedItem))
          {
            if (!vSelectedItem.getOpen())
            {
              var vParent = vSelectedItem.getParentFolder();

              if (vParent instanceof qx.legacy.ui.tree.TreeFolder)
              {
                // The first node (if hidden) should be ignored for selection
                if (vParent instanceof qx.legacy.ui.tree.Tree && vParent.getHideNode()) {
                  return;
                }

                if (!(vParent instanceof qx.legacy.ui.tree.Tree)) {
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
          else if (vSelectedItem instanceof qx.legacy.ui.tree.TreeFile)
          {
            var vParent = vSelectedItem.getParentFolder();

            if (vParent instanceof qx.legacy.ui.tree.TreeFolder)
            {
              if (!(vParent instanceof qx.legacy.ui.tree.Tree)) {
                vParent.close();
              }

              this.setSelectedElement(vParent);
            }
          }

          break;

        case "Right":
          e.preventDefault();

          if (qx.legacy.ui.tree.Tree.isTreeFolder(vSelectedItem))
          {
            if (!vSelectedItem.getOpen()) {
              return vSelectedItem.open();
            }
            else if (vSelectedItem.hasContent())
            {
              var vFirst = vSelectedItem.getFirstVisibleChildOfFolder();
              this.setSelectedElement(vFirst);

              if (vFirst instanceof qx.legacy.ui.tree.TreeFolder) {
                vFirst.open();
              }

              return;
            }
          }

          break;

        default:
          if (!this._fastUpdate)
          {
            this._fastUpdate = true;
            this._oldItem = vSelectedItem;
          }

          vManager.handleKeyPress(e);
      }
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onkeyup : function(e)
    {
      if (this._fastUpdate)
      {
        var vNewItem = this.getManager().getSelectedItem();

        if (!vNewItem) {
          return;
        }

        vNewItem.getIconObject().addState("selected");

        delete this._fastUpdate;
        delete this._oldItem;
      }
    },


    /**
     * TODOC
     *
     * @return {AbstractTreeElement | null} TODOC
     */
    getLastTreeChild : function()
    {
      var vLast = this;

      while (vLast instanceof qx.legacy.ui.tree.AbstractTreeElement)
      {
        if (!(vLast instanceof qx.legacy.ui.tree.TreeFolder) || !vLast.getOpen()) {
          return vLast;
        }

        vLast = vLast.getLastVisibleChildOfFolder();
      }

      return null;
    },


    /**
     * Returns itself.
     *
     * @return {AbstractTreeElement} itself
     */
    getFirstTreeChild : function() {
      return this;
    },


    /**
     * Sets the selected element in the tree to vElement.
     *
     * @param vElement {AbstractTreeElement} the tree element to be selected
     */
    setSelectedElement : function(vElement)
    {
      var vManager = this.getManager();

      vManager.setSelectedItem(vElement);
      vManager.setLeadItem(vElement);
    },

    /* Override getHierarchy: do not add label if root node is hidden */

    /**
     * TODOC
     *
     * @param vArr {var} TODOC
     * @return {var} TODOC
     */
    getHierarchy : function(vArr)
    {
      if (!this.getHideNode() && this._labelObject) {
        vArr.unshift(this._labelObject.getText());
      }

      return vArr;
    },


    /**
     * TODOC
     *
     * @param vUseTreeLines {var} TODOC
     * @param vColumn {var} TODOC
     * @param vLastColumn {var} TODOC
     * @return {var | null} TODOC
     */
    getIndentSymbol : function(vUseTreeLines, vColumn, vLastColumn)
    {
      if (vColumn == vLastColumn && (this.hasContent() || this.getAlwaysShowPlusMinusSymbol()))
      {
        if (!vUseTreeLines) {
          return this.getOpen() ? "minus" : "plus";
        } else {
          return this.getOpen() ? "only-minus" : "only-plus";
        }
      }
      else
      {
        return null;
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_manager");
  }
});
