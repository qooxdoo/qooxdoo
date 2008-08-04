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


 ************************************************************************ */

qx.Class.define("qx.legacy.ui.pageview.AbstractButton",
{
  type : "abstract",
  extend : qx.legacy.ui.basic.Atom,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vText, vIcon, vIconWidth, vIconHeight, vFlash)
  {
    this.base(arguments, vText, vIcon, vIconWidth, vIconHeight, vFlash);

    this.initChecked();
    this.initTabIndex();

    this.addListener("mouseover", this._onmouseover);
    this.addListener("mouseout", this._onmouseout);
    this.addListener("mousedown", this._onmousedown);
    this.addListener("keydown", this._onkeydown);
    this.addListener("keypress", this._onKeyPress);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    tabIndex :
    {
      refine : true,
      init : 1
    },


    /** If this tab is the currently selected/active one */
    checked :
    {
      check :"Boolean",
      init : false,
      apply : "_applyChecked",
      event : "changeChecked"
    },


    /** The attached page of this tab */
    page :
    {
      check : "qx.legacy.ui.pageview.AbstractPage",
      apply : "_applyPage",
      nullable : true
    },


    /** The assigned qx.legacy.ui.selection.RadioManager which handles the switching between registered buttons */
    manager :
    {
      check  : "qx.legacy.ui.selection.RadioManager",
      nullable : true,
      apply : "_applyManager"
    },


    /**
     * The name of the radio group. All the radio elements in a group (registered by the same manager)
     *  have the same name (and could have a different value).
     */
    name :
    {
      check : "String",
      apply : "_applyName"
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
     * @return {var} TODOC
     */
    getView : function()
    {
      var pa = this.getParent();
      return pa ? pa.getParent() : null;
    },




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
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
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {var} TODOC
     */
    _applyParent : function(value, old)
    {
      this.base(arguments, value, old);

      if (old) {
        old.getManager().remove(this);
      }

      if (value) {
        value.getManager().add(this);
      }
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyPage : function(value, old)
    {
      if (old) {
        old.setButton(null);
      }

      if (value)
      {
        value.setButton(this);
        this.getChecked() ? value.show() : value.hide();
      }
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyChecked : function(value, old)
    {
      if (this._hasParent)
      {
        var vManager = this.getManager();

        if (vManager) {
          vManager.handleItemChecked(this, value);
        }
      }

      value ? this.addState("checked") : this.removeState("checked");

      var vPage = this.getPage();

      if (vPage) {
        this.getChecked() ? vPage.show() : vPage.hide();
      }
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyName : function(value, old)
    {
      if (this.getManager()) {
        this.getManager().setName(value);
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmousedown : function(e) {
      this.setChecked(true);
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseover : function(e) {
      this.addState("over");
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseout : function(e) {
      this.removeState("over");
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onkeydown : function(e) {},


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onKeyPress : function(e) {}
  }
});
