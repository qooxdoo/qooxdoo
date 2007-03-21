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
#require(qx.core.Setting)

************************************************************************ */

/**
 * This class is one of the most important parts of qooxdoo's
 * object-oriented features. Its {@link #define} method is used to
 * create all other classes.
 *
 * Each instance of a class defined by <code>qx.Class.define</code> has
 * the following keys attached to the constructor and the prototype:
 *
 * <table>
 * <tr><th><code>classname</code></th><td>The fully-qualified name of the class (e.g. <code>"qx.ui.core.Widget"</code>).</td></tr>
 * <tr><th><code>basename</code></th><td>The namespace part of the class name (e.g. <code>"qx.ui.core"</code>).</td></tr>
 * <tr><th><code>constructor</code></th><td>A reference to the constructor of the class.</td></tr>
 * <tr><th><code>superclass</code></th><td>A reference to the constructor of the super class.</td></tr>
 * </table>
 *
 * Each method may access static members of the same class by using
 * <code>this.self(arguments)</code> ({@link qx.core.Object#self}):
 * <pre><code>
 * statics : { FOO : "bar" },
 * members: {
 *   baz: function(x) {
 *     this.self(arguments).FOO;
 *     ...
 *   }
 * }
 * </code></pre>
 *
 * Each overriding method may call the overridden method by using
 * <code>this.base(arguments [, ...])</code> ({@link qx.core.Object#base}). This is also true for calling
 * the superclass' constructor.
 * <pre><code>
 * members: {
 *   foo: function(x) {
 *     this.base(arguments, x);
 *     ...
 *   }
 * }
 * </code></pre>
 */
qx.Class.define("qx.Class",
{
  statics :
  {
    /*
    ---------------------------------------------------------------------------
       PUBLIC METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Define a new class using the qooxdoo class system. This sets up the namespace for the class and
     * constructs the class from the definition map.
     *
     * Example:
     * <pre><code>
     * qx.Class.define("name",
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
     *     "tabIndexOld": { type: "number", defaultValue : -1, _legacy : true }
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
     * @type static
     * @param name {String} class name
     * @param config {Map ? null} Class definition structure. The configuration map has the following keys:
     *     <table>
     *       <tr><th>Name</th><th>Type</th><th>Description</th></tr>
     *       <tr><th>type</th><td>String</td><td>
     *           Type of the class. Valid types are "abstract", "static" and "singleton". If type is set to
     *           "singleton", the mixin {@link qx.core.MSingleton} is included into the newly created class.
     *       </td></tr>
     *       <tr><th>extend</th><td>Class</td><td>The super class the current class inherits from.</td></tr>
     *       <tr><th>implement</th><td>Interface | Interface[]</td><td>Single interface or array of interfaces the class implements.</td></tr>
     *       <tr><th>include</th><td>Mixin | Mixin[]</td><td>Single mixin or array of mixins, which will be merged into the class.</td></tr>
     *       <tr><th>construct</th><td>Function</td><td>The constructor of the class.</td></tr>
     *       <tr><th>statics</th><td>Map</td><td>Map of static members of the class.</td></tr>
     *       <tr><th>properties</th><td>Map</td><td>Map of property definitions. Format of the map: TODOC</td></tr>
     *       <tr><th>members</th><td>Map</td><td>Map of instance members of the class.</td></tr>
     *       <tr><th>settings</th><td>Map</td><td>Map of settings for this class. Format of the map: TODOC</td></tr>
     *       <tr><th>variants</th><td>Map</td><td>Map of settings for this class. Format of the map: TODOC</td></tr>
     *       <tr><th>events</th><td>Map</td><td>
     *           Map of events the class fires. The keys are the names of the events and the values are
     *           corresponding event type classes.
     *       </td></tr>
     *       <tr><th>defer</th><td>Function</td><td>Function that is to be called after at the end of the class declaration that allows access to the statics, members, properties.</td></tr>
     *       <tr><th>destruct</th><td>Function</td><td>The destructor of the class.</td></tr>
     *     </table>
     * @return {void}
     * @throws TODOC
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
      var clazz = this.__createClass(name, config.type, config.extend, config.construct, config.statics, config.destruct);

      // Members, Properties, Events and Mixins are not available in static classes
      if (config.extend)
      {
        var superclass = config.extend;

        // Attach properties
        if (config.properties) {
          this.__addProperties(clazz, config.properties, true);
        }

        // Attach members
        if (config.members) {
          this.__addMembers(clazz, config.members, true, true);
        }

        // Process Events
        if (config.events) {
          this.__addEvents(clazz, config.events, true);
        }

        // Must be the last here to detect conflicts
        if (config.include)
        {
          if (config.include instanceof Array)
          {
            for (var i=0, l=config.include.length; i<l; i++) {
              this.__addMixin(clazz, config.include[i], false);
            }
          }
          else
          {
            this.__addMixin(clazz, config.include, false);
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
        config.defer.self = clazz;
        config.defer(clazz, clazz.prototype,
        {
          add : function(name, config)
          {
            // build pseudo properties map
            var properties = {};
            properties[name] = config;

            // execute generic property handler
            qx.Class.__addProperties(clazz, properties, true);
          }
        });
      }

      // Interfaces are available in all types of classes
      if (config.implement)
      {
        if (config.implement instanceof Array)
        {
          for (var i=0, l=config.implement.length; i<l; i++) {
            this.__addInterface(clazz, config.implement[i]);
          }
        }
        else
        {
          this.__addInterface(clazz, config.implement);
        }
      }

      // Verify inherited interfaces
      if (config.extend && config.extend.$$implements)
      {
        var inheritedImplements = config.extend.$$implements;
        for (var key in inheritedImplements) {
          qx.Interface.assertInterface(clazz, inheritedImplements[key], false);
        }
      }
    },


    /**
     * Creates a given namespace and assigns the given object to the last part.
     *
     * @type static
     * @param name {String} The namespace including the last (class) name
     * @param object {Object} The data to attach to the namespace
     * @return {Object} last part of the namespace (e.g. classname)
     * @throws TODOC
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
     * @param name {String} class name to check
     * @return {Boolean} true if class exists
     */
    isDefined : function(name) {
      return this.__registry[name] != null;
    },


    /**
     * Determine the number of classes which are defined
     *
     * @type static
     * @return {Number} the number of classes
     */
    getNumber : function() {
      return qx.lang.Object.getLength(this.__registry);
    },


    /**
     * Returns a Class by name
     *
     * @type static
     * @param name {String} class name to resolve
     * @return {Class} the class
     */
    getByName : function(name) {
      return this.__registry[name];
    },


    /**
     * Include all features of the Mixin into the given clazz. The Mixin must not include
     * any functions or properties which are already available. This is only possible using
     * the hackier patch method.
     *
     * @type static
     * @param clazz {Class} A class previously defined where the stuff should be attached.
     * @param mixin {Mixin} Include all features of this Mixin
     */
    include : function(clazz, mixin)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // Build a pseudo temporary mixin array and check for compatibility of all
        if (clazz.$$includes)
        {
          var temp = [mixin];
          for (var key in clazz.$$includes) {
            temp.push(clazz.$$includes[key]);
          }

          qx.Mixin.checkCompatibility(temp);
        }
      }

      qx.Class.__addMixin(clazz, mixin, false);
    },


    /**
     * Include all features of the Mixin into the given clazz. The Mixin can include features
     * which are already defined in the target clazz. Existing stuff gets overwritten. Please
     * be aware that this functionality is not the preferred way.
     *
     * <b>WARNING</b>: You can damage working Classes and features.
     *
     * @type static
     * @param clazz {Class} A class previously defined where the stuff should be attached.
     * @param mixin {Mixin} Include all features of this Mixin
     */
    patch : function(clazz, mixin)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // Build a pseudo temporary mixin array and check for compatibility of all
        if (clazz.$$includes)
        {
          var temp = [mixin];
          for (var key in clazz.$$includes) {
            temp.push(clazz.$$includes[key]);
          }

          qx.Mixin.checkCompatibility(temp);
        }
      }

      qx.Class.__addMixin(clazz, mixin, true);
    },


    /**
     * Check whether clazz is a sub class of vSuperClass
     *
     * @type static
     * @param clazz {Class} the class to check.
     * @param superClass {Class} super class
     * @return {Boolean} whether clazz is a sub class of vSuperClass.
     */
    isSubClassOf : function(clazz, superClass)
    {
      if (!clazz) {
        return false;
      }
      if (clazz == superClass) {
        return true;
      }
      if (clazz.prototype instanceof superClass) {
        return true;
      }
      return false;
    },


    /**
     * Returns the property definition of the given property. Returns null
     * if the property does not exist.
     *
     * @type member
     * @param clazz {Class} class to check
     * @param name {String} name of the event to check for
     * @return {Map|null} whether the object support the given event.
     */
    getPropertyDefinition : function(clazz, name)
    {
      while (clazz)
      {
        if (clazz.$$properties && clazz.$$properties[name]) {
          return clazz.$$properties[name];
        }

        clazz = clazz.superclass;
      }

      return null;
    },


    /**
     * Whether the class has the given property
     *
     * @type member
     * @param clazz {Class} class to check
     * @param name {String} name of the event to check for
     * @return {Boolean} whether the object support the given event.
     */
    hasProperty : function(clazz, name) {
      return !!this.getPropertyDefinition(clazz, name);
    },


    /**
     * Returns the event type of the given event. Returns null if
     * the event does not exist.
     *
     * @type member
     * @param clazz {Class} class to check
     * @param name {String} name of the event to check for
     * @return {Map|null} whether the object support the given event.
     */
    getEventType : function(clazz, name)
    {
      var clazz = clazz.constructor;

      while (clazz.superclass)
      {
        if (clazz.$$events && clazz.$$events[name] !== undefined) {
          return clazz.$$events[name];
        }

        clazz = clazz.superclass;
      }

      return null;
    },


    /**
     * Whether the class supports the given event type
     *
     * @type member
     * @param clazz {Class} class to check
     * @param name {String} name of the event to check for
     * @return {Boolean} whether the object support the given event.
     */
    supportsEvent : function(clazz, name) {
      return !!this.getEventType(clazz, name);
    },


    /**
     * Whether a given class includes a mixin.
     *
     * @type static
     * @param clazz {Class} class to check
     * @param mixin {Mixin} the mixin to check for
     * @return {Boolean} whether the class includes the mixin.
     */
    hasOwnMixin: function(clazz, mixin) {
      return clazz.$$includes && clazz.$$includes[mixin.name] ? true : false;
    },


    /**
     * Whether a given class includes a mixin (recursive).
     *
     * @type static
     * @param clazz {Class} class to check
     * @param mixin {Mixin} the mixin to check for
     * @return {Boolean} whether the class includes the mixin.
     */
    hasMixin: function(clazz, mixin)
    {
      // TODO
    },


    /**
     * Whether a given class includes a interface.
     *
     * This function will only return "true" if the interface was defined
     * in the class declaration (@link qx.Class#define}) using the "implement"
     * key.
     *
     * @type static
     * @param clazz {Class} class or instance to check
     * @param iface {Interface} the interface to check for
     * @return {Boolean} whether the class includes the mixin.
     */
    hasOwnInterface : function(clazz, iface) {
      return clazz.$$implements && clazz.$$implements[iface.name] ? true : false;
    },


    /**
     * Whether a given class includes a interface (recursive).
     *
     * This function will return "true" if the interface was defined
     * in the class declaration (@link qx.Class#define}) of the class
     * or any of its super classes using the "implement"
     * key.
     *
     * @type static
     * @param clazz {Class|Object} class or instance to check
     * @param iface {Interface} the interface to check for
     * @return {Boolean} whether the class includes the interface.
     */
    hasInterface : function(clazz, iface)
    {
      // TODO
    },


    /**
     * Wether a given class conforms to an interface.
     *
     * Checks whether all methods defined in the interface are
     * implemented in the class. The class does not needs to declare
     * the interfaces directly.
     *
     * @type static
     * @param clazz {Class} class to check
     * @param iface {Interface} the interface to check for
     * @return {Boolean} whether the class includes the interface.
     */
    implementsInterface : function(clazz, iface)
    {
      if (this.hasInterface(clazz, iface)) {
        return true;
      }

      try
      {
        this.assertInterface(clazz, iface);
        return true;
      }
      catch(ex) {}

      return false;
    },


    /**
     * Get the name of a member/static function or constructor defined using the new style class definition.
     * If the function could not be found <code>null</code> is returned.
     *
     * This function uses a linear search, so don't use it in performance critical
     * code.
     *
     * @param func {Function} member function to get the name of.
     * @param functionType {String?"all"} Where to look for the function. Possible values are "members", "statics", "constructor", "all"
     * @return {String|null} Name of the function (null if not found).
     */
    getFunctionName: function(func, functionType)
    {
      var clazz = func.self;
      if (!clazz) {
        return null;
      }

      // unwrap
      while(func.wrapper) {
        func = func.wrapper;
      }

      switch (functionType)
      {
        case "construct":
          return func == clazz ? "construct" : null;

        case "members":
          return qx.lang.Object.getKeyFromValue(clazz, func);

        case "statics":
          return qx.lang.Object.getKeyFromValue(clazz.prototype, func);

        default:
          // constructor
          if (func == clazz) {
            return "construct";
          }

          return (
            qx.lang.Object.getKeyFromValue(clazz.prototype, func) ||
            qx.lang.Object.getKeyFromValue(clazz, func) ||
            null
          );
      }
    },


    /**
     * Helper to handle singletons
     *
     * @type static
     * @internal
     * @return {var} TODOC
     */
    getInstance : function()
    {
      if (!this.$$instance)
      {
        this.$$allowconstruct = true;
        this.$$instance = new this;
        delete this.$$allowconstruct;
      }

      return this.$$instance;
    },





    /*
    ---------------------------------------------------------------------------
       PRIVATE BASICS
    ---------------------------------------------------------------------------
    */

    /** Stores all defined classes */
    __registry : {},


    /**
     * Validates incoming configuration and checks keys and values
     *
     * @type static
     * @param name {String} The name of the class
     * @param config {Map} Configuration map
     * @return {void}
     * @throws TODOC
     */
    __validateConfig : function(name, config)
    {
      var allowedKeys =
      {
        "type"       : "string",    // String
        "extend"     : "function",  // Function
        "implement"  : "object",    // Interface | Interface[]
        "include"    : "object",    // Mixin | Mixin[]
        "construct"  : "function",  // Function
        "statics"    : "object",    // Map
        "properties" : "object",    // Map
        "members"    : "object",    // Map
        "settings"   : "object",    // Map
        "variants"   : "object",    // Map
        "events"     : "object",    // Map
        "defer"      : "function",  // Function
        "destruct"   : "function"   // Function
      };

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

      // Check Mixin compatiblity
      if (config.include)
      {
        try {
          qx.Mixin.checkCompatibility(config.include);
        } catch(ex) {
          throw new Error('Error in include definition of class "' + name + '"! ' + ex.message);
        }
      }
    },


    /**
     * Creates a class by type. Supports modern inheritance etc.
     *
     * @type static
     * @param name {String} Full name of the class
     * @param type {String} type of the class.
     * @param extend {clazz} Superclass to inherit from
     * @param construct {Function} Constructor of the new class
     * @param statics {Map} Static methods field
     * @return {Class} The resulting class
     */
    __createClass : function(name, type, extend, construct, statics, destruct)
    {
      var clazz;

      if (!extend || type === "static")
      {
        // Create empty/non-empty class
        clazz = statics || {};
      }
      else
      {
        // create default constructor
        if (construct === undefined) {
          construct = this.__createDefaultConstructor();
        }

        // Wrap constructor to handle mixin constructors and property initialization
        clazz = this.__wrapConstructor(name, type, construct);

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
      clazz.name = clazz.classname = name;
      clazz.basename = basename;

      if (extend)
      {
        var superproto = extend.prototype;

        // Use helper function/class to save the unnecessary constructor call while
        // setting up inheritance.
        var helper = this.__createEmptyFunction();
        helper.prototype = superproto;
        var proto = new helper;

        // Apply prototype to new helper instance
        clazz.prototype = proto;

        // Store names in prototype
        proto.name = proto.classname = name;
        proto.basename = basename;

        /*
          - Store base constructor to constructor-
          - Store reference to extend class
        */
        construct.base = clazz.superclass = extend;

        /*
          - Store statics/constructor onto constructor/prototype
          - Store correct constructor
          - Store statics onto prototype
        */
        construct.self = clazz.constructor = proto.constructor = clazz;

        /*
          - Store destruct onto statics/constructor
        */
        if (destruct) {
          clazz.$$destruct = destruct;
        }

        // Compatibility to qooxdoo 0.6.6
        if (qx.core.Variant.isSet("qx.compatibility", "on"))
        {
          qx.Clazz = clazz;
          qx.Proto = proto;
          qx.Super = extend;
        }
      }
      else
      {
        // Compatibility to qooxdoo 0.6.6
        if (qx.core.Variant.isSet("qx.compatibility", "on"))
        {
          qx.Clazz = clazz;
          qx.Proto = null;
          qx.Super = null;
        }
      }

      // Store class reference in global class registry
      this.__registry[name] = clazz;

      // Return final class object
      return clazz;
    },






    /*
    ---------------------------------------------------------------------------
       PRIVATE ADD HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Attach events to the clazz
     *
     * @param clazz {Class} class to add the events to
     * @param events {Map} map of event names the class fires.
     * @param patch {Boolean ? false} Enable redefinition of event type?
     */
    __addEvents : function(clazz, events, patch)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!qx.core.Target) {
          throw new Error(clazz.classname + ": the class 'qx.core.Target' must be availabe to use events!");
        }

        if (typeof events !== "object" || events instanceof Array) {
          throw new Error(clazz.classname + ": the events must be defined as map!");
        }

        for (var key in events)
        {
          if (typeof events[key] !== "string") {
            throw new Error(clazz.classname + "/" + key + ": the event value needs to be a string with the class name of the event object which will be fired.");
          }
        }

        // Compare old and new event type/value if patching is disabled
        if (clazz.$$events && patch !== true)
        {
          for (var key in events)
          {
            if (clazz.$$events[key] !== events[key]) {
              throw new Error(clazz.classname + "/" + key + ": the event value/type cannot be changed from " + clazz.$$events[key] + " to " + events[key]);
            }
          }
        }
      }

      if (clazz.$$events)
      {
        for (var key in events) {
          clazz.$$events[key] = events[key];
        }
      }
      else
      {
        clazz.$$events = events;
      }
    },


    /**
     * Wrapper for qx.core.LegacyProperty
     *
     * @type static
     * @param clazz {Class} class to add the properties to
     * @param propertyName {String} property name
     * @param property {Map} new class style property definitions
     * @return {void}
     * @throws TODOC
     */
    __addProperties : function(clazz, properties, patch)
    {
      var config;

      for (var name in properties)
      {
        config = properties[name];

        // Check incoming configuration
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (qx.core.Variant.isSet("qx.compatibility", "on"))
          {
            if (!config._legacy && !config._fast && !config._cached && !config.refine && this.hasProperty(clazz, name)) {
              throw new Error("Class " + clazz.classname + " already has a property: " + name + "!");
            }
          }
          else
          {
            if (!config.refine && this.hasProperty(clazz, name)) {
              throw new Error("Class " + clazz.classname + " already has a property: " + name + "!");
            }
          }

          if (config.refine)
          {
            for (var key in config)
            {
              if (key !== "init" && key !== "refine") {
                throw new Error("Class " + clazz.classname + " could not refine property: " + name + "! Key: " + key + " could not be refined!");
              }
            }
          }
        }

        // Store name into configuration
        config.name = name;

        // Add config to local registry
        if (!config.refine)
        {
          if (clazz.$$properties === undefined) {
            clazz.$$properties = {};
          }

          clazz.$$properties[name] = config;
        }

        // Store init value to prototype. This makes it possible to
        // overwrite this value in derived classes.
        if (config.init !== undefined) {
          clazz.prototype["$$init" + name] = config.init;
        }

        // Create old style properties
        if (qx.core.Variant.isSet("qx.compatibility", "on"))
        {
          if (config._fast) {
            qx.core.LegacyProperty.addFastProperty(config, clazz.prototype);
          } else if (config._cached) {
            qx.core.LegacyProperty.addCachedProperty(config, clazz.prototype);
          } else if (config._legacy) {
            qx.core.LegacyProperty.addProperty(config, clazz.prototype);
          }
        }
      }
    },


    /**
     * Attach members to a class
     *
     * @type static
     * @param clazz {Class} clazz to add members to
     * @param members {Map} The map of members to attach
     * @param patch {Boolean ? false} Enable patching of
     * @param base (Boolean ? true) Attach base flag to mark function as members of this class
     * @return {void}
     */
    __addMembers : function(clazz, members, patch, base)
    {
      var superproto = clazz.superclass.prototype;
      var proto = clazz.prototype;
      var key, members;

      for (var i=0, a=qx.lang.Object.getKeys(members), l=a.length; i<l; i++)
      {
        var key = a[i];
        var member = members[key];

        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (patch !== true && proto[key] !== undefined) {
            throw new Error('Overwriting member "' + key + '" of Class "' + clazz.classname + '" is not allowed!');
          }
        }

        // Added helper stuff to functions
        if (base !== false && typeof member === "function" && !(member instanceof RegExp))
        {
          // Configure extend (named base here)
          if (superproto[key]) {
            member.base = superproto[key];
          }

          member.self = clazz;
        }

        // Attach member
        proto[key] = member;
      }
    },


    /**
     * Add a single interface to a class
     *
     * @type static
     * @param clazz {Class} class to add interface to
     * @param iface {Interface} the Interface to add
     * @return {void}
     */
    __addInterface : function(clazz, iface)
    {
      if (!clazz || !iface) {
        throw new Error("Incomple parameters!")
      }

      if (!clazz.$$implements)
      {
        clazz.$$implements = {};
      }
      else if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this.hasInterface(clazz, iface)) {
          throw new Error('Interface "' + iface.name + '" is already used by Class "' + clazz.classname + '"!');
        }
      }

      // Check properties and members
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.Interface.assertInterface(clazz, iface, true);
      }

      // Save interface
      clazz.$$implements[iface.name] = iface;
    },


    /**
     * Include all features of the Mixin into the given class (recursive).
     *
     * @type static
     * @param clazz {Class} A class previously defined where the mixin should be attached.
     * @param mixin {Mixin} Include all features of this Mixin
     * @param patch {Boolean} Overwrite existing fields, functions and properties
     */
    __addMixin : function(clazz, mixin, patch)
    {
      if (!clazz || !mixin) {
        throw new Error("Incomple parameters!")
      }

      if (!clazz.$$includes)
      {
        clazz.$$includes = {};
      }
      else if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this.hasMixin(clazz, mixin)) {
          throw new Error('Mixin "' + mixin.name + '" is already included into Class "' + clazz.classname + '"!');
        }
      }

      // Attach statics, properties and members
      this.__attachMixinContent(clazz, mixin, patch);

      // Save Mixin
      clazz.$$includes[mixin.name] = mixin;
    },


    /**
     * Attach fields of Mixins (recursively) to a class without assignment.
     *
     * @type static
     * @param clazz {Class} A class previously defined where the mixin should be attached.
     * @param mixin {Mixin} Include all features of this Mixin
     * @param patch {Boolean} Overwrite existing fields, functions and properties
     */
    __attachMixinContent : function(clazz, mixin, patch)
    {
      var superclazz = clazz.superclass;
      var proto = clazz.prototype;

      // Attach includes, recursive
      var includes = mixin.include;
      if (includes)
      {
        for (var i=0, l=includes.length; i<l; i++) {
          this.__attachMixinContent(clazz, includes[i], patch);
        }
      }

      // Attach events
      var events = mixin.$$events;
      if (events) {
        this.__addEvents(clazz, events, patch);
      }

      // Attach properties (Properties are already readonly themselve, no patch handling needed)
      var properties = mixin.$$properties;
      if (properties) {
        this.__addProperties(clazz, properties, patch);
      }

      // Attach members (Respect patch setting, but dont apply base variables)
      var members = mixin.$$members;
      if (members) {
        this.__addMembers(clazz, members, patch, false);
      }
    },





    /*
    ---------------------------------------------------------------------------
       PRIVATE FUNCTION HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the default constructor.
     * This constructor just calles the constructor of the base class.
     *
     * @type static
     * @return {Function} The default constructor.
     */
    __createDefaultConstructor : function()
    {
      function defaultConstructor() {
        arguments.callee.base.apply(this, arguments);
      };

      return defaultConstructor;
    },


    /**
     * Returns an empty function. This is needed to get an empty function with an empty closure.
     *
     * @type static
     * @return {Function} empty function
     */
    __createEmptyFunction : function() {
      return function() {};
    },


    /**
     *
     * @param className {String} fully qualified class name of the constructor.
     * @param type {String} the user specified class type
     * @param construct {Fuction} the original constructor
     */
    __wrapConstructor : function(className, type, construct)
    {
      function wrapper()
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (type == null)
          {
            // pass
          }
          else if (type === "abstract")
          {
            if (this.classname == arguments.callee.$$abstract) {
              throw new Error("The class '" + className + "' is abstract! It is not possible to instantiate it.");
            }
          }
          else if (type === "singleton")
          {
            if (!arguments.callee.$$allowconstruct) {
              throw new Error("The class '" + className + "' is a singleton! It is not possible to instantiate it directly. Use the static 'getInstance' method instead.");
            }
          }
        }

        // Execute default constructor
        var instance = construct.apply(this, arguments);

        // Initialize local mixins
        // qx.Class.constructMixins(clazz, this);

        // Initialize local properties
        qx.core.Property.init(qx.Class.getByName(className), this);

        return instance;
      }

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (type != null && type === "abstract") {
          wrapper.$$abstract = className;
        }
      }

      if (type != null && type === "singleton") {
        wrapper.getInstance = qx.Class.getInstance;
      }

      construct.wrapper = wrapper;

      return wrapper;
    },






    /*
    ---------------------------------------------------------------------------
       PROTECTION
    ---------------------------------------------------------------------------
    */

    __addAccessProtectionMembers: function(method, functionName, clazz)
    {
      return method;
      if (functionName.indexOf("__") == 0) {
        return this.__createPrivateStatic(method, functionName, clazz);
      } else if (functionName.indexOf("_") == 0) {
        return  this.__createProtectedMember(method, functionName, clazz);
      } else {
        return this.__createPublicMember(method);
      }
    },


    /**
     * Applies access protection to the function based on the function name.
     * Functions starting with '__' will be wrapped as private, functions
     * starting with '_' will be wrapped as protected. All other functions
     * are returned unmodified.
     *
     * @param method {Function} Function to protect
     * @param functionName {String} name of the Function
     * @param clazz {Class} The class the function is defined in.
     */
    __addAccessProtectionStatics: function(method, functionName, clazz)
    {
      //return method;
      // RegExp are typeof "function" ;-(
      if (method instanceof RegExp) {
        return method;
      }
      if (functionName.indexOf("__") == 0) {
        return this.__createPrivateStatic(method, functionName, clazz);
      } else if (functionName.indexOf("_") == 0) {
        return  this.__createProtectedStatic(method, functionName, clazz);
      } else {
        return method;
      }
    },


    __createPublicMember: function(method)
    {
      // RegExp are typeof "function" ;-(
      if (method instanceof RegExp) {
        return method;
      }
      var wrapper = function() {
        method.context = this;
        return method.apply(this, arguments);
      }
      method.wrapper = wrapper;
      wrapper.self = method.self;
      return wrapper;
    },


    /**
     * Wraps a method so that only methods of the same class are allowed to call it.
     * No wrapper will be created for Opera, since Opera does not support 'caller'.
     *
     * @param method {Function} method to wrap
     * @param name {String} name of the method (for error messages)
     * @param clazz {Class} Class which should be allowed to call the wrapped method
     * @return {Function} wrapped method
     */
    __createPrivateMember : function(method, name, clazz)
    {
      if (arguments.caller || arguments.callee.caller)  // check if caller is available
      {
        var privateMember = function()
        {
          // IE defines arguments.caller.callee
          // Firefox and Webkit define arguments.callee.caller
          var caller = arguments.caller ? arguments.caller.callee : arguments.callee.caller;

          // if this is a wrapped function get the caller of the wrapper
          for (var fcn=arguments.callee; fcn.wrapper; fcn=fcn.wrapper) {
            caller = caller.caller;
          }

          if (caller.context.constructor != clazz)
          {
            if (caller.context) {
              var from = caller.context.classname + ":" + (qx.Class.getFunctionName(caller) || "unknown") + "()";
            } else {
              from = "unknown";
            }

            throw new Error("Private method '"+name+"' of class '"+clazz.classname+"' called from '"+from+"'!");
          }
          // save context
          method.context = this;
        };

        method.wrapper = privateMember;

        return privateMember;
      }
      else
      {
        return method;
      }
    },


    /**
     * Wraps a method so that only methods of the same class and sub classes of the class
     * are allowed to call it.
     * No wrapper will be created for Opera, since Opera does not support 'caller'.
     *
     * @param method {Function} method to wrap
     * @param name {String} name of the method (for error messages)
     * @param clazz {Class} Base class of the classes, which are allowed to call the wrapped method
     * @return {Function} wrapped method
     */
    __createProtectedMember : function(method, name, clazz)
    {
      if (arguments.caller || arguments.callee.caller)  // check if caller is available
      {
        var protectedMember = function()
        {
          // IE defines arguments.caller.callee
          // Firefox and Webkit define arguments.callee.caller
          var caller = arguments.caller ? arguments.caller.callee : arguments.callee.caller;

          if (!(caller.context instanceof clazz)) {
            if (caller.context) {
              var from = caller.context.classname + ":" + (qx.Class.getFunctionName(caller) || "unknown") + "()";
            } else {
              from = "unknown";
            }

            throw new Error("Protected method '"+name+"' of class '"+clazz.classname+"' called from '" + from + "'!");
          }
          // save context
          method.context = this;
          return method.apply(this, arguments);
        };

        method.wrapper = protectedMember;
        protectedMember.self = method.self;
        return protectedMember;
      }
      else
      {
        return method;
      }
    },


    /**
     * Wraps a method so that only methods of the same class are allowed to call it.
     * No wrapper will be created for Opera, since Opera does not support 'caller'.
     *
     * @param method {Function} method to wrap
     * @param name {String} name of the method (for error messages)
     * @param clazz {Class} Class which should be allowed to call the wrapped method
     * @return {Function} wrapped method
     */
    __createPrivateStatic : function(method, name, clazz)
    {
      return method;

      if (arguments.caller || arguments.callee.caller)  // check if caller is available
      {
        var privateMember = function()
        {
          // IE defines arguments.caller.callee
          // Firefox and Webkit define arguments.callee.caller
          var caller = arguments.caller ? arguments.caller.callee : arguments.callee.caller;

          // if this is a wrapped function get the caller of the wrapper
          for (var fcn=arguments.callee; fcn.wrapper; fcn=fcn.wrapper) {
            caller = caller.caller;
          }

          if (!caller.self || caller.self.classname != clazz.classname)
          {
            if (caller.self) {
              var from = caller.self.classname + ":" + (qx.Class.getFunctionName(caller) || "unknown") + "()";
            } else {
              from = "unknown";
            }

            throw new Error("Private method '"+name+"' of class '"+clazz.classname+"' called from '"+from+"'!");
          }

          // save context
          method.context = this;

          return method.apply(this, arguments);
        };

        method.wrapper = privateMember;

        return privateMember;
      }
      else
      {
        return method;
      }
    },


    /**
     * Wraps a method so that only methods of the same class and sub classes of the class
     * are allowed to call it.
     * No wrapper will be created for Opera, since Opera does not support 'caller'.
     *
     * @param method {Function} method to wrap
     * @param name {String} name of the method (for error messages)
     * @param clazz {Class} Base class of the classes, which are allowed to call the wrapped method
     * @return {Function} wrapped method
     */
    __createProtectedStatic : function(method, name, clazz)
    {
      return method;

      if (arguments.caller || arguments.callee.caller)  // check if caller is available
      {
        var protectedMember = function()
        {
          // save context
          method.context = this;

          // IE defines arguments.caller.callee
          // Firefox and Webkit define arguments.callee.caller
          var caller = arguments.caller ? arguments.caller.callee : arguments.callee.caller;

          // if this is a wrapped function get the caller of the wrapper
          for (var fcn=arguments.callee; fcn.wrapper; fcn=fcn.wrapper) {
            caller = caller.caller;
          }

          if (!caller || !qx.Class.isSubClassOf(caller.self, clazz))
          {
            if (caller.self) {
              var from = caller.self.classname + ":" + (qx.Class.getFunctionName(caller) || "unknown") + "()";
            } else {
              from = "unknown";
            }

            throw new Error("Protected method '"+name+"' of class '"+clazz.classname+"' called from '" + from + "'!");
          }

          return method.apply(this, arguments);
        };

        method.wrapper = protectedMember;

        return protectedMember;
      }
      else
      {
        return method;
      }
    }
  }
});
