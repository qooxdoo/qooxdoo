/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_tree)

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
 * qx.ui.tree.SelectionManager TreeSelectionManager}. To get the
 * currently selected element of a tree use the Tree{@link #getSelectedElement
 * getSelectedElement} method and Tree{@link #setSelectedElement
 * setSelectedElement} to set it. The TreeSelectionManager handles more
 * coars-grained issues like providing selectAll()/deselectAll() methods.
 *
 * @appearance tree {qx.ui.layout.HorizontalBoxLayout}
 * @appearance tree-icon {qx.ui.basic.Image}
 * @appearance tree-label {qx.ui.basic.Label}
 */
qx.Class.define("qx.ui.tree.Tree",
{
  extend : qx.ui.tree.TreeFolder,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param vLabel {qx.ui.basic.Label} the label to display for the root node of
   * the tree
   * @param vIcon {qx.ui.basic.Image} the image to display for the root node
   * @param vIconSelected {qx.ui.basic.Image} the image to display when the root
   * node is selected
   */
  construct : function(vLabel, vIcon, vIconSelected)
  {
    this.base(arguments, vLabel, vIcon, vIconSelected);

    // ************************************************************************
    //   INITILISIZE MANAGER
    // ************************************************************************
    this._manager = new qx.ui.tree.SelectionManager(this);

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
    this.addEventListener("keydown", this._onkeydown);
    this.addEventListener("keypress", this._onkeypress);
    this.addEventListener("keyup", this._onkeyup);
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
     * @type static
     * @param vObject {Object} an object
     */
    isTreeFolder : function(vObject) {
      return vObject && vObject instanceof qx.ui.tree.TreeFolder && !(vObject instanceof qx.ui.tree.Tree);
    },


    /**
     * Returns whether vObject is a TreeFolder and is open and
     * has content.
     *
     * @type static
     * @param vObject {Object} an object
     */
    isOpenTreeFolder : function(vObject) {
      return vObject instanceof qx.ui.tree.TreeFolder && vObject.getOpen() && vObject.hasContent();
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
     * @type member
     * @return {qx.ui.tree.SelectionManager} the selection manager of the tree.
     */
    getManager : function() {
      return this._manager;
    },


    /**
     * Returns the currently selected element within the tree. This is a
     * descendant of the root tree element.
     *
     * @type member
     * @return {qx.ui.tree.AbstractTreeElement} the currently selected element
     */
    getSelectedElement : function() {
      return this.getManager().getSelectedItem();
    },




    /*
    ---------------------------------------------------------------------------
      QUEUE HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Adds vChild to the tree queue.
     *
     * @type member
     * @param vChild {AbstractTreeElement} child to add
     * @return {void}
     */
    addChildToTreeQueue : function(vChild)
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
    },


    /**
     * Removes vChild from the tree queue.
     *
     * @type member
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
     * @type member
     * @return {void}
     */
    flushWidgetQueue : function() {
      this.flushTreeQueue();
    },


    /**
     * Flushes the tree queue.
     *
     * @type member
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
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyUseTreeLines : function(value, old)
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
     * @type member
     * @return {qx.ui.tree.Tree} the current tree instance
     */
    getTree : function() {
      return this;
    },


    /**
     * Always returns null since a Tree instance is always the root of a tree,
     * and therefore has no parent.
     *
     * @type member
     * @return {qx.ui.tree.TreeFolder} returns null
     */
    getParentFolder : function() {
      return null;
    },


    /**
     * Always returns 0 since a Tree instance is always the root of a tree, and
     * therefore is on level 0.
     *
     * @type member
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
     * @type member
     * @param e {Event} TODOC
     * @return {var} TODOC
     */
    _onkeydown : function(e)
    {
      var vSelectedItem = this.getManager().getSelectedItem();

      if (e.getKeyIdentifier() == "Enter")
      {
        e.preventDefault();

        if (qx.ui.tree.Tree.isTreeFolder(vSelectedItem)) {
          return vSelectedItem.toggle();
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {var | void} TODOC
     */
    _onkeypress : function(e)
    {
      var vManager = this.getManager();
      var vSelectedItem = vManager.getSelectedItem();

      switch(e.getKeyIdentifier())
      {
        case "Left":
          e.preventDefault();

          if (qx.ui.tree.Tree.isTreeFolder(vSelectedItem))
          {
            if (!vSelectedItem.getOpen())
            {
              var vParent = vSelectedItem.getParentFolder();

              if (vParent instanceof qx.ui.tree.TreeFolder)
              {
                if (!(vParent instanceof qx.ui.tree.Tree)) {
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
          else if (vSelectedItem instanceof qx.ui.tree.TreeFile)
          {
            var vParent = vSelectedItem.getParentFolder();

            if (vParent instanceof qx.ui.tree.TreeFolder)
            {
              if (!(vParent instanceof qx.ui.tree.Tree)) {
                vParent.close();
              }

              this.setSelectedElement(vParent);
            }
          }

          break;

        case "Right":
          e.preventDefault();

          if (qx.ui.tree.Tree.isTreeFolder(vSelectedItem))
          {
            if (!vSelectedItem.getOpen()) {
              return vSelectedItem.open();
            }
            else if (vSelectedItem.hasContent())
            {
              var vFirst = vSelectedItem.getFirstVisibleChildOfFolder();
              this.setSelectedElement(vFirst);

              if (vFirst instanceof qx.ui.tree.TreeFolder) {
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
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onkeyup : function(e)
    {
      if (this._fastUpdate)
      {
        var vOldItem = this._oldItem;
        var vNewItem = this.getManager().getSelectedItem();

        vNewItem.getIconObject().addState("selected");

        delete this._fastUpdate;
        delete this._oldItem;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {AbstractTreeElement | null} TODOC
     */
    getLastTreeChild : function()
    {
      var vLast = this;

      while (vLast instanceof qx.ui.tree.AbstractTreeElement)
      {
        if (!(vLast instanceof qx.ui.tree.TreeFolder) || !vLast.getOpen()) {
          return vLast;
        }

        vLast = vLast.getLastVisibleChildOfFolder();
      }

      return null;
    },


    /**
     * Returns itself.
     *
     * @type member
     * @return {AbstractTreeElement} itself
     */
    getFirstTreeChild : function() {
      return this;
    },


    /**
     * Sets the selected element in the tree to vElement.
     *
     * @type member
     * @param vElement {AbstractTreeElement} the tree element to be selected
     */
    setSelectedElement : function(vElement)
    {
      var vManager = this.getManager();

      vManager.setSelectedItem(vElement);
      vManager.setLeadItem(vElement);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_manager");
    this._disposeFields("_oldItem");
  }
});
