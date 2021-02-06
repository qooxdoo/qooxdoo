/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * The radio container handles a collection of items from which only one item
 * can be selected. Selection another item will deselect the previously selected
 * item. For that, it uses the {@link qx.ui.form.RadioGroup} object.
 *
 * This class is used to create radio groups of {@link qx.ui.form.RadioButton}
 * instances.
 *
 * This widget takes care of the layout of the added items. If you want to
 * take full control of the layout and just use the selection behavior,
 * take a look at the {@link qx.ui.form.RadioGroup} object for a loose coupling.
 */
qx.Class.define("qx.ui.form.RadioButtonGroup",
{
  extend : qx.ui.core.Widget,
  include : [qx.ui.core.MLayoutHandling, qx.ui.form.MModelSelection],
  implement : [
    qx.ui.form.IForm,
    qx.ui.form.IField,
    qx.ui.core.ISingleSelection,
    qx.ui.form.IModelSelection
  ],


  /**
   * @param layout {qx.ui.layout.Abstract} The new layout or
   *     <code>null</code> to reset the layout.
   */
  construct : function(layout)
  {
    this.base(arguments);

    // if no layout is given, use the default layout (VBox)
    if (layout == null) {
      this.setLayout(new qx.ui.layout.VBox(4));
    } else {
      this.setLayout(layout);
    }

    // create the radio group
    this.__radioGroup = new qx.ui.form.RadioGroup();

    // attach the listener
    this.__radioGroup.addListener("changeSelection", this._onChangeSelection, this);
  },


  properties :
  {
    /**
     * Flag signaling if the group at all is valid. All children will have the
     * same state.
     */
    valid : {
      check : "Boolean",
      init : true,
      apply : "_applyValid",
      event : "changeValid"
    },

    /**
     * Flag signaling if the group is required.
     */
    required : {
      check : "Boolean",
      init : false,
      event : "changeRequired"
    },

    /**
     * Message which is shown in an invalid tooltip.
     */
    invalidMessage : {
      check : "String",
      init: "",
      event : "changeInvalidMessage",
      apply : "_applyInvalidMessage"
    },


    /**
     * Message which is shown in an invalid tooltip if the {@link #required} is
     * set to true.
     */
    requiredInvalidMessage : {
      check : "String",
      nullable : true,
      event : "changeInvalidMessage"
    }
  },


  events :
  {
    /** Fires after the value was modified */
    "changeValue" : "qx.event.type.Data",

    /**
     * Fires after the selection was modified
     */
    "changeSelection" : "qx.event.type.Data"
  },


  members :
  {
    __radioGroup : null,


    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */
    // property apply
    _applyInvalidMessage : function(value, old) {
      var children = this._getChildren();
      for (var i = 0; i < children.length; i++) {
        children[i].setInvalidMessage(value);
      }
    },


    // property apply
    _applyValid: function(value, old) {
      var children = this._getChildren();
      for (var i = 0; i < children.length; i++) {
        children[i].setValid(value);
      }
    },


    /*
    ---------------------------------------------------------------------------
      REGISTRY
    ---------------------------------------------------------------------------
    */

    /**
     * The internally used radio group instance will be returned.
     *
     * @return {qx.ui.form.RadioGroup} Returns the used RadioGroup instance.
     */
    getRadioGroup : function() {
      return this.__radioGroup;
    },


    /**
     * Returns the children list
     *
     * @return {qx.ui.core.LayoutItem[]} The children array.
     */
    getChildren : function() {
      return this._getChildren();
    },


    /**
     * Adds a new child widget.
     *
     * The supported keys of the layout options map depend on the layout
     * used to position the widget. The options are documented in the class
     * documentation of each layout manager {@link qx.ui.layout}.
     *
     * @param child {qx.ui.core.LayoutItem} the widget to add.
     * @param options {Map?null} Optional layout data for widget.
     */
    add : function(child, options) {
      this.__radioGroup.add(child);
      this._add(child, options);
    },


    /**
     * Remove the given child widget.
     *
     * @param child {qx.ui.core.LayoutItem} the widget to remove
     */
    remove : function(child)
    {
      this.__radioGroup.remove(child);
      this._remove(child);
    },


    /**
     * Remove all children.
     *
     * @return {Array} An array of {@link qx.ui.core.LayoutItem}'s.
     */
    removeAll : function()
    {
      // remove all children from the radio group
      var radioItems = this.__radioGroup.getItems();
      for (var i = radioItems.length - 1; i >= 0; i--) {
        this.__radioGroup.remove(radioItems[i]);
      }

      return this._removeAll();
    },



    /*
    ---------------------------------------------------------------------------
      SELECTION
    ---------------------------------------------------------------------------
    */

    /**
     * Returns an array of currently selected items.
     *
     * Note: The result is only a set of selected items, so the order can
     * differ from the sequence in which the items were added.
     *
     * @return {qx.ui.core.Widget[]} List of items.
     */
    getSelection : function() {
      return this.__radioGroup.getSelection();
    },


    /**
     * Replaces current selection with the given items.
     *
     * @param items {qx.ui.core.Widget[]} Items to select.
     * @throws {Error} if the item is not a child element.
     */
    setSelection : function(items) {
      this.__radioGroup.setSelection(items);
    },


    /**
     * Clears the whole selection at once.
     */
    resetSelection : function() {
      this.__radioGroup.resetSelection();
    },


    /**
     * Detects whether the given item is currently selected.
     *
     * @param item {qx.ui.core.Widget} Any valid selectable item
     * @return {Boolean} Whether the item is selected.
     * @throws {Error} if the item is not a child element.
     */
    isSelected : function(item) {
      return this.__radioGroup.isSelected(item);
    },


    /**
     * Whether the selection is empty.
     *
     * @return {Boolean} Whether the selection is empty.
     */
    isSelectionEmpty : function() {
      return this.__radioGroup.isSelectionEmpty();
    },


    /**
     * Returns all elements which are selectable.
     *
     * @param all {Boolean} true for all selectables, false for the
     *   selectables the user can interactively select
     * @return {qx.ui.core.Widget[]} The contained items.
     */
    getSelectables: function(all) {
      return this.__radioGroup.getSelectables(all);
    },


    /**
     * Select given value.
     *
     * @param item {null|var} Item to set as selected value.
     * @return {null|Error} The status of this operation.
     */
    setValue : function(item) {
      if (item && 'object' === typeof item && item instanceof qx.ui.form.IRadioItem) {
        return this.__radioGroup.setValue(item);
      } else {
        return new Error("can not select radio item from value");
      }
    },


    /**
     * @return {null|var} Returns the selected value.
     */
    getValue : function() {
      return this.__radioGroup.getValue();
    },


    /**
     * Reset radio item selection.
     */
    resetValue : function() {
      this.__radioGroup.resetValue();
    },


    /**
     * Called on {@link qx.ui.form.RadioGroup} selection change event.
     *
     * @param event {qx.event.type.Data} Event containing the {@link qx.ui.form.RadioGroup} selection data.
     */
    _onChangeSelection : function(event) {
      this.fireDataEvent("changeValue", event.getData(), event.getOldData());
      this.fireDataEvent("changeSelection", event.getData(), event.getOldData());
    }
  },


  destruct : function()
  {
    this.__radioGroup.removeListener("changeSelection", this._onChangeSelection, this);
    this._disposeObjects("__radioGroup");
  }
});
