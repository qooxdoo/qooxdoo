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

qx.Class.define("qx.util.ThemeList",
{
  statics:
  {
    __createButtons : function(parent, x, y, list, prefix, callback)
    {
      var theme, button;

      for (var i=0, l=list.length; i<l; i++)
      {
        theme = list[i];

        button = new qx.ui.form.Button(prefix + theme.title, "icon/16/actions/dialog-ok.png");

        button.setUserData("theme", theme);
        button.setLocation(x, y);
        button.addEventListener("execute", callback);

        parent.add(button);
        y += 30;
      }
    },

    createColorButtons : function(parent, x, y)
    {
      return this.__createButtons(parent, x, y, qx.Theme.getColorThemes(), "Color Theme: ", function(e) {
        qx.manager.object.ColorManager.getInstance().setColorTheme(e.getTarget().getUserData("theme"));
      });
    },

    createBorderButtons : function(parent, x, y)
    {
      return this.__createButtons(parent, x, y, qx.Theme.getBorderThemes(), "Border Theme: ", function(e) {
        qx.manager.object.BorderManager.getInstance().setBorderTheme(e.getTarget().getUserData("theme"));
      });
    },

    createWidgetButtons : function(parent, x, y)
    {
      return this.__createButtons(parent, x, y, qx.Theme.getWidgetThemes(), "Widget Theme: ", function(e) {
        qx.manager.object.ImageManager.getInstance().setWidgetTheme(e.getTarget().getUserData("theme"));
      });
    },

    createIconButtons : function(parent, x, y)
    {
      return this.__createButtons(parent, x, y, qx.Theme.getIconThemes(), "Icon Theme: ", function(e) {
        qx.manager.object.ImageManager.getInstance().setIconTheme(e.getTarget().getUserData("theme"));
      });
    },

    createAppearanceButtons : function(parent, x, y)
    {
      return this.__createButtons(parent, x, y, qx.Theme.getAppearanceThemes(), "Appearance Theme: ", function(e) {
        qx.manager.object.AppearanceManager.getInstance().setAppearanceTheme(e.getTarget().getUserData("theme"));
      });
    }
  }
});
