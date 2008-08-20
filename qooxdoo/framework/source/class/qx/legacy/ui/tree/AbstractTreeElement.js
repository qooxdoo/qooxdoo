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
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#asset(qx/compat/icon/CrystalClear/16/actions/document-new.png)

************************************************************************ */

/**
 * The AbstractTreeElement serves as a common superclass for the {@link
 * TreeFile} and {@link TreeFolder} classes and is an implementation means of
 * the qooxdoo framework. It has no relevance for application developers.
 *
 * @appearance tree-element
 * @appearance tree-element-icon {qx.legacy.ui.basic.Image}
 * @appearance tree-element-label {qx.legacy.ui.basic.Label}
 */
qx.Class.define("qx.legacy.ui.tree.AbstractTreeElement",
{
  type : "abstract",
  extend : qx.legacy.ui.layout.BoxLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(treeRowStructure)
  {
    // Precreate subwidgets
    this._indentObject = treeRowStructure._indentObject;
    this._iconObject = treeRowStructure._iconObject;
    this._labelObject = treeRowStructure._labelObject;

    // Make anonymous
    this._indentObject.setAnonymous(true);
    this._iconObject.setAnonymous(true);
    this._labelObject.setAnonymous(true);

    // Behaviour and Hard Styling
    this._labelObject.setSelectable(false);
    this._labelObject.setStyleProperty("lineHeight", "100%");

    // Simplify label object rendering
    this._labelObject.setMode("text");

    this.base(arguments);

    if (qx.legacy.util.Validation.isValid(treeRowStructure._label)) {
      this.setLabel(treeRowStructure._label);
    }

    // Prohibit selection
    this.initSelectable();

    // Base URL used for indent images
    // Modified to new resource system. A little hacky, I know I know ;)
    this.BASE_URI = qx.util.ResourceManager.toUri(qx.legacy.util.AliasManager.getInstance().resolve("widget/tree/line.gif")).replace("line.gif", "");

    /*
     * Add all of the objects which are to be in the horizontal layout.
     */

    for (var i=0; i<treeRowStructure._fields.length; i++) {
      this.add(treeRowStructure._fields[i]);
    }

    // Set Icons
    if (treeRowStructure._icons.unselected !== undefined)
    {
      this.setIcon(treeRowStructure._icons.unselected);
      this.setIconSelected(treeRowStructure._icons.unselected);
    } else {
      this.initIcon();
    }

    if (treeRowStructure._icons.selected !== undefined) {
      this.setIconSelected(treeRowStructure._icons.selected);
    }

    if (
      (treeRowStructure._icons.selected === undefined) &&
      (treeRowStructure._icons.unselected !== undefined)
    ) {
      this.initIconSelected();
    }

    // Set Appearance
    this._iconObject.setAppearance("tree-element-icon");
    this._labelObject.setAppearance("tree-element-label");

    // Register event listeners
    this.addListener("mousedown", this._onmousedown);
    this.addListener("mouseup", this._onmouseup);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Controls the orientation of the tree element.
     */
    orientation:
    {
      refine : true,
      init : "horizontal"
    },

    /**
     * Controls whether the element is selectable.
     */
    selectable :
    {
      refine : true,
      init : false
    },

    /**
     * Controls the appearance of the tree element.
     */
    appearance :
    {
      refine : true,
      init : "tree-element"
    },


    /**
     * Controls the default icon for the element.
     */
    icon :
    {
      check : "String",
      nullable : true,
      init : "icon/16/actions/document-new.png",
      apply : "_applyIcon"
    },


    /**
     * Controls the icon for the element when it is selected.
     */
    iconSelected :
    {
      check : "String",
      event : "iconSelected",
      nullable : true,
      init : null,
      apply : "_applyIcon"
    },


    /**
     * The label/caption/text of the qx.legacy.ui.basic.Atom instance
     */
    label :
    {
      check : "String",
      apply : "_applyLabel",
      dispose : true
    },


    /**
     * Selected property
     */
    selected :
    {
      check : "Boolean",
      init : false,
      apply : "_applySelected",
      event : "changeSelected"
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
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyLabel : function(value, old)
    {
      if (this._labelObject) {
        this._labelObject.setText(value);
      }
    },


    _applyIcon : function(value, old)
    {
      var iconObject = this.getIconObject();
      if (iconObject)
      {
        var source = this._evalCurrentIcon();
        if (!source) {
          iconObject.setDisplay(false);
        } else {
          iconObject.setDisplay(true);
          iconObject.setSource(source);
        }

        this.addToTreeQueue();
      }
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applySelected : function(value, old)
    {
      if (value)
      {
        this.addState("selected");
        this._labelObject.addState("selected");
      }
      else
      {
        this.removeState("selected");
        this._labelObject.removeState("selected");
      }

      var vTree = this.getTree();

      if (!vTree._fastUpdate || (old && vTree._oldItem == this))
      {
        this._iconObject.setSource(this._evalCurrentIcon());

        if (value) {
          this._iconObject.addState("selected");
        } else {
          this._iconObject.removeState("selected");
        }
      }

      var vManager = this.getTree().getManager();
      vManager.setItemSelected(this, value);
    },


    /**
     * The tree constructor understands two signatures. One compatible with the
     * original qooxdoo tree and one compatible with the treefullcontrol widget.
     * If the first parameter if of type {@link TreeRowStructure} the tree
     * element is rendered using this structure. Otherwhise the all three
     * arguments are evaluated.
     *
     * This function evaluates the constructor arguments and returns a
     * {@link TreeRowStructure} for the tree element.
     *
     * @param labelOrTreeRowStructure {String|TreeRowStructure} Either the structure
     *     defining a tree row or the label text to display for the tree.
     * @param icon {String} the image URL to display for the tree
     * @param iconSelected {String} the image URL to display when the tree
     *     is selected
     */
   _getRowStructure : function(labelOrTreeRowStructure, icon, iconSelected)
   {
      if (labelOrTreeRowStructure instanceof qx.legacy.ui.tree.TreeRowStructure) {
        return labelOrTreeRowStructure;
      } else {
        return qx.legacy.ui.tree.TreeRowStructure.getInstance().standard(labelOrTreeRowStructure, icon, iconSelected);
      }
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    _evalCurrentIcon : function()
    {
      if (this.getSelected() && this.getIconSelected()) {
        return this.getIconSelected();
      } else {
        return this.getIcon();
      }
    },




    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the parent folder of this tree element.
     *
     * @return {AbstractTreeElement | null} TODOC
     */
    getParentFolder : function()
    {
      if (
        this.getParent() &&
        typeof(this.getParent().getParent) == "function"
      ) {
        return this.getParent().getParent();
      }
      return null;
    },


    /**
     * Returns the level of the tree element in the tree hierarchy (starting
     * with 0 at the root element).
     *
     * @return {Integer} the level
     */
    getLevel : function()
    {
      var vParentFolder = this.getParentFolder();
      return vParentFolder ? vParentFolder.getLevel() + 1 : null;
    },


    /**
     * Returns the tree from the parent folder of this element.
     *
     * @return {AbstractTreeElement} the tree root node
     */
    getTree : function()
    {
      var vParentFolder = this.getParentFolder();
      return vParentFolder ? vParentFolder.getTree() : null;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getIndentObject : function() {
      return this._indentObject;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getIconObject : function() {
      return this._iconObject;
    },


    /**
     * TODOC
     *
     * @return {qx.legacy.ui.basic.Label} TODOC
     */
    getLabelObject : function() {
      return this._labelObject;
    },


    /**
     *
     * deselects, disconnects, removes and disposes the
     *    current tree element and its content.
     *
     *
     * destroys the current item (TreeFile or TreeFolder)
     * and all its subitems. The destruction of the subitems
     * is done by calling destroyContent. This is done if the
     * subitem has the method destroyContent which is true if the
     * subitem is a TreeFolder (or one of its subclasses).
     *
     *
     * The method destroyContent is defined in the TreeFolder class.
     *
     *
     * @return {void}
     */
    destroy : function()
    {
      var manager = this.getTree() ? this.getTree().getManager() : null;

      if (manager)
      {
        // if the current destroyed item is
        // selectd deselect the item. If we are
        // in single selection mode we have to
        // call deselectAll because setItemSelected
        // refuses to deselect in this case
        if (manager.getItemSelected(this))
        {
          if (manager.getMultiSelection()) {
            manager.setItemSelected(this, false);
          } else {
            manager.deselectAll();
          }
        }

        // set the leadItem to null if the current
        // destroyed item is the leadItem
        if (manager.getLeadItem() == this) {
          manager.setLeadItem(null);
        }

        // set the anchorItem to null if the current
        // destroyed item is the anchorItem
        if (manager.getAnchorItem() == this) {
          manager.setAnchorItem(null);
        }
      }

      // if the item has the method destroyContent defined
      // then it is a TreeFolder (and it's subclasses)
      // which potentially have content which also
      // has to be destroyed
      if (this.destroyContent) {
        this.destroyContent();
      }

      // first disconnect the item so rendering
      // of the tree lines can be done correctly
      this.disconnect();

      // remove the current item from
      // the parent folder
      var parentFolder = this.getParentFolder();

      if (parentFolder) {
        parentFolder.remove(this);
      }

      // delay the dispose until return from current call stack.  if we were
      // called via an event, e.g. a mouse click, the global queue will be
      // flushed so we can't yet be disposed.
      qx.event.Timer.once(function() {
        this.dispose();
      }, this, 0);
    },


    /**
     * Obtain the entire hierarchy of labels from the root down to the current
     * node.
     *
     * @param vArr {[String]}
     *       When called by the user, arr should typically be an empty array.
     *       Each level from the current node upwards will push its label onto
     *       the array.
     * @return {[String]} array of label texts
     */
    getHierarchy : function(vArr)
    {
      // Add our label to the array
      if (this._labelObject) {
        vArr.unshift(this._labelObject.getText());
      }

      // Get the parent folder
      var parent = this.getParentFolder();

      // If it exists...
      if (parent)
      {
        // ... then add it and its ancestors' labels to the array.
        parent.getHierarchy(vArr);
      }

      // Give 'em what they came for
      return vArr;
    },




    /*
    ---------------------------------------------------------------------------
      QUEUE HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Adds the current element to the tree queue.
     *
     * @return {void}
     */
    addToTreeQueue : function()
    {
      var vTree = this.getTree();

      if (vTree) {
        vTree.addChildToTreeQueue(this);
      }
    },


    /**
     * Removes the current element from the tree queue.
     *
     * @return {void}
     */
    removeFromTreeQueue : function()
    {
      var vTree = this.getTree();

      if (vTree) {
        vTree.removeChildFromTreeQueue(this);
      }
    },


    /**
     * Adds the current item to a custom queue.
     *
     * @param vHint {var} TODOC
     * @return {void}
     */
    addToCustomQueues : function(vHint)
    {
      this.addToTreeQueue();

      this.base(arguments, vHint);
    },


    /**
     * Removes the current element from the custom queue.
     *
     * @param vHint {var} TODOC
     * @return {void}
     */
    removeFromCustomQueues : function(vHint)
    {
      this.removeFromTreeQueue();

      this.base(arguments, vHint);
    },




    /*
    ---------------------------------------------------------------------------
      DISPLAYABLE HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {Object}
     */
    _applyParent : function(value, old)
    {
      this.base(arguments, value, old);

      // Be sure to update previous folder also if it is closed currently
      // (plus/minus symbol)
      if (old && !old.isDisplayable() && old.getParent() && old.getParent().isDisplayable()) {
        old.getParent().addToTreeQueue();
      }

      // Be sure to update new folder also if it is closed currently
      // (plus/minus symbol)
      if (value && !value.isDisplayable() && value.getParent() && value.getParent().isDisplayable()) {
        value.getParent().addToTreeQueue();
      }
    },


    /**
     * TODOC
     *
     * @param vDisplayable {var} TODOC
     * @param vParent {var} TODOC
     * @param vHint {var} TODOC
     * @return {void}
     */
    _handleDisplayableCustom : function(vDisplayable, vParent, vHint)
    {
      this.base(arguments, vDisplayable, vParent, vHint);

      if (vHint)
      {
        var vParentFolder = this.getParentFolder();
        var vPreviousParentFolder = this._previousParentFolder;

        if (vPreviousParentFolder)
        {
          if (this._wasLastVisibleChild) {
            vPreviousParentFolder._updateIndent();
          } else if (!vPreviousParentFolder.hasContent()) {
            vPreviousParentFolder.addToTreeQueue();
          }
        }

        if (vParentFolder && vParentFolder.isDisplayable() && vParentFolder._initialLayoutDone) {
          vParentFolder.addToTreeQueue();
        }

        if (this.isLastVisibleChild())
        {
          var vPrev = this.getPreviousVisibleSibling();

          if (vPrev && vPrev instanceof qx.legacy.ui.tree.AbstractTreeElement) {
            vPrev._updateIndent();
          }
        }

        if (vDisplayable) {
          this._updateIndent();
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
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmousedown : function(e)
    {
      if (e._treeProcessed) {
        return;
      }

      this.getTree().getManager().handleMouseDown(this, e);
      e._treeProcessed = true;
    },



    _onmouseup : function(e)
    {
      if (e._treeProcessed) {
        return;
      }

      var vOriginalTarget = e.getOriginalTarget();

      switch(vOriginalTarget)
      {
        case this._indentObject:
        case this._containerObject:
        case this:
          break;

        default:
          this.getTree().getManager().handleMouseUp(this, e);
          e._treeProcessed = true;
      }
    },




    /*
    ---------------------------------------------------------------------------
      TREE FLUSH
    ---------------------------------------------------------------------------
    */

    /**
     * Flush the tree from the current element on.
     *
     * @return {void}
     */
    flushTree : function()
    {
      // store information for update process
      this._previousParentFolder = this.getParentFolder();
      this._wasLastVisibleChild = this.isLastVisibleChild();

      // generate html for indent area
      var vLevel = this.getLevel();
      var vTree = this.getTree();

      if (!vTree) {
        return;
      }

      var vImage;
      var vHtml = [];
      var vCurrentObject = this;
      var vMinLevel = 0;
      var vMaxLevel = vLevel;

      // If we're displaying the open/close button for the root node (normal)...
      if (vTree.getRootOpenClose())
      {
        // ... then we need one more level
        vMaxLevel = vLevel + 1;
      }

      // If we're not displaying the root node (creating virtual roots)...
      if (vTree.getHideNode())
      {
        // ... then start one level higher
        vMinLevel = 1;
      }

      for (var i=vMinLevel; i<vMaxLevel; i++)
      {
        vImage = vCurrentObject.getIndentSymbol(vTree.getUseTreeLines(), i, vMinLevel, vMaxLevel);

        if (vImage)
        {
          vHtml.push("<img style=\"position:absolute;top:0px;left:");

          // location of image; Root's image could be left of margin (invisible)
          vHtml.push((vMaxLevel - i - 1) * 19);

          vHtml.push("px\" src=\"");
          vHtml.push(this.BASE_URI);
          vHtml.push(vImage);
          vHtml.push(".");
          vHtml.push("gif");
          vHtml.push("\" />");
        }

        vCurrentObject = vCurrentObject.getParentFolder();
      }

      this._indentObject.setHtml(vHtml.join(""));
      this._indentObject.setWidth((vMaxLevel - vMinLevel) * 19);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("_indentObject", "_iconObject", "_labelObject");
    this._disposeFields("_previousParentFolder");
  }
});
