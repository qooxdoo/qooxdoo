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
            throw new Error("Invalid key '" + key + "' in class '" + name + "'! The value is undefined/null!");
          }
        }
      }

      var implement = config.implement;
      if (implement && !(implement instanceof Array)) {
        implement = [ implement ];
      };

      var include = config.include;
      if (include && !(include instanceof Array)) {
        include = [ include ];
      };

      var obj = this.__createClass(name, config.type, config.extend, config.construct, config.statics);
      this.__processSettings(obj, config.settings);
      this.__processVariants(obj, config.variants);
      this.__addStatics(obj, config.statics);

      // For static classes we're done now
      if (config.extend)
      {
        this.__applyInheritance(obj, config.extend, config.construct);
        this.__addMembers(obj, config.members);
        this.__addProperties(obj, config.properties);
        this.__addMixins(obj, include);
        this.__addInterfaces(obj, implement);
      }
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

    __createClass : function(name, type, extend, construct, statics)
    {
      if (!extend)
      {
        if (construct) {
          throw new Error('Superclass is undefined, but constructor was given for class: "' + name + "'");
        }

        // Create empty/non-empty class
        var obj = {};
      }
      else
      {
        if (!construct) {
          throw new Error('Constructor is missing for class "' + name + "'");
        }

        // Store class pointer
        if (type == "abstract")
        {
          obj = this.__createAbstractConstructor(name, construct);
        }
        else if (type == "singleton")
        {
          obj = this.__createSingletonConstructor(construct);

          // three alternatives to implement singletons
          if (true)
          {
            // automagically add the getInstance method to the statics
            if (!statics) {
              statics = {};
            }

            statics.getInstance = qx.Clazz.__getInstance;
          }
          else if (true)
          {
            // enfore the imlpementation of the interface qx.lang.ISingleton
            if (!implement) {
              implement = [];
            }

            implement.push(qx.lang.ISingleton);
          }
          else
          {
            // automagically add the getInstance method to the statics
            if (!statics) {
              statics = {};
            }

            statics.getInstance = qx.lang.MSingleton.statics.getInstance;
          }
        }
        else
        {
          obj = construct;
        }
      }

      // Create namespace
      var basename = this.createNamespace(name, obj, false);

      // Store names in constructor/object
      obj.classname = name;
      obj.basename = basename;

      // Store class reference in global class registry
      this.__registry[name] = obj;

      return obj;
    },

    __applyInheritance : function(obj, extend, construct)
    {
      // Use helper function/class to save the unnecessary constructor call while
      // setting up inheritance.
      var helper = this.__emptyFunction();
      helper.prototype = extend.prototype;
      var prot = new helper;

      // Apply prototype to new helper instance
      obj.prototype = prot;

      // Store names in prototype
      prot.classname = obj.classname;
      prot.basename = obj.basename;

      // Store reference to extend class
      obj.superclass = prot.superclass = extend;

      // Store correct constructor
      obj.constructor = prot.constructor = construct;

      // Store base constructor to constructor
      construct.base = extend;

      // Compatibility to old properties etc.
      qx.Class = obj;
      qx.Proto = prot;
      qx.Super = extend;

      // Copy property lists
      if (extend.prototype._properties) {
        prot._properties = qx.lang.Object.copy(extend.prototype._properties);
      }

      if (extend.prototype._objectproperties) {
        prot._objectproperties = qx.lang.Object.copy(extend.prototype._objectproperties);
      }
    },






    __addStatics : function(obj, statics)
    {
      if (!statics) {
        return;
      }

      for (var key in statics)
      {
        obj[key] = statics[key];

        // Added helper stuff to functions
        if (typeof statics[key] == "function")
        {
          // Configure class
          obj[key].statics = obj;
        }
      }
    },

    /**
     * Wrapper for qx.OO.addProperty. This is needed in two places so the code
     * has been extracted. The global variables qx.Class, qx.Proto and qx.Super
     * must be set before this method is called.
     *
     * @param targetClass {Clazz} class to add the properties to
     * @param properties {Map} new class style property definitions
     */
    __addProperties: function(targetClass, properties)
    {
      if (!properties) {
        return;
      }

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (
          (qx.Class != targetClass) ||
          (qx.Proto != targetClass.prototype) ||
          (qx.Super != targetClass.constructor.base)
        ) {
          throw new Error("The global variable qx.Proto, qx.Class and qx.Super must point to the target class!");
        }
      }

      var legacy = qx.core.LegacyProperty;
      var proto = targetClass.prototype;

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

    __addMembers: function(obj, members)
    {
      if (!members) {
        return;
      }

      var superprot = obj.superclass.prototype;
      var prot = obj.prototype;

      for (var key in members)
      {
        // Attach member
        var member = prot[key] = members[key];

        // Added helper stuff to functions
        if (typeof member === "function")
        {
          if (superprot[key])
          {
            // Configure extend (named base here)
            member.base = superprot[key];
          }

          // Configure class [TODO: find better name for statics here]
          member.statics = obj;
        }
      }
    },

    __addMixins : function(obj, include)
    {
      if (!include) {
        return;
      }

      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.Mixin.compatible(include, 'include list in Class "' + name + '".');
      }

      for (var i=0, l=include.length; i<l; i++) {
        this.__mixin(obj, include[i], false);
      }
    },

    __addInterfaces : function(obj, interfaces)
    {
      if (!interfaces) {
        return;
      }

      // initialize registry
      obj.$$IMPLEMENTS = {};

      for (var i=0, l=interfaces.length; i<l; i++)
      {
        // Only validate members in debug mode.
        // There is nothing more needed for builds
        if (qx.core.Variant.isSet("qx.debug", "on")) {
          qx.Interface.assertInterface(obj, interfaces[i], true);
        }

        // copy primitive static fields
        var interfaceStatics = interfaces[i].statics;
        for (key in interfaceStatics)
        {
          if (typeof(interfaceStatics[key]) != "function")
          {
            // Attach statics
            // Validation is done in qx.Interface
            obj[key] = interfaceStatics[key];
          }
        }

        // save interface name
        obj.$$IMPLEMENTS[interfaces[i].name] = interfaces[i];
      }
    },






    /**
     * Include all features of the Mixin into the given Class.
     *
     * @access private
     * @param targetClass {Clazz} A class previously defined where the mixin should be attached.
     * @param mixin {Mixin} Include all features of this Mixin
     * @param overwrite {Boolean} Overwrite existing functions and properties
     */
    __mixin : function(targetClass, mixin, overwrite)
    {
      // Attach members
      // Directly attach them. This is because we must not
      // modify them e.g. attaching base etc. because they may
      // used by multiple classes
      var imembers = mixin.members;
      var proto = targetClass.prototype;

      if (imembers == null) {
        throw new Error('Invalid include in class "' + proto.classname + '"! The value is undefined/null!');
      }

      for (var key in imembers)
       {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (!overwrite && proto[key] != undefined) {
            throw new Error("Overwriting the member '" + key + "' is not allowed!");
          }
        }
        proto[key] = imembers[key];
      }

      // Attach statics
      var istatics = mixin.statics;
      for (var key in istatics)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (!overwrite && targetClass[key] != undefined) {
            throw new Error("Overwriting the static '" + key + "' is not allowed!");
          }
        }
        targetClass[key] = istatics[key];
      }

      // Attach properties
      var iproperties = mixin.properties;
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        for (var key in iproperties)
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
      this.__addProperties(targetClass, iproperties);
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
     * @return {Fucntion} empty function
     */
    __emptyFunction: function() {
      return function() {};
    },








    /**
     * Define settings for a class
     *
     * @param settings {Map ? null} Maps the setting name to the default value.
     * @param className {String} name of the class defining the setting
     */
    __processSettings: function(obj, settings)
    {
      if (!settings) {
        return;
      }

      for (var key in settings)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (key.substr(0, key.indexOf(".")) != obj.classname.substr(0, obj.classname.indexOf("."))) {
            throw new Error('Forbidden setting "' + key + '" found in "' + obj.classname + '". It is forbidden to define a default setting for an external namespace!');
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
     *  @param className {String} name of the class defining the variant.
     */
    __processVariants: function(obj, variants)
    {
      if (!variants) {
        return;
      }

      for (var key in variants)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (key.substr(0, key.indexOf(".")) != obj.classname.substr(0, obj.classname.indexOf("."))) {
            throw new Error('Forbidden variant "' + key + '" found in "' + obj.classname + '". It is forbidden to define a variant for an external namespace!');
          }
        }

        qx.core.Variant.define(key, variants[key].allowedValues, variants[key].defaultValue);
      }
    }
  }
});
