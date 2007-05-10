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
      apply : "_modifyChecked",
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
     * TODOC
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
      MODIFIER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyChecked : function(propValue, propOldValue, propData)
    {
      if (this._iconObject) {
        this._iconObject.setChecked(propValue);
      }
    },


    // The user can't control the icon in checkboxes
    _modifyIcon : null,
    _modifyDisabledIcon : null,




    /*
    ---------------------------------------------------------------------------
      HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
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
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onclick : function(e) {
      this.toggleChecked();
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onkeydown : function(e)
    {
      if (e.getKeyIdentifier() == "Enter" && !e.isAltPressed()) {
        this.toggleChecked();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
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
