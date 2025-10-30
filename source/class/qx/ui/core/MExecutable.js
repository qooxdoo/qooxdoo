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
     * Fabian Jakobs (fjakobs)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This mixin is included by all widgets, which support an 'execute' like
 * buttons or menu entries.
 */
qx.Mixin.define("qx.ui.core.MExecutable", {
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    /** Fired if the {@link #execute} method is invoked.*/
    execute: "qx.event.type.Event"
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
    /**
     * A command called if the {@link #execute} method is called, e.g. on a
     * button tap.
     */
    command: {
      check: "qx.ui.command.Command",
      apply: "_applyCommand",
      event: "changeCommand",
      nullable: true
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    __executableBindingIds: null,
    
    /**
     * @type {Boolean} Whether the command already executed. The protection flag to stop the second command execution.
     */
    __commandExecuted: false,
    __executeListenerId: null,

    /**
     * @type {Map} Set of properties, which will by synced from the command to the
     *    including widget
     *
     * @lint ignoreReferenceField(_bindableProperties)
     */
    _bindableProperties: qx.core.Environment.select("qx.command.bindEnabled", {
      true: ["enabled", "label", "icon", "toolTipText", "value", "menu"],

      false: ["label", "icon", "toolTipText", "value", "menu"]
    }),

    /**
     * Initiate the execute action.
     */
    execute() {
      var cmd = this.getCommand();

      if (cmd) {
        if (this.__commandExecuted) {
          this.__commandExecuted = false;
        } else {
          this.__commandExecuted = true;
          cmd.execute(this);
        }
      }

      this.fireEvent("execute");
    },

    /**
     * Handler for the execute event of the command.
     *
     * @param e {qx.event.type.Event} The execute event of the command.
     */
    __onCommandExecute(e) {
      if (this.__commandExecuted) {
        this.__commandExecuted = false;
        return;
      }
      this.__commandExecuted = true;
      if (this.isEnabled()) {
        this.execute();
      }
    },

    // property apply
    _applyCommand(value, old) {
      // execute forwarding
      if (old != null) {
        old.removeListenerById(this.__executeListenerId);
      }
      if (value != null) {
        this.__executeListenerId = value.addListener("execute", this.__onCommandExecute, this);
      }

      // binding stuff
      var ids = this.__executableBindingIds;
      if (ids == null) {
        this.__executableBindingIds = ids = {};
      }

      for (var i = 0; i < this._bindableProperties.length; i++) {
        let property = this._bindableProperties[i];

        // remove the old binding
        if (old != null && !old.isDisposed() && ids[property] != null) {
          old.removeListenerById(ids[property]);
          ids[property] = null;
        }

        // add the new binding
        if (value != null && qx.Class.hasProperty(this.constructor, property)) {
          let cmdPropertyValue = value.get(property);
          if (cmdPropertyValue !== null) {
            this.set(property, cmdPropertyValue);
          }
          ids[property] = value.addListener("change" + qx.lang.String.firstUp(property), evt => this.set(property, evt.getData()));
        }
      }
    }
  },

  destruct() {
    this._applyCommand(null, this.getCommand());
    this.__executableBindingIds = null;
  }
});
