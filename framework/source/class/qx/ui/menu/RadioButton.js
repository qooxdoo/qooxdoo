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

************************************************************************ */

/**
 * Renders a special radio button inside a menu. The button behaves like
 * a normal {@link qx.ui.form.RadioButton} and shows a radio icon when
 * checked; normally shows no icon when not checked (depends on the theme).
 */
qx.Class.define("qx.ui.menu.RadioButton",
{
  extend : qx.ui.menu.AbstractButton,
  include : [qx.ui.form.MFormElement],
  implement : [qx.ui.form.IRadioItem, qx.ui.form.IBooleanForm],



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
      this.setLabel(label);
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
      init : "menu-radiobutton"
    },

    /** The value of the widget. True, if the widget is checked. */
    value :
    {
      // TODO change the check to Boolean after the deprecation has been removed
      check : "function(value) {return qx.lang.Type.isString(value) || qx.lang.Type.isBoolean(value)}",
      nullable : true,
      event : "changeValue",
      apply : "_applyValue",
      init : false
    },

    /** The assigned qx.ui.form.RadioGroup which handles the switching between registered buttons */
    group :
    {
      check  : "qx.ui.form.RadioGroup",
      nullable : true,
      apply : "_applyGroup"
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
      if (qx.lang.Type.isString(value)) {
        qx.log.Logger.deprecatedMethodWarning(
          arguments.callee, "Please use boolean values instead."
        );
        return;
      }

      value ? this.addState("checked") : this.removeState("checked");

      // @deprecated
      this.fireDataEvent("changeChecked", value, old);
    },


    // property apply
    _applyGroup : function(value, old)
    {
      if (old) {
        old.remove(this);
      }

      if (value) {
        value.add(this);
      }
    },


    // overridden
    _onMouseUp : function(e)
    {
      if (e.isLeftPressed()) {
        this.setValue(true);
      }
    },


    // overridden
    _onKeyPress : function(e) {
      this.setValue(true);
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
