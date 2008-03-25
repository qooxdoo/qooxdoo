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
 * @appearance radio-button
 * @state checked
 */
qx.Class.define("qx.ui.form.RadioButton",
{
  extend : qx.ui.form.Button,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(label)
  {
    this.base(arguments, label);

    this.addListener("execute", this._onexecute);
    this.addListener("keypress", this._onkeypress);
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
      init : "radio-button"
    },

    /** The assigned qx.ui.selection.RadioManager which handles the switching between registered buttons */
    manager :
    {
      check  : "qx.ui.core.RadioManager",
      nullable : true,
      apply : "_applyManager"
    },

    /** Boolean value signals if the button is checked */
    checked:
    {
      check: "Boolean",
      init: false,
      apply: "_applyChecked",
      event: "changeChecked"
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
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyChecked : function(value, old)
    {
      var vManager = this.getManager();

      if (vManager) {
        vManager.handleItemChecked(this, value);
      }

      value ? this.addState("checked") : this.removeState("checked");
    },


    // property apply
    _applyManager : function(value, old)
    {
      if (old) {
        old.remove(this);
      }

      if (value) {
        value.add(this);
      }
    },



    /*
    ---------------------------------------------------------------------------
      EVENT-HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Callback method for "execute" event<br/>
     * Sets the property "checked" to true
     *
     * @type member
     * @param e {qx.event.type.Event} execute event
     * @return {void}
     */
    _onexecute : function(e) {
      this.setChecked(true);
    },


    /**
     * Callback method for the "keyPress" event.<br/>
     * Selects the previous RadioButton when pressing "Left" or "Up" and
     * selects the next RadioButton when pressing "Right" and "Down"
     *
     * @type member
     * @param e {qx.event.type.KeyInput} keyPress event
     * @return {null | true}
     */
    _onkeypress : function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "Left":
        case "Up":
          return this.getManager() ? this.getManager().selectPrevious(this) : true;

        case "Right":
        case "Down":
          return this.getManager() ? this.getManager().selectNext(this) : true;
      }

      this.base(arguments, e);
    }
  }
});
