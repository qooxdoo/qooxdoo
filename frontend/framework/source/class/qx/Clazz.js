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
 * This class builds the basis for the qooxdoo class system and the qooxdoo
 * style of object oriented JavaScript. The define method is used to create
 * all classes.
 *
 * Instances of classes defined with <code>qx.Clazz.define</code> have the
 * following keys attached to the constructor and the prototype:
 *
 * <table>
 * <tr><th>classname</th><td>The fully qualified name of the class (e.g. "qx.ui.core.Widget").</td></tr>
 * <tr><th>basename</th><td>The namspace part of the class name (e.g. "qx.ui.core").</td></tr>
 * <tr><th>superclass</th><td>A pointer to the constructor of the super class.</td></tr>
 * <tr><th>constructor</th><td>A pointer to the constructor of the class.</td></tr>
 * </table>
 *
 * Further each method, which overwrites a method of it's super class, has access to the overwritten
 * method by using the <code>base</code> property which is attached to the method's function object.
 * It can be accessed inside method by the <code>arguments.callee</code> variable:
 *
 * <pre><code>
 * members: {
 *   ...
 *   foo: function() {
 *     var overWrittenMethod = argument.calle.base;
 *   }
 * }
 * </code></pre>
 */
qx.Clazz.define("qx.Clazz",
{
  statics :
  {
    /**
     * Define a new class using the qooxdoo class system. This sets up the namespace for the class and
     * constructs the class from the definition map.
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
     * @param config {Map} class definition structure. The configuration map has the following keys:
     *   <table>
     *     <tr><th>Name</th><th>Type</th><th>Description</th></tr>
     *     <tr><th>type</th><td>String</td><td>type of the class. Valid types are "abstract", "static" and "singleton"</td></tr>
     *     <tr><th>extend</th><td>Class</td><td>The spuer class the class inherits from.</td></tr>
     *     <tr><th>implement</th><td>Interface[]</td><td>Array of interfaces the class implements.</td></tr>
     *     <tr><th>include</th><td>Mixin[]</td><td>Array of mixins, which will be merged into the class.</td></tr>
     *     <tr><th>construct</th><td>Function</td><td>The constructor of the class.</td></tr>
     *     <tr><th>statics</th><td>Map</td><td>Map of statics of the class.</td></tr>
     *     <tr><th>members</th><td>Map</td><td>Map of members of the class.</td></tr>
     *     <tr><th>properties</th><td>Map</td><td>Map of property definitions. Format of the map: TODOC</td></tr>
     *     <tr><th>settings</th><td>Map</td><td>Map of settings for this class. Format of the map: TODOC</td></tr>
     *     <tr><th>variants</th><td>Map</td><td>Map of settings for this class. Format of the map: TODOC</td></tr>
     *     <tr><th>events</th><td>String[]</td><td>List of events the class fires.</td></tr>
     *     <tr><th>defer</th><td>Function</td><td>TODOC</td></tr>
     *   </table>
     */
    define : function(name, config)
    {
      if (!config) {
        config = {};
      }

      // Validate incoming data
      this.__validateConfig(name, config);

      // Create class
      var clazz = this.__createClass(name, config.type, config.extend, config.construct, config.statics);

      // Members, Properties and Mixins are only available in static classes
      if (config.extend)
      {
        this.__addMembers(clazz, config.members);
        this.__addProperties(clazz, config.properties);
        this.__addMixins(clazz, config.include);
      }

      // Interfaces are available in both
      this.__addInterfaces(clazz, config.implement);

      // Process settings/variants
      this.__processSettings(clazz, config.settings);
      this.__processVariants(clazz, config.variants);

      // Process defer
      this.__processDefer(clazz, config.defer);
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

      // do not overwrite
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (parent[part] != undefined) {
          throw new Error("An object of the name '" + name + "' aready exists and overwriting is not allowed!");
        }
      }

      // store object
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


    /**
     * Check whether vClass is a sub class of vSuperClass
     *
     * @param clazz {Class} the class to check.
     * @param superClass {Class} super class
     * @return {Boolean} whether vClass is a sub class of vSuperClass.
     */
   isSubClassOf: function(clazz, superClass)
   {
     while(clazz.superclass) {
       if (clazz.superclass == superClass) {
         return true;
       }
       clazz = clazz.superclass;
     }
     return false;
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
          "extend": "function",
          "implement": "object", // interface[], interface
          "include": "object", // mixin[], mixin
          "construct": "function",
          "type": "string",
          "statics": "object",
          "members": "object",
          "properties": "object",
          "settings": "object",
          "variants": "object",
          "defer" : "function"
        };

        for (var key in config)
        {
          if (!allowedKeys[key]) {
            throw new Error('The configuration key "' + key + '" in class "' + name + '" is not allowed!');
          }

          if (config[key] == null) {
            throw new Error('Invalid key "' + key + '" in class "' + name + '"! The value is undefined/null!');
          }

          if (typeof(config[key]) != allowedKeys[key]) {
            throw new Error('Invalid type of key "' + key + '" in class "' + name + '"! The type of the key must be "' + allowedKeys[key] + '"!');
          }
        }

        if (!config.extend)
        {
          if (config.construct) {
            throw new Error('Superclass is undefined, but Constructor was given for class: "' + name + '"!');
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
     * @param type {String ? null} type of the class.
     * @param extend {Class ? null} Superclass to inherit from
     * @param construct {Function ? null} Constructor of the new class
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
        // create default constructor
        if (!construct) {
          construct = this.__createDefaultConstructor();
        }

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

        // Store statics/constructor into constructor
        construct.self = clazz;

        // Copy property lists
        if (extend.prototype._properties) {
          proto._properties = qx.lang.Object.copy(extend.prototype._properties);
        }

        if (extend.prototype._objectproperties) {
          proto._objectproperties = qx.lang.Object.copy(extend.prototype._objectproperties);
        }

        // Compatibility to qooxdoo 0.6.x
        qx.Class = clazz;
        qx.Proto = proto;
        qx.Super = extend;
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
     * Process defer configuration
     *
     * @param clazz {Clazz} class to execute the defer function for
     * @param defer {Function} defer function
     */
    __processDefer : function(clazz, defer)
    {
      if (!defer) {
        return;
      }

      var properties =
      {
        add : function(name, config) {
          qx.Clazz.__addProperty(clazz, name, config);
        }
      };

      defer(clazz, clazz.prototype, properties);
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

      for (var name in properties) {
        this.__addProperty(clazz, name, properties[name]);
      }
    },

    __addProperty : function(clazz, name, property)
    {
      var legacy = qx.core.LegacyProperty;
      var proto = clazz.prototype;

      property.name = name;

      if (property.fast)
      {
        legacy.addFastProperty(property, proto);
      }
      else if (property.cached)
      {
        legacy.addCachedProperty(property, proto);
      }
      else if (property.compat)
      {
        legacy.addProperty(property, proto);
      }
      else if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        throw new Error('Could not handle property definition "' + name + '" in Class "' + qx.Proto.classname + "'");
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

          member.self = clazz;
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

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        try {
          qx.Mixin.areCompatible(mixins);
        } catch(ex) {
          throw new Error('The Mixins defined in the include list of "' + clazz.classname + '" are incompatible');
        }
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
        for (var key in interfaceStatics)
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

      if (!clazz.$$INCLUDES) {
        clazz.$$INCLUDES = {};
      }

      if (clazz.$$INCLUDES[mixin.name]) {
        return;
      }

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (members == null) {
          throw new Error('Invalid include in class "' + proto.classname + '"! The value is undefined/null!');
        }
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
      clazz.$$INCLUDES[mixin.name] = mixin;
    },


    /**
     * Returns the default constructor.
     * This constructor just calles the constructor of the base class.
     *
     * @return {Function} The default constructor.
     */
    __createDefaultConstructor: function()
    {
      return function() {
        arguments.callee.base.apply(this, arguments);
      }
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
