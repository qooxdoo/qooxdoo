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

qx.Class.define("qx.legacy.theme.manager.Color",
{
  type : "singleton",
  extend : qx.legacy.util.ValueManager,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** the currently selected color theme */
    colorTheme :
    {
      check : "Theme",
      nullable : true,
      apply : "_applyColorTheme",
      event : "changeColorTheme"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _applyColorTheme : function(value)
    {
      var dest = this._dynamic = {};

      if (value)
      {
        var source = value.colors;
        var util = qx.util.ColorUtil;
        var temp;

        for (var key in source)
        {
          temp = source[key];

          if (typeof temp === "string")
          {
            if (!util.isCssString(temp)) {
              throw new Error("Could not parse color: " + temp);
            }
          }
          else if (temp instanceof Array)
          {
            temp = util.rgbToRgbString(temp);
          }
          else
          {
            throw new Error("Could not parse color: " + temp);
          }

          dest[key] = temp;
        }
      }

      if (qx.legacy.theme.manager.Meta.getInstance().getAutoSync()) {
        this.syncColorTheme();
      }
    },


    /**
     * Sync dependend objects with internal database
     *
     * @return {void}
     */
    syncColorTheme : function() {
      this.updateAll();
    }
  }
});
