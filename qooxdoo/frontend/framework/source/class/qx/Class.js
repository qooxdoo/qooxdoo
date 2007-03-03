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
 * This class builds the basis for the qooxdoo class system and the qooxdoo
 * style of object oriented JavaScript. The define method is used to create
 * all classes.
 *
 * Instances of classes defined with <code>qx.Class.define</code> have the
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
     *       <tr><th>type</th><td>String</td><td>Type of the class. Valid types are "abstract", "static" and "singleton"</td></tr>
     *       <tr><th>extend</th><td>Class</td><td>The super class the current class inherits from.</td></tr>
     *       <tr><th>implement</th><td>Interface | Interface[]</td><td>Single interface or array of interfaces the class implements.</td></tr>
     *       <tr><th>include</th><td>Mixin | Mixin[]</td><td>Single mixin or array of mixins, which will be merged into the class.</td></tr>
     *       <tr><th>construct</th><td>Function</td><td>The constructor of the class.</td></tr>
     *       <tr><th>statics</th><td>Map</td><td>Map of static members of the class.</td></tr>
     *       <tr><th>properties</th><td>Map</td><td>Map of property definitions. Format of the map: TODOC</td></tr>
     *       <tr><th>members</th><td>Map</td><td>Map of instance members of the class.</td></tr>
     *       <tr><th>settings</th><td>Map</td><td>Map of settings for this class. Format of the map: TODOC</td></tr>
     *       <tr><th>variants</th><td>Map</td><td>Map of settings for this class. Format of the map: TODOC</td></tr>
     *       <tr><th>events</th><td>Map</td><td>Map of events the class fires. The keys are the names of the events and the values are corresponding event type classes.</td></tr>
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

        // Copy known interfaces and mixins from superclass
        if (superclass.$$includes) {
          clazz.$$includes = qx.lang.Object.copy(superclass.$$includes);
        }

        if (superclass.$$implements) {
          clazz.$$implements = qx.lang.Object.copy(superclass.$$implements);
        }

        // Copy property lists
        if (superclass.$$properties) {
          clazz.$$properties = qx.lang.Object.copy(superclass.$$properties);
        }

        // Attach properties
        if (config.properties)
        {
          for (var name in config.properties) {
            this.__addProperty(clazz, name, config.properties[name]);
          }
        }

        // Attach members
        if (config.members) {
          this.__addMembers(clazz, config.members);
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
          add : function(name, config) {
            qx.Class.__addProperty(clazz, name, config);
          }
        });
      }

      // Interfaces are available in all types of classes
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
     * @return {call} TODOC
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

      return qx.Class.__addMixin(clazz, mixin, false);
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

      return qx.Class.__addMixin(clazz, mixin, true);
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

      switch (functionType) {
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
     * Helper to handle singletons
     *
     * @type static
     * @return {var} TODOC
     */
    __getInstance : function()
    {
      if (!this.$$instance)
      {
        this.$$allowconstruct = true;
        this.$$instance = new this;
        delete this.$$allowconstruct;
      }

      return this.$$instance;
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
          clazz = this.__createSingletonConstructor(name, construct);
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
        var superproto = extend.prototype;

        // Use helper function/class to save the unnecessary constructor call while
        // setting up inheritance.
        var helper = this.__createEmptyFunction();
        helper.prototype = superproto;
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
          - Store statics/constructor onto constructor/prototype
          - Store correct constructor
          - Store statics onto prototype
        */
        construct.self = clazz.constructor = proto.constructor = clazz;

        /*
          - Store destruct onto statics/constructor
        */
        if (destruct) {
          clazz.destructor = destruct;
        }

        // Compatibility to qooxdoo 0.6.x
        if (qx.core.Variant.isSet("qx.compatibility", "on"))
        {
          qx.Clazz = clazz;
          qx.Proto = proto;
          qx.Super = extend;
        }
      }
      else
      {
        // Compatibility to qooxdoo 0.6.x
        if (qx.core.Variant.isSet("qx.compatibility", "on"))
        {
          qx.Clazz = clazz;
          qx.Proto = null;
          qx.Super = null;
        }
      }

      // add statics protection
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (statics)
        {
          for (var key in statics)
          {
            var staticMember = clazz[key];
            if (typeof(staticMember) == "function")
            {
              staticMember.self = clazz;
              clazz[key] = this.__addAccessProtectionStatics(staticMember, key, clazz);
            }
          }
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
     * @param events {String[]} list of event names the class fires.
     */
    __addEvents : function(clazz, events)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!qx.core.Target) {
          throw new Error(clazz.classname + ": the class 'qx.core.Target' must be availabe to use events!");
        }

        if (!this.isSubClassOf(clazz, qx.core.Target)) {
          throw new Error(clazz.classname + ": the 'events' key can only be used for sub classes of 'qx.core.Target'!");
        }

        if (typeof events != "object" || events instanceof Array) {
          throw new Error(clazz.classname + ": the events must be defined as map!");
        }

        for (var key in events)
        {
          if (typeof events[key] !== "string") {
            throw new Error(clazz.classname + "/" + key + ": the event value needs to be a string with the class name of the event object which will be fired.");
          }
        }
      }

      clazz.$$events = events;
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
    __addProperty : function(clazz, name, config)
    {
      var proto = clazz.prototype;

      config.name = name;

      if (qx.core.Variant.isSet("qx.compatibility", "on"))
      {
        if (config._fast) {
          qx.core.LegacyProperty.addFastProperty(config, proto);
        } else if (config._cached) {
          qx.core.LegacyProperty.addCachedProperty(config, proto);
        } else if (config._legacy) {
          qx.core.LegacyProperty.addProperty(config, proto);
        } else {
          qx.core.Property.addProperty(config, proto);
        }
      }
      else
      {
        qx.core.Property.addProperty(config, proto);
      }

      // register config
      if (clazz.$$properties === undefined) {
        clazz.$$properties = {};
      }

      // add config to config list
      clazz.$$properties[name] = config;
      
      // TODO: Remove with qx 0.7 final
      if (!config.dispose && (config.type == "function" || config.type == "object")) 
      {
        console.warn("Please enable the dispose property for '" + config.name + "' defined by class '" + clazz.classname + "'");
        config.dispose = true;
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
    __addMembers : qx.core.Variant.select("qx.client",
    {
      "default" : function(clazz, members)
      {
        var superproto = clazz.superclass.prototype;
        var proto = clazz.prototype;

        for (var key in members)
        {
          var member = members[key];

          // Added helper stuff to functions
          if (typeof member === "function")
          {
            if (qx.core.Variant.isSet("qx.debug", "on"))
            {
              if (key == "dispose" && clazz.classname != "qx.core.Object") {
                throw new Error("Found old-style dispose in: " + clazz.classname);
              }
            }

            // Configure extend (named base here)
            if (superproto[key]) {
              member.base = superproto[key];
            }

            member.self = clazz;

            // add member protection
            if (qx.core.Variant.isSet("qx.debug", "on")) {
              member = this.__addAccessProtectionMembers(member, key, clazz);
            }
          }

          // Attach member
          proto[key] = member;
        }
      },

      "mshtml" : function(clazz, members)
      {
        var memberNames = qx.lang.Object.getKeys(members);
        var superproto = clazz.superclass.prototype;
        var proto = clazz.prototype;

        for (var i=0, l=memberNames.length; i<l; i++)
        {
          var key = memberNames[i];
          var member = members[key];

          // Added helper stuff to functions
          if (typeof member === "function")
          {
            // Configure extend (named base here)

            if (superproto[key]) {
              member.base = superproto[key];
            }

            member.self = clazz;

            // add member protection
            if (qx.core.Variant.isSet("qx.debug", "on")) {
              member = this.__addAccessProtectionMembers(member, key, clazz);
            }
          }

          // Attach member
          proto[key] = member;
        }
      }
    }),


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
      // Pre check registry
      if (!clazz.$$implements) {
        clazz.$$implements = {};
      } else if (clazz.$$implements[iface.name]) {
        throw new Error('Interface "' + iface.name + '" is already used by Class "' + clazz.classname + '"!');
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
      // Pre check registry
      if (!clazz.$$includes) {
        clazz.$$includes = {};
      } else if (clazz.$$includes[mixin.name]) {
        throw new Error('Mixin "' + mixin.name + '" is already included into Class "' + clazz.classname + '"!');
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
        if (includes.isMixin)
        {
          this.__attachMixinContent(clazz, includes, patch);
        }
        else
        {
          for (var i=0, l=includes.length; i<l; i++) {
            this.__attachMixinContent(clazz, includes[i], patch);
          }
        }
      }

      // TODO add protection !!!!

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
            if (!clazz.$$properties || !clazz.$$properties[key]) {
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
        if (qx.core.Variant.isSet("qx.client", "mshtml"))
        {
          var memberNames = qx.lang.Object.getKeys(members);
          for (var i=0; i<memberNames.length; i++)
          {
            var key = memberNames[i];
            var member = members[key];

            if (proto[key] !== undefined && !patch) {
              throw new Error('Overwriting member "' + key + '" of Class "' + clazz.classname + '" by Mixin "' + mixin.name + '" is not allowed!');
            }

            // add member protection
            if (qx.core.Variant.isSet("qx.debug", "on")) {
              member = this.__addAccessProtectionMembers(member, key, clazz);
            }

            proto[key] = member;
          }
        }
        else
        {
          for (var key in members)
          {
            if (proto[key] !== undefined && !patch) {
              throw new Error('Overwriting member "' + key + '" of Class "' + clazz.classname + '" by Mixin "' + mixin.name + '" is not allowed!');
            }
            var member = members[key];

            // add member protection
            if (qx.core.Variant.isSet("qx.debug", "on")) {
              member = this.__addAccessProtectionMembers(member, key, clazz);
            }

            proto[key] = member;
          }
        }
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
          if (this.classname == arguments.callee.$$abstract) {
            throw new Error("The class '" + className + "' is abstract! It is not possible to instantiate it.");
          }

          return construct.apply(this, arguments);
        }

        construct.wrapper = abstractConstructor;
        abstractConstructor.$$abstract = className;
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
     * @param className {String} fully qualified class name of the constructor.
     * @param construct {Function} original constructor to wrap
     * @return {Function} wrapped constructor
     */
    __createSingletonConstructor : function(className, construct)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        function singletonConstruct()
        {
          if (!arguments.callee.$$allowconstruct) {
            throw new Error("The class '" + className + "' is a singleton! It is not possible to instantiate it directly. Use the static 'getInstance' method instead.");
          }

          return construct.apply(this, arguments);
        }
        construct.wrapper = singletonConstruct;
        return singletonConstruct;
      }
      else
      {
        // in production code omit the check and just return the
        // constructor
        return construct;
      }
    },


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
