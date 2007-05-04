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

/**
 * This singleton manages the current theme
 */
qx.Class.define("qx.manager.object.AppearanceManager",
{
  type : "singleton",
  extend : qx.manager.object.ObjectManager,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** currently used appearance theme */
    appearanceTheme :
    {
      check : "Theme",
      nullable : true,
      apply : "_applyAppearanceTheme",
      event : "changeAppearanceTheme"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    _applyAppearanceTheme : function(propValue, propOldValue, propData)
    {
      var vComp = qx.core.Init.getInstance().getApplication();

      if (vComp && vComp.getUiReady()) {
        qx.ui.core.ClientDocument.getInstance()._recursiveAppearanceThemeUpdate(propValue, propOldValue);
      }

      // Reset cache
      if (propValue) {
        this.__cache = {};
      }

      return true;
    },




    /*
    ---------------------------------------------------------------------------
      THEME HELPER
    ---------------------------------------------------------------------------
    */

    __cache : {},
    __stateMap : {},
    __stateMapLength : 1,


    /**
     * Get the result of the "initial" function for a given id
     *
     * @type member
     * @param theme {Object} appearance theme
     * @param id {String} id of the appearance (e.g. "button", "label", ...)
     * @return {Map} map of widget properties as returned by the "initial" function
     */
    styleFrom : function(id, states)
    {
      var theme = this.getAppearanceTheme();

      if (!theme) {
        return;
      }

      return this.styleFromTheme(theme, id, states);
    },


    /**
     * Get the result of the "state" function for a given id and states
     *
     * @type member
     * @param theme {Object} appearance theme
     * @param id {String} id of the appearance (e.g. "button", "label", ...)
     * @param states {Map} hash map defining the set states
     * @return {Map} map of widget properties as returned by the "state" function
     */
    styleFromTheme : function(theme, id, states)
    {
      var entry = theme.appearances[id];

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!entry) {
          throw new Error("Missing appearance entry: " + id);
        }
      }

      // Fast fallback to super entry
      if (!entry.style)
      {
        if (entry.include) {
          return this.styleFromTheme(theme, entry.include, states);
        } else {
          return null;
        }
      }

      // Creating cache-able ID
      var map = this.__stateMap;
      var helper = [id];
      for (var state in states)
      {
        if (states[state])
        {
          if (!map[state]) {
            map[state] = this.__stateMapLength++;
          }

          helper[map[state]] = true;
        }
      }

      var unique = helper.join();

      // Using cache if available
      var cache = this.__cache;
      if (cache[unique] !== undefined) {
        return cache[unique];
      }

      // Otherwise "compile" the appearance
      // If a include is defined, too, we need to merge the entries
      if (entry.include)
      {
        // This process tries to insert the original data first, and
        // append the new data later, to higher priorise the local
        // data above the included data. This is especially needed
        // for property groups or properties which includences other
        // properties when modified.
        var incl = this.styleFromTheme(theme, entry.include, states);
        var local = entry.style(states);

        // Copy include data, but exclude overwritten local stuff
        var ret = {};
        for (var key in incl)
        {
          if (local[key] === undefined) {
            ret[key] = incl[key]
          }
        }

        // Append local data
        for (var key in local) {
          ret[key] = local[key];
        }
      }
      else
      {
        var ret = entry.style(states);
      }

      // Cache new entry
      cache[unique] = ret || null;

      // Debug
      // this.debug("Cached: " + qx.lang.Object.getLength(cache) + " :: " + unique);

      return ret;
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__cache");
  }
});
