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

    this.__styleCache = {};
    
    this.__idMap = {};    
    
    // To give the style method a unified interface when no states are specified
    this.__defaultStates = {};
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
     * @type member
     * @param id {String} ID to resolve
     * @param theme {Theme} Theme to use for lookup.
     * @return {String} Resolved ID
     */
    resolveId : function(id, theme)
    {
      var db = theme.appearances;
      var entry = db[id];
      
      //this.debug("Resolve: " + id);
      
      if (!entry)
      {
        var divider = "/";
        var end = [];
        var splitted = id.split(divider);
        var alias;
        
        while (!entry && splitted.length > 0)
        {
          end.unshift(splitted.pop());
          baseid = splitted.join(divider);
          entry = db[baseid];
          
          if (entry)
          {
            alias = entry.alias || entry;
            
            if (typeof alias === "string") 
            {
              var mapped = alias + divider + end.join(divider);
              var result = this.resolveId(mapped, theme);
              return result;
            }
          }
        }
        
        return null;
      }
      else if (typeof entry === "string") 
      {
        return this.resolveId(entry, theme);
      }
      else if (entry.include && !entry.style)
      {
        return this.resolveId(entry.include, theme);
      }
      else
      {  
        return id;    
      }
    },
    
    
    getEntry : function(id, theme)
    {
      var map = this.__idMap;
      
      // Cache ID redirects
      var entry = map[id];
      if (entry === undefined) 
      {
        // Searching for real ID
        var mapped = this.resolveId(id, theme);

        // Check if the entry was finally found
        if (!mapped)
        {
          if (qx.core.Variant.isSet("qx.debug", "on")) {
            this.warn("Missing appearance ID: " + id);
          }
  
          return null;
        }

        // this.debug("Map appearance ID: " + id + " to " + mapped);
        entry = map[id] = theme.appearances[mapped];
      }
      
      return entry;      
    },


    /**
     * Get the result of the "state" function for a given id and states
     *
     * @type member
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
      
      var entry = this.getEntry(id, theme);   
      
      // Entries with includes, but without style are automatically merged
      // by the ID handling in {link #getEntry}. When there is no style method in the
      // final object the appearance is empty and null could be returned.
      if (!entry.style) {
        return null;
      }
      
      // Build a unique cache name from ID and state combination
      var unique = id;
      if (states)
      {
        var styleStates = entry.states;
        
        if (styleStates) 
        {
          var optStates = entry.$$states;
          
          // Dynamically build optimized state version 
          // Use a bitmask internalls to make every combination possible
          // Allows a maximum of 30 states per ID which should be enough
          if (!optStates)
          {
            entry.$$states = optStates = {};
            for (var i=0, l=styleStates.length; i<l; i++) {
              optStates[styleStates[i]] = 1<<i;
            }
          }
          
          var sum = 0;
          for (var state in states) {
            sum += optStates[state] || 0;
          }
          
          if (sum > 0) {
            unique += ":" + sum;
          }
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
          var base = this.styleFrom(id, states, entry.base);

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
      cache[unique] = result || null;

      // Return style map
      return result || null;
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__styleCache");
  }
});
