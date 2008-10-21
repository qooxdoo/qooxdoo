/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

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
#module(oo)
#require(qx.core.Setting)
#require(qx.lang.Object)

************************************************************************ */

/**
 * This class is one of the most important parts of qooxdoo's
 * object-oriented features.
 *
 * Its {@link #define} method is used to create qooxdoo classes.
 *
 * Each instance of a class defined by {@link #define} has
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
 * <pre class='javascript'>
 * statics : { FOO : "bar" },
 * members: {
 *   baz: function(x) {
 *     this.self(arguments).FOO;
 *     ...
 *   }
 * }
 * </pre>
 *
 * Each overriding method may call the overridden method by using
 * <code>this.base(arguments [, ...])</code> ({@link qx.core.Object#base}). This is also true for calling
 * the constructor of the superclass.
 * <pre class='javascript'>
 * members: {
 *   foo: function(x) {
 *     this.base(arguments, x);
 *     ...
 *   }
 * }
 * </pre>
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
     * Define a new class using the qooxdoo class system. This sets up the
     * namespace for the class and generates the class from the definition map.
     *
     * Example:
     * <pre class='javascript'>
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
     *     "tabIndex": { check: "Number", init : -1 }
     *   },
     *
     *   members:
     *   {
     *     publicField: "foo",
     *     publicMethod: function() {},
     *
     *     _protectedField: "bar",
     *     _protectedMethod: function() {},
     *
     *     __privateField: "baz",
     *     __privateMethod: function() {}
     *   }
     * });
     * </pre>
     *
     * @type static
     * @param name {String} Name of the class
     * @param config {Map ? null} Class definition structure. The configuration map has the following keys:
     *     <table>
     *       <tr><th>Name</th><th>Type</th><th>Description</th></tr>
     *       <tr><th>type</th><td>String</td><td>
     *           Type of the class. Valid types are "abstract", "static" and "singleton".
     *           If unset it defaults to a regular non-static class.
     *       </td></tr>
     *       <tr><th>extend</th><td>Class</td><td>The super class the current class inherits from.</td></tr>
     *       <tr><th>implement</th><td>Interface | Interface[]</td><td>Single interface or array of interfaces the class implements.</td></tr>
     *       <tr><th>include</th><td>Mixin | Mixin[]</td><td>Single mixin or array of mixins, which will be merged into the class.</td></tr>
     *       <tr><th>construct</th><td>Function</td><td>The constructor of the class.</td></tr>
     *       <tr><th>statics</th><td>Map</td><td>Map of static members of the class.</td></tr>
     *       <tr><th>properties</th><td>Map</td><td>Map of property definitions. For a description of the format of a property definition see
     *           {@link qx.core.Property} or the legacy version {@link qx.core.LegacyProperty}.</td></tr>
     *       <tr><th>members</th><td>Map</td><td>Map of instance members of the class.</td></tr>
     *       <tr><th>settings</th><td>Map</td><td>Map of settings for this class. For a description of the format of a setting see
     *           {@link qx.core.Setting}.</td></tr>
     *       <tr><th>variants</th><td>Map</td><td>Map of settings for this class. For a description of the format of a setting see
     *           {@link qx.core.Variant}</td></tr>
     *       <tr><th>events</th><td>Map</td><td>
     *           Map of events the class fires. The keys are the names of the events and the values are the
     *           corresponding event type class names.
     *       </td></tr>
     *       <tr><th>defer</th><td>Function</td><td>Function that is called at the end of processing the class declaration. It allows access to the declared statics, members and properties.</td></tr>
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

      // Normalize include to array
      if (config.include && !(config.include instanceof Array)) {
        config.include = [config.include];
      }

      // Normalize implement to array
      if (config.implement && !(config.implement instanceof Array)) {
        config.implement = [config.implement];
      }

      // Normalize type
      if (!config.hasOwnProperty("extend") && !config.type) {
        config.type = "static";
      }

      // Validate incoming data
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        this.__validateConfig(name, config);
      }

      // Create the class
      var clazz = this.__createClass(name, config.type, config.extend, config.statics, config.construct, config.destruct);

      // Members, properties, events and mixins are only allowed for non-static classes
      if (config.extend)
      {
        // Attach properties
        if (config.properties) {
          this.__addProperties(clazz, config.properties, true);
        }

        // Attach members
        if (config.members) {
          this.__addMembers(clazz, config.members, true, true, false);
        }

        // Process events
        if (config.events) {
          this.__addEvents(clazz, config.events, true);
        }

        // Include mixins.
        // Must be the last here to detect conflicts
        if (config.include)
        {
          for (var i=0, l=config.include.length; i<l; i++) {
            this.__addMixin(clazz, config.include[i], false);
          }
        }
      }

      // Process settings
      if (config.settings)
      {
        for (var key in config.settings) {
          qx.core.Setting.define(key, config.settings[key]);
        }
      }

      // Process variants
      if (config.variants)
      {
        for (var key in config.variants) {
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

      // Interface support for non-static classes
      if (config.implement)
      {
        for (var i=0, l=config.implement.length; i<l; i++) {
          this.__addInterface(clazz, config.implement[i]);
        }
      }
    },


    /**
     * Creates a namespace and assigns the given object to it.
     *
     * @type static
     * @param name {String} The complete namespace to create. Typically, the last part is the class name itself
     * @param object {Object} The object to attach to the namespace
     * @return {Object} last part of the namespace (typically the class name)
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
        if (parent[part] !== undefined) {
          throw new Error("An object of the name '" + name + "' already exists and overwriting is not allowed!");
        }
      }

      // store object
      parent[part] = object;

      // return last part name (i.e. classname)
      return part;
    },


    /**
     * Whether the given class exists
     *
     * @type static
     * @param name {String} class name to check
     * @return {Boolean} true if class exists
     */
    isDefined : function(name) {
      return this.getByName(name) !== undefined;
    },


    /**
     * Determine the total number of classes
     *
     * @type static
     * @return {Number} the total number of classes
     */
    getTotalNumber : function() {
      return qx.lang.Object.getLength(this.__registry);
    },


    /**
     * Find a class by its name
     *
     * @type static
     * @param name {String} class name to resolve
     * @return {Class} the class
     */
    getByName : function(name) {
      return this.__registry[name];
    },


    /**
     * Include all features of the given mixin into the class. The mixin must
     * not include any methods or properties that are already available in the
     * class. This would only be possible using the {@link #patch} method.
     *
     * @type static
     * @param clazz {Class} An existing class which should be modified by including the mixin.
     * @param mixin {Mixin} The mixin to be included.
     */
    include : function(clazz, mixin)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        if (!mixin) {
          throw new Error("Includes of mixins must be mixins. The mixin of class '" + clazz.classname + "' is undefined/null!");
        }
        qx.Mixin.isCompatible(mixin, clazz);
      }

      qx.Class.__addMixin(clazz, mixin, false);
    },


    /**
     * Include all features of the given mixin into the class. The mixin may
     * include features which are already defined in the target class. Existing
     * features of equal name will be overwritten.
     * Please keep in mind that this functionality is not intented for regular
     * use, but as a formalized way (and a last resort) in order to patch
     * existing classes.
     *
     * <b>WARNING</b>: You may break working classes and features.
     *
     * @type static
     * @param clazz {Class} An existing class which should be modified by including the mixin.
     * @param mixin {Mixin} The mixin to be included.
     */
    patch : function(clazz, mixin)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.Mixin.isCompatible(mixin, clazz);
      }

      qx.Class.__addMixin(clazz, mixin, true);
    },


    /**
     * Whether a class is a direct or indirect sub class of another class,
     * or both classes coincide.
     *
     * @type static
     * @param clazz {Class} the class to check.
     * @param superClass {Class} the potential super class
     * @return {Boolean} whether clazz is a sub class of superClass.
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
     * Returns the definition of the given property. Returns null
     * if the property does not exist.
     *
     * TODO: Correctly support refined properties?
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
     * Returns the class or one of its superclasses which contains the
     * declaration for the given property in its class definition. Returns null
     * if the property is not specified anywhere.
     *
     * @param clazz {Class} class to look for the property
     * @param name {String} name of the property
     * @return {Class | null} The class which includes the property
     */
    getByProperty : function(clazz, name)
    {
      while (clazz)
      {
        if (clazz.$$properties && clazz.$$properties[name]) {
          return clazz;
        }

        clazz = clazz.superclass;
      }

      return null;
    },


    /**
     * Whether a class has the given property
     *
     * @type member
     * @param clazz {Class} class to check
     * @param name {String} name of the property to check for
     * @return {Boolean} whether the class includes the given property.
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
     * @param name {String} name of the event
     * @return {Map|null} Event type of the given event.
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
     * Whether a class supports the given event type
     *
     * @type member
     * @param clazz {Class} class to check
     * @param name {String} name of the event to check for
     * @return {Boolean} whether the class supports the given event.
     */
    supportsEvent : function(clazz, name) {
      return !!this.getEventType(clazz, name);
    },


    /**
     * Whether a class directly includes a mixin.
     *
     * @type static
     * @param clazz {Class} class to check
     * @param mixin {Mixin} the mixin to check for
     * @return {Boolean} whether the class includes the mixin directly.
     */
    hasOwnMixin: function(clazz, mixin) {
      return clazz.$$includes && clazz.$$includes.indexOf(mixin) !== -1;
    },


    /**
     * Returns the class or one of its superclasses which contains the
     * declaration for the given mixin. Returns null if the mixin is not
     * specified anywhere.
     *
     * @param clazz {Class} class to look for the mixin
     * @param mixin {Mixin} mixin to look for
     * @return {Class | null} The class which directly includes the given mixin
     */
    getByMixin : function(clazz, mixin)
    {
      var list, i, l;

      while (clazz)
      {
        if (clazz.$$includes)
        {
          list = clazz.$$flatIncludes;

          for (i=0, l=list.length; i<l; i++)
          {
            if (list[i] === mixin) {
              return clazz;
            }
          }
        }

        clazz = clazz.superclass;
      }

      return null;
    },


    /**
     * Returns a list of all mixins available in a given class.
     *
     * @param clazz {Class} class which should be inspected
     * @return {Mixin[]} array of mixins this class uses
     */
    getMixins : function(clazz)
    {
      var list = [];

      while (clazz)
      {
        if (clazz.$$includes) {
          list.push.apply(list, clazz.$$flatIncludes);
        }

        clazz = clazz.superclass;
      }

      return list;
    },


    /**
     * Whether a given class or any of its superclasses includes a given mixin.
     *
     * @type static
     * @param clazz {Class} class to check
     * @param mixin {Mixin} the mixin to check for
     * @return {Boolean} whether the class includes the mixin.
     */
    hasMixin: function(clazz, mixin) {
      return !!this.getByMixin(clazz, mixin);
    },


    /**
     * Whether a given class directly includes a interface.
     *
     * This function will only return "true" if the interface was defined
     * in the class declaration (@link qx.Class#define}) using the "implement"
     * key.
     *
     * @type static
     * @param clazz {Class} class or instance to check
     * @param iface {Interface} the interface to check for
     * @return {Boolean} whether the class includes the mixin directly.
     */
    hasOwnInterface : function(clazz, iface) {
      return clazz.$$implements && clazz.$$implements.indexOf(iface) !== -1;
    },


    /**
     * Returns the class or one of its superclasses which contains the
     * declaration of the given interface. Returns null if the interface is not
     * specified anywhere.
     *
     * @param clazz {Class} class to look for the interface
     * @param iface {Interface} interface to look for
     * @return {Class | null} the class which directly implements the given interface
     */
    getByInterface : function(clazz, iface)
    {
      var list, i, l;

      while (clazz)
      {
        if (clazz.$$implements)
        {
          list = clazz.$$flatImplements;

          for (i=0, l=list.length; i<l; i++)
          {
            if (list[i] === iface) {
              return clazz;
            }
          }
        }

        clazz = clazz.superclass;
      }

      return null;
    },


    /**
     * Returns a list of all mixins available in a class.
     *
     * @param clazz {Class} class which should be inspected
     * @return {Mixin[]} array of mixins this class uses
     */
    getInterfaces : function(clazz)
    {
      var list = [];

      while (clazz)
      {
        if (clazz.$$implements) {
          list.push.apply(list, clazz.$$flatImplements);
        }

        clazz = clazz.superclass;
      }

      return list;
    },


    /**
     * Whether a given class or any of its superclasses includes a given interface.
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
    hasInterface : function(clazz, iface) {
      return !!this.getByInterface(clazz, iface);
    },


    /**
     * Whether a given class conforms to an interface.
     *
     * Checks whether all methods defined in the interface are
     * implemented in the class. The class does not need to implement
     * the interface explicitly.
     *
     * @type static
     * @param clazz {Class} class to check
     * @param iface {Interface} the interface to check for
     * @return {Boolean} whether the class conforms to the interface.
     */
    implementsInterface : function(clazz, iface)
    {
      if (this.hasInterface(clazz, iface)) {
        return true;
      }

      try
      {
        qx.Interface.assert(clazz, iface, false);
        return true;
      }
      catch(ex) {}

      return false;
    },


    /**
     * Helper method to handle singletons
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
       PRIVATE/INTERNAL BASICS
    ---------------------------------------------------------------------------
    */

    /**
     * This method will be attached to all classes to return
     * a nice identifier for them.
     *
     * @internal
     * @return {String} The class identifier
     */
    genericToString : function() {
      return "[Class " + this.classname + "]";
    },


    /** Stores all defined classes */
    __registry : qx.core.Bootstrap.__registry,


    /** {Map} allowed keys in non-static class definition */
    __allowedKeys : qx.core.Variant.select("qx.debug",
    {
      "on":
      {
        "type"       : "string",    // String
        "extend"     : "function",  // Function
        "implement"  : "object",    // Interface[]
        "include"    : "object",    // Mixin[]
        "construct"  : "function",  // Function
        "statics"    : "object",    // Map
        "properties" : "object",    // Map
        "members"    : "object",    // Map
        "settings"   : "object",    // Map
        "variants"   : "object",    // Map
        "events"     : "object",    // Map
        "defer"      : "function",  // Function
        "destruct"   : "function"   // Function
      },

      "default" : null
    }),


    /** {Map} allowed keys in static class definition */
    __staticAllowedKeys : qx.core.Variant.select("qx.debug",
    {
      "on":
      {
        "type"       : "string",    // String
        "statics"    : "object",    // Map
        "settings"   : "object",    // Map
        "variants"   : "object",    // Map
        "defer"      : "function"   // Function
      },

      "default" : null
    }),


    /**
     * Validates an incoming configuration and checks for proper keys and values
     *
     * @type static
     * @param name {String} The name of the class
     * @param config {Map} Configuration map
     * @return {void}
     * @throws TODOC
     */
    __validateConfig : qx.core.Variant.select("qx.debug",
    {
      "on": function(name, config)
      {
        // Validate type
        if (config.type && !(config.type === "static" || config.type === "abstract" || config.type === "singleton")) {
          throw new Error('Invalid type "' + config.type + '" definition for class "' + name + '"!');
        }

        // Validate keys
        var allowed = config.type === "static" ? this.__staticAllowedKeys : this.__allowedKeys;
        for (var key in config)
        {
          if (!allowed[key]) {
            throw new Error('The configuration key "' + key + '" in class "' + name + '" is not allowed!');
          }

          if (config[key] == null) {
            throw new Error('Invalid key "' + key + '" in class "' + name + '"! The value is undefined/null!');
          }

          if (typeof config[key] !== allowed[key]) {
            throw new Error('Invalid type of key "' + key + '" in class "' + name + '"! The type of the key must be "' + allowed[key] + '"!');
          }
        }

        // Validate maps
        var maps = [ "statics", "properties", "members", "settings", "variants", "events" ];
        for (var i=0, l=maps.length; i<l; i++)
        {
          var key = maps[i];

          if (config[key] !== undefined && (config[key] instanceof Array || config[key] instanceof RegExp || config[key] instanceof Date || config[key].classname !== undefined)) {
            throw new Error('Invalid key "' + key + '" in class "' + name + '"! The value needs to be a map!');
          }
        }

        // Validate include definition
        if (config.include)
        {
          if (config.include instanceof Array)
          {
            for (var i=0, a=config.include, l=a.length; i<l; i++)
            {
              if (a[i] == null || a[i].$$type !== "Mixin") {
                throw new Error('The include definition in class "' + name + '" contains an invalid mixin at position ' + i + ': ' + a[i]);
              }
            }
          }
          else
          {
            throw new Error('Invalid include definition in class "' + name + '"! Only mixins and arrays of mixins are allowed!');
          }
        }

        // Validate implement definition
        if (config.implement)
        {
          if (config.implement instanceof Array)
          {
            for (var i=0, a=config.implement, l=a.length; i<l; i++)
            {
              if (a[i] == null || a[i].$$type !== "Interface") {
                throw new Error('The implement definition in class "' + name + '" contains an invalid interface at position ' + i + ': ' + a[i]);
              }
            }
          }
          else
          {
            throw new Error('Invalid implement definition in class "' + name + '"! Only interfaces and arrays of interfaces are allowed!');
          }
        }

        // Check mixin compatibility
        if (config.include)
        {
          try {
            qx.Mixin.checkCompatibility(config.include);
          } catch(ex) {
            throw new Error('Error in include definition of class "' + name + '"! ' + ex.message);
          }
        }

        // Validate settings
        if (config.settings)
        {
          for (var key in config.settings)
          {
            if (key.substr(0, key.indexOf(".")) != name.substr(0, name.indexOf("."))) {
              qx.log.Logger.ROOT_LOGGER.error('Forbidden setting "' + key + '" found in "' + name + '". It is forbidden to define a default setting for an external namespace!');
            }
          }
        }

        // Validate variants
        if (config.variants)
        {
          for (var key in config.variants)
          {
            if (key.substr(0, key.indexOf(".")) != name.substr(0, name.indexOf("."))) {
              throw new Error('Forbidden variant "' + key + '" found in "' + name + '". It is forbidden to define a variant for an external namespace!');
            }
          }
        }
      },

      "default" : function() {}
    }),


    /**
     * Creates a class by type. Supports modern inheritance etc.
     *
     * @type static
     * @param name {String} Full name of the class
     * @param type {String} type of the class, i.e. "static", "abstract" or "singleton"
     * @param extend {Class} Superclass to inherit from
     * @param statics {Map} Static methods or fields
     * @param construct {Function} Constructor of the class
     * @param destruct {Function} Destructor of the class
     * @return {Class} The generated class
     */
    __createClass : function(name, type, extend, statics, construct, destruct)
    {
      var clazz;

      if (!extend && qx.core.Variant.isSet("qx.aspects", "off"))
      {
        // Create empty/non-empty class
        clazz = statics || {};
      }
      else
      {
        clazz = {};

        if (extend)
        {
          // Create default constructor
          if (!construct) {
            construct = this.__createDefaultConstructor();
          }

          // Wrap constructor to handle mixin constructors and property initialization
          clazz = this.__wrapConstructor(construct, name, type);
        }

        // Copy statics
        if (statics)
        {
          var key;

          for (var i=0, a=qx.lang.Object.getKeys(statics), l=a.length; i<l; i++)
          {
            key = a[i];

            if (qx.core.Variant.isSet("qx.aspects", "on"))
            {
              var staticValue = statics[key];
              if (staticValue instanceof Function) {
                staticValue = qx.core.Aspect.wrap(name + "." + key, staticValue, "static");
              }
              clazz[key] = staticValue;
            }
            else
            {
              clazz[key] = statics[key];
            }
          }
        }
      }

      // Create namespace
      var basename = this.createNamespace(name, clazz, false);

      // Store names in constructor/object
      clazz.name = clazz.classname = name;
      clazz.basename = basename;

      // Attach toString
      if (!clazz.hasOwnProperty("toString")) {
        clazz.toString = this.genericToString;
      }

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

        // Store destruct onto class
        if (destruct) {
          if (qx.core.Variant.isSet("qx.aspects", "on")) {
            destruct = qx.core.Aspect.wrap(name, destruct, "destructor");
          }
          clazz.$$destructor = destruct;
        }
      }

      // Compatibility to qooxdoo 0.6.6
      if (qx.core.Variant.isSet("qx.compatibility", "on"))
      {
        qx.Clazz = clazz;
        qx.Proto = proto || null;
        qx.Super = extend || null;
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
     * Attach events to the class
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
            if (clazz.$$events[key] !== undefined && clazz.$$events[key] !== events[key]) {
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
     * Attach properties to classes
     *
     * @type static
     * @param clazz {Class} class to add the properties to
     * @param properties {Map} map of properties
     * @param patch {Boolean ? false} Overwrite property with the limitations of a property
               which means you are able to refine but not to replace (esp. for new properties)
     */
    __addProperties : function(clazz, properties, patch)
    {
      var config;

      if (patch === undefined) {
        patch = false;
      }

      var attach = !!clazz.$$propertiesAttached;

      for (var name in properties)
      {
        config = properties[name];

        // Check incoming configuration
        if (qx.core.Variant.isSet("qx.debug", "on")) {
          this.__validateProperty(clazz, name, config, patch);
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
          clazz.prototype["__init$" + name] = config.init;
        }

        // register event name
        if (config.event !== undefined) {
          var event = {}
          event[config.event] = "qx.event.type.ChangeEvent";
          this.__addEvents(clazz, event, patch);
        }

        // Remember inheritable properties
        if (config.inheritable) {
          qx.core.Property.$$inheritable[name] = true;
        }

        // If instances of this class were already created, we
        // need to attach the new style properties functions, directly.
        if (attach) {
          qx.core.Property.attachMethods(clazz, name, config);
        }

        // Create old style properties
        if (config._fast) {
          qx.core.LegacyProperty.addFastProperty(config, clazz.prototype);
        } else if (config._cached) {
          qx.core.LegacyProperty.addCachedProperty(config, clazz.prototype);
        } else if (config._legacy) {
          qx.core.LegacyProperty.addProperty(config, clazz.prototype);
        }
      }
    },

    /**
     *
     * @param clazz {Class} class to add property to
     * @param name {String} name of the property
     * @param config {Map} configuration map
     * @param patch {Boolean ? false} enable refine/patch?
     */
    __validateProperty : qx.core.Variant.select("qx.debug",
    {
      "on": function(clazz, name, config, patch)
      {
        var has = this.hasProperty(clazz, name);
        var compat = config._legacy || config._fast || config._cached;

        if (has)
        {
          var existingProperty = this.getPropertyDefinition(clazz, name);
          var existingCompat = existingProperty._legacy || existingProperty._fast || existingProperty._cached;

          if (compat != existingCompat) {
            throw new Error("Could not redefine existing property '" + name + "' of class '" + clazz.classname + "'.");
          }

          if (config.refine && existingProperty.init === undefined) {
            throw new Error("Could not refine a init value if there was previously no init value defined. Property '" + name + "' of class '" + clazz.classname + "'.");
          }
        }

        if (!has && config.refine) {
          throw new Error("Could not refine non-existent property: " + name + "!");
        }

        if (has && !patch) {
          throw new Error("Class " + clazz.classname + " already has a property: " + name + "!");
        }

        if (has && patch && !compat)
        {
          if (!config.refine) {
            throw new Error('Could not refine property "' + name + '" without a "refine" flag in the property definition! This class: ' + clazz.classname + ', original class: ' + this.getByProperty(clazz, name).classname + '.');
          }

          for (var key in config)
          {
            if (key !== "init" && key !== "refine") {
              throw new Error("Class " + clazz.classname + " could not refine property: " + name + "! Key: " + key + " could not be refined!");
            }
          }
        }

        if (compat) {
          return;
        }

        // Check 0.7 keys
        var allowed = config.group ? qx.core.Property.$$allowedGroupKeys : qx.core.Property.$$allowedKeys;
        for (var key in config)
        {
          if (allowed[key] === undefined) {
            throw new Error('The configuration key "' + key + '" of property "' + name + '" in class "' + clazz.classname + '" is not allowed!');
          }

          if (config[key] === undefined) {
            throw new Error('Invalid key "' + key + '" of property "' + name + '" in class "' + clazz.classname + '"! The value is undefined: ' + config[key]);
          }

          if (allowed[key] !== null && typeof config[key] !== allowed[key]) {
            throw new Error('Invalid type of key "' + key + '" of property "' + name + '" in class "' + clazz.classname + '"! The type of the key must be "' + allowed[key] + '"!');
          }
        }

        if (config.transform != null)
        {
          if (!(typeof config.transform == "string")) {
            throw new Error('Invalid transform definition of property "' + name + '" in class "' + clazz.classname + '"! Needs to be a String.');
          }
        }

        if (config.check != null)
        {
          if (!(typeof config.check == "string" ||config.check instanceof Array || config.check instanceof Function)) {
            throw new Error('Invalid check definition of property "' + name + '" in class "' + clazz.classname + '"! Needs to be a String, Array or Function.');
          }
        }

        if (config.event != null && !this.isSubClassOf(clazz, qx.core.Target))
        {
          throw new Error("Invalid property '"+name+"' in class '"+clazz.classname+"': Properties defining an event can only be defined in sub classes of 'qx.core.Target'!");
        }
      },

      "default" : null
    }),


    /**
     * Attach members to a class
     *
     * @param clazz {Class} clazz to add members to
     * @param members {Map} The map of members to attach
     * @param patch {Boolean ? false} Enable patching of
     * @param base (Boolean ? true) Attach base flag to mark function as members
     *     of this class
     * @param wrap {Boolean ? false} Whether the member method should be wrapped.
     *     this is needed to allow base calls in patched mixin members.
     * @return {void}
     */
    __addMembers : function(clazz, members, patch, base, wrap)
    {
      var proto = clazz.prototype;
      var key, member;

      for (var i=0, a=qx.lang.Object.getKeys(members), l=a.length; i<l; i++)
      {
        key = a[i];
        member = members[key];

        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (proto[key] !== undefined && key.charAt(0) == "_" && key.charAt(1) == "_") {
            throw new Error('Overwriting private member "' + key + '" of Class "' + clazz.classname + '" is not allowed!');
          }

          if (patch !== true && proto[key] !== undefined) {
            throw new Error('Overwriting member "' + key + '" of Class "' + clazz.classname + '" is not allowed!');
          }
        }

        // Added helper stuff to functions
        // Hint: Could not use typeof function because RegExp objects are functions, too
        if (base !== false && member instanceof Function)
        {
          if (wrap == true)
          {
            // wrap "patched" mixin member
            member = this.__mixinMemberWrapper(member, proto[key]);
          }
          else
          {
            // Configure extend (named base here)
            // Hint: proto[key] is not yet overwritten here
            if (proto[key]) {
              member.base = proto[key];
            }
            member.self = clazz;
          }

          if (qx.core.Variant.isSet("qx.aspects", "on")) {
            member = qx.core.Aspect.wrap(clazz.classname + "." + key, member, "member");
          }

        }

        // Attach member
        proto[key] = member;
      }
    },


    /**
     * Wraps a member function of a mixin, which is included using "patch". This
     * allows "base" calls in the mixin member function.
     *
     * @param member {Function} The mixin method to wrap
     * @param base {Function} The overwritten method
     * @return {Function} the wrapped mixin member
     */
    __mixinMemberWrapper : function(member, base)
    {
      if (base)
      {
        return function()
        {
          var oldBase = member.base;
          member.base = base;
          var retval = member.apply(this, arguments);
          member.base = oldBase;
          return retval;
        }
      }
      else
      {
        return member;
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
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!clazz || !iface) {
          throw new Error("Incomplete parameters!")
        }

        // This differs from mixins, we only check if the interface is already
        // directly used by this class. It is allowed however, to have an interface
        // included multiple times by extends in the interfaces etc.
        if (this.hasOwnInterface(clazz, iface)) {
          throw new Error('Interface "' + iface.name + '" is already used by Class "' + clazz.classname + '!');
        }

        // Check interface and wrap members
        qx.Interface.assert(clazz, iface, true);
      }

      // Store interface reference
      var list = qx.Interface.flatten([iface]);
      if (clazz.$$implements)
      {
        clazz.$$implements.push(iface);
        clazz.$$flatImplements.push.apply(clazz.$$flatImplements, list);
      }
      else
      {
        clazz.$$implements = [iface];
        clazz.$$flatImplements = list;
      }
    },


    /**
     * Include all features of the mixin into the given class (recursive).
     *
     * @param clazz {Class} A class previously defined where the mixin should be attached.
     * @param mixin {Mixin} Include all features of this mixin
     * @param patch {Boolean} Overwrite existing fields, functions and properties
     */
    __addMixin : function(clazz, mixin, patch)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!clazz || !mixin) {
          throw new Error("Incomplete parameters!")
        }

        if (this.hasMixin(clazz, mixin)) {
          throw new Error('Mixin "' + mixin.name + '" is already included into Class "' + clazz.classname + '" by class: ' + this.getByMixin(clazz, mixin).classname + '!');
        }
      }

      // Attach content
      var list = qx.Mixin.flatten([mixin]);
      var entry;

      for (var i=0, l=list.length; i<l; i++)
      {
        entry = list[i];

        // Attach events
        if (entry.$$events) {
          this.__addEvents(clazz, entry.$$events, patch);
        }

        // Attach properties (Properties are already readonly themselve, no patch handling needed)
        if (entry.$$properties) {
          this.__addProperties(clazz, entry.$$properties, patch);
        }

        // Attach members (Respect patch setting, but dont apply base variables)
        if (entry.$$members) {
          this.__addMembers(clazz, entry.$$members, patch, patch, patch);
        }
      }

      // Store mixin reference
      if (clazz.$$includes)
      {
        clazz.$$includes.push(mixin);
        clazz.$$flatIncludes.push.apply(clazz.$$flatIncludes, list);
      }
      else
      {
        clazz.$$includes = [mixin];
        clazz.$$flatIncludes = list;
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
     * Generate a wrapper of the original class constructor in order to enable
     * some of the advanced OO features (e.g. abstract class, singleton, mixins)
     *
     * @param construct {Function} the original constructor
     * @param name {String} name of the class
     * @param type {String} the user specified class type
     */
    __wrapConstructor : function(construct, name, type)
    {
      var code = [];

      // We can access the class/statics using arguments.callee
      code.push('var clazz=arguments.callee.constructor;');

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // new keyword check
        code.push('if(!(this instanceof clazz))throw new Error("Please initialize ', name, ' objects using the new keyword!");');

        // add abstract and singleton checks
        if (type === "abstract") {
          code.push('if(this.classname===', name, '.classname)throw new Error("The class ', name, ' is abstract! It is not possible to instantiate it.");');
        } else if (type === "singleton") {
          code.push('if(!clazz.$$allowconstruct)throw new Error("The class ', name, ' is a singleton! It is not possible to instantiate it directly. Use the static getInstance() method instead.");');
        }
      }

      // Attach local properties
      code.push('if(!clazz.$$propertiesAttached)qx.core.Property.attach(clazz);');

      // Execute default constructor
      code.push('var retval=clazz.$$original.apply(this,arguments);');

      // Initialize local mixins
      code.push('if(clazz.$$includes){var mixins=clazz.$$flatIncludes;');
      code.push('for(var i=0,l=mixins.length;i<l;i++){');
      code.push('if(mixins[i].$$constructor){mixins[i].$$constructor.apply(this,arguments);}}}');

      // Mark instance as initialized
      code.push('if(this.classname===', name, '.classname)this.$$initialized=true;');

      // Return optional return value
      code.push('return retval;');

      // Parse code as function
      var wrapper = new Function(code.join(""));

      if (qx.core.Variant.isSet("qx.aspects", "on")) {
        var aspectWrapper = qx.core.Aspect.wrap(name, wrapper, "constructor");
        wrapper.$$original = construct;
        wrapper.constructor = aspectWrapper;
        wrapper = aspectWrapper;
      }

      // Add singleton getInstance()
      if (type === "singleton") {
        wrapper.getInstance = this.getInstance;
      }

      // Store original constructor
      wrapper.$$original = construct;

      // Store wrapper into constructor (needed for base calls etc.)
      construct.wrapper = wrapper;

      // Return generated wrapper
      return wrapper;
    }
  },

  defer : function(statics)
  {
    // profiling
    if (qx.core.Variant.isSet("qx.aspects", "on")) {
      for (var key in statics) {
        // only functions, no regexps
        if (statics[key] instanceof Function) {
          statics[key] = qx.core.Aspect.wrap("qx.Class." + key, statics[key], "static");
        }
      }
    }
  }
});
