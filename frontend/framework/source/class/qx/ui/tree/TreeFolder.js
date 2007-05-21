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
#embed(qx.icontheme/16/status/folder-open.png)
#embed(qx.icontheme/16/places/folder.png)

************************************************************************ */

/**
 * @appearance tree-folder {qx.ui.layout.HorizontalBoxLayout}
 * @appearance tree-folder {qx.ui.layout.HorizontalBoxLayout}
 * @appearance tree-folder-icon {qx.ui.basic.Image}
 * @appearance tree-folder-label {qx.ui.basic.Label}
 */
qx.Class.define("qx.ui.tree.TreeFolder",
{
  extend : qx.ui.tree.AbstractTreeElement,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param vLabel {qx.ui.basic.Label}
   * @param vIcon {qx.ui.basic.Image}
   * @param vIconSelected
   */
  construct : function(vLabel, vIcon, vIconSelected)
  {
    this.base(arguments, vLabel, vIcon, vIconSelected);

    this._iconObject.setAppearance("tree-folder-icon");
    this._labelObject.setAppearance("tree-folder-label");

    this.addEventListener("dblclick", this._ondblclick);

    // Remapping of add/remove methods
    // not done in defer because this.base needs the original methods.
    this.add = this.addToFolder;
    this.addBefore = this.addBeforeToFolder;
    this.addAfter = this.addAfterToFolder;
    this.addAt = this.addAtToFolder;
    this.addAtBegin = this.addAtBeginToFolder;
    this.addAtEnd = this.addAtEndToFolder;
    this.remove = this.removeFromFolder;
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

    appearance :
    {
      refine : true,
      init : "tree-folder"
    },

    open :
    {
      check : "Boolean",
      init : false,
      apply : "_modifyOpen",
      event : "changeOpen"
    },

    alwaysShowPlusMinusSymbol :
    {
      check : "Boolean",
      init : false,
      apply : "_modifyAlwaysShowPlusMinusSymbol"
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
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    hasContent : function() {
      return this._containerObject && this._containerObject.getChildrenLength() > 0;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    open : function()
    {
      if (this.getOpen()) {
        return;
      }

      if (this.hasContent() && this.isSeeable())
      {
        this.getTopLevelWidget().setGlobalCursor("progress");
        qx.client.Timer.once(this._openCallback, this, 0);
      }
      else
      {
        this.setOpen(true);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    close : function() {
      this.setOpen(false);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    toggle : function() {
      this.getOpen() ? this.close() : this.open();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _openCallback : function()
    {
      this.setOpen(true);
      qx.ui.core.Widget.flushGlobalQueues();
      this.getTopLevelWidget().setGlobalCursor(null);
    },




    /*
    ---------------------------------------------------------------------------
      CHILDREN HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createChildrenStructure : function()
    {
      if (!(this instanceof qx.ui.tree.Tree)) {
        this.setHeight("auto");
      }

      this.setVerticalChildrenAlign("top");

      if (!this._horizontalLayout)
      {
        this.setOrientation("vertical");

        this._horizontalLayout = new qx.ui.layout.HorizontalBoxLayout;
        this._horizontalLayout.setWidth(null);
        this._horizontalLayout.setParent(this);
        this._horizontalLayout.setAnonymous(true);
        this._horizontalLayout.setAppearance(this instanceof qx.ui.tree.Tree ? "tree" : "tree-folder");

        this._indentObject.setParent(this._horizontalLayout);
        this._iconObject.setParent(this._horizontalLayout);
        this._labelObject.setParent(this._horizontalLayout);
      }

      if (!this._containerObject)
      {
        this._containerObject = new qx.ui.layout.VerticalBoxLayout;
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
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vChild {var} TODOC
     * @param vRelationIndex {var} TODOC
     * @param vRelationChild {var} TODOC
     * @return {void}
     */
    _handleChildMove : function(vChild, vRelationIndex, vRelationChild)
    {
      if (vChild.isDisplayable())
      {
        var vChildren = this._containerObject.getChildren();
        var vOldChildIndex = vChildren.indexOf(vChild);

        if (vOldChildIndex != -1)
        {
          if (vRelationChild) {
            vRelationIndex = vChildren.indexOf(vRelationChild);
          }

          if (vRelationIndex == vChildren.length - 1)
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
            }
          }
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param varargs {AbstractTreeElement} variable number of tree nodes to add
     */
    addToFolder : function(varargs)
    {
      this._createChildrenStructure();

      if (this._containerObject) {
        return this._containerObject.add.apply(this._containerObject, arguments);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vChild {AbstractTreeElement} TODOC
     * @param vBefore {Integer} TODOC
     */
    addBeforeToFolder : function(vChild, vBefore)
    {
      this._createChildrenStructure();

      if (this._containerObject)
      {
        this._handleChildMove(vChild, null, vBefore);
        return this._containerObject.addBefore.apply(this._containerObject, arguments);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vChild {AbstractTreeElement} TODOC
     * @param vAfter {Integer} TODOC
     */
    addAfterToFolder : function(vChild, vAfter)
    {
      this._createChildrenStructure();

      if (this._containerObject)
      {
        this._handleChildMove(vChild, null, vAfter);
        return this._containerObject.addAfter.apply(this._containerObject, arguments);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vChild {AbstractTreeElement} TODOC
     * @param vIndex {Integer} TODOC
     */
    addAtToFolder : function(vChild, vIndex)
    {
      this._createChildrenStructure();

      if (this._containerObject)
      {
        this._handleChildMove(vChild, vIndex);
        return this._containerObject.addAt.apply(this._containerObject, arguments);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vChild {AbstractTreeElement} TODOC
     */
    addAtBeginToFolder : function(vChild) {
      return this.addAtToFolder(vChild, 0);
    },


    /**
     * TODOC
     *
     * @type member
     * @param vChild {AbstractTreeElement} TODOC
     */
    addAtEndToFolder : function(vChild)
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
        }
      }
    },

    _remappingChildTable : [ "remove", "removeAt", "removeAll" ],




    /*
    ---------------------------------------------------------------------------
      CHILDREN UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {qx.ui.layout.VerticalBoxLayout} TODOC
     */
    getContainerObject : function() {
      return this._containerObject;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {qx.ui.layout.HorizontalBoxLayout} TODOC
     */
    getHorizontalLayout : function() {
      return this._horizontalLayout;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {AbstractTreeElement} TODOC
     */
    getFirstVisibleChildOfFolder : function()
    {
      if (this._containerObject) {
        return this._containerObject.getFirstChild();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {AbstractTreeElement} TODOC
     */
    getLastVisibleChildOfFolder : function()
    {
      if (this._containerObject) {
        return this._containerObject.getLastChild();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param recursive {Boolean} TODOC
     * @param invisible {Boolean} TODOC
     * @return {AbstractTreeElement[]} TODOC
     */
    getItems : function(recursive, invisible)
    {
      var a = [ this ];

      if (this._containerObject)
      {
        var ch = invisible == true ? this._containerObject.getChildren() : this._containerObject.getVisibleChildren();

        if (recursive == false) {
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


    /**
     *
     * deselects, disconnects, removes and disposes the
     *    content of the folder and its subfolders.
     *
     *
     * the current items subitems (and the subitems of each
     * subitem) are destroyed going top down the TreeFolder
     * hierarchy. The current item is left as is.
     *
     *
     * @type member
     */
    destroyContent : function()
    {
      if (!this.hasContent()) {
        return;
      }

      var manager = this.getTree() ? this.getTree().getManager() : null;

      var leadItem;
      var anchorItem;

      if (manager)
      {
        leadItem = manager.getLeadItem();
        anchorItem = manager.getAnchorItem();
      }

      // set the container objects display property
      // to true so getChildren will retreive all
      // children objects
      this._containerObject.setDisplay(true);
      var items = this._containerObject.getChildren();
      var item;

      for (var i=items.length-1; i>=0; --i)
      {
        item = items[i];

        // this.getItems seems to also contain "this".
        // In order to avoid endless loops by calling
        // recursively destroyContent we have to avoid
        // destroying ourselves
        if (item != this)
        {
          if (manager)
          {
            // set the leadItem to null if the current
            // destroyed item is the leadItem
            if (leadItem == item) {
              manager.setLeadItem(null);
            }

            // set the anchorItem to null if the current
            // destroyed item is the anchorItem
            if (anchorItem == item) {
              manager.setAnchorItem(null);
            }

            // if the current destroyed item is
            // selected, deselect the item. If we are
            // in single selection mode we have to
            // call deselectAll because setItemSelected
            // refuses to deselect in this case
            if (manager.getItemSelected(item))
            {
              if (manager.getMultiSelection()) {
                manager.setItemSelected(item, false);
              } else {
                manager.deselectAll();
              }
            }

            // if the item has the method destroyContent defined
            // then it is a TreeFolder (and it's subclasses)
            // which potentially have content which also
            // has to be destroyed
            if (item.destroyContent) {
              item.destroyContent();
            }
          }

          // first disconnect the item so rendering
          // of the tree lines can be done correctly
          item.removeFromTreeQueue();
          item.disconnect();

          // remove the item from the containerObject
          this._containerObject.remove(item);

          // delay the dispose until return from current call stack.  if we
          // were called via an event, e.g. a mouse click, the global queue
          // will be flushed so we can't yet be disposed.
          qx.client.Timer.once(function()
                               {
                                 item.dispose();
                                 delete items[i]
                               },
                               this,
                               0);
        }
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
     * @return {var} TODOC
     */
    _evalCurrentIcon : function()
    {
      if (this.getSelected()) {
        return this.getIconSelected() || "icon/16/status/folder-open.png";
      } else {
        return this.getIcon() || "icon/16/places/folder.png";
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {Boolean} TODOC
     */
    _modifyOpen : function(value, old)
    {
      this._updateLastColumn();

      if (this._containerObject) {
        this._containerObject.setDisplay(value);
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {Boolean} TODOC
     */
    _modifyAlwaysShowPlusMinusSymbol : function(value, old)
    {
      this._updateLastColumn();

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _updateLastColumn : function()
    {
      if (this._indentObject)
      {
        var vElement = this._indentObject.getElement();

        if (vElement && vElement.firstChild) {
          vElement.firstChild.src = this.BASE_URI + this.getIndentSymbol(this.getTree().getUseTreeLines(), true) + ".gif";
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmousedown : function(e)
    {
      var vOriginalTarget = e.getOriginalTarget();

      switch(vOriginalTarget)
      {
        case this._indentObject:
          if (this._indentObject.getElement().firstChild == e.getDomTarget())
          {
            this.toggle();

            // Only if we just get closed and the current selection is inside of this node.
            if (!this.getOpen())
            {
              if (qx.lang.Array.contains(this.getItems(true, true), this.getTree().getSelectedElement())) {
                this.getTree().getManager().handleMouseDown(this, e);
              }
            }
          }

          break;

        case this._containerObject:
          break;

        case this:
          if (this._containerObject) {
            break;
          }

          // no break here

        default:
          this.getTree().getManager().handleMouseDown(this, e);
      }

      e.stopPropagation();
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseup : function(e)
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
          }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _ondblclick : function(e)
    {
      if (!this.getTree().getUseDoubleClick()) {
        return;
      }

      this.toggle();
      e.stopPropagation();
    },




    /*
    ---------------------------------------------------------------------------
      INDENT HELPER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vUseTreeLines {Boolean} TODOC
     * @param vIsLastColumn {Boolean} TODOC
     * @return {String} TODOC
     */
    getIndentSymbol : function(vUseTreeLines, vIsLastColumn)
    {
      if (vIsLastColumn)
      {
        if (this.hasContent() || this.getAlwaysShowPlusMinusSymbol())
        {
          if (!vUseTreeLines) {
            return this.getOpen() ? "minus" : "plus";
          } else if (this.isLastChild()) {
            return this.getOpen() ? "end_minus" : "end_plus";
          } else {
            return this.getOpen() ? "cross_minus" : "cross_plus";
          }
        }
        else if (vUseTreeLines)
        {
          return this.isLastChild() ? "end" : "cross";
        }
      }
      else
      {
        return vUseTreeLines && !this.isLastChild() ? "line" : null;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _updateIndent : function()
    {
      // Intentionally bypass superclass; the _updateIndent we want is in TreeFile
      qx.ui.tree.TreeFile.prototype._updateIndent.call(this);

      if (!this._containerObject) {
        return;
      }

      var ch = this._containerObject.getVisibleChildren();

      for (var i=0, l=ch.length; i<l; i++) {
        ch[i]._updateIndent();
      }
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_horizontalLayout", "_containerObject");
  }
});
