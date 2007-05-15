/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org
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

/* ************************************************************************

#module(ui_treefullcontrol)

************************************************************************ */

/**
 * qx.ui.treefullcontrol.Tree objects are tree root nodes but act like
 * TreeFolder.
 *
 * @appearance tree {qx.ui.layout.HorizontalBoxLayout}
 * @appearance tree-icon {qx.ui.basic.Image}
 * @appearance tree-label {qx.ui.basic.Label}
 */
qx.Class.define("qx.ui.treefullcontrol.Tree",
{
  extend : qx.ui.treefullcontrol.TreeFolder,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param treeRowStructure An instance of qx.ui.treefullcontrol.TreeRowStructure,
   *    defining the structure of this tree row.
   */
  construct : function(treeRowStructure)
  {
    this.base(arguments, treeRowStructure);

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
     * TODOC
     *
     * @type static
     * @param vObject {var} TODOC
     * @return {var} TODOC
     */
    isTreeFolder : function(vObject) {
      return (vObject && vObject instanceof qx.ui.treefullcontrol.TreeFolder && !(vObject instanceof qx.ui.treefullcontrol.Tree));
    },


    /**
     * TODOC
     *
     * @type static
     * @param vObject {var} TODOC
     * @return {var} TODOC
     */
    isOpenTreeFolder : function(vObject) {
      return (vObject instanceof qx.ui.treefullcontrol.TreeFolder && vObject.getOpen() && vObject.hasContent());
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

    useDoubleClick :
    {
      check : "Boolean",
      init : false
    },

    useTreeLines :
    {
      check : "Boolean",
      init : true,
      apply : "_modifyUseTreeLines"
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
      _legacy      : true,
      type         : "object",
      defaultValue : []
    },


    /**
     * Hide the root (Tree) node.  This differs from the visibility property in
     *  that this property hides *only* the current node, not the node's children.
     */
    hideNode :
    {
      check : "Boolean",
      init : false,
      apply : "_modifyHideNode"
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
      init : true,
      apply : "_modifyRootOpenClose"
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
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getManager : function() {
      return this._manager;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getSelectedElement : function() {
      return this.getManager().getSelectedItems()[0];
    },




    /*
    ---------------------------------------------------------------------------
      QUEUE HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vChild {var} TODOC
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
     * TODOC
     *
     * @type member
     * @param vChild {var} TODOC
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
     * TODOC
     *
     * @type member
     * @return {void}
     */
    flushWidgetQueue : function() {
      this.flushTreeQueue();
    },


    /**
     * TODOC
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
      MODIFIER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyUseTreeLines : function(propValue, propOldValue, propData)
    {
      if (this._initialLayoutDone) {
        this._updateIndent();
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyHideNode : function(propValue, propOldValue, propData)
    {
      if (!propValue)
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

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyRootOpenClose : function(propValue, propOldValue, propData)
    {
      if (this._initialLayoutDone) {
        this._updateIndent();
      }

      return true;
    },

    // Override getter so we can return a clone of the array.  Otherwise, the
    // setter finds the identical array (after user modifications) and the
    // modify function doesn't get called.
    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getExcludeSpecificTreeLines : function()
    {
      return qx.lang.Array.clone(this["__user$excludeSpecificTreeLines"]);
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyExcludeSpecificTreeLines : function(propValue, propOldValue, propData)
    {
      if (this._initialLayoutDone) {
        this._updateIndent();
      }

      return true;
    },




    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getTree : function() {
      return this;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {null} TODOC
     */
    getParentFolder : function() {
      return null;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {int} TODOC
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
      var vManager = this.getManager();
      var vSelectedItem = vManager.getSelectedItem();

      if (e.getKeyIdentifier() == "Enter")
      {
        e.preventDefault();

        if (qx.ui.treefullcontrol.Tree.isTreeFolder(vSelectedItem)) {
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

          if (qx.ui.treefullcontrol.Tree.isTreeFolder(vSelectedItem))
          {
            if (!vSelectedItem.getOpen())
            {
              var vParent = vSelectedItem.getParentFolder();

              if (vParent instanceof qx.ui.treefullcontrol.TreeFolder)
              {
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

            if (vParent instanceof qx.ui.treefullcontrol.TreeFolder)
            {
              if (!(vParent instanceof qx.ui.treefullcontrol.Tree)) {
                vParent.close();
              }

              this.setSelectedElement(vParent);
            }
          }

          break;

        case "Right":
          e.preventDefault();

          if (qx.ui.treefullcontrol.Tree.isTreeFolder(vSelectedItem))
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
     * @type member
     * @return {var | null} TODOC
     */
    getLastTreeChild : function()
    {
      var vLast = this;

      while (vLast instanceof qx.ui.treefullcontrol.AbstractTreeElement)
      {
        if (!(vLast instanceof qx.ui.treefullcontrol.TreeFolder) || !vLast.getOpen()) {
          return vLast;
        }

        vLast = vLast.getLastVisibleChildOfFolder();
      }

      return null;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getFirstTreeChild : function() {
      return this;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vElement {var} TODOC
     * @return {void}
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
     * @type member
     * @param vArr {var} TODOC
     * @return {var} TODOC
     */
    getHierarchy : function(vArr)
    {
      if (!this.hideNode() && this._labelObject) {
        vArr.unshift(this._labelObject.getText());
      }

      return vArr;
    },


    /**
     * TODOC
     *
     * @type member
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
          return this.getOpen() ? "only_minus" : "only_plus";
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
