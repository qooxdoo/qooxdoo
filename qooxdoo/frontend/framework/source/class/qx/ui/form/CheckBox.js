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

/* ************************************************************************

#module(ui_form)

************************************************************************ */

qx.Class.define("qx.ui.form.CheckBox",
{
  extend : qx.ui.basic.Atom,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vText, vValue, vName, vChecked)
  {
    this.base(arguments, vText);

    this.initTabIndex();
    this._createIcon();

    if (vValue != null) {
      this.setValue(vValue);
    }

    if (vName != null) {
      this.setName(vName);
    }

    if (vChecked != null) {
      this.setChecked(vChecked);
    } else {
      this.initChecked();
    }

    this.addEventListener("click", this._onclick);
    this.addEventListener("keydown", this._onkeydown);
    this.addEventListener("keyup", this._onkeyup);
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
      init : "check-box"
    },

    tabIndex :
    {
      refine : true,
      init : 1
    },


    /** The HTML name of the form element used by the widget */
    name :
    {
      check : "String",
      event : "changeName"
    },


    /** The HTML value of the form element used by the widget */
    value :
    {
      check : "String",
      event : "changeValue"
    },


    /** If the widget is checked */
    checked :
    {
      check : "Boolean",
      apply : "_applyChecked",
      init : false,
      event : "changeChecked"
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

    INPUT_TYPE : "checkbox",


    /**
     * Creates new qx.ui.form.InputCheckSymbol instance and adds it to the checkox widget.
     *
     * @type member
     * @return {void}
     */
    _createIcon : function()
    {
      var i = this._iconObject = new qx.ui.form.InputCheckSymbol;

      i.setType(this.INPUT_TYPE);
      i.setChecked(this.getChecked());
      i.setAnonymous(true);

      this.addAtBegin(i);
    },




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
    },


    // The user can't control the icon in checkboxes
    _applyIcon : null,
    _applyDisabledIcon : null,




    /*
    ---------------------------------------------------------------------------
      HANDLER
    ---------------------------------------------------------------------------
    */

    _handleIcon : function()
    {
      switch(this.getShow())
      {
        case "icon":
        case "both":
          this._iconIsVisible = true;
          break;

        default:
          this._iconIsVisible = false;
      }

      if (this._iconIsVisible) {
        this._iconObject ? this._iconObject.setDisplay(true) : this._createIcon();
      } else if (this._iconObject) {
        this._iconObject.setDisplay(false);
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT-HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Listener method for "click" event. Toggles property "checked"
     *
     * @type member
     * @param e {Event} Mouse click event
     * @return {void}
     */
    _onclick : function(e) {
      this.toggleChecked();
    },


    /**
     * Listener method for "keydown" event. Toggles property "checked"
     * when "Enter" key and NO "Alt" key are pressed
     *
     * @type member
     * @param e {Event} Key event
     * @return {void}
     */
    _onkeydown : function(e)
    {
      if (e.getKeyIdentifier() == "Enter" && !e.isAltPressed()) {
        this.toggleChecked();
      }
    },


    /**
     * Listener method for "keyup" event. Toggles property "checked" when
     * "Space" key was pressed.
     *
     * @type member
     * @param e {Event} Key event
     * @return {void}
     */
    _onkeyup : function(e)
    {
      if (e.getKeyIdentifier() == "Space") {
        this.toggleChecked();
      }
    }
  }
});
