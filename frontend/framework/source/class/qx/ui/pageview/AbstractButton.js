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


 ************************************************************************ */

qx.Class.define("qx.ui.pageview.AbstractButton",
{
  type : "abstract",
  extend : qx.ui.basic.Atom,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vText, vIcon, vIconWidth, vIconHeight, vFlash)
  {
    this.base(arguments, vText, vIcon, vIconWidth, vIconHeight, vFlash);

    this.setTabIndex(1);

    // ************************************************************************
    //   MOUSE EVENTS
    // ************************************************************************
    this.addEventListener("mouseover", this._onmouseover);
    this.addEventListener("mouseout", this._onmouseout);
    this.addEventListener("mousedown", this._onmousedown);

    // ************************************************************************
    //   KEY EVENTS
    // ************************************************************************
    this.addEventListener("keydown", this._onkeydown);
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

    /** If this tab is the currently selected/active one */
    checked :
    {
      _legacy      : true,
      type         : "boolean",
      defaultValue : false
    },


    /** The attached page of this tab */
    page :
    {
      _legacy : true,
      type    : "object"
    },


    /** The assigned qx.manager.selection.RadioManager which handles the switching between registered buttons */
    manager :
    {
      _legacy   : true,
      type      : "object",
      instance  : "qx.manager.selection.RadioManager",
      allowNull : true
    },


    /**
     * The name of the radio group. All the radio elements in a group (registered by the same manager)
     *  have the same name (and could have a different value).
     */
    name :
    {
      _legacy : true,
      type    : "string"
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
      UTILITIES
    ---------------------------------------------------------------------------
     */

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getView : function() {
      return this.getParent().getParent();
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
     * @return {var} TODOC
     */
    _modifyParent : function(propValue, propOldValue, propData)
    {
      if (propOldValue) {
        propOldValue.getManager().remove(this);
      }

      if (propValue) {
        propValue.getManager().add(this);
      }

      return this.base(arguments, propValue, propOldValue, propData);
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyPage : function(propValue, propOldValue, propData)
    {
      if (propOldValue) {
        propOldValue.setButton(null);
      }

      if (propValue)
      {
        propValue.setButton(this);
        this.getChecked() ? propValue.show() : propValue.hide();
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
     * @return {Boolean} TODOC
     */
    _modifyChecked : function(propValue, propOldValue, propData)
    {
      if (this._hasParent)
      {
        var vManager = this.getManager();

        if (vManager) {
          vManager.handleItemChecked(this, propValue);
        }
      }

      propValue ? this.addState("checked") : this.removeState("checked");

      var vPage = this.getPage();

      if (vPage) {
        this.getChecked() ? vPage.show() : vPage.hide();
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
     * @return {Boolean} TODOC
     */
    _modifyName : function(propValue, propOldValue, propData)
    {
      if (this.getManager()) {
        this.getManager().setName(propValue);
      }

      return true;
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
     */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmousedown : function(e) {
      this.setChecked(true);
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseover : function(e) {
      this.addState("over");
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseout : function(e) {
      this.removeState("over");
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onkeydown : function(e) {},


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onkeypress : function(e) {}
  }
});
