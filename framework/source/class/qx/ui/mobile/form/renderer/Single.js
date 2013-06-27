/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Gabriel Munteanu (gabios)
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * Single renderer is a class used to render forms into a mobile page.
 * It displays a label above or next to each form element.
 *
 */
qx.Class.define("qx.ui.mobile.form.renderer.Single",
{

  extend : qx.ui.mobile.form.renderer.AbstractRenderer,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(form)
  {
    this.__errorMessageContainers = [];
    this._rows = [];
    this._labels = [];
    this.base(arguments,form);
  },

  members :
  {

    _rows : null,
    _labels : null,

    /**
     * A collection of error containers used to keep the error messages
     * resulted after form validation.
     * Also useful to clear them when the validation passes.
     */
    __errorMessageContainers : null,


    // override
    _getTagName : function()
    {
      return "ul";
    },


     /**
     * Determines whether the given item can be display in one line
     * or whether a separate line for the text label is needed.
     * @param item {qx.ui.mobile.core.Widget} the widget which should be added.
     * @return {Boolean} it indicates whether the widget can be displayed
     *  in same line as the label.
     */
    _isOneLineWidget : function(item) {
      return (
        item instanceof qx.ui.mobile.form.ToggleButton ||
        item instanceof qx.ui.mobile.form.RadioButton ||
        item instanceof qx.ui.mobile.form.TextField ||
        item instanceof qx.ui.mobile.form.PasswordField ||
        item instanceof qx.ui.mobile.form.NumberField ||
        item instanceof qx.ui.mobile.form.CheckBox ||
        item instanceof qx.ui.mobile.form.SelectBox
      );
    },


    // override
    addItems : function(items, names, title) {
      if(title != null)
      {
        this._addGroupHeader(title);
      }

      this._addGroupHeaderRow();
      for(var i=0, l=items.length; i<l; i++)
      {
        var item = items[i];
        var name = names[i];
        var isLastItem = (i==items.length-1);

        if(item instanceof qx.ui.mobile.form.TextArea) {
          this._addInScrollComposite(item,name);
        } else {
          if(this._isOneLineWidget(item)) {
            this._addInOneLine(item, name);
          } else {
            this._addInSeparateLines(item, name);
          }
        }


        if(!isLastItem) {
          this._addSeparationRow();
        }
      }

      this._addGroupFooterRow();
    },


    /**
     * Wraps the given item with a {@link qx.ui.mobile.container.ScrollComposite} and
     * calls _addInSeparateLines() with the composite as item.
     * @param item {qx.ui.mobile.core.Widget} A form item to render.
     * @param name {String} A name for the form item.
     */
    _addInScrollComposite : function(item,name) {
      var scrollContainer = new qx.ui.mobile.container.ScrollComposite();
      scrollContainer.add(item,{flex:1});
      this._addInSeparateLines(scrollContainer,name);
    },


    /**
     * Adds a label and the widgets in two separate lines (rows).
     * @param item {qx.ui.mobile.core.Widget} A form item to render.
     * @param name {String} A name for the form item.
     */
    _addInSeparateLines : function(item, name) {
      var labelRow = new qx.ui.mobile.form.Row();
      labelRow.addCssClass("form-row-content");

      var itemRow = new qx.ui.mobile.form.Row();
      itemRow.addCssClass("form-row-content");

      if(name) {
        var label = new qx.ui.mobile.form.Label(name);
        label.setLabelFor(item.getId());

        labelRow.add(label);
        this._labels.push(label);

        this._add(labelRow);
        this._rows.push(labelRow);
      }

      itemRow.add(item);
      this._add(itemRow);
      this._rows.push(itemRow);
    },


    /**
     * Adds a label and it according widget in one line (row).
     * @param item {qx.ui.mobile.core.Widget} A form item to render.
     * @param name {String} A name for the form item.
     */
    _addInOneLine : function(item, name) {
      var row = new qx.ui.mobile.form.Row(new qx.ui.mobile.layout.HBox());
      row.addCssClass("form-row-content");

      if(name != null) {
        var label = new qx.ui.mobile.form.Label(name);
        label.setLabelFor(item.getId());
        row.add(label, {flex:1});
        this._labels.push(label);
      }
      row.add(item);
      this._add(row);
      this._rows.push(row);
    },


    /**
     * Adds a separation line into the form.
     */
    _addSeparationRow : function() {
      var row = new qx.ui.mobile.form.Row();
      row.addCssClass("form-separation-row")
      this._add(row);
      this._rows.push(row);
    },


    /**
     * Adds an row group header.
     */
    _addGroupHeaderRow : function() {
      var row = new qx.ui.mobile.form.Row();
      row.addCssClass("form-row-group-first")
      this._add(row);
      this._rows.push(row);
    },


    /**
     * Adds an row group footer.
     */
    _addGroupFooterRow : function() {
      var row = new qx.ui.mobile.form.Row();
      row.addCssClass("form-row-group-last")
      this._add(row);
      this._rows.push(row);
    },


    /**
     * Adds a row with the name of a group of elements
     * When you want to group certain form elements, this methods implements
     * the way the header of that group is presented.
     * @param title {String} the title shown in the group header
     */
    _addGroupHeader : function(title)
    {
      var row = new qx.ui.mobile.form.Row();
      row.addCssClass("form-row-group-title");
      var titleLabel = new qx.ui.mobile.basic.Label(title);
      row.add(titleLabel);
      this._add(row);
      this._labels.push(titleLabel);
      this._rows.push(row);
    },


    // override
    addButton : function(button) {
      var row = new qx.ui.mobile.form.Row(new qx.ui.mobile.layout.HBox());
      row.add(button, {flex:1});
      this._add(row);
      this._rows.push(row);
    },


    // override
    showErrorForItem : function(item) {
      var errorNode = qx.dom.Element.create('div');
      errorNode.innerHTML = item.getInvalidMessage();
      qx.bom.element.Class.add(errorNode, 'form-element-error');
      qx.dom.Element.insertAfter(errorNode, item.getLayoutParent().getContainerElement());
      //qx.bom.Element.focus(item.getContainerElement());
      this.__errorMessageContainers.push(errorNode);
    },


    /**
     * Shows a single item of this form
     * @param item {qx.ui.form.IForm} form item which should be hidden.
     */
    showItem : function(item) {
      item.getLayoutParent().removeCssClass("exclude");
    },


    /**
     * Hides a single item of this form
     * @param item {qx.ui.form.IForm} form item which should be hidden.
     */
    hideItem : function(item) {
      item.getLayoutParent().addCssClass("exclude");
    },


    // override
    resetForm : function() {
      for(var i=0; i < this.__errorMessageContainers.length; i++) {
        qx.dom.Element.remove(this.__errorMessageContainers[i]);
      }
    }
  },


 /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.resetForm();
    this._disposeArray("_labels");
    this._disposeArray("_rows");
  }
});
