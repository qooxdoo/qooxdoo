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

/**
 * Manager for meta themes
 */
qx.Class.define("qx.theme.manager.Meta",
{
  type : "singleton",
  extend : qx.core.Object,



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Meta theme. Applies the defined color, decoration, ... themes to
     * the corresponding managers.
     */
    theme :
    {
      check : "Theme",
      nullable : true,
      apply : "_applyTheme"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // property apply
    _applyTheme : function(value, old)
    {
      var color = null;
      var decoration = null;
      var font = null;
      var icon = null;
      var appearance = null;

      if (value)
      {
        color = value.meta.color || null;
        decoration = value.meta.decoration || null;
        font = value.meta.font || null;
        icon = value.meta.icon || null;
        appearance = value.meta.appearance || null;
      }

      var colorMgr = qx.theme.manager.Color.getInstance();
      var decorationMgr = qx.theme.manager.Decoration.getInstance();
      var fontMgr = qx.theme.manager.Font.getInstance();
      var iconMgr = qx.theme.manager.Icon.getInstance();
      var appearanceMgr = qx.theme.manager.Appearance.getInstance();

      colorMgr.setTheme(color);
      decorationMgr.setTheme(decoration);
      fontMgr.setTheme(font);
      iconMgr.setTheme(icon);
      appearanceMgr.setAppearanceTheme(appearance);
    },


    /**
     * Initialize the themes which were selected using the settings. Should only
     * be called from qooxdoo based application.
     */
    initialize : function()
    {
      var setting = qx.core.Setting;
      var theme, obj;

      theme = setting.get("qx.theme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The theme to use is not available: " + theme);
        }

        this.setTheme(obj);
      }
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings : {
    "qx.theme"           : "qx.theme.Classic"
  }
});
