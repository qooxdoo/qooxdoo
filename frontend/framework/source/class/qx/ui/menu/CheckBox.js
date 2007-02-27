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
#embed(qx.widgettheme/menu/checkbox.gif)
#embed(qx.static/image/blank.gif)

************************************************************************ */

/** A checkbox for the menu system. */
qx.Clazz.define("qx.ui.menu.CheckBox",
{
  extend : qx.ui.menu.Button,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vLabel, vCommand, vChecked)
  {
    this.base(arguments, vLabel, "static/image/blank.gif", vCommand);

    if (vChecked != null) {
      this.setChecked(vChecked);
    }

    qx.manager.object.ImageManager.getInstance().preload("widget/menu/checkbox.gif");
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

    appearance :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "menu-check-box"
    },

    name :
    {
      _legacy : true,
      type    : "string"
    },

    value :
    {
      _legacy : true,
      type    : "string"
    },

    checked :
    {
      _legacy      : true,
      type         : "boolean",
      defaultValue : false,
      getAlias     : "isChecked"
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
     * @return {boolean} TODOC
     */
    _modifyChecked : function(propValue, propOldValue, propData)
    {
      propValue ? this.addState("checked") : this.removeState("checked");
      this.getIconObject().setSource(propValue ? "widget/menu/checkbox.gif" : "static/image/blank.gif");

      return true;
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
      this.setChecked(!this.getChecked());
      this.base(arguments);
    }
  }
});
