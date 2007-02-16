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
     * @param config {Map} Class definition structure. The configuration map has the following keys:
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
        var config = {};
      }

      // Validate incoming data
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        this.__validateConfig(name, config);
      }

      // Create class
      var clazz = this.__createClass(name, config.type, config.extend, config.construct, config.statics);

      // Members, Properties and Mixins are not available in static classes
      if (config.extend)
      {
        // Attach members
        if (config.members) {
          this.__addMembers(clazz, config.members);
        }

        // Attach properties
        if (config.properties)
        {
          for (var name in config.properties) {
            this.__addProperty(clazz, name, config.properties[name]);
          }
        }

        // Must be the last here to detect conflicts
        if (config.include)
        {
          var incoming = config.include;

          if (incoming.isMixin)
          {
            this.__addMixin(clazz, incoming, false);
          }
          else
          {
            for (var i=0, l=incoming.length; i<l; i++) {
              this.__addMixin(clazz, incoming[i], false);
            }
          }
        }
      }

      // Interfaces are available in both
      if (config.implement)
      {
        var incoming = config.implement;

        if (incoming.isInterface)
        {
          this.__addInterface(clazz, incoming);
        }
        else
        {
          for (var i=0, l=incoming.length; i<l; i++) {
            this.__addInterface(clazz, incoming[i]);
          }
        }
      }

      // Process settings
      if (config.settings)
      {
        for (var key in config.settings)
        {
          if (qx.core.Variant.isSet("qx.debug", "on"))
          {
            if (key.substr(0, key.indexOf(".")) != clazz.classname.substr(0, clazz.classname.indexOf("."))) {
              throw new Error('Forbidden setting "' + key + '" found in "' + clazz.classname + '". It is forbidden to define a default setting for an external namespace!');
            }
          }

          qx.core.Setting.define(key, config.settings[key]);
        }
      }

      // Process variants
      if (config.variants)
      {
        for (var key in config.variants)
        {
          if (qx.core.Variant.isSet("qx.debug", "on"))
          {
            if (key.substr(0, key.indexOf(".")) != clazz.classname.substr(0, clazz.classname.indexOf("."))) {
              throw new Error('Forbidden variant "' + key + '" found in "' + clazz.classname + '". It is forbidden to define a variant for an external namespace!');
            }
          }

          qx.core.Variant.define(key, config.variants[key].allowedValues, config.variants[key].defaultValue);
        }
      }

      // Process defer
      if (config.defer)
      {
        config.defer(clazz, clazz.prototype,
        {
          add : function(name, config) {
            qx.Clazz.__addProperty(clazz, name, config);
          }
        });
      }
    },


    /**
     * Creates a given namespace and assigns the given object to the last part.
     *
     * @param name {String} The namespace including the last (class) name
     * @param object {Object} The data to attach to the namespace
     * @return {Object} last part of the namespace (e.g. classname)
     */
    createNamespace : function(name, object)
    {
      var splits = name.split(".");
      var parent = window;
      var part = splits[0];

      for (var i=0, l=splits.length-1; i<l; i++, part=splits[i])
      {
        if (!parent[part]) {
          parent = parent[part] = {};
        } else {
          parent = parent[part];
        }
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
     * @return {clazz|undefined} the class
     */
    get : function(name) {
      return this.__registry[name];
    },


    /**
     * Include all features of the Mixin into the given clazz. The Mixin must not include
     * any functions or properties which are already available. This is only possible using
     * the hackier patch method.
     *
     * @param target {Class} A class previously defined where the stuff should be attached.
     * @param mixin {Mixin} Include all features of this Mixin
     */
    include : function(target, mixin) {
      return qx.Clazz.__addMixin(target, mixin, false);
    },


    /**
     * Include all features of the Mixin into the given clazz. The Mixin can include features
     * which are already defined in the target clazz. Existing stuff gets overwritten. Please
     * be aware that this functionality is not the preferred way.
     *
     * <b>WARNING</b>: You can damage working Classes and features.
     *
     * @param target {Class} A class previously defined where the stuff should be attached.
     * @param mixin {Mixin} Include all features of this Mixin
     */
    patch : function(target, mixin) {
      return qx.Clazz.__addMixin(target, mixin, true);
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
      var allowedKeys =
      {
        "extend": "function",
        "implement": "object", // interface[], interface
        "include": "object", // mixin[], mixin
        "construct": "function",
        "type": "string",
        "statics": "object", // Map
        "members": "object", // Map
        "properties": "object", // Map
        "settings": "object", // Map
        "variants": "object", // Map
        "defer" : "function",
        "event" : "object" // Array
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

      if (config.type && !(config.type == "static" || config.type == "abstract" || config.type == "singleton")) {
        throw new Error('Invalid type "' + type + '" definition for class "' + name + '"!');
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
     * @param name {String} Full name of the class
     * @param type {String ? null} type of the class.
     * @param extend {clazz ? null} Superclass to inherit from
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
        if (!type || type == "static")
        {
          clazz = construct;
        }
        else if (type == "abstract")
        {
          clazz = this.__createAbstractConstructor(name, construct);
        }
        else if (type == "singleton")
        {
          clazz = this.__createSingletonConstructor(construct);
          clazz.getInstance = this.__getInstance;
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

        /*
          - Store base constructor to constructor-
          - Store reference to extend class
        */
        construct.base = clazz.superclass = proto.superclass = extend;

        /*
          - Store statics/constructor into constructor
          - Store correct constructor
        */
        construct.self = clazz.constructor = proto.constructor = clazz;

        // Copy property lists (qooxdoo 0.6 properties)
        if (extend.prototype._properties) {
          proto._properties = qx.lang.Object.copy(extend.prototype._properties);
        }

        if (extend.prototype._objectproperties) {
          proto._objectproperties = qx.lang.Object.copy(extend.prototype._objectproperties);
        }

        // TODO: Copy qooxodo 0.7 properties

        // Compatibility to qooxdoo 0.6.x
        // TODO: Remove this before 0.7 final
        qx.clazz = clazz;
        qx.Proto = proto;
        qx.Super = extend;
      }

      // Store class reference in global class registry
      this.__registry[name] = clazz;

      // Return final class object
      return clazz;
    },







    /**
     * Wrapper for qx.OO.addProperty.
     *
     * @param clazz {Clazz} class to add the properties to
     * @param propertyName {String} property name
     * @param property {Map} new class style property definitions
     */
    __addProperty : function(clazz, propertyName, property)
    {
      var legacy = qx.core.LegacyProperty;
      var proto = clazz.prototype;

      property.name = propertyName;

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
        throw new Error('Could not handle property definition "' + propertyName + '" in clazz "' + clazz.classname + "'");
      }
    },


    /**
     * Attach members to a class
     *
     * @param clazz {Class} clazz to add members to
     * @param members {Map} The map of members to attach
     */
    __addMembers: function(clazz, members)
    {
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
     * Add a single interface to a class
     *
     * @param clazz {Class} clazz to add interface to
     * @param iface {Interface} the Interface to add
     */
    __addInterface : function(clazz, iface)
    {
      // Pre check registry
      if (!clazz.$$IMPLEMENTS) {
        clazz.$$IMPLEMENTS = {};
      }

      if (clazz.$$IMPLEMENTS[iface.name]) {
        return;
      }

      // Only validate members in debug mode.
      // There is nothing more needed for builds
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.Interface.assertInterface(clazz, iface, true);
      }

      // Copy primitive static fields
      var statics = iface.statics;
      for (var key in statics)
      {
        // Attach statics
        // Validation is done in qx.Interface
        if (typeof(statics[key]) != "function") {
          clazz[key] = statics[key];
        }
      }

      // Save interface name
      clazz.$$IMPLEMENTS[iface.name] = iface;
    },


    /**
     * Include all features of the Mixin into the given clazz.
     *
     * @param clazz {Clazz} A class previously defined where the mixin should be attached.
     * @param mixin {Mixin} Include all features of this Mixin
     * @param overwrite {Boolean} Overwrite existing functions and properties
     */
    __addMixin : function(clazz, mixin, overwrite)
    {
      // Pre check registry
      if (!clazz.$$INCLUDES) {
        clazz.$$INCLUDES = {};
      }

      if (clazz.$$INCLUDES[mixin.name]) {
        return;
      }

      // Attach members
      var members = mixin.members;
      var proto = clazz.prototype;
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
      for (var key in properties)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (!overwrite)
          {
            var getterName = "get" + qx.lang.String.toFirstUp(key);
            if (proto[getterName] != undefined) {
              throw new Error("Overwriting the property '" + key + "' of class '" + proto.classname + "'is not allowed!");
            }
          }

          this.__addProperty(clazz, key, properties[key]);
        }
      }

      // Save mixin name
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
     * Returns an empty function. This is needed to get an empty function with an empty closure.
     *
     * @return {Function} empty function
     */
    __createEmptyFunction: function() {
      return function() {};
    }
  }
});
