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

************************************************************************ */

/**
 * A item for a list. Could be added to all List like widgets but also
 * to the {@link qx.ui.form.SelectBox} and {@link qx.ui.form.ComboBox}.
 */
qx.Class.define("qx.ui.form.ListItem",
{
  extend : qx.ui.basic.Atom,
  implement : [qx.ui.form.IModel],
  include : [qx.ui.form.MModelProperty],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * The value property is deprecated so is the value parameter in the
   * constructor.
   *
   * @param label {String} Label to use
   * @param icon {String?null} Icon to use
   * @param value {String?null} The items string value (DEPRECATED)
   */
  construct : function(label, icon, value)
  {
    this.base(arguments, label, icon);

    if (value != null) {
      this.setValue(value);
    }
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events:
  {
    /** (Fired by {@link qx.ui.form.List}) */
    "action" : "qx.event.type.Event",

    /**
     * Old change event for the value property.
     * @deprecated
     */
    "changeValue" : "qx.event.type.Data"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "listitem"
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
      SEARCH VALUE
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the searchable value of the list item.
     *
     * This is normally the real value with a fallback to the label like in HTML
     * select boxes.
     *
     * @deprecated
     */
    getFormValue : function()
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "The value is deprecated. Please use model instead."
      );

      var value = this.getValue();
      if (value == null) {
        value = this.getLabel();
      }

      return value;
    },


    // deprecated
    __value : null,


    /**
     * Sets the value of the ListItem.
     * @param value {String} The sting value of the listitem.
     * @deprecated
     */
    setValue: function(value) {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "The value is deprecated. Please use model instead."
      );

      var oldValue = this.__value;
      this.__value = value;
      this.fireDataEvent("changeValue", value, oldValue);
    },


    /**
     * Returns the set value.
     * @return {String|null} The set value.
     * @deprecated
     */
    getValue: function() {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "The value is deprecated. Please use model instead."
      );

      return this.__value;
    },


    /**
     * Resets the value of the listitem.
     * @deprecated
     */
    resetValue: function() {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "The value is deprecated. Please use model instead."
      );

      this.setValue(null);
    }
  }
});
