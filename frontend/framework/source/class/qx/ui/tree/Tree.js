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

qx.Clazz.define("qx.ui.tree.Tree",
{
  extend : qx.ui.tree.TreeFolder,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vLabel, vIcon, vIconSelected)
  {
    this.base(arguments, vLabel, vIcon, vIconSelected);

    // ************************************************************************
    //   INITILISIZE MANAGER
    // ************************************************************************
    this._manager = new qx.manager.selection.TreeSelectionManager(this);

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
      return vObject && vObject instanceof qx.ui.tree.TreeFolder && !(vObject instanceof qx.ui.tree.Tree);
    },


    /**
     * TODOC
     *
     * @type static
     * @param vObject {var} TODOC
     * @return {var} TODOC
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

    useDoubleClick :
    {
      _legacy      : true,
      type         : "boolean",
      defaultValue : false,
      getAlias     : "useDoubleClick"
    },

    useTreeLines :
    {
      _legacy      : true,
      type         : "boolean",
      defaultValue : true,
      getAlias     : "useTreeLines"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
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
      return this.getManager().getSelectedItem();
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
     * @return {boolean} TODOC
     */
    _modifyUseTreeLines : function(propValue, propOldValue, propData)
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
     * @return {var | null} TODOC
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




    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      this.removeEventListener("keydown", this._onkeydown);
      this.removeEventListener("keypress", this._onkeypress);
      this.removeEventListener("keyup", this._onkeyup);

      if (this._manager)
      {
        this._manager.dispose();
        this._manager = null;
      }

      delete this._oldItem;

      return this.base(arguments);
    }
  }
});
