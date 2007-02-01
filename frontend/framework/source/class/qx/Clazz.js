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

#module(oo)
#module(core)
#load(qx.Mixin)
#load(qx.Interface)
#load(qx.lang.Core)
#load(qx.core.Settings)
#load(qx.core.Variant)

************************************************************************ */

/**
 * Verify existing namespace
 */
if (!window.qx) {
  qx = {};
}


/**
 * Enable debugging
 */
qx.DEBUG = true;


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
     * <pre><code>
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
     *     "tabIndexOld": { type: "number", defaultValue : -1, compat : true }
     *     "tabIndex": { type: "number", init : -1 }
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
     * </code></pre>
     *
     * @param name {String} class name
     * @param config {Map ? null} config structure
     * @param config.extend {Function ? null} extend class
     * @param config.implement {Array ? null} list of implement that need to be implemented
     * @param config.include {Array ? null} list of include to include
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
      var extend, implement, include, settings, init, statics, properties, members;





      /*
      ---------------------------------------------------------------------------
        Read in configuration map
      ---------------------------------------------------------------------------
      */

      for (key in config)
      {
        value = config[key];

        if (value == null) {
          throw new Error('Invalid key "' + key + '" in class "' + name + '"! The value is undefined/null!');
        }

        switch(key)
        {
          case "extend":
            extend = value;
            break;

          case "implement":
            // Normalize to Array
            if (!(value instanceof Array)) {
              value = [value];
            }

            implement = value;
            break;

          case "include":
            // Normalize to Array
            if (!(value instanceof Array)) {
              value = [value];
            }

            include = value;
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
            throw new Error('The configuration key "' + key + '" in class "' + name + '" is not allowed!');
        }
      }






      /*
      ---------------------------------------------------------------------------
        Create Class
      ---------------------------------------------------------------------------
      */

      if (!extend)
      {
        if (init) {
          throw new Error('Superclass is undefined, but constructor was given for class: "' + name + "'");
        }

        // Create empty/non-empty class
        var obj = {};
      }
      else
      {
        if (!init) {
          throw new Error('Constructor is missing for class "' + name + "'");
        }

        // Store class pointer
        var obj = init;
      }

      // Create namespace
      var basename = qx.Clazz.createNamespace(name, obj);

      // Store names in constructor/object
      obj.classname = name;
      obj.basename = basename;

      // Store class reference in global class registry
      qx.Clazz.registry[name] = obj;

      // Compatibility to old properties etc.
      qx.Class = obj;
      qx.Proto = null;





      /*
      ---------------------------------------------------------------------------
        Settings
      ---------------------------------------------------------------------------
      */

      if (settings)
      {
        for (var key in settings)
        {
          if (qx.DEBUG)
          {
            if (key.substr(0, key.indexOf(".")) != name.substr(0, name.indexOf("."))) {
              throw new Error('Forbidden setting "' + key + '" found in "' + name + '". It forbidden to define a default setting for an external namespace!');
            }
          }

          qx.core.Settings.set(key, settings[key]);
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
          obj[vProp] = statics[vProp];

          // Added helper stuff to functions
          if (typeof statics[vProp] == "function")
          {
            // Configure class
            obj[vProp].statics = obj;
          }
        }
      }







      /*
      ---------------------------------------------------------------------------
        Superclass support
      ---------------------------------------------------------------------------
      */

      // For static classes we're done now
      if (!extend) {
        return;
      }

      // Use helper function/class to save the unnecessary constructor call while
      // setting up inheritance. Safari does not support "new Function"
      var helper = function() {};
      helper.prototype = extend.prototype;
      var prot = new helper;

      // Apply prototype to new helper instance
      obj.prototype = prot;

      // Store names in prototype
      prot.classname = name;
      prot.basename = basename;

      // Store reference to extend class
      obj.extend = prot.extend = extend;

      // Store correct constructor
      obj.constructor = prot.constructor = init;

      // Store base constructor to constructor
      init.base = extend;

      // Compatibility to old properties etc.
      qx.Proto = prot;






      /*
      ---------------------------------------------------------------------------
        Merge in the Mixins
      ---------------------------------------------------------------------------
      */

      if (include)
      {
        var imembers, iproperties;

        if (qx.DEBUG) {
          qx.Mixin.compatible(include, 'include list in Class "' + name + '".');
        }

        for (var i=0, l=include.length; i<l; i++)
        {
          // Attach members
          // Directly attach them. This is because we must not
          // modify them e.g. attaching base etc. because they may
          // used by multiple classes
          imembers = include[i].members;

          if (imembers == null) {
            throw new Error('Invalid include in class "' + name + '"! The value is undefined/null!');            
          }
          for (var key in imembers) {
            prot[key] = imembers[key];
          }

          // Attach properties
          iproperties = include[i].properties;
          for (var key in iproperties) {
            properties[key] = iproperties[key];
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
            throw new Error('Could not handle property definition "' + key + '" in Class "' + name + "'");
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
        var superprotoobj = extend.prototype;

        for (var key in members)
        {

          // add marker for the generator script
          if (!qx.BROWSER_OPTIMIZED) {

            // patch browser dependent methods
            if (typeof(members[key]) === "function" && key.indexOf("$") > 0)
            {
              var nameParts = key.split("$");
              var baseName = nameParts[0];
              var patch = false;
              for (var i=1; i<nameParts.length; i++) {
                if (qx.core.Client.getInstance().getEngine() == nameParts[i]) {
                  patch = true;
                  break;
                }
              }
              if (patch) {
                prot[baseName] = members[key];
              }
            }
          }

          // Attach member
          value = prot[key] = members[key];

          // Added helper stuff to functions
          if (typeof value === "function")
          {
            if (superprotoobj[key])
            {
              // Configure extend (named base here)
              value.base = superprotoobj[key];
            }

            // Configure class [TODO: find better name for statics here]
            value.statics = obj;
          }
        }
      }







      /*
      ---------------------------------------------------------------------------
        Check interface implementation
      ---------------------------------------------------------------------------
      */

      if (implement)
      {
        // Only validate members in debug mode.
        // There is nothing more needed for builds
        if (qx.DEBUG)
        {
          var interfaceMembers;

          for (var i=0, l=implement.length; i<l; i++)
          {
            // Validate members
            interfaceMembers = implement[i]._members;

            for (key in interfaceMembers)
            {
              if (typeof prot[key] != "function") {
                throw new Error('Implementation of method "' + key + '"() is missing in Class "' + name + '" required by interface "' + implement[i].name + "'");
              }
            }
          }
        }

        // Attach statics
        // Validation is done in qx.Interface
        var interfaceStatics;

        for (var i=0, l=implement.length; i<l; i++)
        {
          interfaceStatics = implement[i]._statics;

          for (key in interfaceStatics) {
            obj[key] = interfaceStatics[key];
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
