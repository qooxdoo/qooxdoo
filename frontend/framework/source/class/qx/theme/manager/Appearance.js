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

/**
 * This singleton manages the current theme
 */
qx.Class.define("qx.theme.manager.Appearance",
{
  type : "singleton",
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.__cache = {};
    this.__stateMap = {};
    this.__stateMapLength = 1;
  },




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
    _applyAppearanceTheme : function(value, old)
    {
      if (!value && !old) {
        return;
      }

      if (value) {
        this.__cache[value.name] = {};
      }

      if (old) {
        delete this.__cache[old.name];
      }
    },



    /*
    ---------------------------------------------------------------------------
      THEME HELPER
    ---------------------------------------------------------------------------
    */

    /**
     * Get the result of the "initial" function for a given id
     *
     * @type member
     * @param id {String} id of the appearance (e.g. "button", "label", ...)
     * @param states {Map} hash map defining the set states
     * @return {Map} map of widget properties as returned by the "initial" function
     */
    styleFrom : function(id, states)
    {
      var theme = this.getAppearanceTheme();
      return theme ? this.styleFromTheme(theme, id, states) : null;
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

      if (!entry)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (!this.__missing) {
            this.__missing = {};
          }

          if (!this.__missing[id])
          {
            this.warn("Missing appearance entry: " + id);
            this.__missing[id] = true;
          }
        }

        return null;
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
        if (!map[state]) {
          map[state] = this.__stateMapLength++;
        }

        helper[map[state]] = true;
      }

      var unique = helper.join();

      // Using cache if available
      var cache = this.__cache[theme.name];
      if (cache && cache[unique] !== undefined) {
        return cache[unique];
      }

      var result;

      // Otherwise "compile" the appearance
      // If a include or base is defined, too, we need to merge the entries
      if (entry.include || entry.base)
      {
        // This process tries to insert the original data first, and
        // append the new data later, to higher prioritize the local
        // data above the included/inherited data. This is especially needed
        // for property groups or properties which includes other
        // properties when modified.
        var local = entry.style(states);

        // Gather included data
        var incl;
        if (entry.include) {
          incl = this.styleFromTheme(theme, entry.include, states);
        }

        // Create new map
        result = {};

        // Copy base data, but exclude overwritten local and included stuff
        if (entry.base)
        {
          var base = this.styleFromTheme(entry.base, id, states);

          if (entry.include)
          {
            for (var key in base)
            {
              if (incl[key] === undefined && local[key] === undefined) {
                result[key] = base[key];
              }
            }
          }
          else
          {
            for (var key in base)
            {
              if (local[key] === undefined) {
                result[key] = base[key];
              }
            }
          }
        }

        // Copy include data, but exclude overwritten local stuff
        if (entry.include)
        {
          for (var key in incl)
          {
            if (local[key] === undefined) {
              result[key] = incl[key];
            }
          }
        }

        // Append local data
        for (var key in local) {
          result[key] = local[key];
        }
      }
      else
      {
        result = entry.style(states);
      }

      // Cache new entry and return
      if (cache) {
        cache[unique] = result || null;
      }

      return result || null;
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__cache", "__stateMap");
  }
});
