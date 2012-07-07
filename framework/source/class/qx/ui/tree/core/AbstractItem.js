/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Derrell Lipman (derrell)
     * Christian Hagendonr (chris_schmidt)

************************************************************************ */

/**
 * The AbstractItem serves as a common superclass for the {@link
 * qx.ui.tree.core.AbstractTreeItem} and {@link qx.ui.tree.VirtualTreeItem} classes.
 *
 * @childControl label {qx.ui.basic.Label} label of the tree item
 * @childControl icon {qx.ui.basic.Image} icon of the tree item
 * @childControl open {qx.ui.tree.core.FolderOpenButton} button to open/close a subtree
 */
qx.Class.define("qx.ui.tree.core.AbstractItem",
{
  extend : qx.ui.core.Widget,
  type : "abstract",
  include : [qx.ui.form.MModelProperty],
  implement : [qx.ui.form.IModel],


  /**
   * @param label {String?null} The tree item's caption text
   */
  construct : function(label)
  {
    this.base(arguments);

    if (label != null) {
      this.setLabel(label);
    }

    this._setLayout(new qx.ui.layout.HBox());
    this._addWidgets();

    this.initOpen();
  },


  properties :
  {
    /**
     * Whether the tree item is opened.
     */
    open :
    {
      check : "Boolean",
      init : false,
      event : "changeOpen",
      apply : "_applyOpen"
    },


    /**
     * Controls, when to show the open symbol. If the mode is "auto" , the open
     * symbol is shown only if the item has child items.
     */
    openSymbolMode :
    {
      check : ["always", "never", "auto"],
      init : "auto",
      event : "changeOpenSymbolMode",
      apply : "_applyOpenSymbolMode"
    },


    /**
     * The number of pixel to indent the tree item for each level.
     */
    indent :
    {
      check : "Integer",
      init : 19,
      apply : "_applyIndent",
      event : "changeIndent",
      themeable : true
    },


    /**
     * URI of "closed" icon. Can be any URI String supported by qx.ui.basic.Image.
     **/
    icon :
    {
      check : "String",
      apply : "_applyIcon",
      event : "changeIcon",
      nullable : true,
      themeable : true
    },


    /**
     * URI of "opened" icon. Can be any URI String supported by qx.ui.basic.Image.
     **/
    iconOpened :
    {
      check : "String",
      apply : "_applyIconOpened",
      event : "changeIconOpened",
      nullable : true,
      themeable : true
    },


    /**
     * The label/caption/text
     */
    label :
    {
      check : "String",
      apply : "_applyLabel",
      event : "changeLabel",
      init : ""
    }
  },


  members :
  {
    __labelAdded : null,
    __iconAdded : null,
    __spacer : null,


    /**
     * This method configures the tree item by adding its sub widgets like
     * label, icon, open symbol, ...
     *
     * This method must be overridden by sub classes.
     */
    _addWidgets : function() {
      throw new Error("Abstract method call.");
    },


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "label":
          control = new qx.ui.basic.Label().set({
            alignY: "middle",
            anonymous: true,
            value: this.getLabel()
          });
          break;

        case "icon":
          control = new qx.ui.basic.Image().set({
            alignY: "middle",
            anonymous: true,
            source: this.getIcon()
          });
          break;

        case "open":
          control = new qx.ui.tree.core.FolderOpenButton().set({
            alignY: "middle"
          });
          control.addListener("changeOpen", this._onChangeOpen, this);
          control.addListener("resize", this._updateIndent, this);
          break;
      }

      return control || this.base(arguments, id);
    },


    /*
    ---------------------------------------------------------------------------
      TREE ITEM CONFIGURATION
    ---------------------------------------------------------------------------
    */

    /**
     * Adds a sub widget to the tree item's horizontal box layout.
     *
     * @param widget {qx.ui.core.Widget} The widget to add
     * @param options {Map?null} The (optional) layout options to use for the widget
     */
    addWidget : function(widget, options) {
      this._add(widget, options);
    },


    /**
     * Adds the spacer used to render the indentation to the item's horizontal
     * box layout. If the spacer has been added before, it is removed from its
     * old position and added to the end of the layout.
     */
    addSpacer : function()
    {
      if (!this.__spacer) {
        this.__spacer = new qx.ui.core.Spacer();
      } else {
        this._remove(this.__spacer);
      }

      this._add(this.__spacer);
    },


    /**
     * Adds the open button to the item's horizontal box layout. If the open
     * button has been added before, it is removed from its old position and
     * added to the end of the layout.
     */
    addOpenButton : function() {
      this._add(this.getChildControl("open"));
    },


    /**
     * Event handler, which listens to open state changes of the open button
     *
     * @param e {qx.event.type.Data} The event object
     */
    _onChangeOpen : function(e)
    {
      if (this.isOpenable()) {
        this.setOpen(e.getData());
      }
    },


    /**
     * Adds the icon widget to the item's horizontal box layout. If the icon
     * widget has been added before, it is removed from its old position and
     * added to the end of the layout.
     */
    addIcon : function()
    {
      var icon = this.getChildControl("icon");

      if (this.__iconAdded) {
        this._remove(icon);
      }

      this._add(icon);
      this.__iconAdded = true;
    },


    /**
     * Adds the label to the item's horizontal box layout. If the label
     * has been added before, it is removed from its old position and
     * added to the end of the layout.
     *
     * @param text {String?0} The label's contents
     */
    addLabel : function(text)
    {
      var label = this.getChildControl("label");

      if (this.__labelAdded) {
        this._remove(label);
      }

      if (text) {
        this.setLabel(text);
      } else {
        label.setValue(this.getLabel());
      }

      this._add(label);
      this.__labelAdded = true;
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyIcon : function(value, old)
    {
      // Set "closed" icon - even when "opened" - if no "opened" icon was
      // user-defined
      if (!this.__getUserValueIconOpened()) {
        this.__setIconSource(value);
      }

      else if (!this.isOpen()) {
        this.__setIconSource(value);
      }

    },


    // property apply
    _applyIconOpened : function(value, old)
    {

      if (this.isOpen()) {

        // ... both "closed" and "opened" icon were user-defined
        if (this.__getUserValueIcon() && this.__getUserValueIconOpened()) {
          this.__setIconSource(value);
        }

        // .. only "opened" icon was user-defined
        else if (!this.__getUserValueIcon() && this.__getUserValueIconOpened()) {
          this.__setIconSource(value);
        }
      }

    },


    // property apply
    _applyLabel : function(value, old)
    {
      var label = this.getChildControl("label", true);
      if (label) {
        label.setValue(value);
      }
    },

    // property apply
    _applyOpen : function(value, old)
    {
      var open = this.getChildControl("open", true);
      if (open) {
        open.setOpen(value);
      }

      //
      // Determine source of icon for "opened" or "closed" state
      //
      var source;

      // Opened
      if (value) {
        // Never overwrite user-defined icon with themed "opened" icon
        source = this.__getUserValueIconOpened() ? this.getIconOpened() : null;
      }

      // Closed
      else {
        source = this.getIcon();
      }

      if (source) {
        this.__setIconSource(source);
      }

      value ? this.addState("opened") : this.removeState("opened");

    },

    /**
    * Get user-defined value of "icon" property
    *
    * @return {var} The user value of the property "icon"
    */
    __getUserValueIcon : function() {
      return qx.util.PropertyUtil.getUserValue(this, "icon");
    },

    /**
    * Get user-defined value of "iconOpened" property
    *
    * @return {var} The user value of the property "iconOpened"
    */
    __getUserValueIconOpened : function() {
      return qx.util.PropertyUtil.getUserValue(this, "iconOpened");
    },

    /**
    * Set source of icon child control
    *
    * @param url {String} The URL of the icon
    * @return {void}
    */
    __setIconSource : function(url) {
      var icon = this.getChildControl("icon", true);
      if (icon) {
        icon.setSource(url);
      }
    },


    /*
    ---------------------------------------------------------------------------
      INDENT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Whether the tree item can be opened.
     *
     * @return {Boolean} Whether the tree item can be opened.
     */
    isOpenable : function()
    {
      var openMode = this.getOpenSymbolMode();
      return (
        openMode === "always" ||
        openMode === "auto" && this.hasChildren()
      );
    },


    /**
     * Whether the open symbol should be shown
     *
     * @return {Boolean} Whether the open symbol should be shown.
     */
    _shouldShowOpenSymbol : function() {
      throw new Error("Abstract method call.");
    },


    // property apply
    _applyOpenSymbolMode : function(value, old) {
      this._updateIndent();
    },


    /**
     * Update the indentation of the tree item.
     */
    _updateIndent : function()
    {
      var openWidth = 0;
      var open = this.getChildControl("open", true);

      if (open)
      {
        if (this._shouldShowOpenSymbol())
        {
          open.show();

          var openBounds = open.getBounds();
          if (openBounds) {
            openWidth = openBounds.width;
          } else {
            return;
          }
        }
        else
        {
          open.exclude();
        }
      }

      if (this.__spacer) {
        this.__spacer.setWidth((this.getLevel() + 1) * this.getIndent() - openWidth);
      }
    },


    // property apply
    _applyIndent : function(value, old) {
      this._updateIndent();
    },


    /**
     * Computes the item's nesting level. If the item is not part of a tree
     * this function will return <code>null</code>.
     *
     * @return {Integer|null} The item's nesting level or <code>null</code>.
     */
    getLevel : function() {
      throw new Error("Abstract method call.");
    },


    // overridden
    syncWidget : function(jobs) {
      this._updateIndent();
    },


    /**
     * Whether the item has any children
     *
     * @return {Boolean} Whether the item has any children.
     */
    hasChildren : function() {
      throw new Error("Abstract method call.");
    }
  },


  destruct : function() {
    this._disposeObjects("__spacer");
  }
});
