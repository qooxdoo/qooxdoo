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

qx.Class.define("qx.ui.groupbox.RadioGroupBox",
{
  extend : qx.ui.groupbox.GroupBox,

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init   : "radio-groupbox"
    }
  },

  events :
  {
    /** Fired when the included radiobutton changed its status */
    "changeChecked" : "qx.event.type.Data"
  },

  members :
  {
    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "legend":
          control = new qx.ui.form.RadioButton;
          control.setChecked(true);
          control.addListener("changeChecked", this._onChangeRadio, this);

          this._add(control);
      }

      return control || this.base(arguments, id);
    },


    /**
     * Event listener for change event of radio button
     *
     * @param e {qx.event.type.Data} Data event which holds the current status
     */
    _onChangeRadio : function(e)
    {
      // Disable content
      var checked = e.getData();
      this.getChildrenContainer().setEnabled(checked);

      // Fire event to the outside
      this.fireDataEvent("changeChecked", checked);
    }
  }
});
