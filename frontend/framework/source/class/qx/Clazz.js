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
     * @type static
     * @param name {String} class name
     * @param config {Map ? null} Class definition structure. The configuration map has the following keys:
     *     <table>
     *       <tr><th>Name</th><th>Type</th><th>Description</th></tr>
     *       <tr><th>type</th><td>String</td><td>type of the class. Valid types are "abstract", "static" and "singleton"</td></tr>
     *       <tr><th>extend</th><td>Class</td><td>The spuer class the class inherits from.</td></tr>
     *       <tr><th>implement</th><td>Interface[]</td><td>Array of interfaces the class implements.</td></tr>
     *       <tr><th>include</th><td>Mixin[]</td><td>Array of mixins, which will be merged into the class.</td></tr>
     *       <tr><th>construct</th><td>Function</td><td>The constructor of the class.</td></tr>
     *       <tr><th>statics</th><td>Map</td><td>Map of statics of the class.</td></tr>
     *       <tr><th>members</th><td>Map</td><td>Map of members of the class.</td></tr>
     *       <tr><th>properties</th><td>Map</td><td>Map of property definitions. Format of the map: TODOC</td></tr>
     *       <tr><th>settings</th><td>Map</td><td>Map of settings for this class. Format of the map: TODOC</td></tr>
     *       <tr><th>variants</th><td>Map</td><td>Map of settings for this class. Format of the map: TODOC</td></tr>
     *       <tr><th>events</th><td>String[]</td><td>List of events the class fires.</td></tr>
     *       <tr><th>defer</th><td>Function</td><td>TODOC</td></tr>
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
      var clazz = this.__createClass(name, config.type, config.extend, config.construct, config.statics);

      // Members, Properties, Events and Mixins are not available in static classes
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

        // Process Events
        if (config.events) {
          this.__addEvents(clazz, config.events);
        }

        // Must be the last here to detect conflicts
        if (config.include)
        {
          var incoming = config.include;

          if (incoming.isMixin)
          {
            // Add Mixin
            this.__addMixin(clazz, incoming, false);
          }
          else
          {
            // Add Mixins
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

        if (incoming.isInterface) {
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
     * @return {call} TODOC
     */
    include : function(clazz, mixin)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // TODO: Polishing
        var a = qx.lang.Array.copy(clazz.$$INCLUDES || []);
        a.push(mixin);
        qx.Mixin.checkCompatibility(a);
      }

      return qx.Clazz.__addMixin(clazz, mixin, false);
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
     * @return {call} TODOC
     */
    patch : function(clazz, mixin)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // TODO: Polishing
        var a = qx.lang.Array.copy(clazz.$$INCLUDES || []);
        a.push(mixin);
        qx.Mixin.checkCompatibility(a);
      }

      return qx.Clazz.__addMixin(clazz, mixin, true);
    },


    /**
     * Check whether vClass is a sub class of vSuperClass
     *
     * @type static
     * @param clazz {Class} the class to check.
     * @param superClass {Class} super class
     * @return {Boolean} whether vClass is a sub class of vSuperClass.
     */
    isSubClassOf : function(clazz, superClass)
    {
      while (clazz.superclass)
      {
        if (clazz.superclass == superClass) {
          return true;
        }

        clazz = clazz.superclass;
      }

      return false;
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
        "extend"     : "function",  // Function
        "implement"  : "object",    // Interface | Interface[]
        "include"    : "object",    // Mixin | Mixin[]
        "construct"  : "function",  // Function
        "type"       : "string",    // String
        "statics"    : "object",    // Map
        "members"    : "object",    // Map
        "properties" : "object",    // Map
        "settings"   : "object",    // Map
        "variants"   : "object",    // Map
        "defer"      : "function",  // Function
        "events"      : "object"     // Array
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
     * Helper to handle singletons
     *
     * @type static
     * @return {var} TODOC
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
     * @type static
     * @param name {String} Full name of the class
     * @param type {String} type of the class.
     * @param extend {clazz} Superclass to inherit from
     * @param construct {Function} Constructor of the new class
     * @param statics {Map} Static methods field
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
        if (!type || type == "static") {
          clazz = construct;
        } else if (type == "abstract") {
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
        construct.base = clazz.superclass = extend;

        /*
          - Store statics/constructor into constructor/prototype
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




    /*
    ---------------------------------------------------------------------------
       PRIVATE ADD HELPERS
    ---------------------------------------------------------------------------
    */


    /**
     * Attach events to the clazz
     *
     * @param clazz {Class} class to add the events to
     * @param events{String[]} list of event names the class fires.
     */
    __addEvents : function(clazz, events)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!qx.core.Target) {
          throw new Error("The class 'qx.core.Target' must be availabe to use events!");
        }
        if (!this.isSubClassOf(clazz, qx.core.Target)) {
          throw new Error("The 'events' key can only be used for sub classes of 'qx.core.Target'!");
        }
      }
      clazz.$$EVENTS = {};
      for (var i=0; i<events.length; i++) {
        clazz.$$EVENTS[events[i]] = 1;
      }
    },


    /**
     * Wrapper for qx.OO.addProperty.
     *
     * @type static
     * @param clazz {Clazz} class to add the properties to
     * @param propertyName {String} property name
     * @param property {Map} new class style property definitions
     * @return {void}
     * @throws TODOC
     */
    __addProperty : function(clazz, propertyName, property)
    {
      var legacy = qx.core.LegacyProperty;
      var proto = clazz.prototype;

      property.name = propertyName;

      if (property.fast) {
        legacy.addFastProperty(property, proto);
      } else if (property.cached) {
        legacy.addCachedProperty(property, proto);
      } else if (property.compat) {
        legacy.addProperty(property, proto);
      } else if (qx.core.Variant.isSet("qx.debug", "on")) {
        throw new Error('Could not handle property definition "' + propertyName + '" in clazz "' + clazz.classname + "'");
      }
    },


    /**
     * Attach members to a class
     *
     * @type static
     * @param clazz {Class} clazz to add members to
     * @param members {Map} The map of members to attach
     * @return {void}
     */
    __addMembers : function(clazz, members)
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
     * @type static
     * @param clazz {Class} clazz to add interface to
     * @param iface {Interface} the Interface to add
     * @return {void}
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
        if (typeof (statics[key]) != "function") {
          clazz[key] = statics[key];
        }
      }

      // Save interface name
      clazz.$$IMPLEMENTS[iface.name] = iface;
    },


    /**
     * Include all features of the Mixin into the given class.
     *
     * @type static
     * @param clazz {Clazz} A class previously defined where the mixin should be attached.
     * @param mixin {Mixin} Include all features of this Mixin
     * @param patch {Boolean} Overwrite existing fields, functions and properties
     */
    __addMixin : function(clazz, mixin, patch)
    {
      // Pre check registry
      if (!clazz.$$INCLUDES) {
        clazz.$$INCLUDES = {};
      }

      if (clazz.$$INCLUDES[mixin.name]) {
        throw new Error('Mixin "' + mixin.name + '" is already included into Class "' + clazz.classname + '"!');
      }

      var superclazz = clazz.superclass;
      var proto = clazz.prototype;

      // Attach includes
      var includes = mixin.include;
      if (includes)
      {
        for (var i=0, l=includes.length; i<l; i++) {
          this.__addMixin(clazz, includes[i], patch);
        }
      }

      // Attach statics
      var statics = mixin.statics;
      if (statics)
      {
        if (patch)
        {
          for (var key in statics) {
            clazz[key] = statics[key];
          }
        }
        else
        {
          for (var key in statics)
          {
            if (clazz[key] === undefined) {
              clazz[key] = statics[key];
            } else {
              throw new Error('Overwriting static member "' + key + '" of Class "' + clazz.classname + '" by Mixin "' + mixin.name + '" is not allowed!');
            }
          }
        }
      }

      // Attach properties
      // TODO: Properties NG
      var properties = mixin.properties;
      if (properties)
      {
        if (patch)
        {
          for (var key in properties) {
            this.__addProperty(clazz, key, properties[key]);
          }
        }
        else
        {
          for (var key in properties)
          {
            if (!proto._properties || !proto._properties[key]) {
              this.__addProperty(clazz, key, properties[key]);
            } else {
              throw new Error('Overwriting property "' + key + '" of Class "' + clazz.classname + '" by Mixin "' + mixin.name + '" is not allowed!');
            }
          }
        }
      }

      // Attach members
      var members = mixin.members;
      if (members)
      {
        if (patch)
        {
          for (var key in members) {
            proto[key] = members[key];
          }
        }
        else
        {
          for (var key in members)
          {
            if (proto[key] === undefined) {
              proto[key] = members[key];
            } else {
              throw new Error('Overwriting member "' + key + '" of Class "' + clazz.classname + '" by Mixin "' + mixin.name + '" is not allowed!');
            }
          }
        }
      }

      // Save mixin name
      clazz.$$INCLUDES[mixin.name] = mixin;
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
      return function() {
        arguments.callee.base.apply(this, arguments);
      };
    },


    /**
     * Convert a constructor into an abstract constructor.
     *
     * @type static
     * @param className {String} fully qualified class name of the constructor.
     * @param construct {Fuction} the original constructor
     * @return {Function} abstract constructor
     * @throws TODOC
     */
    __createAbstractConstructor : function(className, construct)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        function abstractConstructor()
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
     * @type static
     * @param construct {Function} original constructor to wrap
     * @return {Function} wrapped constructor
     * @throws TODOC
     */
    __createSingletonConstructor : function(construct)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        function singletonConstruct()
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
     * @type static
     * @return {Function} empty function
     */
    __createEmptyFunction : function() {
      return function() {};
    }
  }
});
