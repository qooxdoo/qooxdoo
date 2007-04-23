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

qx.Class.define("qx.manager.object.ColorManager",
{
  type : "singleton",
  extend : qx.manager.object.ValueManager,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    colorTheme :
    {
      check : "Theme",
      nullable : true,
      apply : "_processThemedData",
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
    _processThemedData : function(value)
    {
      var dest = this._dynamic = {};

      if (value)
      {
        var source = value.colors;
        var util = qx.util.ColorUtil;

        for (var key in source) {
          dest[key] = util.rgbToRgbString(source[key]);
        }
      }

      // Inform objects which have registered
      // regarding the theme switch
      this._updateThemedObjects();
    }
  }
});
