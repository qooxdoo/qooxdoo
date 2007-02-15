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

qx.Clazz.define("qx.Mixin",
{
  statics :
  {
    /** Registers all defined Mixins */
    registry : {},

    /**
     * Mixin config
     *
     * Example:
     * <pre>
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
     * </pre>
     *
     * @type static
     * @name define
     * @access public
     * @param name {String} name of the mixin
     * @param config {Map} config structure
     * @return {void}
     * @throws TODOC
     */
    define : function(name, config)
    {
      /*
      ---------------------------------------------------------------------------
        Verify in configuration map
      ---------------------------------------------------------------------------
      */

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


     /*
      ---------------------------------------------------------------------------
        Initialize aliases
      ---------------------------------------------------------------------------
      */

      var include = config.extent;
    	if (include && !(include instanceof Array)) {
      	include = [ include ];
     	}

      var statics = config.statics || {};
      var members = config.members || {};
      var properties = config.properties || {};


     /*
      ---------------------------------------------------------------------------
        Create Mixin
      ---------------------------------------------------------------------------
      */

      // Initialize object
      var obj = {};

      // Create namespace
      var basename = qx.Clazz.createNamespace(name, obj, false);

      // Add to registry
      qx.Mixin.registry[name] = obj;

      // Attach data fields
      obj.name = name;
      obj.basename = basename;
      obj.properties = properties;
      obj.members = members;
      obj.statics = statics;




      /*
      ---------------------------------------------------------------------------
        Extend Mixin
      ---------------------------------------------------------------------------
      */

      if (include)
      {
        var emembers, eproperties;

        if (qx.core.Variant.isSet("qx.debug", "on")) {
          arguments.callee.self.areCompatible(include);
        }

        for (var i=0, l=include.length; i<l; i++)
        {
          // Attach members
          emembers = include[i].members;

          for (var key in emembers) {
            members[key] = emembers[key];
          }

          // Attach members
          eproperties = include[i].properties;

          for (var key in eproperties) {
            properties[key] = eproperties[key];
          }
        }
      }
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
      return arguments.callee.self.byName(name) !== undefined;
    },

    /**
     * Checks a list of Mixins for conflicts.
     *
     * @type static
     * @name areCompatible
     * @access public
     * @param list {Array} List of Mixins
     * @param msg {var} TODOC
     * @return {void}
     * @throws TODOC
     */
    areCompatible : function(list)
    {
      if (list.length < 2) {
        return true;
      }

      var kmembers = {};
      var kstatics = {};
      var kproperties = {};

      for (var i=0, l=list.length; i<l; i++)
      {
        // Check members
        var emembers = list[i].members;

        for (var key in emembers)
        {
          if (key in kmembers) {
            throw new Error('Double defintion of member "' + key + '"');
          }

          kmembers[key] = true;
        }

        // Check statics
        var estatics = list[i].statics;

        for (var key in estatics)
        {
          if (key in kstatics) {
            throw new Error('Double defintion of member "' + key + '"');
          }

          kstatics[key] = true;
        }

        // Check properties
        var eproperties = list[i].properties;

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
    hasMixin: function(clazz, mixin)
    {
    	return (clazz.$$INCLUDES[mixin.name] ? true : false);
    }
    
  }
});
