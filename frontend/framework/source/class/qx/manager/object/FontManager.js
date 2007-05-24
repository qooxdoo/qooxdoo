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

qx.Class.define("qx.manager.object.FontManager",
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
    /** the currently selected font theme */
    fontTheme :
    {
      check : "Theme",
      nullable : true,
      apply : "_applyFontTheme",
      event : "changeFontTheme"
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * If the incoming value is a border object it will be stored into the
     * static map and return the corresponding hashCode.
     *
     * @type member
     * @param value {var} The original value
     * @return {var} The result value
     */
    _preprocess : function(value)
    {
      if (value instanceof qx.renderer.font.Font)
      {
        var key = "f" + value.toHashCode();

        if (!this._dynamic[key]) {
          this._dynamic[key] = value;
        }

        return key;
      }

      return value;
    },


    _applyFontTheme : function(value)
    {
      var dest = this._dynamic;

      for (var key in dest)
      {
        if (dest[key].themed)
        {
          dest[key].dispose();
          delete dest[key];
        }
      }

      if (value)
      {
        var source = value.fonts;
        var font = qx.renderer.font.Font;

        for (var key in source)
        {
          dest[key] = (new font).set(source[key]);
          dest[key].themed = true;
        }
      }

      if (qx.manager.object.ThemeManager.getInstance().getAutoSync()) {
        this.syncFontTheme();
      }
    },


    /**
     * Sync dependend objects with internal database
     *
     * @type member
     * @return {void}
     */
    syncFontTheme : function() {
      this._updateObjects();
    }
  }
});
