/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * A group box, which has a check box near the legend.
 *
 * @childControl legend {qx.ui.form.CheckBox} checkbox to en-/disable the
 *   groupbox content
 */
qx.Class.define("qx.ui.groupbox.CheckGroupBox",
{
  extend : qx.ui.groupbox.GroupBox,
  implement : [qx.ui.form.IExecutable, qx.ui.form.IBooleanForm, qx.ui.form.IModel],
  include : [qx.ui.form.MModelProperty],


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
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "legend":
          control = new qx.ui.form.CheckBox();
          control.setValue(true);
          control.setAllowGrowX(true);
          control.addListener("changeValue", this._onRadioChangeValue, this);
          control.addListener("resize", this._repositionFrame, this);
          control.addListener("execute", this._onExecute, this);

          this._add(control, {left: 0, right: 0});
      }

      return control || this.base(arguments, id);
    },


    // overridden
    _applyEnabled : function(value, old) {
      this.base(arguments, value, old);

      this.getChildrenContainer().setEnabled(value && this.getValue());
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
      this.fireDataEvent("changeValue", checked, e.getOldData());
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
    setValue : function(value) {
      this.getChildControl("legend").setValue(value);
    },


    /**
     * Resets the value.
     */
    resetValue: function() {
      this.getChildControl("legend").resetValue();
    }
  }
});
