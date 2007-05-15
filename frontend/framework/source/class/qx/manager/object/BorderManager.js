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

qx.Class.define("qx.manager.object.BorderManager",
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
    /** the currently selected border theme */
    borderTheme :
    {
      check : "Theme",
      nullable : true,
      apply : "_applyBorderTheme",
      event : "changeBorderTheme"
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
    _processStatic : function(value)
    {
      if (value instanceof qx.renderer.border.Border)
      {
        var key = "b" + value.toHashCode();

        if (!this._static[key]) {
          this._static[key] = value;
        }

        return key;
      }

      return value;
    },


    _applyBorderTheme : function(value)
    {
      var dest = this._dynamic;

      if (dest)
      {
        for (var key in dest) {
          dest[key].dispose();
        }
      }

      dest = this._dynamic = {};

      if (value)
      {
        var source = value.borders;
        var border = qx.renderer.border.Border;

        for (var key in source) {
          dest[key] = (new border).set(source[key]);
        }
      }

      if (qx.manager.object.ThemeManager.getInstance().getAutoSync()) {
        this.syncBorderTheme();
      }
    },


    /**
     * Sync dependend objects with internal database
     *
     * @type member
     * @return {void}
     */
    syncBorderTheme : function() {
      this._updateObjects();
    },


    /**
     * Update all objects which use the given border. Only updates one edge at each call.
     *
     * @type member
     * @param border {qx.renderer.border.Border} the border which have been modified
     * @param edge {String} top, right, bottom or left
     */
    updateObjectsEdge : function(border, edge)
    {
      var reg = this._registry;
      var dynamics = this._dynamic;
      var statics = this._static;
      var entry;

      for (var key in reg)
      {
        entry = reg[key];

        if ((dynamics[entry.value] || statics[entry.value]) === border) {
          entry.callback.call(entry.object, border, edge);
        }
      }
    }
  }
});
