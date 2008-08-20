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
 * Manager for appearance themes
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

    this.__styleCache = {};
    this.__aliasMap = {};
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
    __defaultStates : {},


    _applyAppearanceTheme : function(value, old)
    {

    },



    /*
    ---------------------------------------------------------------------------
      THEME HELPER
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the appearance entry ID to use
     * when all aliases etc. are processed.
     *
     * @param id {String} ID to resolve
     * @param theme {Theme} Theme to use for lookup.
     * @return {String} Resolved ID
     */
    __resolveId : function(id, theme)
    {
      var db = theme.appearances;
      var entry = db[id];

      // this.debug("Resolve: " + id);

      if (!entry)
      {
        var divider = "/";
        var end = [];
        var splitted = id.split(divider);
        var alias;

        while (!entry && splitted.length > 0)
        {
          end.unshift(splitted.pop());
          var baseid = splitted.join(divider);
          entry = db[baseid];

          if (entry)
          {
            alias = entry.alias || entry;

            if (typeof alias === "string")
            {
              var mapped = alias + divider + end.join(divider);
              return this.__resolveId(mapped, theme);
            }
          }
        }

        return null;
      }
      else if (typeof entry === "string")
      {
        return this.__resolveId(entry, theme);
      }
      else if (entry.include && !entry.style)
      {
        return this.__resolveId(entry.include, theme);
      }

      return id;
    },


    /**
     * Get the result of the "state" function for a given id and states
     *
     * @param id {String} id of the appearance (e.g. "button", "label", ...)
     * @param states {Map} hash map defining the set states
     * @param theme {Theme?} appearance theme
     * @return {Map} map of widget properties as returned by the "state" function
     */
    styleFrom : function(id, states, theme)
    {
      if (!theme) {
        theme = this.getAppearanceTheme();
      }

      // Resolve ID
      var aliasMap = this.__aliasMap;
      var resolved = aliasMap[id];
      if (!resolved) {
        resolved = aliasMap[id] = this.__resolveId(id, theme);
      }

      // Query theme for ID
      var entry = theme.appearances[resolved];
      if (!entry)
      {
        this.warn("Missing appearance: " + id);
        return null;
      }

      // Entries with includes, but without style are automatically merged
      // by the ID handling in {link #getEntry}. When there is no style method in the
      // final object the appearance is empty and null could be returned.
      if (!entry.style) {
        return null;
      }

      // Build a unique cache name from ID and state combination
      var unique = resolved;
      if (states)
      {
        // Create data fields
        var bits = entry.$$bits;
        if (!bits)
        {
          bits = entry.$$bits = {};
          entry.$$length = 0;
        }

        // Compute sum
        var sum = 0;
        for (var state in states)
        {
          if (bits[state] == null) {
            bits[state] = 1<<entry.$$length++;
          }

          sum += bits[state];
        }

        // Only append the sum if it is bigger than zero
        if (sum > 0) {
          unique += ":" + sum;
        }
      }

      // Using cache if available
      var cache = this.__styleCache;
      if (cache[unique] !== undefined) {
        return cache[unique];
      }

      // Fallback to default (empty) states map
      if (!states) {
        states = this.__defaultStates;
      }

      // Compile the appearance
      var result;

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
          incl = this.styleFrom(entry.include, states, theme);
        }

        // Create new map
        result = {};

        // Copy base data, but exclude overwritten local and included stuff
        if (entry.base)
        {
          var base = this.styleFrom(resolved, states, entry.base);

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
      return cache[unique] = result || null;
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__styleCache", "__aliasMap");
  }
});
