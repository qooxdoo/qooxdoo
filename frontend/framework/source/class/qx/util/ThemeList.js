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
    createColorButtons : function(vParent, xCor, yCor)
    {
      var vButton;
      var vThemes = this.__colorThemes;
      var vIcon = "icon/16/actions/format-color.png";
      var vPrefix = "Color Theme: ";
      var vEvent = "execute";

      for (var vId in vThemes)
      {
        var vObj = vThemes[vId];
        var vButton = new qx.ui.form.Button(vPrefix + vObj.title, vIcon);

        vButton.setLocation(xCor, yCor);
        vButton.addEventListener(vEvent, new Function("qx.manager.object.ColorManager.getInstance().setColorThemeById('" + vId + "')"));

        vParent.add(vButton);

        yCor += 30;
      }
    },

    // TODO: rename to createIconThemeList
    /**
     * TODOC
     *
     * @type member
     * @param vParent {var} TODOC
     * @param xCor {var} TODOC
     * @param yCor {var} TODOC
     * @return {void}
     */
    createIconButtons : function(vParent, xCor, yCor)
    {
      var vButton;
      var vThemes = this._iconThemes;
      var vIcon = "icon/16/apps/preferences-desktop-theme.png";
      var vPrefix = "Icon Theme: ";
      var vEvent = "execute";

      for (var vId in vThemes)
      {
        var vObj = vThemes[vId];
        var vButton = new qx.ui.form.Button(vPrefix + vObj.title, vIcon);

        vButton.setLocation(xCor, yCor);
        vButton.addEventListener(vEvent, new Function("qx.manager.object.ImageManager.getInstance().setIconThemeById('" + vId + "')"));

        vParent.add(vButton);

        yCor += 30;
      }
    }
  }
});
