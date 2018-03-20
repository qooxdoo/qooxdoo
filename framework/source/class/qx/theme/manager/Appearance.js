/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
    /** Currently used appearance theme */
    theme :
    {
      check : "Theme",
      nullable : true,
      event : "changeTheme",
      apply : "_applyTheme"
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
     * @lint ignoreReferenceField(__defaultStates)
     */
    __defaultStates : {},
    __styleCache : null,
    __aliasMap : null,


    // property apply
    _applyTheme : function() {
      // empty the caches
      this.__aliasMap = {};
      this.__styleCache = {};
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
     * @param id {String} ID to resolve.
     * @param theme {Theme} Theme to use for lookup.
     * @param defaultId {String} ID for a fallback.
     * @param chain {Array} The appearance id chain.
     * @return {String} Resolved ID
     */
    __resolveId : function(id, theme, defaultId, chain)
    {
      var db = theme.appearances;
      var entry = db[id];

      if (!entry)
      {
        var divider = "/";
        var end = [];
        var splitted = id.split(divider);
        var chainCopy = qx.lang.Array.clone(splitted);
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
              return this.__resolveId(mapped, theme, defaultId, chainCopy);
            }
          }
        }

        // check if we find a control fitting in the appearance [BUG #4020]
        for (var i = 0; i < end.length - 1; i++) {
          // remove the first id, it has already been checked at startup
          end.shift();
          // build a new subid without the former first id
          var subId = end.join(divider);
          var resolved = this.__resolveId(subId, theme, null, chainCopy);
          if (resolved) {
            return resolved;
          }
        }

        // check for the fallback
        if (defaultId != null) {
          return this.__resolveId(defaultId, theme, null, chainCopy);
        }

        // it's safe to output this message here since we can be sure that the return
        // value is 'null' and something went wrong with the id lookup.
        if (qx.core.Environment.get("qx.debug"))
        {
          if (typeof chain !== "undefined") {
            this.debug("Cannot find a matching appearance for '" + chain.join("/") + "'.");

            if (chain.length > 1) {
              this.info("Hint: This may be an issue with nested child controls and a missing alias definition in the appearance theme.");
            }
          }
        }

        return null;
      }
      else if (typeof entry === "string")
      {
        return this.__resolveId(entry, theme, defaultId, chainCopy);
      }
      else if (entry.include && !entry.style)
      {
        return this.__resolveId(entry.include, theme, defaultId, chainCopy);
      }

      return id;
    },


    /**
     * Get the result of the "state" function for a given id and states
     *
     * @param id {String} id of the appearance (e.g. "button", "label", ...)
     * @param states {Map} hash map defining the set states
     * @param theme {Theme?} appearance theme
     * @param defaultId {String} fallback id.
     * @return {Map} map of widget properties as returned by the "state" function
     */
    styleFrom : function(id, states, theme, defaultId)
    {
      if (!theme) {
        theme = this.getTheme();
      }

      // Resolve ID
      var aliasMap = this.__aliasMap;
      if(!aliasMap[theme.name]) {
        aliasMap[theme.name] = {};
      }
      var resolved = aliasMap[theme.name][id];
      if (!resolved) {
        resolved = aliasMap[theme.name][id] = this.__resolveId(id, theme, defaultId);
      }

      // Query theme for ID
      var entry = theme.appearances[resolved];
      if (!entry)
      {
        this.warn("Missing appearance: " + id);
        return null;
      }

      // Entries with includes, but without style are automatically merged
      // by the ID handling in {@link #getEntry}. When there is no style method in the
      // final object the appearance is empty and null could be returned.
      if (!entry.style) {
        return null;
      }

      // Build an unique cache name from ID and state combination
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
          if (!states[state]) {
            continue;
          }

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
      if (cache[theme.name] && (cache[theme.name][unique] !== undefined)) {
        return cache[theme.name][unique];
      }

      // Fallback to default (empty) states map
      if (!states) {
        states = this.__defaultStates;
      }

      // Compile the appearance
      var result;

      // If an include or base is defined, too, we need to merge the entries
      if (entry.include || entry.base)
      {

        // Gather included data
        var incl;
        if (entry.include) {
          incl = this.styleFrom(entry.include, states, theme, defaultId);
        }

        // This process tries to insert the original data first, and
        // append the new data later, to higher prioritize the local
        // data above the included/inherited data. This is especially needed
        // for property groups or properties which includes other
        // properties when modified.
        var local = entry.style(states, incl);

        // Create new map
        result = {};

        // Copy base data, but exclude overwritten local and included stuff
        if (entry.base)
        {
          var base = this.styleFrom(resolved, states, entry.base, defaultId);

          if (entry.include)
          {
            for (var baseIncludeKey in base)
            {
              if (!incl.hasOwnProperty(baseIncludeKey) && !local.hasOwnProperty(baseIncludeKey)) {
                result[baseIncludeKey] = base[baseIncludeKey];
              }
            }
          }
          else
          {
            for (var baseKey in base)
            {
              if (!local.hasOwnProperty(baseKey)) {
                result[baseKey] = base[baseKey];
              }
            }
          }
        }

        // Copy include data, but exclude overwritten local stuff
        if (entry.include)
        {
          for (var includeKey in incl)
          {
            if (!local.hasOwnProperty(includeKey)) {
              result[includeKey] = incl[includeKey];
            }
          }
        }

        // Append local data
        for (var localKey in local) {
          result[localKey] = local[localKey];
        }
      }
      else
      {
        result = entry.style(states);
      }

      // Cache new entry and return
      if(!cache[theme.name]) {
        cache[theme.name] = {};
      }
       return cache[theme.name][unique] = result || null;
    }
  }
});
