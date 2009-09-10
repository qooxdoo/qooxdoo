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
 * This mixin is included by all widgets, which support an 'execute' like
 * buttons or menu entries.
 */
qx.Mixin.define("qx.ui.core.MExecutable",
{
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired if the {@link #execute} method is invoked.*/
    "execute" : "qx.event.type.Event"
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * A command called if the {@link #execute} method is called, e.g. on a
     * button click.
     */
    command :
    {
      check : "qx.event.Command",
      apply : "_applyCommand",
      event : "changeCommand",
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
    /**
     * Initiate the execute action.
     *
     */
    execute : function()
    {
      var cmd = this.getCommand();

      if (cmd) {
        cmd.execute(this);
      }

      this.fireEvent("execute");
    },


    // property apply
    _applyCommand : function(value, old)
    {
      if (old) {
        old.removeListener("changeEnabled", this._onChangeEnabledCommand, this);
      }

      if (value)
      {
        value.addListener("changeEnabled", this._onChangeEnabledCommand, this);

        if (this.getEnabled() === false) {
          value.setEnabled(false);
        } else if (value.getEnabled() === false) {
          this.setEnabled(false);
        }
      }
    },


    /**
     * Event Listener. Listen for enabled changes in the associated command
     *
     * @param e {qx.event.type.Data} The change event
     */
    _onChangeEnabledCommand : function(e) {
      this.setEnabled(e.getData());
    }
  }
});