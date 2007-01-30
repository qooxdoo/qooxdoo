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

#id(qx.Clazz)
#module(core)
#load(qx.Mixin)
#load(qx.Interface)
#load(qx.Settings)
#load(qx.Locale)

************************************************************************ */

/**
 * Verify existing namespace
 */
if (!window.qx) {
  qx = {};
}


/**
 * Bootstrap qx.Clazz
 */
qx.Clazz =
{
  define : function(name, config) {
    qx.Clazz = config.statics;
  }
};


/**
 * Stuff needed for qooxdoo's advanced JavaScript OO handling.
 */
qx.Clazz.define("qx.Clazz",
{
  statics :
  {
    /**
     * Stores all defined classes
     */
    registry : {},

    /**
     * Creates a given namespace and assigns the given object to the last part.
     *
     * @param name {String} The namespace including the last (class) name
     * @param object {Object} The data to attach to the namespace
     */
    createNamespace : function(name, object)
    {
      var splits = name.split(".");
      var len = splits.length;
      var parent = window;
      var part = splits[0];

      for (var i=0, l=len-1; i<l; i++)
      {
        if (!parent[part]) {
          parent[part] = {};
        }

        parent = parent[part];
        part = splits[i + 1];
      }

      // store object
      parent[part] = object;

      // return last part name (e.g. classname)
      return part
    },

    /**
     * Class config
     *
     * Example:
     * <pre>
     * qx.Clazz.define("name",
     * {
     *   extend: Object, // superclass
     *   implement: [Interfaces],
     *   include : [Mixins],
     *
     *   statics:
     *   {
     *     CONSTANT : 3.141,
     *
     *     publicMethod: function() {},
     *     _protectedMethod: function() {},
     *     __privateMethod: function() {}
     *   },
     *
     *   properties:
     *   {
     *     "tabIndex": { compat : true, type: "number", defaultValue : -1 }
     *   },
     *
     *   members:
     *   {
     *     publicProperty: "foo",
     *     publicMethod: function() {},
     *
     *     _protectedProperty: "bar",
     *     _protectedMethod: function() {},
     *
     *     __privateProperty: "baz",
     *     __privateMethod: function() {}
     *   }
     * });
     * </pre>
     *
     * @param name {String} class name
     * @param config {Map ? null} config structure
     * @param config.extend {Function ? null} superclass class
     * @param config.implement {Array ? null} list of interfaces that need to be implemented
     * @param config.include {Array ? null} list of mixins to include
     * @param config.settings {Map ? null} hash of settings for this class
     * @param config.init {Function ? null} constructor method to run on each initialization
     * @param config.statics {Map ? null} hash of static properties and methods ("class members")
     * @param config.properties {Map ? null} hash of properties with generated setters and getters
     * @param config.members {Map ? null} hash of regular properties and methods ("instance members")
     * @param config.defer {Function ? null} function to be called for post-processing
     * @param config.abstract {boolean ? false} is abstract class
     * @param config.singleton {boolean ? false} is singleton class
     * @param config.events {Array ? null} list of events the class is able to fire
     * @return {void}
     * @throws TODOC
     */
    define : function(name, config)
    {
      var key, value;
      var superclass, interfaces, mixins, settings, init, statics, properties, members;





      /*
      ---------------------------------------------------------------------------
        Read in configuration map
      ---------------------------------------------------------------------------
      */

      for (key in config)
      {
        value = config[key];

        if (value == null) {
          throw new Error("Invalid key '" + key + "' in class '" + name + "'! The value is undefined/null!");
        }

        switch(key)
        {
          case "extend":
            superclass = value;
            break;

          case "implement":
            // Normalize to array structure
            if (!(value instanceof Array)) {
              value = [value];
            }
            interfaces = value;
            break;

          case "include":
            // Normalize to array structure
            if (!(value instanceof Array)) {
              value = [value];
            }
            mixins = value;
            break;

          case "settings":
            settings = value;
            break;

          case "init":
            init = value;
            break;

          case "statics":
            statics = value;
            break;

          case "properties":
            properties = value;
            break;

          case "members":
            members = value;
            break;

          default:
            throw new Error("The configuration key '" + key + "' in class '" + name + "' is not allowed!");
        }
      }






      /*
      ---------------------------------------------------------------------------
        Create class
      ---------------------------------------------------------------------------
      */

      if (!superclass)
      {
        if (init) {
          throw new Error("Superclass is undefined, but constructor was given for class: " + name);
        }

        // Create empty/non-empty class
        var classobj = {};
      }
      else
      {
        if (!init) {
          throw new Error("Constructor is missing for class: " + name);
        }

        // Store class pointer
        var classobj = init;
      }

      // Create namespace
      var basename = qx.Clazz.createNamespace(name, classobj);

      // Store names in constructor/object
      classobj.classname = name;
      classobj.basename = basename;

      // Store class reference in global class registry
      qx.Clazz.registry[name] = classobj;

      // Compatibility to old properties etc.
      qx.Class = classobj;
      qx.Proto = null;





      /*
      ---------------------------------------------------------------------------
        Settings
      ---------------------------------------------------------------------------
      */

      if (settings)
      {
        for (var key in settings) {
          qx.Settings.setDefault(key, settings[key]);
        }
      }






      /*
      ---------------------------------------------------------------------------
        Attach static class members
      ---------------------------------------------------------------------------
      */

      if (statics)
      {
        for (var vProp in statics)
        {
          classobj[vProp] = statics[vProp];

          // Added helper stuff to functions
          if (typeof statics[vProp] == "function")
          {
            // Configure class
            classobj[vProp].statics = classobj;
          }
        }
      }







      /*
      ---------------------------------------------------------------------------
        Superclass support
      ---------------------------------------------------------------------------
      */

      // For static classes we're done now
      if (!superclass) {
        return;
      }

      // Use helper function/class to save the unnecessary constructor call while
      // setting up inheritance. Safari does not support "new Function"
      var helper = function() {};
      helper.prototype = superclass.prototype;
      var protoobj = new helper;

      // Apply prototype to new helper instance
      classobj.prototype = protoobj;

      // Store names in prototype
      protoobj.classname = name;
      protoobj.basename = basename;

      // Store reference to superclass class
      classobj.superclass = protoobj.superclass = superclass;

      // Store correct constructor
      classobj.constructor = protoobj.constructor = init;

      // Store base constructor to constructor
      init.base = superclass;

      // Compatibility to old properties etc.
      qx.Proto = protoobj;






      /*
      ---------------------------------------------------------------------------
        Merge in the Mixins
      ---------------------------------------------------------------------------
      */

      if (mixins)
      {
        var mixinMembers;

        for (var i=0, l=mixins.length; i<l; i++)
        {
          // Attach members
          mixinMembers = mixins[i]._members;

          for (var key in mixinMembers) {
            protoobj[key] = mixinMembers[key];
          }
        }
      }







      /*
      ---------------------------------------------------------------------------
        Attach properties
      ---------------------------------------------------------------------------
      */

      if (properties)
      {
        for (var key in properties)
        {
          value = properties[key];
          value.name = key;

          if (value.fast) {
            qx.OO.addFastProperty(value);
          } else if (value.cached) {
            qx.OO.addCachedProperty(value);
          } else if (value.compat) {
            qx.OO.addProperty(value);
          } else {
            throw new Error("Could not handle property definition: " + key + " in Class " + name);
          }
        }
      }







      /*
      ---------------------------------------------------------------------------
        Attach instance members
      ---------------------------------------------------------------------------
      */

      if (members)
      {
        var superprotoobj = superclass.prototype;

        for (var key in members)
        {
          // Attach member
          value = protoobj[key] = members[key];

          // Added helper stuff to functions
          if (typeof value === "function")
          {
            if (superprotoobj[key])
            {
              // Configure superclass (named base here)
              value.base = superprotoobj[key];
            }

            // Configure class [TODO: find better name for statics here]
            value.statics = classobj;
          }
        }
      }







      /*
      ---------------------------------------------------------------------------
        Check interface implementation
      ---------------------------------------------------------------------------
      */

      if (interfaces)
      {
        // Only validate members in debug mode.
        // There is nothing more needed for builds
        if (qx.DEBUG)
        {
          var interfaceMembers;

          for (var i=0, l=interfaces.length; i<l; i++)
          {
            // Validate members
            interfaceMembers = interfaces[i]._members;

            for (key in interfaceMembers)
            {
              if (typeof protoobj[key] != "function") {
                throw new Error("Implementation of method " + key + "() is missing in Class " + name + " required by interface " + interfaces[i].name);
              }
            }
          }
        }

        // Attach statics
        // Validation is done in qx.Interface
        var interfaceStatics;

        for (var i=0, l=interfaces.length; i<l; i++)
        {
          interfaceStatics = interfaces[i]._statics;

          for (key in interfaceStatics) {
            classobj[key] = interfaceStatics[key];
          }
        }
      }
    },

    /**
     * Determine if class exists
     *
     * @param name {String} class name to check
     * @return {Boolean} true if class exists
     */
    isDefined : function(name) {
      return this.registry[name] != null;
    },


    /**
     * Include all features of the Mixin into the given Class. The Mixin must not include
     * any functions or properties which are already available. This is only possible using
     * the hackier patch method.
     *
     * @param target {Clazz} A class previously defined where the stuff should be attached.
     * @param mixin {Mixin} Include all features of this Mixin
     * @param overwrite {Boolean ? false} Overwrite existing functions and properties
     */
    __mixin : function(target, mixin, overwrite)
    {
      // Needs implementation


    },


    /**
     * Include all features of the Mixin into the given Class. The Mixin must not include
     * any functions or properties which are already available. This is only possible using
     * the hackier patch method.
     *
     * @param target {Clazz} A class previously defined where the stuff should be attached.
     * @param mixin {Mixin} Include all features of this Mixin
     */
    include : function(target, mixin) {
      return qx.Clazz.__mixin(target, mixin, false);
    },


    /**
     * Include all features of the Mixin into the given Class. The Mixin can include features
     * which are already defined in the target Class. Existing stuff gets overwritten. Please
     * be aware that this functionality is not the preferred way. You can damage working
     * Classes and features.
     *
     * @param target {Clazz} A class previously defined where the stuff should be attached.
     * @param mixin {Mixin} Include all features of this Mixin
     */
    patch : function(target, mixin) {
      return qx.Clazz.__mixin(target, mixin, true);
    }
  }
});
