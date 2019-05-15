/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Create namespace
 *
 * @ignore(qx.data)
 * @ignore(qx.data.IListData)
 * @ignore(qx.util.OOUtil)
 */
if (!window.qx) {
  window.qx = {};
}

/**
 * Bootstrap qx.Bootstrap to create myself later
 * This is needed for the API browser etc. to let them detect me
 */
qx.Bootstrap = {

  genericToString : function() {
    return "[Class " + this.classname + "]";
  },

  createNamespace : function(name, object)
  {
    var splits = name.split(".");
    var part = splits[0];
    var parent = qx.$$namespaceRoot && qx.$$namespaceRoot[part] ? qx.$$namespaceRoot : window;

    for (var i=0, len=splits.length-1; i<len; i++, part=splits[i])
    {
      if (!parent[part]) {
        parent = parent[part] = {};
      } else {
        parent = parent[part];
      }
    }

    // store object
    parent[part] = object;

    // return last part name (e.g. classname)
    return part;
  },


  setDisplayName : function(fcn, classname, name)
  {
    fcn.displayName = classname + "." + name + "()";
  },


  setDisplayNames : function(functionMap, classname)
  {
    for (var name in functionMap)
    {
      var value = functionMap[name];
      if (value instanceof Function) {
        value.displayName = classname + "." + name + "()";
      }
    }
  },


  base : function(args, varargs)
  {
    if (qx.Bootstrap.DEBUG) {
      if (!qx.Bootstrap.isFunction(args.callee.base)) {
        throw new Error(
          "Cannot call super class. Method is not derived: " +
          args.callee.displayName
        );
      }
    }

    if (arguments.length === 1) {
      return args.callee.base.call(this);
    } else {
      return args.callee.base.apply(this, Array.prototype.slice.call(arguments, 1));
    }
  },


  define : function(name, config)
  {
    var isStrictMode = function () {
      return (typeof this == 'undefined');
    };

    if (!config) {
      config = { statics : {} };
    }

    var clazz;
    var proto = null;

    qx.Bootstrap.setDisplayNames(config.statics, name);

    if (config.members || config.extend)
    {
      qx.Bootstrap.setDisplayNames(config.members, name + ".prototype");

      clazz = config.construct || new Function;

      if (config.extend) {
        this.extendClass(clazz, clazz, config.extend, name, basename);
      }

      var statics = config.statics || {};
      // use keys to include the shadowed in IE
      for (var i=0, keys=qx.Bootstrap.keys(statics), l=keys.length; i<l; i++) {
        var key = keys[i];
        clazz[key] = statics[key];
      }

      proto = clazz.prototype;
      // Enable basecalls within constructor
      proto.base = qx.Bootstrap.base;
      proto.name = proto.classname = name;

      var members = config.members || {};
      var key, member;

      // use keys to include the shadowed in IE
      for (var i=0, keys=qx.Bootstrap.keys(members), l=keys.length; i<l; i++) {
        key = keys[i];
        member = members[key];

        // Enable basecalls for methods
        // Hint: proto[key] is not yet overwritten here
        if (member instanceof Function && proto[key]) {
          member.base = proto[key];
        }

        proto[key] = member;
      }
    }
    else
    {
      clazz = config.statics || {};

      // Merge class into former class (needed for 'optimize: ["statics"]')
      if (qx.Bootstrap.$$registry && qx.Bootstrap.$$registry[name]) {
        var formerClass = qx.Bootstrap.$$registry[name];

        // Add/overwrite properties and return early if necessary
        if (this.keys(clazz).length !== 0) {
          // Execute defer to prevent too early overrides
          if (config.defer) {
            config.defer(clazz, proto);
          }

          for (var curProp in clazz) {
            formerClass[curProp] = clazz[curProp];
          }
          return formerClass;
        }
      }
    }

    // Store type info
    clazz.$$type = "Class";

    // Attach toString
    if (!clazz.hasOwnProperty("toString")) {
      clazz.toString = this.genericToString;
    }

    // Create namespace
    var basename = name ? this.createNamespace(name, clazz) : "";

    // Store names in constructor/object
    clazz.classname = name;
    if (!isStrictMode()) {
      try {
        clazz.name = name;
      } catch(ex) {
        // Nothing
      }
    }
    clazz.basename = basename;
    clazz.$$events = config.events;

    // Execute defer section
    if (config.defer) {
      this.addPendingDefer(clazz, function() {
        config.defer(clazz, proto);
      });
    }

    // Store class reference in global class registry
    if (name != null) {
      qx.Bootstrap.$$registry[name] = clazz;
    }

    return clazz;
  }
};


/**
 * Internal class that is responsible for bootstrapping the qooxdoo
 * framework at load time.
 */
qx.Bootstrap.define("qx.Bootstrap",
{
  statics :
  {
    /** Timestamp of qooxdoo based application startup */
    LOADSTART : qx.$$start || new Date(),

    /**
     * Mapping for early use of the qx.debug environment setting.
     */
     DEBUG : (function() {
       // make sure to reflect all changes here to the environment class!
       var debug = true;
       if (qx.$$environment && qx.$$environment["qx.debug"] === false) {
         debug = false;
       }
       return debug;
     })(),


     /**
      * Minimal accessor API for the environment settings given from the
      * generator.
      *
      * WARNING: This method only should be used if the
      * {@link qx.core.Environment} class is not loaded!
      *
      * @param key {String} The key to get the value from.
      * @return {var} The value of the setting or <code>undefined</code>.
      */
     getEnvironmentSetting : function(key) {
       if (qx.$$environment) {
         return qx.$$environment[key];
       }
     },


     /**
      * Minimal mutator for the environment settings given from the generator.
      * It checks for the existence of the environment settings and sets the
      * key if its not given from the generator. If a setting is available from
      * the generator, the setting will be ignored.
      *
      * WARNING: This method only should be used if the
      * {@link qx.core.Environment} class is not loaded!
      *
      * @param key {String} The key of the setting.
      * @param value {var} The value for the setting.
      */
     setEnvironmentSetting : function(key, value) {
       if (!qx.$$environment) {
         qx.$$environment = {};
       }
       if (qx.$$environment[key] === undefined) {
         qx.$$environment[key] = value;
       }
     },


    /**
     * Creates a namespace and assigns the given object to it.
     *
     * @internal
     * @signature function(name, object)
     * @param name {String} The complete namespace to create. Typically, the last part is the class name itself
     * @param object {Object} The object to attach to the namespace
     * @return {String} last part of the namespace (which object is assigned to)
     * @throws {Error} when the given object already exists.
     */
    createNamespace : qx.Bootstrap.createNamespace,


    /**
     * Offers the ability to change the root for creating namespaces from window to
     * whatever object is given.
     *
     * @param root {Object} The root to use.
     * @internal
     */
    setRoot : function(root) {
      qx.$$namespaceRoot = root;
    },

    /**
     * Call the same method of the super class.
     *
     * @signature function(args, varargs)
     * @param args {arguments} the arguments variable of the calling method
     * @param varargs {var} variable number of arguments passed to the overwritten function
     * @return {var} the return value of the method of the base class.
     */
    base : qx.Bootstrap.base,

    /**
     * Define a new class using the qooxdoo class system.
     * Lightweight version of {@link qx.Class#define} with less features.
     *
     * @signature function(name, config)
     * @param name {String?} Name of the class. If null, the class will not be
     *   attached to a namespace.
     * @param config {Map ? null} Class definition structure. The configuration map has the following keys:
     *     <table>
     *       <tr><th>Name</th><th>Type</th><th>Description</th></tr>
     *       <tr><th>extend</th><td>Class</td><td>The super class the current class inherits from.</td></tr>
     *       <tr><th>construct</th><td>Function</td><td>The constructor of the class.</td></tr>
     *       <tr><th>statics</th><td>Map</td><td>Map of static values / functions of the class.</td></tr>
     *       <tr><th>members</th><td>Map</td><td>Map of instance members of the class.</td></tr>
     *       <tr><th>defer</th><td>Function</td><td>Function that is called at the end of
     *          processing the class declaration.</td></tr>
     *     </table>
     * @return {Class} The defined class.
     */
    define : qx.Bootstrap.define,


    /**
     * Sets the display name of the given function
     *
     * @signature function(fcn, classname, name)
     * @param fcn {Function} the function to set the display name for
     * @param classname {String} the name of the class the function is defined in
     * @param name {String} the function name
     */
    setDisplayName : qx.Bootstrap.setDisplayName,


    /**
     * Set the names of all functions defined in the given map
     *
     * @signature function(functionMap, classname)
     * @param functionMap {Object} a map with functions as values
     * @param classname {String} the name of the class, the functions are
     *   defined in
     */
    setDisplayNames : qx.Bootstrap.setDisplayNames,

    /**
     * This method will be attached to all classes to return
     * a nice identifier for them.
     *
     * @internal
     * @signature function()
     * @return {String} The class identifier
     */
    genericToString : qx.Bootstrap.genericToString,


    /**
     * Inherit a clazz from a super class.
     *
     * This function differentiates between class and constructor because the
     * constructor written by the user might be wrapped and the <code>base</code>
     * property has to be attached to the constructor, while the <code>superclass</code>
     * property has to be attached to the wrapped constructor.
     *
     * @param clazz {Function} The class's wrapped constructor
     * @param construct {Function} The unwrapped constructor
     * @param superClass {Function} The super class
     * @param name {Function} fully qualified class name
     * @param basename {Function} the base name
     */
    extendClass : function(clazz, construct, superClass, name, basename)
    {
      var superproto = superClass.prototype;

      // Use helper function/class to save the unnecessary constructor call while
      // setting up inheritance.
      var helper = new Function();
      helper.prototype = superproto;
      var proto = new helper();

      // Apply prototype to new helper instance
      clazz.prototype = proto;

      // Store names in prototype
      proto.name = proto.classname = name;
      proto.basename = basename;

      /*
        - Store base constructor to constructor-
        - Store reference to extend class
      */
      construct.base = superClass;
      clazz.superclass = superClass;

      /*
        - Store statics/constructor onto constructor/prototype
        - Store correct constructor
        - Store statics onto prototype
      */
      construct.self = clazz.constructor = proto.constructor = clazz;
    },

    /** Private list of classes which have a defer method that needs to be executed */
    __pendingDefers: [],

    /**
     * Adds a callback for a class so that it's defer method can be called, either after all classes
     * are loaded or when absolutely necessary because of load-time requirements of other classes.
     *
     * @param clazz {Class} Class to add a callback to
     * @param cb {Function} Callback function
     */
    addPendingDefer: function(clazz, cb) {
      if (qx.$$loader && qx.$$loader.delayDefer) {
        this.__pendingDefers.push(clazz);
        clazz.$$pendingDefer = cb;
      } else {
        cb.call(clazz);
      }
    },

    /**
     * Executes the defer methods for classes which are required by the dependency information in
     * dbClassInfo (which is a map in the format generated by qxcompiler).  Defer methods are of course
     * only executed once but they are always put off until absolutely necessary to avoid potential
     * side effects and recursive and/or difficult to resolve dependencies.
     *
     * @param dbClassInfo {Object} qxcompiler map
     */
    executePendingDefers: function(dbClassInfo) {
      var executeForDbClassInfo = function (dbClassInfo) {
        if (dbClassInfo.environment) {
          var required = dbClassInfo.environment.required;
          if (required) {
            for (var key in required) {
              var info = required[key];
              if (info.load && info.className) {
                executeForClassName(info.className);
              }
            }
          }
        }
        for (var key in dbClassInfo.dependsOn) {
          var depInfo = dbClassInfo.dependsOn[key];
          if (depInfo.require || depInfo.usage === "dynamic") {
            executeForClassName(key);
          }
        }
      }

      var executeForClassName = function (className) {
        var clazz = getByName(className);
        if (!clazz) {
          return;
        }
        if (clazz.$$deferComplete) {
          return;
        }
        var dbClassInfo = clazz.$$dbClassInfo;
        if (dbClassInfo) {
          executeForDbClassInfo(dbClassInfo);
        }
        execute(clazz);
      }

      var execute = function (clazz) {
        var cb = clazz.$$pendingDefer;
        if (cb) {
          delete clazz.$$pendingDefer;
          clazz.$$deferComplete = true;
          cb.call(clazz);
        }
      }

      var getByName = function (name) {
        var clazz = qx.Bootstrap.getByName(name);
        if (!clazz) {
          var splits = name.split(".");
          var part = splits[0];
          var root = qx.$$namespaceRoot && qx.$$namespaceRoot[part] ? qx.$$namespaceRoot : window;
          var tmp = root;

          for (var i = 0, len = splits.length - 1; tmp && i < len; i++, part = splits[i]) {
            tmp = tmp[part];
          }
          if (tmp != root) {
            clazz = tmp;
          }
        }
        return clazz;
      }

      if (!dbClassInfo) {
        var pendingDefers = this.__pendingDefers;
        this.__pendingDefers = [];
        pendingDefers.forEach(execute);
        return;
      }

      executeForDbClassInfo(dbClassInfo);
    },


    /**
     * Find a class by its name
     *
     * @param name {String} class name to resolve
     * @return {Class} the class
     */
    getByName : function(name) {
      return qx.Bootstrap.$$registry[name];
    },


    /** @type {Map} Stores all defined classes */
    $$registry : {},


    /*
    ---------------------------------------------------------------------------
      OBJECT UTILITY FUNCTIONS
    ---------------------------------------------------------------------------
    */

    /**
     * Get the number of own properties in the object.
     *
     * @param map {Object} the map
     * @return {Integer} number of objects in the map
     * @lint ignoreUnused(key)
     */
    objectGetLength : function(map) {
      return qx.Bootstrap.keys(map).length;
    },


    /**
     * Inserts all keys of the source object into the
     * target objects. Attention: The target map gets modified.
     *
     * @param target {Object} target object
     * @param source {Object} object to be merged
     * @param overwrite {Boolean ? true} If enabled existing keys will be overwritten
     * @return {Object} Target with merged values from the source object
     */
    objectMergeWith : function(target, source, overwrite)
    {
      if (overwrite === undefined) {
        overwrite = true;
      }

      for (var key in source)
      {
        if (overwrite || target[key] === undefined) {
          target[key] = source[key];
        }
      }

      return target;
    },


    /**
     * IE does not return "shadowed" keys even if they are defined directly
     * in the object.
     *
     * @internal
     * @type {String[]}
     */
    __shadowedKeys :
    [
      "isPrototypeOf",
      "hasOwnProperty",
      "toLocaleString",
      "toString",
      "valueOf",
      "propertyIsEnumerable",
      "constructor"
    ],


    /**
     * Get the keys of a map as array as returned by a "for ... in" statement.
     *
     * @signature function(map)
     * @internal
     * @param map {Object} the map
     * @return {Array} array of the keys of the map
     */
    keys :
    ({
      "ES5" : Object.keys,

      "BROKEN_IE" : function(map)
      {
        if (map === null || (typeof map !== "object" && typeof map !== "function")) {
            throw new TypeError("Object.keys requires an object as argument.");
        }

        var arr = [];
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        for (var key in map) {
          if (hasOwnProperty.call(map, key)) {
            arr.push(key);
          }
        }

        // IE does not return "shadowed" keys even if they are defined directly
        // in the object. This is incompatible with the ECMA standard!!
        // This is why this checks are needed.
        var shadowedKeys = qx.Bootstrap.__shadowedKeys;
        for (var i=0, a=shadowedKeys, l=a.length; i<l; i++)
        {
          if (hasOwnProperty.call(map, a[i])) {
            arr.push(a[i]);
          }
        }

        return arr;
      },

      "default" : function(map)
      {
        if (map === null || (typeof map !== "object" && typeof map !== "function")) {
            throw new TypeError("Object.keys requires an object as argument.");
        }

        var arr = [];

        var hasOwnProperty = Object.prototype.hasOwnProperty;
        for (var key in map) {
          if (hasOwnProperty.call(map, key)) {
            arr.push(key);
          }
        }

        return arr;
      }
    })[
      typeof(Object.keys) === "function" ? "ES5" :
        (function() {for (var key in {toString : 1}) { return key; }})() !== "toString" ? "BROKEN_IE" : "default"
    ],


    /**
     * Mapping from JavaScript string representation of objects to names
     * @internal
     * @type {Map}
     */
    __classToTypeMap :
    {
      "[object String]": "String",
      "[object Array]": "Array",
      "[object Object]": "Object",
      "[object RegExp]": "RegExp",
      "[object Number]": "Number",
      "[object Boolean]": "Boolean",
      "[object Date]": "Date",
      "[object Function]": "Function",
      "[object Error]": "Error",
      "[object Blob]": "Blob",
      "[object ArrayBuffer]": "ArrayBuffer",
      "[object FormData]": "FormData"
    },


    /*
    ---------------------------------------------------------------------------
      FUNCTION UTILITY FUNCTIONS
    ---------------------------------------------------------------------------
    */


    /**
     * Returns a function whose "this" is altered.
     *
     * *Syntax*
     *
     * <pre class='javascript'>qx.Bootstrap.bind(myFunction, [self, [varargs...]]);</pre>
     *
     * *Example*
     *
     * <pre class='javascript'>
     * function myFunction()
     * {
     *   this.setStyle('color', 'red');
     *   // note that 'this' here refers to myFunction, not an element
     *   // we'll need to bind this function to the element we want to alter
     * };
     *
     * var myBoundFunction = qx.Bootstrap.bind(myFunction, myElement);
     * myBoundFunction(); // this will make the element myElement red.
     * </pre>
     *
     * @param func {Function} Original function to wrap
     * @param self {Object ? null} The object that the "this" of the function will refer to.
     * @param varargs {arguments ? null} The arguments to pass to the function.
     * @return {Function} The bound function.
     */
    bind : function(func, self, varargs)
    {
      var fixedArgs = Array.prototype.slice.call(arguments, 2, arguments.length);
      return function() {
        var args = Array.prototype.slice.call(arguments, 0, arguments.length);
        return func.apply(self, fixedArgs.concat(args));
      };
    },


    /*
    ---------------------------------------------------------------------------
      STRING UTILITY FUNCTIONS
    ---------------------------------------------------------------------------
    */


    /**
     * Convert the first character of the string to upper case.
     *
     * @param str {String} the string
     * @return {String} the string with an upper case first character
     */
    firstUp : function(str) {
      return str.charAt(0).toUpperCase() + str.substr(1);
    },


    /**
     * Convert the first character of the string to lower case.
     *
     * @param str {String} the string
     * @return {String} the string with a lower case first character
     */
    firstLow : function(str) {
      return str.charAt(0).toLowerCase() + str.substr(1);
    },


    /*
    ---------------------------------------------------------------------------
      TYPE UTILITY FUNCTIONS
    ---------------------------------------------------------------------------
    */

    /**
     * Get the internal class of the value. See
     * http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
     * for details.
     *
     * @param value {var} value to get the class for
     * @return {String} the internal class of the value
     */
    getClass : function(value)
    {
      // The typeof null and undefined is "object" under IE8
      if(value === undefined) {
        return "Undefined";
      }else if(value === null) {
        return "Null";
      }
      var classString = Object.prototype.toString.call(value);
      return (
        qx.Bootstrap.__classToTypeMap[classString] ||
        classString.slice(8, -1)
      );
    },


    /**
     * Whether the value is a string.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a string.
     */
    isString : function(value)
    {
      // Added "value !== null" because IE throws an exception "Object expected"
      // by executing "value instanceof String" if value is a DOM element that
      // doesn't exist. It seems that there is an internal difference between a
      // JavaScript null and a null returned from calling DOM.
      // e.q. by document.getElementById("ReturnedNull").
      return (
        value !== null && (
        typeof value === "string" ||
        qx.Bootstrap.getClass(value) === "String" ||
        value instanceof String ||
        (!!value && !!value.$$isString))
      );
    },


    /**
     * Whether the value is an array.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is an array.
     */
    isArray : function(value)
    {
      // Added "value !== null" because IE throws an exception "Object expected"
      // by executing "value instanceof Array" if value is a DOM element that
      // doesn't exist. It seems that there is an internal difference between a
      // JavaScript null and a null returned from calling DOM.
      // e.q. by document.getElementById("ReturnedNull").
      return (
        value !== null && (
        value instanceof Array ||
        (value && qx.data && qx.data.IListData && qx.util.OOUtil.hasInterface(value.constructor, qx.data.IListData) ) ||
        qx.Bootstrap.getClass(value) === "Array" ||
        (!!value && !!value.$$isArray))
      );
    },


    /**
     * Whether the value is an object. Note that built-in types like Window are
     * not reported to be objects.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is an object.
     */
    isObject : function(value) {
      return (
        value !== undefined &&
        value !== null &&
        qx.Bootstrap.getClass(value) === "Object"
      );
    },


    /**
     * Whether the value is a function.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a function.
     */
    isFunction : function(value) {
      return qx.Bootstrap.getClass(value) === "Function";
    },


    /**
     * Whether the value is a function or an async function.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a function.
     */
    isFunctionOrAsyncFunction : function(value) {
      var name = qx.Bootstrap.getClass(value)
      return ((name === "Function")||(name === "AsyncFunction"));
    },



    /*
    ---------------------------------------------------------------------------
      LOGGING UTILITY FUNCTIONS
    ---------------------------------------------------------------------------
    */

    $$logs : [],


    /**
     * Sending a message at level "debug" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     */
    debug : function(object, message) {
      qx.Bootstrap.$$logs.push(["debug", arguments]);
    },


    /**
     * Sending a message at level "info" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     */
    info : function(object, message) {
      qx.Bootstrap.$$logs.push(["info", arguments]);
    },


    /**
     * Sending a message at level "warn" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     */
    warn : function(object, message) {
      qx.Bootstrap.$$logs.push(["warn", arguments]);
    },


    /**
     * Sending a message at level "error" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     */
    error : function(object, message) {
      qx.Bootstrap.$$logs.push(["error", arguments]);
    },


    /**
     * Prints the current stack trace at level "info"
     *
     * @param object {Object} Contextual object (either instance or static class)
     */
    trace : function(object) {}
  }
});
