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
#embed(qx.icontheme/16/status/folder-open.png)
#embed(qx.icontheme/16/places/folder.png)

************************************************************************ */

/**
 * qx.ui.tree.TreeFolder objects are tree rows which may contain
 * sub-trees
 *
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
   * The TreeFolder constructor understands two signatures. One compatible with the
   * original qooxdoo tree and one compatible with the treefullcontrol widget.
   * If the first parameter if of type {@link TreeRowStructure} the tree
   * folder is rendered using this structure. Otherwhise the all three
   * arguments are evaluated.
   *
   * @param labelOrTreeRowStructure {String|TreeRowStructure} Either the structure
   *     defining a tree row or the label text to display for the tree folder.
   * @param icon {String?null} the image URL to display for the tree folder
   * @param iconSelected {String?null} the image URL to display when the tree folder
   *     is selected
   */
  construct : function(labelOrTreeRowStructure, icon, iconSelected)
  {
    var treeRowStructure = this._getRowStructure(labelOrTreeRowStructure, icon, iconSelected);
    this.base(arguments, treeRowStructure);

    // Save the tree row field order. We'll need it to create children structure.
    this._treeRowStructureFields = treeRowStructure._fields;

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
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events : {
    /**
     * Called when a tree folder with content is opened. The data property
     * contains the opened {@link TreeFolder}.
     */
    "treeOpenWithContent" : "qx.event.type.DataEvent",

    /**
     * Called when a tree folder without content is opened. The data property
     * contains the opened {@link TreeFolder}.
     */
    "treeOpenWhileEmpty" : "qx.event.type.DataEvent",

    /**
     * Called when a tree folder is closed. The data property
     * contains the {@link TreeFolder} being closed.
     */
    "treeClose" : "qx.event.type.DataEvent"
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


    /**
     * Controls the default icon for the element.
     */
    icon :
    {
      refine : true,
      init : "icon/16/places/folder.png"
    },


    /**
     * Controls the icon for the element when it is selected.
     */
    iconSelected :
    {
      refine : true,
      init : "icon/16/status/folder-open.png"
    },


    /**
     * Controls whether the folder is open.
     */
    open :
    {
      check : "Boolean",
      init : false,
      apply : "_applyOpen",
      event : "changeOpen"
    },

    /**
     * Controls whether always to display the open status of the folder with a
     * plus or minus symbol.
     */
    alwaysShowPlusMinusSymbol :
    {
      check : "Boolean",
      init : false,
      apply : "_applyAlwaysShowPlusMinusSymbol"
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
     * Returns whether the folder has content, i.e. child folder or files.
     *
     * @type member
     * @return {Boolean} true if the folder has content
     */
    hasContent : function() {
      return this._containerObject && this._containerObject.getChildrenLength() > 0;
    },


    /**
     * Opens the current folder.
     *
     * @type member
     * @return {void}
     */
    open : function()
    {
      if (this.getOpen()) {
        return;
      }

      if (this.hasContent())
      {
        // If there are listeners waiting for a treeOpenWithContent event...
        if (this.getTree().hasEventListeners("treeOpenWithContent"))
        {
          // ... then issue the event
          this.getTree().dispatchEvent(new qx.event.type.DataEvent("treeOpenWithContent", this), true);
        }

        this.getTopLevelWidget().setGlobalCursor("progress");
        qx.client.Timer.once(this._openCallback, this, 0);
      }
      else
      {
        // If there are listeners waiting for a treeOpenWithContent event...
        if (this.getTree().hasEventListeners("treeOpenWhileEmpty"))
        {
          // ... then issue the event
          this.getTree().dispatchEvent(new qx.event.type.DataEvent("treeOpenWhileEmpty", this), true);
        }

        this.setOpen(true);
      }
    },


    /**
     * Closes the current folder.
     *
     * @type member
     * @return {void}
     */
    close : function()
    {
      // If there are listeners waiting for a treeClose event...
      if (this.getTree().hasEventListeners("treeClose"))
      {
        // ... then issue the event
        this.getTree().dispatchEvent(new qx.event.type.DataEvent("treeClose", this), true);
      }

      this.setOpen(false);
    },


    /**
     * Toggles between open and closed status of the folder.
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

        // Create a horizontal layout for this tree row
        this._horizontalLayout = new qx.ui.layout.HorizontalBoxLayout;
        this._horizontalLayout.setWidth(null);
        this._horizontalLayout.setParent(this);
        this._horizontalLayout.setAnonymous(true);
        this._horizontalLayout.setAppearance(this instanceof qx.ui.tree.Tree ? "tree" : "tree-folder");

        // Move the row fields into the horizontal layout
        for (var i=0; i<this._treeRowStructureFields.length; i++) {
          this._treeRowStructureFields[i].setParent(this._horizontalLayout);
        }

        // We don't need the tree row structure any more.
        this._treeRowStructureFields = null;
      }

      if (!this._containerObject)
      {
        // Create a veritcal box layout for all of this folder's children
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
     * Adds the passed tree elements to the current folder.
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
     * Adds the new tree element vChild to the current folder, before the
     * existing child vBefore.
     *
     * @type member
     * @param vChild {AbstractTreeElement} new tree element to insert
     * @param vBefore {AbstractTreeElement} existing child of folder
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
     * Adds the new tree element vChild to the current folder, after the
     * existing child vAfter.
     *
     * @type member
     * @param vChild {AbstractTreeElement} new tree element to insert
     * @param vAfter {AbstractTreeElement} existing child of folder
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
     * Adds the new tree element vChild to the current folder, at position
     * vIndex.
     *
     * @type member
     * @param vChild {AbstractTreeElement} new tree element to insert
     * @param vIndex {Integer} position to insert into
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
     * Adds the new tree element vChild at the beginning of the current folder.
     *
     * @type member
     * @param vChild {AbstractTreeElement} new tree element to insert
     */
    addAtBeginToFolder : function(vChild) {
      return this.addAtToFolder(vChild, 0);
    },


    /**
     * Adds the new tree element vChild at the end of the current folder.
     *
     * @type member
     * @param vChild {AbstractTreeElement} new tree element to insert
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
     * Returns the container of the current tree element.
     *
     * @type member
     * @return {qx.ui.layout.VerticalBoxLayout} the widget container
     */
    getContainerObject : function() {
      return this._containerObject;
    },


    /**
     * Returns the HorizontalBoxLayout of the folder.
     *
     * @type member
     * @return {qx.ui.layout.HorizontalBoxLayout} the horizontal layout widget
     */
    getHorizontalLayout : function() {
      return this._horizontalLayout;
    },


    /**
     * Returns the first visible child of the folder.
     *
     * @type member
     * @return {AbstractTreeElement} the first visible child element
     */
    getFirstVisibleChildOfFolder : function()
    {
      if (this._containerObject) {
        return this._containerObject.getFirstChild();
      }
    },


    /**
     * Returns the last visible child of the folder.
     *
     * @type member
     * @return {AbstractTreeElement} the last visible child element
     */
    getLastVisibleChildOfFolder : function()
    {
      if (this._containerObject) {
        return this._containerObject.getLastChild();
      }
    },


    /**
     * Returns all children of the folder.
     *
     * @type member
     * @param recursive {Boolean ? false} whether children of subfolder should be
     * included
     * @param invisible {Boolean ? true} whether invisible children should be included
     * @return {AbstractTreeElement[]} list of children
     */
    getItems : function(recursive, invisible)
    {
      var a = [ this ];

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
    _applyOpen : function(value, old)
    {
      // we need the whole indent process if certain tree lines are to be excluded
      var tree = this.getTree();
      if (tree && tree.getExcludeSpecificTreeLines().length > 0) {
        this._updateIndent();
      } else {
        this._updateLastColumn();
      }

      if (this._containerObject) {
        this._containerObject.setDisplay(value);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyAlwaysShowPlusMinusSymbol : function(value, old)
    {
      var t = this.getTree();

      if (t)
      {
        // we need the whole indent process if only certain tree lines are to be
        // excluded
        if (t.getExcludeSpecificTreeLines().length > 0) {
          this._updateIndent();
        } else {
          this._updateLastColumn();
        }
      }
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
          vElement.firstChild.src = this.BASE_URI + this.getIndentSymbol(this.getTree().getUseTreeLines(), 0, 0, 0) + ".gif";
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
      if (e._treeProcessed) {
        return;
      }

      var vOriginalTarget = e.getOriginalTarget();

      switch(vOriginalTarget)
      {
        case this._indentObject:
          if (this._indentObject.getElement().firstChild == e.getDomTarget())
          {
            this.getTree().getManager().handleMouseDown(this, e);
            this.toggle();
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

      e._treeProcessed = true;
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
     * Returns a string indicating the symbol used to indent the current item,
     * or null.
     *
     * @type member
     * @param vUseTreeLines {Boolean} whether tree lines are used
     * @param vIsLastColumn {Boolean} whether the item is in the last column
     * @return {String | null} "end", "cross", "line" or null
     */
    getIndentSymbol : function(vUseTreeLines, vColumn, vFirstColumn, vLastColumn)
    {
      var vLevel = this.getLevel();
      var vExcludeList = this.getTree().getExcludeSpecificTreeLines();
      var vExclude = vExcludeList[vLastColumn - vColumn - 1];

      if (vColumn == vFirstColumn)
      {
        if (this.hasContent() || this.getAlwaysShowPlusMinusSymbol())
        {
          // If tree lines were not requested, don't display them
          if (!vUseTreeLines) {
            return this.getOpen() ? "minus" : "plus";
          }

          // If this is the first level under the root...
          if (vLevel == 1)
          {
            // ... and the root is not being displayed and this is the first
            // child...
            var vParentFolder = this.getParentFolder();

            if (vParentFolder && !vParentFolder._horizontalLayout.getVisibility() && this.isFirstChild())
            {
              // ... then if this is also the last (i.e. only) child, use no tree
              // lines; otherwise, use descender lines but no ascender.
              if (this.isLastChild() || vExclude === true) {
                return this.getOpen() ? "only_minus" : "only_plus";
              } else {
                return this.getOpen() ? "start_minus" : "start_plus";
              }
            }
          }

          if (vExclude === true) {
            return this.getOpen() ? "only_minus" : "only_plus";
          } else if (this.isLastChild()) {
            return this.getOpen() ? "end_minus" : "end_plus";
          } else {
            return this.getOpen() ? "cross_minus" : "cross_plus";
          }
        }
        else if (vUseTreeLines && !(vExclude === true))
        {
          return this.isLastChild() ? "end" : "cross";
        }
      }
      else
      {
        if (vUseTreeLines && !this.isLastChild())
        {
          if (vExclude === true) {
            return null;
          }

          return "line";
        }

        return null;
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
    this._disposeFields('_treeRowStructureFields');
    this._disposeObjects("_horizontalLayout", "_containerObject");
  }
});
