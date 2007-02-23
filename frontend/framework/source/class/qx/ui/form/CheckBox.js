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

qx.Clazz.define("qx.ui.form.CheckBox",
{
  extend : qx.ui.basic.Atom,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vText, vValue, vName, vChecked)
  {
    qx.ui.basic.Atom.call(this, vText);

    this.setTabIndex(1);
    this.setPadding(2, 3);

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
      this.setChecked(false);
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
    /** The HTML name of the form element used by the widget */
    name :
    {
      _legacy : true,
      type    : "string"
    },


    /** The HTML value of the form element used by the widget */
    value :
    {
      _legacy : true,
      type    : "string"
    },


    /** If the widget is checked */
    checked :
    {
      _legacy  : true,
      type     : "boolean",
      getAlias : "isChecked"
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
      i.setChecked(this.isChecked());
      i.setEnabled(this.isEnabled());
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
     * @return {boolean} TODOC
     */
    _modifyChecked : function(propValue, propOldValue, propData)
    {
      if (this._iconObject) {
        this._iconObject.setChecked(propValue);
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
     * @return {var} TODOC
     */
    _modifyEnabled : function(propValue, propOldValue, propData)
    {
      if (this._iconObject) {
        this._iconObject.setEnabled(propValue);
      }

      return qx.ui.basic.Atom.prototype._modifyEnabled.call(this, propValue, propOldValue, propData);
    },




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
        case qx.ui.basic.Atom.SHOW_ICON:
        case qx.ui.basic.Atom.SHOW_BOTH:
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

      this.removeEventListener("click", this._onclick);
      this.removeEventListener("keydown", this._onkeydown);
      this.removeEventListener("keyup", this._onkeyup);

      return qx.ui.basic.Atom.prototype.dispose.call(this);
    }
  },
  
  defer : function(clazz, proto)
  {
    // TODO using remove property is really ugly. Either enhance Atom or base Checkbox on a different super class
    qx.OO.removeProperty({ name : "icon" });
    qx.OO.removeProperty({ name : "disabledIcon" });    
  }
  
});


