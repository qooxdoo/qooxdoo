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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * A group box, which has a check box near the legend.
 */
qx.Class.define("qx.ui.groupbox.CheckGroupBox",
{
  extend : qx.ui.groupbox.GroupBox,
  include : [qx.ui.form.MFormElement],
  implement : [qx.ui.form.IExecutable, qx.ui.form.IBooleanForm],

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init   : "check-groupbox"
    }
  },

  events :
  {
    /**
     * Fired when the included checkbox changed its status.
     *
     * @deprecated
     */
    "changeChecked" : "qx.event.type.Data",

    /** Fired when the included checkbox changed its value */
    "changeValue" : "qx.event.type.Data",

    /** Fired if the {@link #execute} method is invoked.*/
    "execute" : "qx.event.type.Event"
  },

  members :
  {
    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "legend":
          control = new qx.ui.form.CheckBox();
          control.setValue(true);
          control.addListener("changeValue", this._onRadioChangeValue, this);
          control.addListener("changeName", this._onRadioChangeName, this);
          control.addListener("resize", this._repositionFrame, this);
          control.addListener("execute", this._onExecute, this);

          this._add(control);
      }

      return control || this.base(arguments, id);
    },




    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for execute event of checkbox.
     *
     * @param e {qx.event.type.Event} Event which holds the current status
     */
    _onExecute: function(e) {
      this.fireEvent("execute");
    },


    /**
     * Event listener for change event of checkbox
     *
     * @param e {qx.event.type.Data} Data event which holds the current status
     */
    _onRadioChangeValue : function(e)
    {
      var checked = e.getData() ? true : false;
      // Disable content
      this.getChildrenContainer().setEnabled(checked);

      // Fire event to the outside
      this.fireDataEvent("changeChecked", checked); // TODO deprecated
      this.fireDataEvent("changeValue", checked, e.getOldData());
    },


    /**
     * Event listener for changeName event of checkbox
     *
     * @param e {qx.event.type.Data} Data event which holds the current status
     *
     * @deprecated
     */
    _onRadioChangeName : function(e)
    {
      this.setName(e.getData());
    },



    /*
    ---------------------------------------------------------------------------
      REDIRECTIONS TO LEGEND (CHECKBOX COMPATIBILITY MODE)
    ---------------------------------------------------------------------------
    */

    // interface implementation
    execute: function() {
      this.getChildControl("legend").execute();
    },


    // interface implementation
    setCommand : function(command) {
      this.getChildControl("legend").setCommand(command);
    },


    // interface implementation
    getCommand : function() {
      return this.getChildControl("legend").getCommand();
    },


    /**
     * The value of the groupbox.
     *
     * @return {Boolean} <code>true</code> when enabled.
     */
    getValue : function() {
      return this.getChildControl("legend").getValue();
    },


    /**
     * Configures the value of the groupbox.
     *
     * @param value {Boolean} <code>true</code> when enabled.
     */
    setValue : function(value)
    {
      if (qx.lang.Type.isString(value)) {
        qx.log.Logger.deprecatedMethodWarning(
          arguments.callee, "Please use boolean values instead."
        );
        return;
      }

      this.getChildControl("legend").setValue(value);
    },


    /**
     * Resets the value.
     */
    resetValue: function() {
      this.getChildControl("legend").resetValue();
    },


    /**
     * Whether the groupbox is enabled
     *
     * @return {Boolean} <code>true</code> when enabled
     */
    getChecked : function() {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee, "Please use the value property instead."
      );

      return this.getValue();
    },


    /**
     * Configures whether the groupbox should be enabled
     *
     * @param value {String} whether the groupbox should be checked
     * @return {Boolean} the incoming value
     */
    setChecked : function(value)
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee, "Please use the value property instead."
      );

      this.setValue(value);
    }
  }
});
