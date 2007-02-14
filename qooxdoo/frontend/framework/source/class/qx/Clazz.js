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
#require(qx.core.Bootstrap)
#require(qx.core.Variant)
#require(qx.core.Setting)

************************************************************************ */

/**
 * Stuff needed for qooxdoo's advanced JavaScript OO handling.
 */
qx.Clazz.define("qx.Clazz",
{
  statics :
  {
    /**
     * Class config
     *
     * Example:
     * <pre><code>
     * qx.Clazz.define("name",
     * {
     *   extend : Object, // superclass
     *   implement : [Interfaces],
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
     * @param config {Map} config structure
     * @param config.type {String ? null}  type of class ("abstract" | "static" | "singleton")
     * @param config.extend {Function ? null} extend class
     * @param config.implement {Array ? null} list of implement that need to be implemented
     * @param config.include {Array ? null} list of include to include
     * @param config.construct {Function ? null} constructor method to run on each initialization
     * @param config.statics {Map ? null} hash of static properties and methods ("class members")
     * @param config.properties {Map ? null} hash of properties with generated setters and getters
     * @param config.members {Map ? null} hash of regular properties and methods ("instance members")
     * @param config.defer {Function ? null} function to be called for post-processing
     * @param config.settings {Map ? null} hash of settings for this class
     * @param config.variants {Map ? null} hash of settings for this class
     * @param config.events {Array ? null} list of events the class is able to fire
     * @return {void}
     * @throws TODOC
     */
    define : function(name, config)
    {
      // Validate incoming data
      this.__validateConfig(name, config);

      // Create class
      var clazz = this.__createClass(name, config.type, config.extend, config.construct, config.statics);

      // Process basics
      this.__processSettings(clazz, config.settings);
      this.__processVariants(clazz, config.variants);

      // Members, Properties and Mixins are only available in static classes
      if (config.extend)
      {
        this.__addMembers(clazz, config.members);
        this.__addProperties(clazz, config.properties);
        this.__addMixins(clazz, config.include);
      }

      // Interfaces are available in both
      this.__addInterfaces(clazz, config.implement);
    },

    /**
     * Creates a given namespace and assigns the given object to the last part.
     *
     * @param name {String} The namespace including the last (class) name
     * @param object {Object} The data to attach to the namespace
     * @param forceOverwrite {Boolean} whether an object should be overwritten if it already exists
     *   in the namespace.
     * @return {Object} last part of the namespace (e.g. classname)
     */
    createNamespace : function(name, object, forceOverwrite)
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
      if (!forceOverwrite && parent[part] != undefined) {
        throw new Error("An object of the name '" + name + "' aready exists and overwriting is not allowed!");
      }
      parent[part] = object;

      // return last part name (e.g. classname)
      return part;
    },

    /**
     * Determine if class exists
     *
     * @type static
     * @name isDefined
     * @access public
     * @param name {String} class name to check
     * @return {Boolean} true if class exists
     */
    isDefined : function(name) {
      return this.__registry[name] != null;
    },

    /**
     * Returns a class by name
     *
     * @type static
     * @name get
     * @access public
     * @param name {String} class name to resolve
     * @return {Class|undefined} the class
     */
    get : function(name) {
      return this.__registry[name];
    },

    /**
     * Include all features of the Mixin into the given Class. The Mixin must not include
     * any functions or properties which are already available. This is only possible using
     * the hackier patch method.
     *
     * @param target {Class} A class previously defined where the stuff should be attached.
     * @param mixin {Mixin} Include all features of this Mixin
     */
    include : function(target, mixin) {
      return qx.Clazz.__mixin(target, mixin, false);
    },

    /**
     * Include all features of the Mixin into the given Class. The Mixin can include features
     * which are already defined in the target Class. Existing stuff gets overwritten. Please
     * be aware that this functionality is not the preferred way.
     *
     * <b>WARNING</b>: You can damage working Classes and features.
     *
     * @param target {Class} A class previously defined where the stuff should be attached.
     * @param mixin {Mixin} Include all features of this Mixin
     */
    patch : function(target, mixin) {
      return qx.Clazz.__mixin(target, mixin, true);
    },








    /** Stores all defined classes */
    __registry : {},

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
        var allowedKeys =
        {
          "extend": 1,
          "implement": 1,
          "include": 1,
          "construct": 1,
          "type": 1,
          "statics": 1,
          "members": 1,
          "properties": 1,
          "settings": 1,
          "variants": 1
        };

        for (var key in config)
        {
          if (!allowedKeys[key]) {
            throw new Error('The configuration key "' + key + '" in class "' + name + '" is not allowed!');
          }

          if (config[key] == null) {
            throw new Error('Invalid key "' + key + '" in class "' + name + '"! The value is undefined/null!');
          }
        }

        if (!config.extend)
        {
          if (config.construct) {
            throw new Error('Superclass is undefined, but Constructor was given for class: "' + name + '"!');
          }
        }
        else
        {
          if (!config.construct) {
            throw new Error('Constructor is missing for class "' + name + '"!');
          }
        }

        if (!config.extend && (config.members || config.properties || config.mixins)) {
          throw new Error('Members, Properties and Mixins are not allowed for static class: "' + name + '"!');
        }
      }
    },

    /**
     * Helper to handle singletons
     */
    __getInstance : function()
    {
      if (!this.$$INSTANCE)
      {
        this.$$ALLOWCONSTRUCT = true;
        this.$$INSTANCE = new this;
        delete this.$$ALLOWCONSTRUCT;
      }

      return this.$$INSTANCE;
    },

    /**
     * Creates a class by type. Supports modern inheritance etc.
     *
     * @param name {String} Full name of class
     * @param type {String ? null} Name of the class
     * @param extend {Class ? null} Superclass to inherit from
     * @param construct {Function ? null} Constructor of new class
     * @param statics {Map ? null} Static methods field
     * @return {Class} The resulting class
     */
    __createClass : function(name, type, extend, construct, statics)
    {
      var clazz;

      if (!extend)
      {
        // Create empty/non-empty class
        clazz = statics || {};
      }
      else
      {
        // Store class pointer
        if (type == "abstract")
        {
          clazz = this.__createAbstractConstructor(name, construct);
        }
        else if (type == "singleton")
        {
          clazz = this.__createSingletonConstructor(construct);
          clazz.getInstance = this.__getInstance;
        }
        else
        {
          clazz = construct;
        }

        // Copy statics
        if (statics)
        {
          for (var key in statics) {
            clazz[key] = statics[key];
          }
        }
      }

      // Create namespace
      var basename = this.createNamespace(name, clazz, false);

      // Store names in constructor/object
      clazz.classname = name;
      clazz.basename = basename;

      if (extend)
      {
        // Use helper function/class to save the unnecessary constructor call while
        // setting up inheritance.
        var helper = this.__createEmptyFunction();
        helper.prototype = extend.prototype;
        var proto = new helper;

        // Apply prototype to new helper instance
        clazz.prototype = proto;

        // Store names in prototype
        proto.classname = name;
        proto.basename = basename;

        // Store reference to extend class
        clazz.superclass = proto.superclass = extend;

        // Store correct constructor
        clazz.constructor = proto.constructor = construct;

        // Store base constructor to constructor
        construct.base = extend;

        // Compatibility to qooxdoo 0.6.x
        qx.Class = clazz;
        qx.Proto = proto;
        qx.Super = extend;

        // Copy property lists
        if (extend.prototype._properties) {
          proto._properties = qx.lang.Object.copy(extend.prototype._properties);
        }

        if (extend.prototype._objectproperties) {
          proto._objectproperties = qx.lang.Object.copy(extend.prototype._objectproperties);
        }
      }

      // Store class reference in global class registry
      this.__registry[name] = clazz;

      // Return final class object
      return clazz;
    },

    /**
     * Define settings for a class
     *
     * @param settings {Map ? null} Maps the setting name to the default value.
     * @param className {String} name of the class defining the setting
     */
    __processSettings: function(clazz, settings)
    {
      if (!settings) {
        return;
      }

      for (var key in settings)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (key.substr(0, key.indexOf(".")) != clazz.classname.substr(0, clazz.classname.indexOf("."))) {
            throw new Error('Forbidden setting "' + key + '" found in "' + clazz.classname + '". It is forbidden to define a default setting for an external namespace!');
          }
        }

        qx.core.Setting.define(key, settings[key]);
      }
    },

    /**
     * Define variants for a class
     *
     * @param variants {Map ? null} Map of definitions of variants. The key is the name of the variant.
     *   The value is a map with the following keys:
     *   <ul>
     *     <li>allowedValues: array of allowed values</li>
     *     <li>defaultValue: default value</li>
     *   </ul>
     * @param className {String} name of the class defining the variant.
     */
    __processVariants: function(clazz, variants)
    {
      if (!variants) {
        return;
      }

      for (var key in variants)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (key.substr(0, key.indexOf(".")) != clazz.classname.substr(0, clazz.classname.indexOf("."))) {
            throw new Error('Forbidden variant "' + key + '" found in "' + clazz.classname + '". It is forbidden to define a variant for an external namespace!');
          }
        }

        qx.core.Variant.define(key, variants[key].allowedValues, variants[key].defaultValue);
      }
    },

    /**
     * Wrapper for qx.OO.addProperty. This is needed in two places so the code
     * has been extracted. The global variables qx.Class, qx.Proto and qx.Super
     * must be set before this method is called.
     *
     * @param clazz {Clazz} class to add the properties to
     * @param properties {Map} new class style property definitions
     */
    __addProperties: function(clazz, properties)
    {
      if (!properties) {
        return;
      }

      var legacy = qx.core.LegacyProperty;
      var proto = clazz.prototype;

      for (var name in properties)
      {
        var property = properties[name];

        var value = property;
        value.name = name;

        if (value.fast) {
          legacy.addFastProperty(value, proto);
        } else if (value.cached) {
          legacy.addCachedProperty(value, proto);
        } else if (value.compat) {
          legacy.addProperty(value, proto);
        } else {
          throw new Error('Could not handle property definition "' + key + '" in Class "' + qx.Proto.classname + "'");
        }
      }
    },

    /**
     * Attach members to a class
     *
     * @param clazz {Class} Class to add members to
     * @param members {Map} The map of members to attach
     */
    __addMembers: function(clazz, members)
    {
      if (!members) {
        return;
      }

      var proto = clazz.prototype;
      var superproto = clazz.superclass.prototype;

      for (var key in members)
      {
        // Attach member
        var member = proto[key] = members[key];

        // Added helper stuff to functions
        if (typeof member === "function")
        {
          // Configure extend (named base here)
          if (superproto[key]) {
            member.base = superproto[key];
          }

          // Configure class [TODO: find better name for statics here]
          member.statics = clazz;
        }
      }
    },

    /**
     * Attach mixins to a class
     *
     * @param clazz {Class} Class to add mixins to
     * @param mixins {Map} The map of mixins to attach
     */
    __addMixins : function(clazz, mixins)
    {
      if (!mixins) {
        return;
      }

      if (!(mixins instanceof Array)) {
        mixins = [mixins];
      }

      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.Mixin.compatible(mixins, 'include list in Class "' + name + '".');
      }

      for (var i=0, l=mixins.length; i<l; i++) {
        this.__mixin(clazz, mixins[i], false);
      }
    },

    /**
     * Attach interfaces to a class
     *
     * @param clazz {Class} Class to add interfaces to
     * @param interfaces {Map} The map of interfaces to attach/check
     */
    __addInterfaces : function(clazz, interfaces)
    {
      if (!interfaces) {
        return;
      }

      if (!(interfaces instanceof Array)) {
        interfaces = [interfaces];
      }

      // initialize registry
      clazz.$$IMPLEMENTS = {};

      for (var i=0, l=interfaces.length; i<l; i++)
      {
        // Only validate members in debug mode.
        // There is nothing more needed for builds
        if (qx.core.Variant.isSet("qx.debug", "on")) {
          qx.Interface.assertInterface(clazz, interfaces[i], true);
        }

        // copy primitive static fields
        var interfaceStatics = interfaces[i].statics;
        for (key in interfaceStatics)
        {
          if (typeof(interfaceStatics[key]) != "function")
          {
            // Attach statics
            // Validation is done in qx.Interface
            clazz[key] = interfaceStatics[key];
          }
        }

        // save interface name
        clazz.$$IMPLEMENTS[interfaces[i].name] = interfaces[i];
      }
    },







    /**
     * Include all features of the Mixin into the given Class.
     *
     * @access private
     * @param clazz {Clazz} A class previously defined where the mixin should be attached.
     * @param mixin {Mixin} Include all features of this Mixin
     * @param overwrite {Boolean} Overwrite existing functions and properties
     */
    __mixin : function(clazz, mixin, overwrite)
    {
      // Attach members
      // Directly attach them. This is because we must not
      // modify them e.g. attaching base etc. because they may
      // used by multiple classes
      var members = mixin.members;
      var proto = clazz.prototype;

      if (members == null) {
        throw new Error('Invalid include in class "' + proto.classname + '"! The value is undefined/null!');
      }

      for (var key in members)
       {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (!overwrite && proto[key] != undefined) {
            throw new Error("Overwriting the member '" + key + "' is not allowed!");
          }
        }
        proto[key] = members[key];
      }

      // Attach statics
      var statics = mixin.statics;
      for (var key in statics)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (!overwrite && clazz[key] != undefined) {
            throw new Error("Overwriting the static '" + key + "' is not allowed!");
          }
        }
        clazz[key] = statics[key];
      }

      // Attach properties
      var properties = mixin.properties;
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        for (var key in properties)
        {
          if (!overwrite)
          {
            var getterName = "get" + qx.lang.String.toFirstUp(key);
            if (proto[getterName] != undefined) {
              throw new Error("Overwriting the property '" + key + "' of class '" + proto.classname + "'is not allowed!");
            }
          }
        }
      }
      this.__addProperties(clazz, properties);
    },

    /**
     * Convert a constructor into an abstract constructor.
     *
     * @param className {String} fully qualified class name of the constructor.
     * @param construct {Fuction} the original constructor
     * @return {Function} abstract constructor
     */
    __createAbstractConstructor: function(className, construct)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        var abstractConstructor = function()
        {
          if (this.classname == arguments.callee.$$ABSTRACT) {
            throw new Error("The class '" + className + "' is abstract! It is not possible to instantiate it.");
          }

          return construct.apply(this, arguments);
        }

        abstractConstructor.$$ABSTRACT = className;
        return abstractConstructor;
      }
      else
      {
        // in production code omit the check and just return the
        // constructor
        return construct;
      }
    },

    /**
     * Add a singleton check to a constructor. The constructor will only work if
     * the static member <code>$ALLOWCONSTRUCT</code> of the class is set to true.
     *
     * @param construct {Function} original constructor to wrap
     * @return {Function} wrapped constructor
     */
    __createSingletonConstructor: function(construct)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        var singletonConstruct = function()
        {
          if (!arguments.callee.$$ALLOWCONSTRUCT) {
            throw new Error("Singleton");
          }

          return construct.apply(this, arguments);
        }
        return singletonConstruct;
      }
      else
      {
        // in production code omit the check and just return the
        // constructor
        return construct;
      }
    },

    /**
     * Returns an empty function.
     * This make sure that the new function has an empty closure.
     *
     * @return {Function} empty function
     */
    __wrapFunctionWithPrecondition: function(method, name, preCondition)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        return function()
        {
          if (!preCondition.apply(this, arguments)) {
           throw new Error("Pre condition of method '" + name + "'failed: " + preCondition.toString());
          }

          method.apply(this, arguments);
        }
      } else {
        return method;
      }
    },

    /**
     * Returns an empty function. This is needed to get an empty function with an empty closure.
     *
     * @return {Function} empty function
     */
    __createEmptyFunction: function() {
      return function() {};
    }
  }
});
