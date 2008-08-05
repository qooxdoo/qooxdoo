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

qx.Class.define("qx.legacy.theme.manager.Meta",
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
     * Meta theme. Applies the defined color, border, widget, ... themes to
     * the corresponding managers.
     */
    theme :
    {
      check : "Theme",
      nullable : true,
      apply : "_applyTheme",
      event : "changeTheme"
    },

    /**
     * Controls whether sync is done automatically
     */
    autoSync :
    {
      check : "Boolean",
      init : true,
      apply : "_applyAutoSync"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _applyTheme : function(value, old)
    {
      var color = null;
      var border = null;
      var font = null;
      var widget = null;
      var icon = null;
      var appearance = null;

      if (value)
      {
        color = value.meta.color || null;
        border = value.meta.border || null;
        font = value.meta.font || null;
        widget = value.meta.widget || null;
        icon = value.meta.icon || null;
        appearance = value.meta.appearance || null;
      }

      if (old) {
        this.setAutoSync(false);
      }

      var colorMgr = qx.legacy.theme.manager.Color.getInstance();
      var borderMgr = qx.legacy.theme.manager.Border.getInstance();
      var fontMgr = qx.legacy.theme.manager.Font.getInstance();
      var iconMgr = qx.legacy.theme.manager.Icon.getInstance();
      var widgetMgr = qx.legacy.theme.manager.Widget.getInstance();
      var appearanceMgr = qx.legacy.theme.manager.Appearance.getInstance();

      colorMgr.setColorTheme(color);
      borderMgr.setBorderTheme(border);
      fontMgr.setFontTheme(font);
      widgetMgr.setWidgetTheme(widget);
      iconMgr.setIconTheme(icon);
      appearanceMgr.setAppearanceTheme(appearance);

      if (old) {
        this.setAutoSync(true);
      }
    },


    _applyAutoSync : function(value, old)
    {
      if (value)
      {
        qx.legacy.theme.manager.Appearance.getInstance().syncAppearanceTheme();
        qx.legacy.theme.manager.Icon.getInstance().syncIconTheme();
        qx.legacy.theme.manager.Widget.getInstance().syncWidgetTheme();
        qx.legacy.theme.manager.Font.getInstance().syncFontTheme();
        qx.legacy.theme.manager.Border.getInstance().syncBorderTheme();
        qx.legacy.theme.manager.Color.getInstance().syncColorTheme();
      }
    },


    /**
     * Initialize the themes which were selected using the settings. Should only
     * be called from qooxdoo based application.
     *
     */
    initialize : function()
    {
      var setting = qx.core.Setting;
      var theme, obj;

      theme = setting.get("qx.legacy.theme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The meta theme to use is not available: " + theme);
        }

        this.setTheme(obj);
      }

      theme = setting.get("qx.legacy.colorTheme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The color theme to use is not available: " + theme);
        }

        qx.legacy.theme.manager.Color.getInstance().setColorTheme(obj);
      }

      theme = setting.get("qx.legacy.borderTheme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The border theme to use is not available: " + theme);
        }

        qx.legacy.theme.manager.Border.getInstance().setBorderTheme(obj);
      }

      theme = setting.get("qx.legacy.fontTheme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The font theme to use is not available: " + theme);
        }

        qx.legacy.theme.manager.Font.getInstance().setFontTheme(obj);
      }

      theme = setting.get("qx.legacy.widgetTheme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The widget theme to use is not available: " + theme);
        }

        qx.legacy.theme.manager.Widget.getInstance().setWidgetTheme(obj);
      }

      theme = setting.get("qx.legacy.iconTheme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The icon theme to use is not available: " + theme);
        }

        qx.legacy.theme.manager.Icon.getInstance().setIconTheme(obj);
      }

      theme = setting.get("qx.legacy.appearanceTheme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The appearance theme to use is not available: " + theme);
        }

        qx.legacy.theme.manager.Appearance.getInstance().setAppearanceTheme(obj);
      }
    },

    /**
     * Query the theme list to get all themes the given key
     *
     * @param key {String} the key to look for
     * @return {Theme[]} list of matching themes
     */
    __queryThemes : function(key)
    {
      var reg = qx.Theme.getAll();
      var theme;
      var list = [];

      for (var name in reg)
      {
        theme = reg[name];
        if (theme[key]) {
          list.push(theme);
        }
      }

      return list;
    },


    /**
     * Returns a list of all registered meta themes
     *
     * @return {Theme[]} list of meta themes
     */
    getMetaThemes : function() {
      return this.__queryThemes("meta");
    },


    /**
     * Returns a list of all registered color themes
     *
     * @return {Theme[]} list of color themes
     */
    getColorThemes : function() {
      return this.__queryThemes("colors");
    },


    /**
     * Returns a list of all registered border themes
     *
     * @return {Theme[]} list of border themes
     */
    getBorderThemes : function() {
      return this.__queryThemes("borders");
    },


    /**
     * Returns a list of all registered font themes
     *
     * @return {Theme[]} list of font themes
     */
    getFontThemes : function() {
      return this.__queryThemes("fonts");
    },


    /**
     * Returns a list of all registered widget themes
     *
     * @return {Theme[]} list of widget themes
     */
    getWidgetThemes : function() {
      return this.__queryThemes("widgets");
    },


    /**
     * Returns a list of all registered icon themes
     *
     * @return {Theme[]} list of icon themes
     */
    getIconThemes : function() {
      return this.__queryThemes("icons");
    },


    /**
     * Returns a list of all registered appearance themes
     *
     * @return {Theme[]} list of appearance themes
     */
    getAppearanceThemes : function() {
      return this.__queryThemes("appearances");
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings :
  {
    "qx.legacy.theme"           : "qx.legacy.theme.ClassicRoyale",
    "qx.legacy.colorTheme"      : null,
    "qx.legacy.borderTheme"     : null,
    "qx.legacy.fontTheme"       : null,
    "qx.legacy.widgetTheme"     : null,
    "qx.legacy.appearanceTheme" : null,
    "qx.legacy.iconTheme"       : null
  }
});
