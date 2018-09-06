/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Martijn Evers, The Netherlands

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martijn Evers (mever)

************************************************************************ */

/**
 * Field interface.
 *
 * This interface allows any value to be set as long as the following constraint
 * is met: any value returned by {@link getValue} can be set by {@link setValue}.
 *
 * This specifies the interface for handling the model value of a field.
 * The model value is always in a consistent state (see duration example), and
 * should only handle model values of a type that correctly represents the
 * data available through its UI. E.g.: duration can ideally be modeled by a number
 * of time units, like seconds. When using a date the duration may be
 * unclear (since Unix time?). Type conversions should be handled by data binding.
 *
 * The model value is not necessary what is shown to the end-user
 * by implementing class. A good example is the {@link qx.ui.form.TextField}
 * which is able to operate with or without live updating the model value.
 *
 * Duration example: a field for duration may use two date pickers for begin
 * and end dates. When the end date is before the start date the model is in
 * inconsistent state. getValue should never return such state. And calling
 * it must result in either null or the last consistent value (depending
 * on implementation or setting).
 */
qx.Interface.define("qx.ui.form.IField",
{
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired when the model value was modified */
    "changeValue" : "qx.event.type.Data"
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
      VALUE PROPERTY
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the field model value. Should also update the UI.
     *
     * @param value {var|null} Updates the field with the new model value.
     * @return {null|Error} Should return an error when the type of
     *  model value is not compatible with the implementing class (the concrete field).
     */
    setValue : function(value) {
      return arguments.length == 1;
    },


    /**
     * Resets the model value to its initial value. Should also update the UI.
     */
    resetValue : function() {},


    /**
     * Returns a consistent and up-to-date model value.
     *
     * Note: returned value can also be a promise of type <code>Promise&lt;*|null&gt;</code>.
     *
     * @return {var|null} The model value plain or as promise.
     */
    getValue : function() {}
  }
});
