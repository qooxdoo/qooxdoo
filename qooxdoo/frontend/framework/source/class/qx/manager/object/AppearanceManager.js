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
      var cache = this.__cache;
      var entry = theme.appearances[id];

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!entry) {
          throw new Error("Missing appearance entry: " + id);
        }
      }

      // Fast fallback to super entry
      if (!entry.style && entry.include) {
        return this.styleFromTheme(theme, entry.include, states);
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
      if (cache[unique] !== undefined) {
        return cache[unique];
      }

      // Otherwise "compile" the appearance
      var ret;

      // This is the place where we really call the appearance theme
      if (entry.style)
      {
        // Executing appearance theme style definition
        ret = entry.style(states);

        // Fill with data from inheritance
        if (entry.include) {
          qx.lang.Object.carefullyMergeWith(ret, this.styleFromTheme(theme, entry.include, states));
        }
      }

      // Normalize to null (needed for caching)
      ret = ret || null;

      // Cache new entry
      cache[unique] = ret;

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
