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

#module(ui_menu)
#embed(qx.static/image/blank.gif)

************************************************************************ */

/**
 * A checkbox for the menu system.
 *
 * @appearance menu-check-box
 * @state checked Set by {@link #checked}
 */
qx.Class.define("qx.ui.menu.CheckBox",
{
  extend : qx.ui.menu.Button,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vLabel, vCommand, vChecked)
  {
    this.base(arguments, vLabel, null, vCommand);

    if (vChecked != null) {
      this.setChecked(vChecked);
    }
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
      init : "menu-check-box"
    },

    /** Name of the checkbox instance */
    name :
    {
      check : "String"
    },

    /** Value of the checkbox instance */
    value :
    {
      check : "String",
      event : "changeValue"
    },

    /** Whether the checkbox is checked or not */
    checked :
    {
      check : "Boolean",
      init : false,
      apply : "_applyChecked",
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
      MODIFIERS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyChecked : function(value, old) {
      value === true ? this.addState("checked") : this.removeState("checked");
    },




    /*
    ---------------------------------------------------------------------------
      EXECUTE
    ---------------------------------------------------------------------------
    */

    /**
     * Calls the protected method {@link #_processExecute} to process
     * the execute action.
     *
     * @type member
     * @return {void}
     */
    execute : function()
    {
      this._processExecute();
      this.base(arguments);
    },

    /**
     * Processes the execute action in calling the {@link #toggleChecked} method
     *
     * @type member
     * @return {void}
     */
    _processExecute : function() {
      this.toggleChecked();
    }
  }
});
