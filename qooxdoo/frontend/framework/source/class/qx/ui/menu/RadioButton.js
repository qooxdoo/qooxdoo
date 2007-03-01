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
#embed(qx.widgettheme/menu/radiobutton.gif)
#embed(qx.static/image/blank.gif)

************************************************************************ */

qx.Class.define("qx.ui.menu.RadioButton",
{
  extend : qx.ui.menu.CheckBox,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vLabel, vCommand, vChecked)
  {
    this.base(arguments, vLabel, vCommand, vChecked);

    qx.manager.object.ImageManager.getInstance().preload("widget/menu/radiobutton.gif");
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
      defaultValue : "menu-radio-button"
    },


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
      var vManager = this.getManager();

      if (vManager)
      {
        if (propValue) {
          vManager.setSelected(this);
        } else if (vManager.getSelected() == this) {
          vManager.setSelected(null);
        }
      }

      propValue ? this.addState("checked") : this.removeState("checked");
      this.getIconObject().setSource(propValue ? "widget/menu/radiobutton.gif" : "static/image/blank.gif");

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
      this.setChecked(true);

      // Intentionally bypass superclass and call super.super.execute
      this.base(arguments);
    }
  }
});
