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
    _borderToWidgetsMap : {},

    // overridden
    connect : function(callback, obj, value)
    {
      var objectKey = obj.toHashCode();
      var callbackKey = qx.core.Object.toHashCode(callback);
      var listenerKey = objectKey + "|" + callbackKey;
      var reg = this._registry;

      // remove old entry
      if (reg[objectKey] && reg[objectKey][callbackKey])
      {
        var oldValue = reg[objectKey][callbackKey].value;
        if (this.isDynamic(oldValue)) {
          oldValue = this.resolveDynamic(oldValue);
        }
        if (oldValue instanceof qx.core.Object)
        {
          var oldValueWidgets = this._borderToWidgetsMap[oldValue.toHashCode()];
          if (oldValueWidgets) {
            delete oldValueWidgets[listenerKey];
          }
        }
      }

      this.base(arguments, callback, obj, value);

      if (!value) {
        return;
      }

      // add new entry
      if (this.isDynamic(value)) {
        value = this.resolveDynamic(value);
      }

      var valueKey = value.toHashCode();
      if (!this._borderToWidgetsMap[valueKey]) {
        this._borderToWidgetsMap[valueKey] = {};
      }

      this._borderToWidgetsMap[valueKey][listenerKey] = {
        callbackKey: qx.core.Object.toHashCode(callback),
        contextKey: qx.core.Object.toHashCode(obj)
      };
    },


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
    updateObjects : function(decoration) {
      this.syncConnectedObjects(border, edge);
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
