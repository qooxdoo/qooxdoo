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

    name :
    {
      check : "String"
    },

    value :
    {
      check : "String",
      event : "changeValue"
    },

    checked :
    {
      check : "Boolean",
      init : false,
      apply : "_modifyChecked"
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
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyChecked : function(propValue, propOldValue, propData) {
      propValue === true ? this.addState("checked") : this.removeState("checked");
    },




    /*
    ---------------------------------------------------------------------------
      EXECUTE
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    execute : function()
    {
      this._processExecute();
      this.base(arguments);
    },

    _processExecute : function() {
      this.toggleChecked();
    }
  }
});
