/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Gabriel Munteanu (gabios)
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * The SelectBox
 *
 * an example, how to use the SelectBox:
 * *Example*
 *
 * <pre class='javascript'>
 *    var page1 = new qx.ui.mobile.page.Page();
 *    page1.addListener("initialize", function()
 *    {
 *      var sel = new qx.ui.mobile.form.SelectBox();
 *      page1.add(sel);
 *      var model = new qx.data.Array(["item1","item2"]);
 *      sel.setModel(model);
 *      model.push("item3");
 *
 *      var but = new qx.ui.mobile.form.Button("setSelection");
 *      page1.add(but);
 *      but.addListener("tap", function(){
 *        sel.setSelection("item3");
 *      }, this);
 *
 *      sel.addListener("changeSelection", function(evt) {
 *        console.log(evt.getData());
 *      }, this);
 *
 *      var title = new qx.ui.mobile.form.Title("item2");
 *      title.bind("value",sel,"value");
 *      sel.bind("value",title,"value");
 *      page1.add(title);
 *   },this);
 *
 *   page1.show();
 *  </pre>
 */
qx.Class.define("qx.ui.mobile.form.SelectBox",
{
  extend : qx.ui.mobile.core.Widget,
  include : [
    qx.ui.mobile.form.MValue,
    qx.ui.form.MForm,
    qx.ui.mobile.form.MText,
    qx.ui.mobile.form.MState
  ],
  implement : [
    qx.ui.form.IForm,
    qx.ui.form.IField,
    qx.ui.form.IModel
  ],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function()
  {
    this.base(arguments);

    // This text node is for compatibility reasons, because Firefox can not
    // change appearance of SelectBoxes.
    this._setAttribute("type","text");
    this.setReadOnly(true);

    this.addListener("focus", this.blur);
    this.addListener("tap", this._onTap, this);

    // Selection dialog creation.
    this.__selectionDialog = this._createSelectionDialog();

    this.addCssClass("gap");

    // When selectionDialogs changes selection, get chosen selectedIndex from it.
    this.__selectionDialog.addListener("changeSelection", this._onChangeSelection, this);
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
  events :
  {
    /**
     * Fired when user selects an item.
     */
    changeSelection : "qx.event.type.Data"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "selectbox"
    },


    // overridden
    activatable :
    {
      refine :true,
      init : true
    },


    /**
     * Defines if the SelectBox has a clearButton, which resets the selection.
     */
    nullable :
    {
      init : true,
      check : "Boolean",
      apply : "_applyNullable"
    },


    /**
     * The model to use to render the list.
     */
    model :
    {
      check : "qx.data.Array",
      apply : "_applyModel",
      event : "changeModel",
      nullable : true,
      init : null
    },


    /**
     * The selected index of this SelectBox.
     */
    selection :
    {
      init : null,
      validate : "_validateSelection",
      apply : "_applySelection",
      nullable : true
    }
  },


  members :
  {
    __selectionDialog : null,


    // overridden
    _getTagName : function()
    {
      // No select here, see BUG #6054
      return "input";
    },


    /**
     * Creates the menu dialog. Override this to customize the widget.
     *
     * @return {qx.ui.mobile.dialog.Menu} A dialog, containing a selection list.
     */
    _createSelectionDialog : function() {
      var menu = new qx.ui.mobile.dialog.Menu();

      // Special appearance for SelectBox menu items.
      menu.setSelectedItemClass("selectbox-selected");
      menu.setUnselectedItemClass("selectbox-unselected");

      // Hide selectionDialog on tap on blocker.
      menu.setHideOnBlockerTap(true);

      return menu;
    },


    /**
     * Returns the SelectionDialog.
     * @return {qx.ui.mobile.dialog.Menu} the SelectionDialog.
     */
    getSelectionDialog : function() {
      return this.__selectionDialog;
    },


    /**
     * Sets the dialog title on the selection dialog.
     * @param title {String} the title to set on selection dialog.
     */
    setDialogTitle : function(title) {
      this.__selectionDialog.setTitle(title);
    },


    /**
     * Set the ClearButton label of the selection dialog.
     * @param value {String} the value to set on the ClearButton at selection dialog.
     */
    setClearButtonLabel : function(value) {
      this.__selectionDialog.setClearButtonLabel(value);
    },


    /**
     * Sets the selected text value of this SelectBox.
     * @param value {String} the text value which should be selected.
     */
    _setValue : function(value) {
      if(this.getModel() == null) {
        return;
      }

      if (value == "") {
        if (this.isNullable()) {
          this.setSelection(null);
        } else {
          this.setSelection(0);
        }
      } else if (value != null) {
        this.setSelection(this.getModel().indexOf(value));
      } else {
        this.setSelection(null);
      }
    },


    /**
     * Get the text value of this
     * It is called by setValue method of qx.ui.mobile.form.MValue mixin.
     * @return {Number} the new selected index of the SelectBox.
     */
    _getValue : function() {
      return this._getAttribute("value");
    },


    /**
     * Renders this SelectBox. Override this if you would like to display the
     * values of the SelectBox in a different way than the default.
     */
    _render : function() {
      if(this.getModel() != null && this.getModel().length > 0) {
        var selectedItem = this.getModel().getItem(this.getSelection());
        this._setAttribute("value", selectedItem);
      }

      this._domUpdated();
    },


    /**
     * Sets the model property to the new value
     * @param value {qx.data.Array}, the new model
     * @param old {qx.data.Array?}, the old model
     */
    _applyModel : function(value, old){
      value.addListener("change", this._render, this);
      if (old != null) {
        old.removeListener("change", this._render, this);
      }

      this._render();
    },


    /**
     * Refreshs selection dialogs model, and shows it.
     */
    __showSelectionDialog : function () {
      if(this.isEnabled() == true) {
        // Set index before items, because setItems() triggers rendering.
        this.__selectionDialog.setSelectedIndex(this.getSelection());
        this.__selectionDialog.setItems(this.getModel());
        this.__selectionDialog.show();
      }
    },


    /**
     * Gets the selectedIndex out of change selection event and renders view.
     * @param evt {qx.event.type.Data} data event.
     */
    _onChangeSelection : function (evt) {
      this.setSelection(evt.getData().index);
      this._render();
    },


    /**
    * Handler for <code>tap</code> event on this widget.
    * @param evt {qx.event.type.Tap} the handling tap event.
    */
    _onTap : function(evt) {
      this.__showSelectionDialog();

      // request focus so that it leaves previous widget
      // such as text field and hide virtual keyboard.
      evt.getOriginalTarget().focus();
    },


    /**
     * Validates the selection value.
     * @param value {Integer} the selection value to validate.
     */
    _validateSelection : function(value) {
      if(value != null && qx.lang.Type.isNumber(value) == false)
      {
        throw new qx.core.ValidationError(
          "Validation Error: Input value is not a number"
        );
      }

      if(this.getModel() === null) {
        throw new qx.core.ValidationError(
          "Validation Error: Please apply model before selection"
        );
      }

      if(!this.isNullable() && value === null ) {
        throw new qx.core.ValidationError(
          "Validation Error: SelectBox is not nullable"
        );
      }

      if(value != null && (value < 0 || value >= this.getModel().getLength())) {
        throw new qx.core.ValidationError(
          "Validation Error: Input value is out of model range"
        );
      }
    },


    // property apply
    _applySelection : function(value, old) {
      var selectedItem = this.getModel().getItem(value);
      this.fireDataEvent("changeSelection", {index: value, item: selectedItem});

      this._render();
    },


    // property apply
    _applyNullable : function(value, old) {
      // Delegate nullable property.
      this.__selectionDialog.setNullable(value);
    }
  },


  destruct : function()
  {
    this.__selectionDialog.removeListener("changeSelection", this._onChangeSelection, this);

    this._disposeObjects("__selectionDialog","__selectionDialogTitle");

    this.removeListener("focus", this.blur);
    this.removeListener("tap", this._onTap, this);
  }
});
