/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
     2022 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Martin Wittemann (martinwittemann)
     * Derrell Lipman (derrell)

************************************************************************ */

// Undeclared member variables we've already notified the user of
let undeclared = {};

// For debugging, allow not hiding internal variables  with `enumerable: false`
let allEnumerable = false;

// To be imlemented in the future
let FUTURE = false;

// Bootstrap the Bootstrap static class
window.qx = Object.assign(window.qx || {}, {
  $$namespaceRoot: window,

  Bootstrap: {
    /** Undeclared member variables we've already notified the user of */
    $$undeclared: {},

    /** @type {Map} Stores all defined classes */
    $$registry: {},

    _allowedStaticKeys: {
      "@": "object",
      type: "string", // String
      include: "object", // Mixin[]
      statics: "object", // Map
      environment: "object", // Map
      events: "object", // Map
      defer: "function" // Function
    },

    _allowedNonStaticKeys: {
      "@": "object",
      "@construct": "object",
      "@destruct": "object",
      type: "string", // String
      extend: "function", // Function
      // extendNativeClass: "boolean", // Boolean -- Does not work yet
      implement: "object", // Interface[]
      include: "object", // Mixin[]
      construct: "function", // Function
      statics: "object", // Map
      properties: "object", // Map
      members: "object", // Map
      environment: "object", // Map
      events: "object", // Map
      delegate: "object", // Map
      defer: "function", // Function
      destruct: "function" // Function
    },

    define(className, config) {
      let clazz;
      let proxy;
      let handler;
      let path;
      let classnameComponents;
      let implicitType = false;

      // Ensure the desginated class has not already been defined
      if (className && qx.Bootstrap.$$registry[className]) {
        throw new Error(
          `${className} is already defined; cannot redefine a class`
        );
      }

      // Process environment
      let environment = config.environment || {};
      for (let key in environment) {
        qx["core"]["Environment"].add(key, environment[key]);
      }

      // Explicit null `extend` key means extend from Object. Otherwise,
      // falsy `extend` means it's a static class.
      if (
        config.extend === null ||
        (!config.extend && config.type != "static")
      ) {
        config.extend = Object;
      } else if (!config.extend) {
        if (qx["core"]["Environment"].get("qx.debug")) {
          if (config.type && config.type != "static") {
            throw new Error(
              `${className}: ` +
                `No 'extend' key, but 'type' is not 'static' ` +
                `(found ${config.type})`
            );
          }
        }

        implicitType = true;
        config.type = "static";
      }

      if (qx["core"]["Environment"].get("qx.debug")) {
        Object.keys(config).forEach(key => {
          let allowedKeys =
            config.type == "static"
              ? qx.Bootstrap._allowedStaticKeys
              : qx.Bootstrap._allowedNonStaticKeys;

          // Ensure this key is allowed
          if (!(key in allowedKeys)) {
            if (config.type == "static") {
              throw new Error(
                `${className}: ` +
                  `disallowed key in static class configuration: ${key}`
              );
            } else {
              throw new Error(
                `${className}: ` +
                  `unrecognized key in class configuration: ${key}`
              );
            }
          }

          // Ensure its value is of the correct type
          if (typeof config[key] != allowedKeys[key]) {
            throw new Error(
              `${className}: ` +
                `typeof value for key ${key} must be ${allowedKeys[key]}; ` +
                `found ${typeof config[key]}`
            );
          }
        });
      }

      // Create the new class
      clazz = qx.Bootstrap._extend(className, config);

      // Add singleton getInstance()
      if (config.type === "singleton") {
        clazz.getInstance = qx.Bootstrap.getInstance;
      }

      clazz.classname = className;
      qx.Bootstrap.setDisplayName(clazz, className, "constructor");

      // Attach toString
      if (!clazz.hasOwnProperty("toString")) {
        clazz.toString = qx.Bootstrap.genericToString;
      }

      // Add statics
      for (let key in config.statics || {}) {
        let staticFuncOrVar = config.statics[key];

        if (typeof staticFuncOrVar == "function") {
          // Allow easily identifying this method
          qx.Bootstrap.setDisplayName(staticFuncOrVar, className, key);
        }

        // Add this static as a class property
        Object.defineProperty(clazz, key, {
          value: staticFuncOrVar,
          writable: true,
          configurable: true,
          enumerable: allEnumerable || true
        });
      }

      // Members are only allowed for non-static classes.
      if (config.extend) {
        // Add members
        if (config.members) {
          qx.Bootstrap.addMembers(clazz, config.members);
        }
      }

      //
      // Store destruct onto class. We wrap their function (or an empty
      // function) in code that also handles any properties that
      // require `dereference : true`
      //
      let destruct = config.destruct || function () {};

      clazz.$$destructor = destruct;
      qx.Bootstrap.setDisplayName(destruct, className, "destruct");

      // If there's a specified classname...
      if (className) {
        // Create that namespace
        qx.Bootstrap.createNamespace(className, clazz);

        // Store class reference in global class registry
        qx.Bootstrap.$$registry[className] = clazz;
      }

      // Now that the class has been defined, arrange to call its
      // (optional) defer function
      if (config.defer) {
        // Execute defer section
        qx.Bootstrap.addPendingDefer(clazz, () => {
          config.defer(clazz, clazz.prototype, {
            add(name, config) {
              qx.Bootstrap.addProperties(
                clazz,
                {
                  [name]: config
                },

                true
              );
            }
          });
        });
      }

      return clazz;
    },

    _extend(className, config) {
      const type = config.type || "class";
      const superclass = config.extend || Object;
      let initFunctions = [];
      let subclass;
      let initialConstruct = config.construct;

      if (config.type != "static") {
        // If the constructor function is defined as a "method" using
        // shorthand syntax, e.g.,
        // qx.Class.define("myApp.X",
        //   {
        //      construct(x) {}
        //   });
        //
        // rather than as an actual function, e.g.,
        // qx.Class.define("myApp.X",
        //   {
        //      construct : function(x) {}
        //   });
        //
        // then it's not allowed by the spec to be a constructor. We
        // must wrap it.
        //
        subclass = function (...args) {
          let ret;

          // At the time this function is called, config.construct, even
          // if undefined in the configuration, will have been set to a
          // trivial function. We therefore look at its initial value to
          // decide whether to call it, or the superclass constructor.
          if (initialConstruct) {
            ret = initialConstruct.apply(this, args);
          } else {
            ret = superclass.apply(this, args);
          }

          return ret;
        };
      } else {
        subclass = function () {
          throw new Error(`${className}: can not instantiate a static class`);
        };
      }

      // Allow easily identifying this class
      qx.Bootstrap.setDisplayName(subclass, className);

      // This is a class
      subclass.$$type = "Class";
      subclass.classname = className;

      // If its class type was specified, save it
      if (config.type) {
        subclass.$$classtype = config.type;
      }

      // Provide access to the superclass for base calls
      subclass.base = superclass;

      // Ensure there's something unique to compare constructors to.
      if (!config.construct) {
        config.construct = function () {};
      }

      // We need to point to the superclass from it so that `base()`
      // calls work
      config.construct.base = subclass.base;

      // Keep track of the original constructor so we know when to
      // construct mixins
      subclass.$$originalConstructor = config.construct;

      // Some internals require that `superclass` be defined too
      subclass.superclass = superclass;

      // Create the subclass' prototype as a copy of the superclass'
      // prototype
      subclass.prototype = Object.create(superclass.prototype);
      subclass.prototype.classname = className;

      // Save any init functions that need to be called upon instantiation
      Object.defineProperty(subclass, "$$initFunctions", {
        value: initFunctions,
        writable: false,
        configurable: false,
        enumerable: allEnumerable || false
      });

      // Proxy the subclass so we can watch for property changes
      subclass.constructor = subclass.prototype.constructor = new Proxy(
        subclass,
        {
          construct(target, args) {
            let proxy;
            let handler;
            let obj = Object.create(subclass.prototype);

            // add abstract and singleton checks
            if (type === "abstract") {
              if (target.classname === className) {
                throw new Error(
                  "The class '," +
                    className +
                    "' is abstract! It is not possible to instantiate it."
                );
              }
            }

            if (type === "singleton") {
              if (!target.$$allowconstruct) {
                throw new Error(
                  "The class '" +
                    className +
                    "' is a singleton! It is not possible to instantiate it " +
                    "directly. Use the static getInstance() method instead."
                );
              }
            }

            // Create the proxy handler
            handler = {
              get(obj, prop) {
                const storage = qx.core.propertystorage.Default;
                return storage.get.call(obj, prop);
              },

              set(obj, prop, value) {
                let origValue = value;
                const storage = qx.core.propertystorage.Default;

                storage.set.call(obj, prop, value);
                return true;
              },

              getPrototypeOf(target) {
                return Reflect.getPrototypeOf(target);
              }
            };

            // Create the instance proxy which manages properties, etc.
            proxy = new Proxy(obj, handler);

            // Call any initFunctions defined for properties of this class
            target.$$initFunctions.forEach(prop => {
              let propertyFirstUp = qx.Bootstrap.firstUp(prop);

              // Initialize this property
              obj[`init${propertyFirstUp}`]();
              obj[`$$variant_${prop}`] = "init";
            });

            this.apply(target, proxy, args);

            return proxy;
          },

          apply(target, _this, args) {
            // Call the constructor
            return subclass.apply(_this, args);
          },

          getPrototypeOf(target) {
            return Reflect.getPrototypeOf(target);
          }
        }
      );

      return subclass.prototype.constructor;
    },

    /**
     * Removes a class from qooxdoo defined by {@link #define}
     *
     * @param name {String}
     *   Name of the class
     */
    undefine(name) {
      // Nothing to do if the class name isn't registered
      if (!(name in qx.Bootstrap.$$registry)) {
        return;
      }

      // Delete the class from the registry
      delete qx.Bootstrap.$$registry[name];

      // Delete the class' property descriptors
      qx.core.PropertyDescriptorRegistry.unregister(name);

      // Delete the class reference from the namespaces and all
      // empty namespaces
      let ns = name.split(".");

      // Build up an array containing all namespace objects including window
      let objects = [window];
      for (let i = 0; i < ns.length; i++) {
        objects.push(objects[i][ns[i]]);
      }

      // go through all objects and check for the constructor or
      // empty namespaces
      for (let i = objects.length - 1; i >= 1; i--) {
        var last = objects[i];
        var parent = objects[i - 1];
        if (
          // The class being undefined, but parent classes in case it is a
          // nested class that is being undefined
          (i == objects.length - 1 && qx.Bootstrap.isFunction(last)) ||
          qx.Bootstrap.objectGetLength(last) === 0
        ) {
          delete parent[ns[i - 1]];
        } else {
          break;
        }
      }
    },

    /**
     * Attach members to a class
     *
     * @param clazz {Class}
     *   Class to add members to
     *
     * @param members {Map}
     *   The map of members to attach
     */
    addMembers(clazz, members) {
      for (let key in members) {
        let member = members[key];
        let proto = clazz.prototype;

        if (qx["core"]["Environment"].get("qx.debug")) {
          if (
            proto[key] !== undefined &&
            key.charAt(0) === "_" &&
            key.charAt(1) === "_"
          ) {
            throw new Error(
              `Overwriting private member "${key}" ` +
                `of Class "${clazz.classname}" ` +
                "is not allowed"
            );
          }
        }

        if (typeof member == "function") {
          // Allow easily identifying this method
          qx.Bootstrap.setDisplayName(member, clazz.classname, key);

          // Allow base calls
          if (key in clazz.prototype) {
            member.base = clazz.prototype[key];
          }
        }

        // Create the storage for this member
        Object.defineProperty(clazz.prototype, key, {
          value: member,
          writable: true,
          configurable: true,
          enumerable: allEnumerable || true
        });
      }
    },

    /**
     * This method will be attached to all classes to return a nice
     * identifier for them.
     *
     * @internal
     * @signature function()
     * @return {String} The class identifier
     */
    genericToString() {
      return this.classname;
    },

    /**
     * Returns a function whose "this" is altered.
     *
     * *Syntax*
     *
     * <pre class='javascript'>
     * qx.Bootstrap.bind(myFunction, [self, [varargs...]]);
     * </pre>
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
     * @param func {Function}
     *   Original function to wrap
     *
     * @param self {Object ? null}
     *   The object that the "this" of the function will refer to.
     *
     * @param varargs {arguments ? null}
     *   The variable number of arguments to pass to the function
     *
     * @return {Function}
     *   The bound function.
     */
    bind(func, self, varargs) {
      var fixedArgs = Array.prototype.slice.call(arguments, 2);
      return func.bind(self, ...fixedArgs);
    },

    /**
     * Helper method to handle singletons
     *
     * @return {Object}
     *   The singleton instance
     *
     * @internal
     */
    getInstance() {
      if (this.$$instance === null) {
        throw new Error(
          "Singleton instance of " +
            this +
            " is requested, but not ready yet. This is most likely due" +
            " to a recursive call in the constructor path."
        );
      }

      if (!this.$$instance) {
        // Allow calling the constructor
        this.$$allowconstruct = true;

        // null means "object is being created"; needed for another call
        // of getInstance() during instantiation
        this.$$instance = null;

        // Obtain the singleton instance
        this.$$instance = new this();

        // Disallow, again, calling the constructor
        delete this.$$allowconstruct;
      }

      return this.$$instance;
    },

    createNamespace(name, object) {
      var splits = name.split(".");
      var part = splits[0];
      var parent =
        qx.$$namespaceRoot && qx.$$namespaceRoot[part]
          ? qx.$$namespaceRoot
          : window;

      for (var i = 0, len = splits.length - 1; i < len; i++, part = splits[i]) {
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

    /**
     * Offers the ability to change the root for creating namespaces from
     * window to whatever object is given.
     *
     * @param root {Object}
     *   The root to use.
     *
     * @internal
     */
    setRoot(root) {
      qx.$$namespaceRoot = root;
    },

    getDisplayName(f) {
      return f.$$displayName || "<non-qooxdoo>";
    },

    setDisplayName(f, classname, name) {
      if (name) {
        f.$$displayName = f.displayName = `${classname}.${name}()`;
      } else {
        f.$$displayName = f.displayName = `${classname}()`;
      }
    },

    setDisplayNames(functionMap, classname) {
      for (let name in functionMap) {
        let f = functionMap[name];

        if (f instanceof Function) {
          f.$$displayName = f.displayName = `${classname}.${f.name || name}()`;
        }
      }
    },

    base(args, varargs) {
      if (qx.Bootstrap.DEBUG) {
        if (typeof args.callee.base != "function") {
          throw new Error(
            "Cannot call super class. Method is not derived: " +
              qx.Bootstrap.getDisplayName(args.callee)
          );
        }
      }

      if (arguments.length === 1) {
        return args.callee.base.call(this);
      } else {
        return args.callee.base.apply(
          this,
          Array.prototype.slice.call(arguments, 1)
        );
      }
    },

    /**
     * Get the internal class of the value. See
     * http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
     * for details.
     *
     * @param value {var}
     *   value to get the class for
     *
     * @return {String}
     *   The internal class of the value
     */
    getClass(value) {
      // The typeof null and undefined is "object" under IE8
      if (value === undefined) {
        return "Undefined";
      } else if (value === null) {
        return "Null";
      }

      let classString = Object.prototype.toString.call(value);
      return (
        qx.Bootstrap._classToTypeMap[classString] || classString.slice(8, -1)
      );
    },

    /**
     * Find a class by its name
     *
     * @param name {String}
     *   class name to resolve
     *
     * @return {Class}
     *   The class
     */
    getByName(name) {
      return qx.Bootstrap.$$registry[name];
    },

    /**
     * Whether the value is a string.
     *
     * @param value {var}
     *   Value to check.
     *
     * @return {Boolean}
     *   Whether the value is a string.
     */
    isString(value) {
      // Added "value !== null" because IE throws an exception
      // "Object expected" by executing "value instanceof String" if
      // value is a DOM element that doesn't exist. It seems that
      // there is an internal difference between a JavaScript null
      // and a null returned from calling DOM. e.q. by
      // document.getElementById("ReturnedNull").
      return (
        value !== null &&
        (typeof value === "string" ||
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
    isArray(value) {
      // Added "value !== null" because IE throws an exception
      // "Object expected" by executing "value instanceof Array" if
      // value is a DOM element that doesn't exist. It seems that
      // there is an internal difference between a JavaScript null
      // and a null returned from calling DOM. e.q. by
      // document.getElementById("ReturnedNull").
      return (
        value !== null &&
        (value instanceof Array ||
          (value &&
            qx.data &&
            qx.data.IListData &&
            qx.util.OOUtil.hasInterface(
              value.constructor,
              qx.data.IListData
            )) ||
          qx.Bootstrap.getClass(value) === "Array" ||
          (!!value && !!value.$$isArray))
      );
    },

    /**
     * Whether the value is an object. Note that built-in types like Window
     * are not reported to be objects.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is an object.
     */
    isObject(value) {
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
    isFunction(value) {
      return qx.Bootstrap.getClass(value) === "Function";
    },

    /**
     * Whether the value is a function or an async function.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a function.
     */
    isFunctionOrAsyncFunction(value) {
      var name = qx.Bootstrap.getClass(value);
      return name === "Function" || name === "AsyncFunction";
    },

    /**
     * Tests whether an object is an instance of qx.core.Object without
     * using instanceof - this is only for certain low level instances
     * which would otherwise cause a circular, load time dependency
     *
     * @param object {Object?} the object to test
     * @return {Boolean} true if object is an instance of qx.core.Object
     */
    isQxCoreObject(object) {
      if (object === object.constructor) {
        return false;
      }

      let clz = object.constructor;
      let qxCoreObject = ["qx", "core", "Object"].join(".");
      while (clz) {
        if (clz.classname === qxCoreObject) {
          return true;
        }
        clz = clz.superclass;
      }

      return false;
    },

    /**
     * Convert the first character of the string to upper case.
     *
     * @param str {String} the string
     * @return {String} the string with an upper case first character
     */
    firstUp(str) {
      return str.charAt(0).toUpperCase() + str.substr(1);
    },

    /**
     * Convert the first character of the string to lower case.
     *
     * @param str {String} the string
     * @return {String} the string with a lower case first character
     */
    firstLow(str) {
      return str.charAt(0).toLowerCase() + str.substr(1);
    },

    /**
     * Mapping from JavaScript string representation of objects to names
     * @internal
     * @type {Map}
     */
    _classToTypeMap: {
      "[object String]": "String",
      "[object Array]": "Array",
      "[object Object]": "Object",
      "[object RegExp]": "RegExp",
      "[object Number]": "Number",
      "[object Boolean]": "Boolean",
      "[object Date]": "Date",
      "[object Function]": "Function",
      "[object AsyncFunction]": "Function",
      "[object Error]": "Error",
      "[object Blob]": "Blob",
      "[object ArrayBuffer]": "ArrayBuffer",
      "[object FormData]": "FormData"
    }
  },

  core: {
    // Bootstrap Aspect class
    Aspect: {
      wrap(fullName, f, type) {
        return f;
      }
    },

    // Bootstrap Environment class
    Environment: {
      $$environment: {},

      get(key) {
        return qx["core"]["Environment"].$$environment[key];
      },

      add(key, value) {
        qx["core"]["Environment"].$$environment[key] = value;
      }
    }
  }
});

//
// Pull ourself up by our bootstraps!
//
qx.Bootstrap.define("qx.Bootstrap", {
  type: "static",
  statics: Object.assign(
    {
      /** Timestamp of qooxdoo based application startup */
      LOADSTART: qx.$$start || new Date(),

      /**
       * Mapping for early use of the qx.debug environment setting.
       */
      DEBUG: (function () {
        // make sure to reflect all changes here to the environment class!
        var debug = true;
        if (qx.$$environment && qx.$$environment["qx.debug"] === false) {
          debug = false;
        }

        return debug;
      })(),

      /**
       * Minimal accessor API for the environment settings given from
       * the generator.
       *
       * WARNING: This method only should be used if the {@link
       * qx["core"]["Environment"]} class is not loaded!
       *
       * @param key {String}
       *   The key to get the value from.
       *
       * @return {var}
       *   The value of the setting or <code>undefined</code>.
       */
      getEnvironmentSetting(key) {
        if (qx.$$environment) {
          return qx.$$environment[key];
        }

        return undefined;
      },

      /**
       * Minimal mutator for the environment settings given from the
       * generator. It checks for the existence of the environment settings
       * and sets the key if its not given from the generator. If a setting
       * is available from the generator, the setting will be ignored.
       *
       * WARNING: This method only should be used if the
       * {@link qx.core.Environment} class is not loaded!
       *
       * @param key {String} The key of the setting.
       * @param value {var} The value for the setting.
       */
      setEnvironmentSetting(key, value) {
        if (!qx.$$environment) {
          qx.$$environment = {};
        }

        if (qx.$$environment[key] === undefined) {
          qx.$$environment[key] = value;
        }
      },

      /**
       * Private list of classes which have a defer method that
       * needs to be executed
       */
      __pendingDefers: [],

      /**
       * Adds a callback for a class so that it's defer method can be
       * called, either after all classes are loaded or when absolutely
       * necessary because of load-time requirements of other classes.
       *
       * @param clazz {Class}
       *   Class to add a callback to
       *
       * @param cb {Function}
       *   Callback function
       */
      addPendingDefer(clazz, cb) {
        if (qx.$$loader && qx.$$loader.delayDefer) {
          this.__pendingDefers.push(clazz);
          clazz.$$pendingDefer = cb;
        } else {
          cb.call(clazz);
        }
      },

      /**
       * Executes the defer methods for classes which are required by the
       * dependency information in dbClassInfo (which is a map in the format
       * generated by qxcompiler). Defer methods are of course only executed
       * once but they are always put off until absolutely necessary to
       * avoid potential side effects and recursive and/or difficult to
       * resolve dependencies.
       *
       * @param dbClassInfo {Object}
       *   qxcompiler map
       */
      executePendingDefers(dbClassInfo) {
        let execute;
        let executeForDbClassInfo;
        let executeForClassName;
        let getByName;

        execute = function (clazz) {
          let cb = clazz.$$pendingDefer;
          if (cb) {
            delete clazz.$$pendingDefer;
            clazz.$$deferComplete = true;
            cb.call(clazz);
          }
        };

        executeForDbClassInfo = function (dbClassInfo) {
          if (dbClassInfo.environment) {
            let required = dbClassInfo.environment.required;
            if (required) {
              for (let key in required) {
                let info = required[key];
                if (info.load && info.className) {
                  executeForClassName(info.className);
                }
              }
            }
          }

          for (let key in dbClassInfo.dependsOn) {
            let depInfo = dbClassInfo.dependsOn[key];
            if (depInfo.require || depInfo.usage === "dynamic") {
              executeForClassName(key);
            }
          }
        };

        executeForClassName = function (className) {
          let clazz = getByName(className);
          if (!clazz) {
            return;
          }

          if (clazz.$$deferComplete) {
            return;
          }
          let dbClassInfo = clazz.$$dbClassInfo;
          if (dbClassInfo) {
            executeForDbClassInfo(dbClassInfo);
          }
          execute(clazz);
        };

        getByName = function (name) {
          let clazz = qx.Bootstrap.getByName(name);
          if (!clazz) {
            let splits = name.split(".");
            let part = splits[0];
            let root =
              qx.$$namespaceRoot && qx.$$namespaceRoot[part]
                ? qx.$$namespaceRoot
                : window;
            let tmp = root;

            for (
              let i = 0, len = splits.length - 1;
              tmp && i < len;
              i++, part = splits[i]
            ) {
              tmp = tmp[part];
            }
            if (tmp != root) {
              clazz = tmp;
            }
          }
          return clazz;
        };

        if (!dbClassInfo) {
          let pendingDefers = this.__pendingDefers;
          this.__pendingDefers = [];
          pendingDefers.forEach(execute);
          return;
        }

        executeForDbClassInfo(dbClassInfo);
      },

      /*
    -----------------------------------------------------------------------
    OBJECT UTILITY FUNCTIONS
    -----------------------------------------------------------------------
    */

      /**
       * Get the number of own properties in the object.
       *
       * @param map {Object}
       *   the map
       *
       * @return {Integer}
       *   number of objects in the map
       *
       * @lint ignoreUnused(key)
       */
      objectGetLength(map) {
        return qx.Bootstrap.keys(map).length;
      },

      /**
       * Inserts all keys of the source object into the target
       * objects. Attention: The target map gets modified.
       *
       * @param target {Object}
       *   target object
       *
       * @param source {Object}
       *   object to be merged
       *
       * @param overwrite {Boolean ? true}
       *   If enabled existing keys will be overwritten
       *
       * @return {Object}
       *   Target with merged values from the source object
       */
      objectMergeWith(target, source, overwrite) {
        if (overwrite === undefined) {
          overwrite = true;
        }

        for (let key in source) {
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
      _shadowedKeys: [
        "isPrototypeOf",
        "hasOwnProperty",
        "toLocaleString",
        "toString",
        "valueOf",
        "propertyIsEnumerable",
        "constructor"
      ],

      /**
       * Get the keys of a map as array as returned by a "for ... in"
       * statement.
       *
       * @signature function(map)
       *
       * @internal
       *
       * @param map {Object}
       *   the map
       *
       * @return {Array}
       *   array of the keys of the map
       */
      keys: {
        ES5: Object.keys,

        BROKEN_IE(map) {
          if (
            map === null ||
            (typeof map !== "object" && typeof map !== "function")
          ) {
            throw new TypeError("Object.keys requires an object as argument.");
          }

          let arr = [];
          let hasOwnProperty = Object.prototype.hasOwnProperty;
          for (let key in map) {
            if (hasOwnProperty.call(map, key)) {
              arr.push(key);
            }
          }

          // IE does not return "shadowed" keys even if they are
          // defined directly in the object. This is incompatible
          // with the ECMA standard!! This is why this checks are
          // needed.
          var shadowedKeys = qx.Bootstrap._shadowedKeys;
          for (let i = 0, a = shadowedKeys, l = a.length; i < l; i++) {
            if (hasOwnProperty.call(map, a[i])) {
              arr.push(a[i]);
            }
          }

          return arr;
        },

        default(map) {
          if (
            map === null ||
            (typeof map !== "object" && typeof map !== "function")
          ) {
            throw new TypeError("Object.keys requires an object as argument.");
          }

          let arr = [];

          let hasOwnProperty = Object.prototype.hasOwnProperty;
          for (let key in map) {
            if (hasOwnProperty.call(map, key)) {
              arr.push(key);
            }
          }

          return arr;
        }
      }[
        typeof Object.keys === "function"
          ? "ES5"
          : (function () {
              for (let key in { toString: 1 }) {
                return key;
              }
            })() !== "toString"
          ? "BROKEN_IE"
          : "default"
      ],

      /*
    -----------------------------------------------------------------------
    LOGGING UTILITY FUNCTIONS
    -----------------------------------------------------------------------
    */

      $$logs: [],

      /**
       * Sending a message at level "debug" to the logger.
       *
       * @param object {Object}
       *   Contextual object (either instance or static class)
       *
       * @param message {var}
       *   Any number of arguments supported. An argument may have any
       *   JavaScript data type. All data is serialized immediately and does
       *   not keep references to other objects.
       */
      debug(object, message) {
        qx.Bootstrap.$$logs.push(["debug", arguments]);
      },

      /**
       * Sending a message at level "info" to the logger.
       *
       * @param object {Object}
       *   Contextual object (either instance or static class)
       *
       * @param message {var}
       *   Any number of arguments supported. An argument may have any
       *   JavaScript data type. All data is serialized immediately and does
       *   not keep references to other objects.
       */
      info(object, message) {
        qx.Bootstrap.$$logs.push(["info", arguments]);
      },

      /**
       * Sending a message at level "warn" to the logger.
       *
       * @param object {Object}
       *   Contextual object (either instance or static class)
       *
       * @param message {var}
       *   Any number of arguments supported. An argument may have any
       *   JavaScript data type. All data is serialized immediately and does
       *   not keep references to other objects.
       */
      warn(object, message) {
        qx.Bootstrap.$$logs.push(["warn", arguments]);
      },

      /**
       * Sending a message at level "error" to the logger.
       *
       * @param object {Object}
       *   Contextual object (either instance or static class)
       *
       * @param message {var}
       *   Any number of arguments supported. An argument may have any
       *   JavaScript data type. All data is serialized immediately and does
       *   not keep references to other objects.
       */
      error(object, message) {
        qx.Bootstrap.$$logs.push(["error", arguments]);
      },

      /**
       * Prints the current stack trace at level "info"
       *
       * @param object {Object}
       *   Contextual object (either instance or static class)
       */
      trace(object) {}
    },

    qx.Bootstrap
  )
});
