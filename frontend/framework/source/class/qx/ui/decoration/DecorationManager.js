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

qx.Class.define("qx.ui.decoration.DecorationManager",
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
    /** the currently selected decoration theme */
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
      return typeof(value) == "object" ? value : this._dynamic[value];
    },


    /**
     * Whether a value is interpreted dynamically
     *
     * @type member
     * @param value {String} dynamically interpreted idenfier
     * @return {Boolean} returns true if the value is interpreted dynamically
     */
    isDynamic : function(value) {
      return value && (typeof(value) == "object" || this._dynamic[value] !== undefined);
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
     * Update all objects which use the given decoration.
     *
     * @type member
     * @param decoration {qx.ui.core.Decoration} the decoration which have been modified
     */
    updateObjects : function(decoration)
    {
      var reg = this._registry;
      var dynamics = this._dynamic;
      var entry;

      for (var key in reg)
      {
        entry = reg[key];

        if (entry.value === decoration || dynamics[entry.value] === decoration) {
          entry.callback.call(entry.object, decoration);
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
        var decoration = qx.ui.decoration.Basic;

        for (var key in source)
        {
          dest[key] = (new decoration).set(source[key]);
          dest[key].themed = true;
        }
      }

      if (qx.theme.manager.Meta.getInstance().getAutoSync()) {
        this.syncBorderTheme();
      }
    }
  }
});
