/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_form)

************************************************************************ */

qx.Class.define("qx.ui.form.RadioButton",
{
  extend : qx.ui.form.CheckBox,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vText, vValue, vName, vChecked)
  {
    this.base(arguments, vText, vValue, vName, vChecked);

    this.addEventListener("keypress", this._onkeypress);
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
      check  : "qx.ui.selection.RadioManager",
      nullable : true,
      apply : "_applyManager"
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
      ICON HANDLING
    ---------------------------------------------------------------------------
    */

    INPUT_TYPE : "radio",




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyChecked : function(value, old)
    {
      if (this._iconObject) {
        this._iconObject.setChecked(value);
      }

      var vManager = this.getManager();

      if (vManager) {
        vManager.handleItemChecked(this, value);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyManager : function(value, old)
    {
      if (old) {
        old.remove(this);
      }

      if (value) {
        value.add(this);
      }
    },


    /**
     * Apply method for property "name"
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyName : function(value, old)
    {
      if (this._iconObject) {
        this._iconObject.setName(value);
      }

      if (this.getManager()) {
        this.getManager().setName(value);
      }
    },


    /**
     * Apply method for property "value"
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyValue : function(value, old)
    {
      if (this.isCreated() && this._iconObject) {
        this._iconObject.setValue(value);
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT-HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Callback method for "keyDown" event<br/>
     * Sets the property "checked" to true if "Enter" key is pressed.
     * Does only work if the "Enter" key is not pressed in combination with
     * the "Alt" key.
     *
     * @type member
     * @param e {qx.event.type.KeyEvent} keyDown event
     * @return {void}
     */
    _onkeydown : function(e)
    {
      if (e.getKeyIdentifier() == "Enter" && !e.isAltPressed()) {
        this.setChecked(true);
      }
    },


    /**
     * Callback method for the "keyPress" event.<br/>
     * Selects the previous RadioButton when pressing "Left" or "Up" and
     * selects the next RadioButton when pressing "Right" and "Down"
     *
     * @type member
     * @param e {qx.event.type.KeyEvent} keyPress event
     * @return {null | true}
     */
    _onkeypress : function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "Left":
        case "Up":
          qx.event.handler.FocusHandler.mouseFocus = false;

          // we want to have a focus border when using arrows to select
          qx.event.handler.FocusHandler.mouseFocus = false;

          return this.getManager() ? this.getManager().selectPrevious(this) : true;

        case "Right":
        case "Down":
          // we want to have a focus border when using arrows to select
          qx.event.handler.FocusHandler.mouseFocus = false;

          return this.getManager() ? this.getManager().selectNext(this) : true;
      }
    },


    /**
     * Callback method for "click" event<br/>
     * Simply sets the "checked" property to true
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} click event
     * @return {void}
     */
    _onclick : function(e) {
      this.setChecked(true);
    },


    /**
     * Callback method for "keyUp" event<br/>
     * If "Space" is pressed the property "checked" is set to true
     *
     * @type member
     * @param e {qx.event.type.KeyEvent} keyUp event
     * @return {void}
     */
    _onkeyup : function(e)
    {
      if (e.getKeyIdentifier() == "Space") {
        this.setChecked(true);
      }
    }
  }
});
