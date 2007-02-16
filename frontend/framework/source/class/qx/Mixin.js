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
      if (!config) {
        var config = {};
      }

      // Validate incoming data
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        this.__validateConfig(name, config);
      }

      // create mixin
      var mixin = this.__createMixin(name, config.members, config.statics, config.properties);

      // add includes
      if (config.include)
      {
        if (config.include.isMixin) {
          this.__addMixin(mixin, config.include);
        }
        else
        {
          for (var i=0, l=config.include.length; i<l; i++) {
            this.__addMixin(mixin, config.include[i]);
          }
        }
      }

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
    	return (clazz.$$INCLUDES[mixin.name] ? true : false);
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
          throw new Error('The configuration key "' + key + '" in class "' + name + '" is not allowed!');
        }

        if (config[key] == null) {
          throw new Error('Invalid key "' + key + '" in class "' + name + '"! The value is undefined/null!');
        }

        if (typeof config[key] !== allowedKeys[key]) {
          throw new Error('Invalid type of key "' + key + '" in class "' + name + '"! The type of the key must be "' + allowedKeys[key] + '"!');
        }
      }
    },


    /**
     * Creates a mixin.
     *
     * @type static
     * @param name {String} Full name of mixin
     * @param members {Map} Map of members of the mixin
     * @param statics {Map} Map of statics of the of the mixin
     * @param properties {Map} Map of property definitions.
     * @return {Mixin} The resulting mixin
     */
    __createMixin: function(name, members, statics, properties)
    {
      // Initialize object
      var mixin = {};

      // Create namespace
      var basename = qx.Clazz.createNamespace(name, mixin, false);

      // Store class reference in global mixin registry
      this.__registry[name] = mixin;

      // Attach data fields
      mixin.isMixin = true;
      mixin.name = name;
      mixin.basename = basename;

      // Attach functionality fields
      mixin.properties = properties || {};
      mixin.members = members || {};
      mixin.statics = statics || {};

      return mixin;
    },


    /**
     * Adds a Mixin to another Mixin
     *
     * @type static
     * @param to {Mixin} The target Mixin
     * @param from {Mixin} The source Mixin
     */
    __addMixin : function(to, from)
    {
      // Attach members
      var to_members = to.members;
      var from_members = from.members;

      for (var key in from_members) {
        to_members[key] = from_members[key];
      }

      // Attach statics
      var to_statics = to.statics;
      var from_statics = from.statics;

      for (var key in from_statics) {
        to_statics[key] = from_statics[key];
      }

      // Attach properties
      var to_properties = to.properties;
      var from_properties = from.properties;

      for (var key in from_properties) {
        to_properties[key] = from_properties[key];
      }
    }
  }
});
