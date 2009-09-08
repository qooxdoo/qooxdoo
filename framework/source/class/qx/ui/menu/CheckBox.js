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
     * Fabian Jakobs (fjakobs)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Renders a special checkbox button inside a menu. The button behaves like
 * a normal {@link qx.ui.form.CheckBox} and shows a check icon when
 * checked; normally shows no icon when not checked (depends on the theme).
 */
qx.Class.define("qx.ui.menu.CheckBox",
{
  extend : qx.ui.menu.AbstractButton,
  include : [qx.ui.form.MFormElement],
  implement : [
    qx.ui.form.IFormElement,
    qx.ui.form.IBooleanForm
  ],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} Initial label
   * @param menu {qx.ui.menu.Menu} Initial sub menu
   */
  construct : function(label, menu)
  {
    this.base(arguments);

    // Initialize with incoming arguments
    if (label != null) {
      // try to translate every time you create a checkbox [BUG #2699]
      if (label.translate) {
        this.setLabel(label.translate());
      } else {
        this.setLabel(label);
      }
    }

    if (menu != null) {
      this.setMenu(menu);
    }
  },



  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
  events : {
    /**
     * The old checked change event. Please use the value property instead.
     * @deprecated
     */
    "changeChecked" : "qx.event.type.Data"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "menu-checkbox"
    },

    /** Whether the button is checked */
    value :
    {
      // TODO change the check to Boolean after the deprecation has been removed
      check : "function(value) {return qx.lang.Type.isString(value) || qx.lang.Type.isBoolean(value)}",      init : false,
      apply : "_applyValue",
      event : "changeValue",
      nullable : true
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // property apply
    _applyValue : function(value, old)
    {
      value ?
        this.addState("checked") :
        this.removeState("checked");
    },


    // overridden
    _onMouseUp : function(e)
    {
      if (e.isLeftPressed()) {
        this.toggleValue();
      }
    },


    // overridden
    _onKeyPress : function(e) {
      this.toggleValue();
    },


    /*
    ---------------------------------------------------------------------------
      DEPRECATED STUFF
    ---------------------------------------------------------------------------
    */
    /**
     * Old set method for the checked property. Please use the value
     * property instead.
     *
     * @param value {String} The value of the label.
     * @deprecated
     */
    setChecked: function(value) {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee, "Please use the value property instead."
      );

      this.setValue(value);
    },


    /**
     * Old is method for the checked property. Please use the value property
     * instead.
     *
     * @deprecated
     */
    isChecked: function() {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee, "Please use the value property instead."
      );

      return this.getValue();
    },


    /**
     * Old toggle method for the checked property. Please use the value property
     * instead.
     *
     * @deprecated
     */
    toggleChecked: function() {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee, "Please use the value property instead."
      );

      this.setValue(!this.getValue());
    },


    /**
     * Old get method for the checked property. Please use the value
     * property instead.
     *
     * @deprecated
     */
    getChecked: function() {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee, "Please use the value property instead."
      );

      return this.getValue();
    },


    /**
     * Old reset method for the checked property. Please use the value
     * property instead.
     *
     * @deprecated
     */
    resetChecked: function() {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee, "Please use the value property instead."
      );

      this.resetValue();
    },


    // overridden
    addListener: function(type, listener, self, capture) {
      if (type == "changeChecked") {
        qx.log.Logger.deprecatedEventWarning(
          arguments.callee,
          "changeChecked",
          "Please use the changeValue event instead."
        );
      }
      return this.base(arguments, type, listener, self, capture);
    },


    // TODO can be removed when the check of the value property is set to Boolean
    /**
     * Toggles the state of the button.
     */
    toggleValue: function() {
      this.setValue(!this.getValue());
    },

    // TODO can be removed when the check of the value property is set to Boolean
    /**
     * Returns if the value is true
     *
     * @return {Boolean} True, if the button is checked.
     */
    isValue: function() {
      return this.getValue();
    }
  }
});
