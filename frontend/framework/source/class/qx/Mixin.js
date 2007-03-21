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
 *
 * To define a new mixin the {@link #define} method is used.
 */
qx.Class.define("qx.Mixin",
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
     *     <tr><th>statics</th><td>Map</td><td>
     *         Map of statics of the mixin. The statics will not get copied into the target class. They remain
     *         acceccible from the mixin. This is the same behaviour as statics in Interfaces ({@link qx.Interface#define}).
     *     </td></tr>
     *     <tr><th>members</th><td>Map</td><td>Map of members of the mixin.</td></tr>
     *     <tr><th>properties</th><td>Map</td><td>Map of property definitions. Format of the map: TODOC</td></tr>
     *     <tr><th>events</th><td>Map</td><td>
     *         Map of events the mixin fires. The keys are the names of the events and the values are
     *         corresponding event type classes.
     *     </td></tr>
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

        // Create Interface from statics
        var mixin = config.statics ? config.statics : {};

        // Attach configuration
        if (config.construct) {
          mixin.$$construct = config.construct;
        }
                
        if (config.include) {
          mixin.$$include = config.include instanceof Array ? config.include : [config.include];
        }
        
        if (config.properties) {
          mixin.$$properties = config.properties;
        }
        
        if (config.members) {
          mixin.$$members = config.members;
        }
        
        if (config.events) {
          mixin.$$events = config.events;
        }
        
        if (config.destruct) {
          mixin.$$destruct = config.destruct;
        }
      }
      else
      {
        var mixin = {};
      }

      // Add basics
      mixin.$$type = "Mixin";
      mixin.name = name;

      // Assign to namespace
      mixin.basename = qx.Class.createNamespace(name, mixin);

      // Store class reference in global mixin registry
      this.__registry[name] = mixin;

      // Return final Mixin
      return mixin;
    },


    /**
     * Check compatiblity between Mixins (including their includes)
     *
     * @param mixins {Mixin[]} An Array of Mixins
     */
    checkCompatibility : function(mixins)
    {
      var properties = {};
      var members = {};
      var events = {};

      for (var i=0, l=mixins.length; i<l; i++) {
        this.__checkCompatibilityRecurser(mixins[i], events, properties, members);
      }
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
     * @param name {String} Mixin name to check
     * @return {Boolean} true if Mixin exists
     */
    isDefined : function(name) {
      return arguments.callee.self.getByName(name) !== undefined;
    },


    /**
     * Determine the number of mixins which are defined
     *
     * @type static
     * @return {Number} the number of classes
     */
    getNumber : function() {
      return qx.lang.Object.getLength(this.__registry);
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
        "include"    : "object",   // Mixin | Mixin[]
        "statics"    : "object",   // Map
        "members"    : "object",   // Map
        "properties" : "object",   // Map
        "destruct"   : "function", // Function
        "construct"  : "function", // Function
        "events"     : "object"    // Map
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

      if (config.include)
      {
        var include = config.include;
        
        if (!(include instanceof Array)) {
          include = [include];
        }
        
        for (var i=0, l=include.length; i<l; i++)
        {
          if (include[i] == null) {
            throw new Error("Includes of mixins must be mixins. The include number '" + (i+1) + "' in mixin '" + name + "'is undefined/null!");
          }

          if (include[i].$$type !== "Mixin") {
            throw new Error("Includes of mixins must be mixins. The include number '" + (i+1) + "' in mixin '" + name + "'is not a mixin!");
          }
        }

        this.checkCompatibility(include);
      }
    },
    

    /**
     * Check compatiblity between Mixins
     *
     * @param mixin {Mixin} the mixin to test
     * @param events {Map} successive build Map of already found events
     * @param properties {Map} successive build Map of already found properties
     * @param members {Map} successive build Map of already found members
     * @see checkCompatibility
     */
    __checkCompatibilityRecurser : function(mixin, events, properties, members)
    {
      for (var key in mixin.events)
      {
        if(events[key]) {
          throw new Error('Conflict between Mixin "' + mixin.name + '" and "' + events[key] + '" in member "' + key + '"!');
        }

        events[key] = mixin.name;
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
        for (var i=0, a=mixin.$$include, l=a.length; i<l; i++) {
          this.__checkCompatibilityRecurser(a[i], events, properties, members);
        }    
      }
    }
  }
});
