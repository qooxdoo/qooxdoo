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
#embed(qx.widgettheme/tree/*)
#embed(qx.icontheme/16/actions/document-new.png)

************************************************************************ */

/**
 * @appearance tree-element
 * @appearance tree-element-icon {qx.ui.basic.Image}
 * @appearance tree-element-label {qx.ui.basic.Label}
 */
qx.Class.define("qx.ui.tree.AbstractTreeElement",
{
  type : "abstract",
  extend : qx.ui.layout.BoxLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vLabel, vIcon, vIconSelected)
  {
    if (this.classname == qx.ui.tree.AbstractTreeElement.ABSTRACT_CLASS) {
      throw new Error("Please omit the usage of qx.ui.tree.AbstractTreeElement directly. Choose between qx.ui.tree.TreeFolder and qx.ui.tree.TreeFile instead!");
    }

    // Precreate subwidgets
    this._indentObject = new qx.ui.embed.HtmlEmbed;
    this._iconObject = new qx.ui.basic.Image;
    this._labelObject = new qx.ui.basic.Label;

    // Make anonymous
    this._indentObject.setAnonymous(true);
    this._iconObject.setAnonymous(true);
    this._labelObject.setAnonymous(true);

    // Behaviour and Hard Styling
    this._labelObject.setSelectable(false);
    this._labelObject.setStyleProperty("lineHeight", "100%");
    this._labelObject.setAllowStretchY(false);

    // Simplify label object rendering
    this._labelObject.setMode("text");

    this.base(arguments);

    this.setLabel(vLabel);

    // Prohibit selection
    this.initSelectable();

    // Base URL used for indent images
    this.BASE_URI = qx.manager.object.AliasManager.getInstance().resolvePath("widget/tree/");

    // Adding subwidgets
    this.add(this._indentObject, this._iconObject, this._labelObject);

    // Set Icons
    if (vIcon != null)
    {
      this.setIcon(vIcon);
      this.setIconSelected(vIcon);
    }

    if (vIconSelected != null) {
      this.setIconSelected(vIconSelected);
    }

    // Setup initial icon
    this._iconObject.setSource(this._evalCurrentIcon());

    // Set Appearance
    this._iconObject.setAppearance("tree-element-icon");
    this._labelObject.setAppearance("tree-element-label");

    // Register event listeners
    this.addEventListener("mousedown", this._onmousedown);
    this.addEventListener("mouseup", this._onmouseup);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    orientation:
    {
      refine : true,
      init : "horizontal"
    },

    selectable :
    {
      refine : true,
      init : false
    },

    appearance :
    {
      refine : true,
      init : "tree-element"
    },


    /** The icons */
    icon :
    {
      check : "String",
      nullable : true
    },

    iconSelected :
    {
      check : "String",
      event : "iconSelected",
      nullable : true
    },


    /** The label/caption/text of the qx.ui.basic.Atom instance */
    label :
    {
      apply : "_modifyLabel",
      dispose : true
    },


    /** Selected property */
    selected :
    {
      check : "Boolean",
      init : false,
      apply : "_modifySelected",
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
    _modifyLabel : function(propValue, propOldValue, propData)
    {
      if (this._labelObject) {
        this._labelObject.setText(propValue);
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
    _modifySelected : function(propValue, propOldValue, propData)
    {
      propValue ? this.addState("selected") : this.removeState("selected");
      propValue ? this._labelObject.addState("selected") : this._labelObject.removeState("selected");

      var vTree = this.getTree();

      if (!vTree._fastUpdate || (propOldValue && vTree._oldItem == this))
      {
        this._iconObject.setSource(this._evalCurrentIcon());

        if (propValue) {
          this._iconObject.addState("selected");
        } else {
          this._iconObject.removeState("selected");
        }
      }

      var vManager = this.getTree().getManager();

      if (propOldValue && vManager.getSelectedItem() == this) {
        vManager.deselectAll();
      } else if (propValue && vManager.getSelectedItem() != this) {
        vManager.setSelectedItem(this);
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    _evalCurrentIcon : function()
    {
      if (this.getSelected() && this.getIconSelected()) {
        return this.getIconSelected();
      } else {
        return this.getIcon() || "icon/16/actions/document-new.png";
      }
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
     * @return {var | null} TODOC
     */
    getParentFolder : function()
    {
      try {
        return this.getParent().getParent();
      } catch(ex) {}

      return null;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getLevel : function()
    {
      var vParentFolder = this.getParentFolder();
      return vParentFolder ? vParentFolder.getLevel() + 1 : null;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getTree : function()
    {
      var vParentFolder = this.getParentFolder();
      return vParentFolder ? vParentFolder.getTree() : null;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getIndentObject : function() {
      return this._indentObject;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getIconObject : function() {
      return this._iconObject;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
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
     * @type member
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
      qx.client.Timer.once(function()
                           {
                             this.dispose();
                           },
                           this,
                           0);
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
     * TODOC
     *
     * @type member
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
     * TODOC
     *
     * @type member
     * @param vHint {var} TODOC
     * @return {void}
     */
    addToCustomQueues : function(vHint)
    {
      this.addToTreeQueue();

      this.base(arguments, vHint);
    },


    /**
     * TODOC
     *
     * @type member
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
      DISPLAYBLE HANDLING
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
    _modifyParent : function(propValue, propOldValue, propData)
    {
      this.base(arguments, propValue, propOldValue, propData);

      // Be sure to update previous folder also if it is closed currently (plus/minus symbol)
      if (propOldValue && !propOldValue.isDisplayable() && propOldValue.getParent() && propOldValue.getParent().isDisplayable()) {
        propOldValue.getParent().addToTreeQueue();
      }

      // Be sure to update new folder also if it is closed currently (plus/minus symbol)
      if (propValue && !propValue.isDisplayable() && propValue.getParent() && propValue.getParent().isDisplayable()) {
        propValue.getParent().addToTreeQueue();
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
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

          if (vPrev && vPrev instanceof qx.ui.tree.AbstractTreeElement) {
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
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmousedown : function(e)
    {
      this.getTree().getManager().handleMouseDown(this, e);
      e.stopPropagation();
    },

    /**
     * @signature function()
     */
    _onmouseup : qx.lang.Function.returnTrue,




    /*
    ---------------------------------------------------------------------------
      TREE FLUSH
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    flushTree : function()
    {
      // store informations for update process
      this._previousParentFolder = this.getParentFolder();
      this._wasLastVisibleChild = this.isLastVisibleChild();

      // generate html for indent area
      var vLevel = this.getLevel();
      var vTree = this.getTree();
      var vImage;
      var vHtml = [];
      var vCurrentObject = this;

      for (var i=0; i<vLevel; i++)
      {
        vImage = vCurrentObject.getIndentSymbol(vTree.getUseTreeLines(), i == 0);

        if (vImage)
        {
          vHtml.push("<img style=\"position:absolute;top:0px;left:");
          vHtml.push((vLevel - i - 1) * 19);
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
      this._indentObject.setWidth(vLevel * 19);
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
