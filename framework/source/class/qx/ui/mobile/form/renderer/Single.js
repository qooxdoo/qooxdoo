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
     * Gabriel Munteanu (gabios)

************************************************************************ */

/**
 * Single is a class used to render forms into a mobile page.
 * It presents a label above each form element
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
    this.__rows = [];
    this.__labels = [];
    this.base(arguments,form);
  },

  members :
  {

    __rows : null,
    __labels : null,

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


    // override
    addItems : function(items, names, title) {
      if(title != null)
      {
        this._showGroupHeader(title);
      }
      for(var i=0, l=items.length; i<l; i++)
      {
        var row = new qx.ui.mobile.form.Row();
        if(names[i] != null) {
          var label = new qx.ui.mobile.basic.Label(names[i]);
          label._setStyle('marginBottom', '7px');
          row.add(label);
          this.__labels.push(label);
        }
        row.add(items[i]);
        this._add(row);
        this.__rows.push(row);
      }
    },

    /**
     * Adds a row with the name of a group of elements
     * When you want to group certain form elements, this methods implements
     * the way the header of that group is presented.
     * @param title {String} the title shown in the group header
     */
    _showGroupHeader : function(title)
    {
      var row = new qx.ui.mobile.form.Row();
      var titleLabel = new qx.ui.mobile.basic.Label(title);
      row.add(titleLabel);
      this._add(row);
      this.__labels.push(titleLabel);
      this.__rows.push(row);
    },


    // override
    addButton : function(button) {
      var row = new qx.ui.mobile.form.Row(new qx.ui.mobile.layout.HBox());
      row.add(button, {flex:1});
      this._add(row);
      this.__rows.push(row);
    },


    // override
    showErrorForItem : function(item) {
      var errorNode = qx.dom.Element.create('div');
      errorNode.innerHTML = item.getInvalidMessage();
      qx.bom.element.Class.add(errorNode, 'formElementError');
      qx.dom.Element.insertAfter(errorNode, item.getContainerElement());
      qx.bom.Element.focus(item.getContainerElement());
      this.__errorMessageContainers.push(errorNode);
    },

    // override
    resetForm : function() {
      for(var i=0; i<this.__errorMessageContainers.length; i++) {
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
    this._disposeArray("__labels");
    this._disposeArray("__rows");
  }
});
