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

#module(ui_core)

************************************************************************ */

qx.Class.define("qx.manager.object.ThemeManager",
{
  type : "singleton",
  extend : qx.core.Target,

  properties :
  {
    theme :
    {
      check : "Theme",
      nullable : true,
      apply : "_applyTheme"
    }
  },

  members :
  {
    _applyTheme : function(value, old)
    {
      var color = null;
      var border = null;
      var widget = null;
      var icon = null;
      var appearance = null;

      if (value)
      {
        color = value.meta.color || null;
        border = value.meta.border || null;
        widget = value.meta.widget || null;
        icon = value.meta.icon || null;
        appearance = value.meta.appearance || null;
      }

      qx.manager.object.ColorManager.getInstance().setColorTheme(color);
      qx.manager.object.BorderManager.getInstance().setBorderTheme(border);
      qx.manager.object.ImageManager.getInstance().setWidgetTheme(widget);
      qx.manager.object.ImageManager.getInstance().setIconTheme(icon);
      qx.manager.object.AppearanceManager.getInstance().setAppearanceTheme(appearance);
    },

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

        qx.manager.object.ColorManager.getInstance().setColorTheme(obj);
      }

      theme = setting.get("qx.borderTheme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The border theme to use is not available: " + theme);
        }

        qx.manager.object.BorderManager.getInstance().setBorderTheme(obj);
      }

      theme = setting.get("qx.widgetTheme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The widget theme to use is not available: " + theme);
        }

        qx.manager.object.ImageManager.getInstance().setWidgetTheme(obj);
      }

      theme = setting.get("qx.iconTheme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The icon theme to use is not available: " + theme);
        }

        qx.manager.object.ImageManager.getInstance().setIconTheme(obj);
      }

      theme = setting.get("qx.appearanceTheme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The appearance theme to use is not available: " + theme);
        }

        qx.manager.object.AppearanceManager.getInstance().setAppearanceTheme(obj);
      }
    }
  },

  settings :
  {
    /*
      Make sure to select an icon theme that is compatible to the license you
      chose to receive the qooxdoo code under. For more information, please
      see the LICENSE file in the project's top-level directory.
     */

    "qx.theme"           : "qx.theme.ClassicRoyale",
    "qx.colorTheme"      : null,
    "qx.borderTheme"     : null,
    "qx.widgetTheme"     : null,
    "qx.appearanceTheme" : null,
    "qx.iconTheme"       : null
  }
});
