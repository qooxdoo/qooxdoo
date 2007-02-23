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

qx.Clazz.define("qx.ui.form.RadioButton",
{
  extend : qx.ui.form.CheckBox,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vText, vValue, vName, vChecked)
  {
    qx.ui.form.CheckBox.call(this, vText, vValue, vName, vChecked);

    this.addEventListener("keypress", this._onkeypress);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    /** The assigned qx.manager.selection.RadioManager which handles the switching between registered buttons */
    manager :
    {
      _legacy   : true,
      type      : "object",
      instance  : "qx.manager.selection.RadioManager",
      allowNull : true
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
     * @return {boolean} TODOC
     */
    _modifyChecked : function(propValue, propOldValue, propData)
    {
      if (this._iconObject) {
        this._iconObject.setChecked(propValue);
      }

      var vManager = this.getManager();

      if (vManager) {
        vManager.handleItemChecked(this, propValue);
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {boolean} TODOC
     */
    _modifyManager : function(propValue, propOldValue, propData)
    {
      if (propOldValue) {
        propOldValue.remove(this);
      }

      if (propValue) {
        propValue.add(this);
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {boolean} TODOC
     */
    _modifyName : function(propValue, propOldValue, propData)
    {
      if (this._iconObject) {
        this._iconObject.setName(propValue);
      }

      if (this.getManager()) {
        this.getManager().setName(propValue);
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {boolean} TODOC
     */
    _modifyValue : function(propValue, propOldValue, propData)
    {
      if (this.isCreated() && this._iconObject) {
        this._iconObject.setValue(propValue);
      }

      return true;
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
    _onkeydown : function(e)
    {
      if (e.getKeyIdentifier() == "Enter" && !e.isAltPressed()) {
        this.setChecked(true);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {var} TODOC
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
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void} 
     */
    _onclick : function(e) {
      this.setChecked(true);
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
        this.setChecked(true);
      }
    },




    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      return qx.ui.form.CheckBox.prototype.dispose.call(this);
    }
  }
});
