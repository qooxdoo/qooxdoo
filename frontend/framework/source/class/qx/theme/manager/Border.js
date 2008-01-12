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

/* ************************************************************************

#module(ui_core)

************************************************************************ */

qx.Class.define("qx.theme.manager.Border",
{
  type : "singleton",
  extend : qx.util.manager.Value,




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
     * Returns the dynamically interpreted result for the incoming value
     *
     * @type member
     * @param value {String} dynamically interpreted idenfier
     * @return {var} return the (translated) result of the incoming value
     */
    resolveDynamic : function(value) {
      return value instanceof qx.ui.core.Border ? value : this._dynamic[value];
    },


    /**
     * Whether a value is interpreted dynamically
     *
     * @type member
     * @param value {String} dynamically interpreted idenfier
     * @return {Boolean} returns true if the value is interpreted dynamically
     */
    isDynamic : function(value) {
      return value && (value instanceof qx.ui.core.Border || this._dynamic[value] !== undefined);
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
     * @param border {qx.ui.core.Border} the border which have been modified
     * @param edge {String} top, right, bottom or left
     */
    updateObjectsEdge : function(border, edge)
    {
      var reg = this._registry;
      var dynamics = this._dynamic;
      var entry;

      for (var key in reg)
      {
        entry = reg[key];

        if (entry.value === border || dynamics[entry.value] === border) {
          entry.callback.call(entry.object, border, edge);
        }
      }
    },


    _applyBorderTheme : function(value)
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
        var source = value.borders;
        var border = qx.ui.core.Border;

        for (var key in source)
        {
          dest[key] = (new border).set(source[key]);
          dest[key].themed = true;
        }
      }

      if (qx.theme.manager.Meta.getInstance().getAutoSync()) {
        this.syncBorderTheme();
      }
    }
  }
});
