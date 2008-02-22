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
     * Meta theme. Applies the defined color, widget, ... themes to
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
      var decoration = null;
      var font = null;
      var widget = null;
      var icon = null;
      var appearance = null;

      if (value)
      {
        color = value.meta.color || null;
        decoration = value.meta.decoration || null;
        font = value.meta.font || null;
        widget = value.meta.widget || null;
        icon = value.meta.icon || null;
        appearance = value.meta.appearance || null;
      }

      if (old) {
        this.setAutoSync(false);
      }

      var colorMgr = qx.theme.manager.Color.getInstance();
      var decorationMgr = qx.theme.manager.Decoration.getInstance();
      var fontMgr = qx.theme.manager.Font.getInstance();
      var iconMgr = qx.theme.manager.Icon.getInstance();
      var widgetMgr = qx.theme.manager.Widget.getInstance();
      var appearanceMgr = qx.theme.manager.Appearance.getInstance();

      colorMgr.setTheme(color);
      decorationMgr.setTheme(decoration);
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
        qx.theme.manager.Appearance.getInstance().syncAppearanceTheme();
        qx.theme.manager.Icon.getInstance().syncIconTheme();
        qx.theme.manager.Widget.getInstance().syncWidgetTheme();
        qx.theme.manager.Font.getInstance().syncFontTheme();
        qx.theme.manager.Decoration.getInstance().syncDecorationTheme();
        qx.theme.manager.Color.getInstance().syncColorTheme();
      }
    },


    /**
     * Initialize the themes which were selected using the settings. Should only
     * be called from qooxdoo based application.
     *
     * @type static
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
          throw new Error("The meta theme to use is not available: " + theme);
        }

        this.setTheme(obj);
      }

      theme = setting.get("qx.colorTheme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The color theme to use is not available: " + theme);
        }

        qx.theme.manager.Color.getInstance().setTheme(obj);
      }

      theme = setting.get("qx.decorationTheme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The decoration theme to use is not available: " + theme);
        }

        qx.theme.manager.Decoration.getInstance().setTheme(obj);
      }

      theme = setting.get("qx.fontTheme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The font theme to use is not available: " + theme);
        }

        qx.theme.manager.Font.getInstance().setFontTheme(obj);
      }

      theme = setting.get("qx.widgetTheme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The widget theme to use is not available: " + theme);
        }

        qx.theme.manager.Widget.getInstance().setWidgetTheme(obj);
      }

      theme = setting.get("qx.iconTheme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The icon theme to use is not available: " + theme);
        }

        qx.theme.manager.Icon.getInstance().setIconTheme(obj);
      }

      theme = setting.get("qx.appearanceTheme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The appearance theme to use is not available: " + theme);
        }

        qx.theme.manager.Appearance.getInstance().setAppearanceTheme(obj);
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
     * @type static
     * @return {Theme[]} list of meta themes
     */
    getMetaThemes : function() {
      return this.__queryThemes("meta");
    },


    /**
     * Returns a list of all registered color themes
     *
     * @type static
     * @return {Theme[]} list of color themes
     */
    getColorThemes : function() {
      return this.__queryThemes("colors");
    },


    /**
     * Returns a list of all registered decoration themes
     *
     * @type static
     * @return {Theme[]} list of decoration themes
     */
    getDecorationThemes : function() {
      return this.__queryThemes("decorations");
    },


    /**
     * Returns a list of all registered font themes
     *
     * @type static
     * @return {Theme[]} list of font themes
     */
    getFontThemes : function() {
      return this.__queryThemes("fonts");
    },


    /**
     * Returns a list of all registered widget themes
     *
     * @type static
     * @return {Theme[]} list of widget themes
     */
    getWidgetThemes : function() {
      return this.__queryThemes("widgets");
    },


    /**
     * Returns a list of all registered icon themes
     *
     * @type static
     * @return {Theme[]} list of icon themes
     */
    getIconThemes : function() {
      return this.__queryThemes("icons");
    },


    /**
     * Returns a list of all registered appearance themes
     *
     * @type static
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
    "qx.theme"           : "qx.theme.Classic",
    "qx.colorTheme"      : null,
    "qx.decorationTheme" : null,
    "qx.fontTheme"       : null,
    "qx.widgetTheme"     : null,
    "qx.appearanceTheme" : null,
    "qx.iconTheme"       : null
  }
});
