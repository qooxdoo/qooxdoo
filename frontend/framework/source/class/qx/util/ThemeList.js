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

qx.Class.define("qx.util.ThemeList",
{
  statics:
  {
    /**
     * Generates buttons for the given list
     *
     * @param parent {qx.ui.layout.CanvasLayout} the parent where the buttons should be added
     * @param x {Integer} the x coordinate
     * @param y {Integer} the y coordinate
     * @param list {Theme[]} list of themes
     * @param prefix {String} button caption prefix
     * @param callback {Function} callback function to apply new theme, the theme is stored in
     *   the user data field "theme".
     */
    __createButtons : function(parent, x, y, list, prefix, callback)
    {
      var theme, button;

      for (var i=0, l=list.length; i<l; i++)
      {
        theme = list[i];

        if (theme.type === "abstract") {
          continue;
        }

        button = new qx.ui.form.Button(prefix + theme.title, "icon/16/actions/dialog-ok.png");

        button.setUserData("theme", theme);
        button.setLocation(x, y);
        button.addEventListener("execute", callback);

        parent.add(button);
        y += 30;
      }
    },


    /**
     * Generates buttons for all existing meta themes and
     * place it to the given coordinates inside the given parent
     *
     * @param parent {qx.ui.layout.CanvasLayout} the parent where the buttons should be added
     * @param x {Integer} the x coordinate
     * @param y {Integer} the y coordinate
     */
    createMetaButtons : function(parent, x, y)
    {
      var mgr = qx.theme.manager.Meta.getInstance();
      return this.__createButtons(parent, x, y, mgr.getMetaThemes(), "Theme: ", function(e) {
        qx.theme.manager.Meta.getInstance().setTheme(e.getTarget().getUserData("theme"));
      });
    },


    /**
     * Generates buttons for all existing color themes and
     * place it to the given coordinates inside the given parent
     *
     * @param parent {qx.ui.layout.CanvasLayout} the parent where the buttons should be added
     * @param x {Integer} the x coordinate
     * @param y {Integer} the y coordinate
     */
    createColorButtons : function(parent, x, y)
    {
      var mgr = qx.theme.manager.Meta.getInstance();
      return this.__createButtons(parent, x, y, mgr.getColorThemes(), "Color Theme: ", function(e) {
        qx.theme.manager.Color.getInstance().setColorTheme(e.getTarget().getUserData("theme"));
      });
    },


    /**
     * Generates buttons for all existing border themes and
     * place it to the given coordinates inside the given parent
     *
     * @param parent {qx.ui.layout.CanvasLayout} the parent where the buttons should be added
     * @param x {Integer} the x coordinate
     * @param y {Integer} the y coordinate
     */
    createBorderButtons : function(parent, x, y)
    {
      var mgr = qx.theme.manager.Meta.getInstance();
      return this.__createButtons(parent, x, y, mgr.getBorderThemes(), "Border Theme: ", function(e) {
        qx.theme.manager.Border.getInstance().setBorderTheme(e.getTarget().getUserData("theme"));
      });
    },


    /**
     * Generates buttons for all existing font themes and
     * place it to the given coordinates inside the given parent
     *
     * @param parent {qx.ui.layout.CanvasLayout} the parent where the buttons should be added
     * @param x {Integer} the x coordinate
     * @param y {Integer} the y coordinate
     */
    createFontButtons : function(parent, x, y)
    {
      var mgr = qx.theme.manager.Meta.getInstance();
      return this.__createButtons(parent, x, y, mgr.getFontThemes(), "Font Theme: ", function(e) {
        qx.theme.manager.Font.getInstance().setFontTheme(e.getTarget().getUserData("theme"));
      });
    },


    /**
     * Generates buttons for all existing widget themes and
     * place it to the given coordinates inside the given parent
     *
     * @param parent {qx.ui.layout.CanvasLayout} the parent where the buttons should be added
     * @param x {Integer} the x coordinate
     * @param y {Integer} the y coordinate
     */
    createWidgetButtons : function(parent, x, y)
    {
      var mgr = qx.theme.manager.Meta.getInstance();
      return this.__createButtons(parent, x, y, mgr.getWidgetThemes(), "Widget Theme: ", function(e) {
        qx.theme.manager.Widget.getInstance().setWidgetTheme(e.getTarget().getUserData("theme"));
      });
    },


    /**
     * Generates buttons for all existing icon themes and
     * place it to the given coordinates inside the given parent
     *
     * @param parent {qx.ui.layout.CanvasLayout} the parent where the buttons should be added
     * @param x {Integer} the x coordinate
     * @param y {Integer} the y coordinate
     */
    createIconButtons : function(parent, x, y)
    {
      var mgr = qx.theme.manager.Meta.getInstance();
      return this.__createButtons(parent, x, y, mgr.getIconThemes(), "Icon Theme: ", function(e) {
        qx.theme.manager.Icon.getInstance().setIconTheme(e.getTarget().getUserData("theme"));
      });
    },


    /**
     * Generates buttons for all existing appearance themes and
     * place it to the given coordinates inside the given parent
     *
     * @param parent {qx.ui.layout.CanvasLayout} the parent where the buttons should be added
     * @param x {Integer} the x coordinate
     * @param y {Integer} the y coordinate
     */
    createAppearanceButtons : function(parent, x, y)
    {
      var mgr = qx.theme.manager.Meta.getInstance();
      return this.__createButtons(parent, x, y, mgr.getAppearanceThemes(), "Appearance Theme: ", function(e) {
        qx.theme.manager.Appearance.getInstance().setAppearanceTheme(e.getTarget().getUserData("theme"));
      });
    }
  }
});
