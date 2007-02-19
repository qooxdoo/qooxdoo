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

#module(core)

************************************************************************ */

/**
 * This class is used to define mixins.
 *
 * Mixins are collections of code and variables, which can be merged into
 * other classes. They are similar to classes but don't support inheritence
 * and don't have a constructor.
 */
qx.Clazz.define("qx.Mixin",
{
  statics :
  {
    /*
    ---------------------------------------------------------------------------
       PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Define a new mixin.
     *
     * Example:
     * <pre><code>
     * qx.Mixin.define("name",
     * {
     *   "includes": [SuperMixins],
     *
     *   "properties": {
     *     "tabIndex": {type: "number", init: -1}
     *   },
     *
     *   "members":
     *   {
     *     prop1: "foo",
     *     meth1: function() {},
     *     meth2: function() {}
     *   }
     * });
     * </code></pre>
     *
     * @type static
     * @param name {String} name of the mixin
     * @param config {Map ? null} Mixin definition structure. The configuration map has the following keys:
     *   <table>
     *     <tr><th>Name</th><th>Type</th><th>Description</th></tr>
     *     <tr><th>include</th><td>Mixin[]</td><td>Array of mixins, which will be merged into the mixin.</td></tr>
     *     <tr><th>statics</th><td>Map</td><td>Map of statics of the mixin.</td></tr>
     *     <tr><th>members</th><td>Map</td><td>Map of members of the mixin.</td></tr>
     *     <tr><th>properties</th><td>Map</td><td>Map of property definitions. Format of the map: TODOC</td></tr>
     *   </table>
     */
    define : function(name, config)
    {
      if (config)
      {
        // Validate incoming data
        if (qx.core.Variant.isSet("qx.debug", "on")) {
          this.__validateConfig(name, config);
        }

        var mixin = config;
      }
      else
      {
        var mixin = {};
      }

      mixin.isMixin = true;
      mixin.name = name;
      mixin.basename = qx.Clazz.createNamespace(name, mixin);

      // Store class reference in global mixin registry
      this.__registry[name] = mixin;

      // Return final class object
      return mixin;
    },


    /**
     * Returns a Mixin by name
     *
     * @type static
     * @param name {String} class name to resolve
     * @return {Class} the class
     */
    getByName : function(name) {
      return this.__registry[name];
    },


    /**
     * Determine if Mixin exists
     *
     * @type static
     * @name isDefined
     * @access public
     * @param name {String} Mixin name to check
     * @return {Boolean} true if Mixin exists
     */
    isDefined : function(name) {
      return arguments.callee.self.getByName(name) !== undefined;
    },


    /**
     * Whether a given class includes a mixin.
     *
     * @type static
     * @param clazz {Class} class to check
     * @param mixin {Mixin} the mixin to check for
     * @return {Boolean} whether the class includes the mixin.
     */
    hasMixin: function(clazz, mixin) {
    	return (clazz.$$includes[mixin.name] ? true : false);
    },




    /*
    ---------------------------------------------------------------------------
       PRIVATE FUNCTIONS AND DATA
    ---------------------------------------------------------------------------
    */

    /** Registers all defined Mixins */
    __registry : {},

    /**
     * Validates incoming configuration and checks keys and values
     *
     * @type static
     * @param name {String} The name of the class
     * @param config {Map} Configuration map
     */
    __validateConfig : function(name, config)
    {
      var allowedKeys =
      {
        "include"    : "object", // Mixin | Mixin[]
        "statics"    : "object", // Map
        "members"    : "object", // Map
        "properties" : "object"  // Map
      }

      for (var key in config)
      {
        if (!allowedKeys[key]) {
          throw new Error('The configuration key "' + key + '" in mixin "' + name + '" is not allowed!');
        }

        if (config[key] == null) {
          throw new Error('Invalid key "' + key + '" in mixin "' + name + '"! The value is undefined/null!');
        }

        if (typeof config[key] !== allowedKeys[key]) {
          throw new Error('Invalid type of key "' + key + '" in mixin "' + name + '"! The type of the key must be "' + allowedKeys[key] + '"!');
        }
      }

      if (config.include instanceof Array)
      {
        for (var i=0; i<config.include.length; i++) {
          if (!config.include[i].isMixin) {
            throw new Error("Includes of mixins must be mixins. Include number '"+i+"' in mixin '"+name+"'is not a mixin!");
          }
        }
      } else if (config.include && !config.include.isMixin) {
        throw new Error("Includes of mixins must be mixins. The include in mixin '"+name+"' is not a mixin!");        
      }

      if (config.include)
      {
        if (config.include.isMixin) {
          this.__checkCompatibility(config.include);
        } else {
          this.__checkCompatibility.apply(this, config.include);
        }
      }
    },

    /**
     * Check compatiblity between Mixins (including their includes)
     *
     * @param mixins {Mixin | Mixin[]} A single Mixin or an Array of Mixins
     */
    checkCompatibility : function(mixins)
    {
      var statics = {};
      var properties = {};
      var members = {};

      if (mixins.isMixin) {
        mixins = [mixins];
      }

      for (var i=0, l=mixins.length; i<l; i++) {
        this.__checkCompatibilityRecurser(mixins[i], statics, properties, members);
      }
    },

    /**
     * Check compatiblity between Mixins
     *
     * @param mixin {Mixin} the mixin to test
     * @param statics {Map} successive build Map of already found static fields
     * @param properties {Map} successive build Map of already found properties
     * @param members {Map} successive build Map of already found members
     * @see checkCompatibility
     */
    __checkCompatibilityRecurser : function(mixin, statics, properties, members)
    {
      for (var key in mixin.statics)
      {
        if(statics[key]) {
          throw new Error('Conflict between Mixin "' + mixin.name + '" and "' + statics[key] + '" in static member "' + key + '"!');
        }

        statics[key] = mixin.name;
      }

      for (var key in mixin.properties)
      {
        if(properties[key]) {
          throw new Error('Conflict between Mixin "' + mixin.name + '" and "' + properties[key] + '" in property "' + key + '"!');
        }

        properties[key] = mixin.name;
      }

      for (var key in mixin.members)
      {
        if(members[key]) {
          throw new Error('Conflict between Mixin "' + mixin.name + '" and "' + members[key] + '" in member "' + key + '"!');
        }

        members[key] = mixin.name;
      }

      if (mixin.include)
      {
        var includes = mixins.isMixin ? [mixins.isMixin] : mixins.isMixin;

        for (var i=0, l=includes.length; i<l; i++) {
          this.__checkCompatibilityRecurser(includes[i], statics, properties, members);
        }
      }
    }
  }
});
