/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de
     2017 Martijn Evers, The Netherlands

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Martijn Evers (mever)

************************************************************************ */
/**
 * The resetter is responsible for managing a set of fields and resetting these
 * fields on a {@link #reset} call. It can handle all form field implementing IField.
 */
qx.Class.define("qx.ui.form.Resetter",
{
  extend : qx.core.Object,


  construct : function()
  {
    this.base(arguments);

    this.__items = [];
  },

  members :
  {
    __items : null,

    /**
     * Adding a field to the resetter will get its current value and store
     * it for resetting.
     *
     * @param field {qx.ui.form.IField} The field which should be added.
     * @throws {TypeError} When given argument is not a field.
     */
    add : function(field) {
      this.__typeCheck(field);
      this.__items.push({item: field, init: field.getValue()});
    },


    /**
     * Removes a field from the resetter.
     *
     * @param field {qx.ui.form.IField} The field which should be removed.
     * @throws {TypeError} When given argument is not a field.
     * @return {Boolean} <code>true</code>, if the field has been removed.
     */
    remove : function(field) {
      this.__typeCheck(field);
      for (var i = 0; i < this.__items.length; i++) {
        var storedItem = this.__items[i];
        if (storedItem.item === field) {
          this.__items.splice(i, 1);
          return true;
        }
      }
      return false;
    },


    /**
     * Resets all added fields to their initial value. The initial value
     * is the value in the widget during the {@link #add}.
     *
     * @return {null|Error} Returns an error when some fields could not be reset.
     */
    reset: function() {
      var dataEntry, e, errors = [];
      for (var i = 0; i < this.__items.length; i++) {
        dataEntry = this.__items[i];
        e = dataEntry.item.setValue(dataEntry.init);
        if (e && e instanceof Error) {
          errors.push(e);
        }
      }

      if (errors.length) {
        return new Error(errors.join(', '));
      } else {
        return null;
      }
    },


    /**
     * Resets a single given field. The field has to be added to the resetter
     * instance before. Otherwise, an error is thrown.
     *
     * @param field {qx.ui.form.IField} The field, which should be reset.
     * @throws {TypeError} When given argument is not a field.
     * @return {null|Error} Returns an error when the field value could not be set.
     */
    resetItem : function(field) {
      this.__typeCheck(field);
      for (var i = 0; i < this.__items.length; i++) {
        var dataEntry = this.__items[i];
        if (dataEntry.item === field) {
          return field.setValue(dataEntry.init);
        }
      }

      throw new Error("The given field has not been added.");
    },


    /**
     * Takes the current values of all added fields and uses these values as
     * init values for resetting.
     */
    redefine: function() {
      // go threw all added items
      for (var i = 0; i < this.__items.length; i++) {
        var item = this.__items[i].item;
        // set the new init value for the item
        this.__items[i].init = item.getValue();
      }
    },


    /**
     * Takes the current value of the given field and stores this value as init
     * value for resetting.
     *
     * @param field {qx.ui.form.IField} The field to redefine.
     * @throws {TypeError} When given argument is not a field.
     */
    redefineItem : function(field) {
      this.__typeCheck(field);

      // get the data entry
      var dataEntry;
      for (var i = 0; i < this.__items.length; i++) {
        if (this.__items[i].item === field) {
          dataEntry = this.__items[i];
          dataEntry.init = dataEntry.item.getValue();
          return;
        }
      }

      throw new Error("The given field has not been added.");
    },


    /**
     * Assert when given argument is not a field.
     *
     * @param field {qx.ui.form.IField|var} Any argument that should be a field.
     * @throws {TypeError} When given argument is not a field.
     * @private
     */
    __typeCheck : function(field) {
      if (!qx.Class.hasInterface(field.constructor, qx.ui.form.IField)) {
        throw new TypeError("Field " + field + " not supported for resetting.");
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
    // holding references to widgets --> must set to null
    this.__items = null;
  }
});
