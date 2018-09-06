/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Form interface for all form widgets which have strings as their primary
 * data type like textfield's.
 */
qx.Interface.define("qx.ui.form.IStringForm",
{
  extend : qx.ui.form.IField,


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired when the value was modified */
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
     * Sets the element's value.
     *
     * @param value {String|null} The new value of the element.
     */
    setValue : function(value) {
      return arguments.length == 1;
    },


    /**
     * Resets the element's value to its initial value.
     */
    resetValue : function() {},


    /**
     * The element's user set value.
     *
     * @return {String|null} The value.
     */
    getValue : function() {}
  }
});
