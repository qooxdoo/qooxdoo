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
#load(qx.lang.Object)

************************************************************************ */

/*
 * Bootstrapping needed to let qx.Clazz create itself
 */

qx.Clazz = {};

/** registers all defined classes */
qx.Clazz.registry = { "qx.Clazz" : qx.Clazz };

qx.Clazz.createNamespace = function(name, object)
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
}

/**
 * Class config
 *
 * Example:
 * qx.Clazz.define("name",
 * {
 *   "extend": SuperClass,
 *   "implement": [Interfaces],
 *   "include" : [Mixins],
 *
 *   "statics":
 *   {
 *     static_property1: 3.141,
 *     static_method1: function() {}
 *   },
 *
 *   "properties":
 *   {
 *     "tabIndex": {type: "number", init: -1}
 *   },
 *
 *   "members":
 *   {
 *     public_property1: 3.141,
 *     public_method1: function() {},
 *
 *     _protected_property: 3.141,
 *     _protected_method1: function() {},
 *   }
 * });
 *
 * @type object
 * @name define
 * @access public
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
qx.Clazz.define = function(name, config)
{
  console.log("Define: " + name);

  var key, value;
  var superclass, interfaces, mixins, settings, construct, statics, properties, members;





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
        construct = value;
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
    if (construct) {
      throw new Error("Superclass is undefined, but constructor was given for class: " + name);
    }

    // Create empty/non-empty class
    var classobj = {};
  }
  else
  {
    if (!construct) {
      throw new Error("Constructor is missing for class: " + name);
    }

    // Store class pointer
    var classobj = construct;
  }

  // Create namespace
  basename = qx.Clazz.createNamespace(name, classobj);

  // Store names in constructor/object
  classobj.classname = name;
  classobj.basename = basename;

  // Store class reference in global class registry
  qx.Clazz.registry[name] = classobj;







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
    Superclass
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
  classobj.constructor = protoobj.constructor = construct;

  // Store base constructor to constructor
  construct.base = superclass;







  /*
  ---------------------------------------------------------------------------
    Merge in the mixins
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
      } else if (value.compatible) {
        qx.OO.addProperty(value);
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
    var vTotal = interfaces.length;
    var vInterfaceMembers;

    for (i=0; i<vTotal; i++)
    {
      vInterfaceMembers = interfaces[i]._members;

      for (vProp in vInterfaceMembers)
      {
        if (typeof vInterfaceMembers[vProp] === "function")
        {
          if (typeof protoobj[vProp] === "undefined") {
            throw new Error("Implementation of method " + vProp + "() missing in class " + name + " required by interface " + interfaces[i].name);
          }
        }
        else if (typeof classobj[vProp] !== "undefined")
        {
          throw new Error("Existing property " + vProp + " in class " + name + " conflicts with interface " + interfaces[i].name);
        }
        else
        {
          // attach as class member. TODO: Does this make sense??
          classobj[vProp] = vInterfaceMembers[vProp];
        }
      }
    }
  }
};

/**
 * Determine if class exists
 *
 * @type object
 * @name isDefined
 * @access public
 * @param name {String} class name to check
 * @return {Boolean} true if class exists
 */
qx.Clazz.isDefined = function(name) {
  return this.registry[name] != null;
};
