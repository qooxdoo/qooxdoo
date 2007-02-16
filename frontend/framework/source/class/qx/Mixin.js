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
     * @param config {Map} Mixin definition structure. The configuration map has the following keys:
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

      // Validate incoming data
      this.__validateConfig(name, config);

      // create mixin
      var mixin = this.__createMixin(name, config.members, config.statics, config.properties);

      // add includes
      if (config.include)
      {
        this.__addMixins(mixin, config.includes);
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
     * @access public
     * @param name {String} Mixin name to check
     * @return {Boolean} true if Mixin exists
     */
    isDefined : function(name) {
      return arguments.callee.self.getByName(name) !== undefined;
    },


    /**
     * Check if a list of mixins are disjunct. Disjunct here means that
     * two different interfaces have no members, statics or properties
     * of the same name.
     *
     * @type static
     * @param mixins {Mixin[]} List of Mixins to check.
     * @return {Boolean} whether the interfaces are compatibble.
     */
    areCompatible : function(mixins)
    {
      if (mixins.length < 2) {
        return true;
      }

      var kmembers = {};
      var kstatics = {};
      var kproperties = {};

      for (var i=0, l=mixins.length; i<l; i++)
      {
        // Check members
        var emembers = mixins[i].members;

        for (var key in emembers)
        {
          if (key in kmembers) {
            throw new Error('Double defintion of member "' + key + '"');
          }

          kmembers[key] = true;
        }

        // Check statics
        var estatics = mixins[i].statics;

        for (var key in estatics)
        {
          if (key in kstatics) {
            throw new Error('Double defintion of member "' + key + '"');
          }

          kstatics[key] = true;
        }

        // Check properties
        var eproperties = mixins[i].properties;

        for (var key in eproperties)
        {
          if (key in kproperties) {
            throw new Error('Double defintion of property "' + key + '"');
          }

          kproperties[key] = true;
        }
      }
    },


    /**
     * Whether a given class includes a mixin.
     *
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
    registry : {},

    /**
     * Validates incoming configuration and checks keys and values
     *
     * @param name {String} The name of the class
     * @param config {Map} Configuration map
     */
    __validateConfig : function(name, config)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        var allowedKeys = {
          "include": 1,
          "statics": 1,
          "members": 1,
          "properties": 1
        }

        for (var key in config) {
          if (!allowedKeys[key]) {
            throw new Error('The configuration key "' + key + '" in class "' + name + '" is not allowed!');
          }
          if (config[key] == null) {
            throw new Error("Invalid key '" + key + "' in class '" + name + "'! The value is undefined/null!");
          }
        }
      }
    },


    /**
     * Creates a mixin.
     *
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

      // Add to registry
      qx.Mixin.registry[name] = mixin;

      // Attach data fields
      mixin.isMixin = true;
      mixin.name = name;
      mixin.basename = basename;
      mixin.properties = properties || {};
      mixin.members = members || {};
      mixin.statics = statics || {};

      return mixin;
    },


    /**
     * Attach mixins to this mixin
     *
     * @param mixin {Mixin} Class to add mixins to
     * @param includes {Mixin[]} The map of mixins to attach
     */
    __addMixins: function(mixin, includes)
    {
    	if (includes && !(includes instanceof Array)) {
      	includes = [ includes ];
     	}

      if (qx.core.Variant.isSet("qx.debug", "on")) {
        arguments.callee.self.areCompatible(include);
      }

      for (var i=0, l=includes.length; i<l; i++)
      {
        // Attach members
        var emembers = includes[i].members;

        for (var key in emembers) {
          mixin.members[key] = emembers[key];
        }

        // Attach statics
        var estatics = includes[i].statics;

        for (var key in emembers) {
          mixin.statics[key] = estatics[key];
        }

        // Attach properties
        var eproperties = includes[i].properties;

        for (var key in eproperties) {
          mixin.properties[key] = eproperties[key];
        }
      }
    }

  }
});
