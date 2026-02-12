/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2022 Derrell Lipman
     2023-24 John Spackman, Zenesis Ltd (johnspackman, https://www.zenesis.com)

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)
     * John Spackman (johnspackman)

************************************************************************ */

let BROKEN = false;

qx.Bootstrap.define("qx.Class", {
  type: "static",

  environment: {
    "qx.Class.futureCheckJsDoc": false
  },

  statics: {
    /**
     * Options configured mostly by unit tests
     *
     * @internal
     */
    $$options: {
      /**
       * Whether to warn if a member variable is assigned without
       * being declared in the "members" section
       */
      "Warn member not declared": false,

      /**
       * Allow all private and internal-use properties methods -- e.g.,
       * those beginning with `$$`, setX, getX, resetX, etc. -- to be
       * enumerated, configured, and written to. Ideally, this is set to
       * `false`, so that those private properties don't get mucked with.
       * The unit tests, though, require that they be enumerable,
       * configurable and writable. Setting this to `false` breaks those
       * tests, and although we could set it to 'true' only for the tests,
       * we'd then be testing different behavior than what normal apps would
       * use. I think we'll just live with all properties being enumerable,
       * configurable, and writable for the time being.
       */
      propsAccessible: true
    },

    /** Properties that are predefined in Object */
    objectProperties: new Set(["hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"]),

    /** The global object registry */
    $$registry: qx.Bootstrap.$$registry,

    /** Supported keys for property definitions */
    _allowedPropKeys: {
      "@": null, // Anything
      name: "string", // String
      dereference: "boolean", // Boolean
      inheritable: "boolean", // Boolean
      nullable: "boolean", // Boolean
      themeable: "boolean", // Boolean
      refine: "boolean", // Boolean
      init: null, // var
      apply: ["string", "function"], // String, Function
      event: ["string", "object"], // String or null
      check: null, // Array, String, Function
      transform: null, // String, Function
      async: "boolean", // Boolean
      deferredInit: "boolean", // Boolean
      validate: ["string", "function"], // String, Function
      isEqual: ["string", "function"], // String, Function
      autoApply: "boolean", // Boolean
      get: ["string", "function"], // String, Function
      set: ["string", "function"], // String, Function
      getAsync: ["string", "function"], // String, Function
      setAsync: ["string", "function"], // String, Function
      initFunction: "function", // Function
      storage: "function", // implements qx.core.propertystorage.IStorage
      immutable: "string" // String
    },

    /** Supported keys for property group definitions */
    _allowedPropGroupKeys: {
      "@": null, // Anything
      name: "string", // String
      group: "object", // Array
      mode: "string", // String
      themeable: "boolean" // Boolean
    },

    /** Deprecated keys for properties, that we want to warn about */
    $$deprecatedPropKeys: {},

    /**
     * Define a new class using the qooxdoo class system. This sets
     * up the namespace for the class and generates the class from
     * the definition map.
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
     * @param name {String?null} Name of the class. If <code>null</code>, the class
     *   will not be added to any namespace which could be handy for testing.
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
     *           {@link qx.core.Property}.</td></tr>
     *       <tr><th>members</th><td>Map</td><td>Map of instance members of the class.</td></tr>
     *       <tr><th>environment</th><td>Map</td><td>Map of environment settings for this class. For a description of the format of a setting see
     *           {@link qx.core.Environment}.</td></tr>
     *       <tr><th>events</th><td>Map</td><td>
     *           Map of events the class fires. The keys are the names of the events and the values are the
     *           corresponding event type class names.
     *       </td></tr>
     *       <tr><th>defer</th><td>Function</td><td>Function that is called at the end of processing the class declaration. It allows access to the declared statics, members and properties.</td></tr>
     *       <tr><th>destruct</th><td>Function</td><td>The destructor of the class.</td></tr>
     *     </table>
     * @return {new (...args: any) => any} The defined class
     */
    define(name, config) {
      try {
        return this.__defineImpl(name, config);
      } catch (ex) {
        qx.Class.$$brokenClassDefinitions = true;
        throw ex;
      }
    },

    /**
     * Implementation behind `define` - this exists just for the simplicity of wrapping an exception
     * handler around the code
     *
     * @param config {Map ? null}
     *   Class definition structure. The configuration map has the following
     *   keys:
     *     <table>
     *       <tr>
     *         <th>Name</th>
     *         <th>Type</th>
     *         <th>Description</th>
     *       </tr>
     *       <tr>
     *         <th>type</th>
     *         <td>String</td>
     *         <td>
     *           Type of the class. Valid types are "abstract",
     *           "static" and "singleton". If unset it defaults to a
     *           regular non-static class if an `extend` key is
     *           provided; otherwise, to a static class.
     *         </td>
     *       </tr>
     *       <tr>
     *         <th>extend</th>
     *         <td>Class</td>
     *         <td>The super class the current class inherits from.</td>
     *       </tr>
     *       <tr>
     *         <th>implement</th>
     *         <td>Interface | Interface[]</td>
     *         <td>Single interface or array of interfaces the class implements.</td>
     *       </tr>
     *       <tr>
     *         <th>include</th>
     *         <td>Mixin | Mixin[]</td>
     *         <td>
     *           Single mixin or array of mixins, which will be merged into
     *           the class.
     *         </td>
     *       </tr>
     *       <tr>
     *         <th>construct</th>
     *         <td>Function</td>
     *         <td>The constructor of the class.</td>
     *       </tr>
     *       <tr>
     *         <th>statics</th>
     *         <td>Map</td>
     *         <td>Map of static members of the class.</td>
     *       </tr>
     *       <tr>
     *         <th>properties</th>
     *         <td>Map</td>
     *         <td>
     *           Map of property definitions. For a description of the
     *           format of a property definition see {@link
     *           qx.core.Property}.
     *         </td>
     *       </tr>
     *       <tr>
     *         <th>members</th>
     *         <td>Map</td>
     *         <td>Map of instance members of the class.</td>
     *       </tr>
     *       <tr>
     *         <th>environment</th>
     *         <td>Map</td>
     *         <td>
     *           Map of environment settings for this class. For a
     *           description of the format of a setting see {@link
     *           qx.core.Environment}.
     *         </td>
     *       </tr>
     *       <tr>
     *         <th>events</th>
     *         <td>Map</td>
     *         <td>
     *           Map of events the class fires. The keys are the names of
     *           the events and the values are the corresponding event type
     *           class names.
     *         </td>
     *       </tr>
     *       <tr>
     *         <th>defer</th>
     *         <td>Function</td>
     *         <td>
     *           Function that is called at the end of processing the class
     *           declaration. It allows access to the declared statics,
     *           members and properties.
     *         </td>
     *       </tr>
     *       <tr>
     *         <th>destruct</th>
     *         <td>Function</td>
     *         <td>The destructor of the class.</td>
     *       </tr>
     *       <tr>
     *         <th>delegate</th>
     *         <td>Map</td>
     *         <td>
     *           EXPERIMENTAL: Special-use-case handling of storage
     *           setters/getters for non-properties. See the developer
     *           documentation.
     *         </td>
     *       </tr>
     *     </table>
     *
     * @return {Class}
     *   The defined class
     */
    __defineImpl(className, config) {
      let clazz;
      let proxy;
      let handler;
      let path;
      let classnameComponents;
      let implicitType = false;

      // Ensure the desginated class has not already been defined
      if (className && qx.Bootstrap.$$registry[className]) {
        throw new Error(`${className} is already defined; cannot redefine a class`);
      }

      // Process environment
      let environment = config.environment || {};
      for (let key in environment) {
        qx.core.Environment.add(key, environment[key]);
      }

      // Normalize include to array
      if (config.include && qx.Bootstrap.getClass(config.include) != "Array") {
        config.include = [config.include];
      }

      // Normalize implement to array
      if (config.implement && qx.Bootstrap.getClass(config.implement) != "Array") {
        config.implement = [config.implement];
      }

      // Explicit null `extend` key means extend from Object. Otherwise,
      // falsy `extend` means it's a static class.
      if (config.extend === null) {
        config.extend = Object;
      } else if (!config.extend) {
        if (qx.core.Environment.get("qx.debug")) {
          if (config.type && config.type != "static") {
            throw new Error(`${className}: ` + `No 'extend' key, but 'type' is not 'static' ` + `(found ${config.type})`);
          }
        }

        implicitType = true;
        config.type = "static";
      } else if (config.extendNativeClass) {
        // They're extending a native `class`. We need ability to call
        // its constructor. That is supposed to work only via the
        // `new` keyword; there's no way I've found yet to call a
        // native lass (superclass) constructor from a qooxdoo class'
        // constructor, so the native class must be enhanced. We need
        // the new `extendNativeClass` config key because there's
        // otherwise no way to know that it's a native class without
        // inspecting the transpiled code (`config.extend.toString()`)
        // to see if it contains `"_classCallCheck(this"`, and that's
        // not reliable because someone could use that function name
        // in their own, non-native class. Note that the native class
        // is munged: its 'constructor' method is altered.
        //
        // THIS IS NOT YET FUNCTIONAL. Until we get it working,
        // `extendNativeClass` is commented out in
        // qx.Bootstrap._allowedNonStaticKeys, so we can't get here.
        let orig = config.extend;
        config.extend.constructor = function (...args) {
          return Reflect.construct(orig, ...args, this);
        };
      } else if (qx.core.Environment.get("qx.debug") && config.extend.toString()?.includes("_classCallCheck(this")) {
        console.warn(
          `${className}: ` +
            "It looks like you may be extending a native JavaScript class " +
            "but you neglected to add `extendNativeClass : true` to your " +
            "configuration. Calling the native class (superclass) constructor " +
            "and methods may not work reliably. " +
            "If you are not extending a native JavaScript class, you are " +
            "seeing this warning because your superclass constructor " +
            "references the function `_classCallCheck`."
        );
      }

      if (qx.core.Environment.get("qx.debug")) {
        Object.keys(config).forEach(key => {
          let allowedKeys = config.type == "static" ? qx.Bootstrap._allowedStaticKeys : qx.Bootstrap._allowedNonStaticKeys;

          // Ensure this key is allowed
          if (!(key in allowedKeys)) {
            if (config.type == "static") {
              throw new Error(`${className}: ` + `disallowed key in static class configuration: ${key}`);
            } else {
              throw new Error(`${className}: ` + `unrecognized key in class configuration: ${key}`);
            }
          }

          // Ensure its value is of the correct type
          if (typeof config[key] != allowedKeys[key]) {
            throw new Error(`${className}: ` + `typeof value for key ${key} must be ${allowedKeys[key]}; ` + `found ${typeof config[key]}`);
          }
        });

        try {
          qx.Class._validateConfig(className, config);
        } catch (e) {
          if (implicitType) {
            e.message = 'Assumed static class because no "extend" key was found. ' + e.message;
          }
          throw e;
        }

        qx.Class._validatePropertyDefinitions(className, config);
      }

      // Create the new class
      clazz = qx.Class._extend(className, config);

      // Initialise class and constructor/destructor annotations
      ["@", "@construct", "@destruct"].forEach(id => {
        qx.Class._attachAnno(clazz, id, null, config[id]);
      });

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
        let staticFuncOrVar;

        if (qx.core.Environment.get("qx.debug")) {
          if (key.charAt(0) === "@") {
            if (config.statics[key.substring(1)] === undefined) {
              throw new Error('Annonation for static "' + key.substring(1) + '" of Class "' + clazz.classname + '" does not exist!');
            }

            if (key.charAt(1) === "_" && key.charAt(2) === "_") {
              throw new Error('Cannot annotate private static "' + key.substring(1) + '" of Class "' + clazz.classname);
            }
          }
        }

        // Do not add annotations as class properties
        if (key.charAt(0) === "@") {
          continue;
        }

        staticFuncOrVar = config.statics[key];

        if (typeof staticFuncOrVar == "function") {
          if (qx.core.Environment.get("qx.aspects")) {
            staticFuncOrVar = qx.core.Aspect.wrap(className, staticFuncOrVar, "static");
          }

          // Allow easily identifying this method
          qx.Bootstrap.setDisplayName(staticFuncOrVar, className, key);
        }

        // Add this static as a class property
        Object.defineProperty(clazz, key, {
          value: staticFuncOrVar,
          writable: qx.Class.$$options.propsAccessible || true,
          configurable: qx.Class.$$options.propsAccessible || true,
          enumerable: qx.Class.$$options.propsAccessible || true
        });

        // Attach annotations
        qx.Class._attachAnno(clazz, "statics", key, config.statics["@" + key]);
      }

      // Add a method to refresh all inheritable properties
      Object.defineProperty(clazz.prototype, "$$refreshInheritables", {
        value() {
          let allProperties = this.constructor.prototype.$$allProperties;

          // Call the refresh method of each inheritable property
          for (let prop in allProperties) {
            let property = allProperties[prop];

            if (property.isInheritable()) {
              let propertyFirstUp = qx.Bootstrap.firstUp(prop);

              // Call this property's refresh method
              this[`refresh${propertyFirstUp}`]();
            }
          }
        },
        writable: qx.Class.$$options.propsAccessible || false,
        configurable: qx.Class.$$options.propsAccessible || false,
        enumerable: qx.Class.$$options.propsAccessible || false
      });

      // Members, properties, events, and mixins are only allowed for
      // non-static classes.
      if (config.extend) {
        // Track members defined by the class itself (not from mixins)
        // This allows class members to override mixin members
        if (config.members) {
          if (!clazz.prototype.$$ownMembers) {
            clazz.prototype.$$ownMembers = {};
          }
          for (let key in config.members) {
            clazz.prototype.$$ownMembers[key] = true;
          }
        }

        // Add members
        if (config.members) {
          qx.Class.addMembers(clazz, config.members, config.events, false);
        }

        // Add properties
        if (config.properties) {
          qx.Class.addProperties(clazz, config.properties, false);
        }

        // Add events
        if (config.events) {
          qx.Class.addEvents(clazz, config.events, false);
        }

        // Add objects
        if (config.objects) {
          this.__addObjects(clazz, config.objects);
        }

        // Include mixins
        // Must be here, after members and properties, to detect conflicts
        if (config.include) {
          config.include.forEach(mixin => this.addMixin(clazz, mixin, false));
        }
      }

      // Add interfaces
      // We ensure that `this.addInterface` exists, because the default
      // property storage implements an interface and during bootstrap
      // time, we want to ignore that.
      if (this.addInterface) {
        if (config.implement) {
          config.implement.forEach(iface => this.addInterface(clazz, iface));
        }

        if (qx.core.Environment.get("qx.debug")) {
          this.validateAbstractInterfaces(clazz);
        }
      }

      //
      // Store destruct onto class. We wrap their function (or an empty
      // function) in code that also handles any properties that
      // require `dereference : true`
      //
      let destruct = config.destruct || function () {};

      if (qx.core.Environment.get("qx.aspects")) {
        destruct = qx.core.Aspect.wrap(className, destruct, "destructor");
      }

      // Wrap the destructor in a function that calls the original
      // destructor and then deletes any property remnants for
      // properties that are marked as `dereference : true`.
      let destructDereferencer = function () {
        let properties = this.constructor.prototype.$$allProperties;

        // First call the original or aspect-wrapped destruct method
        destruct.call(this);

        // Now ensure all properties marked with `derefrence : true`
        // have their saved values removed from this object.
        for (let prop in properties) {
          let property = properties[prop];
          if (property instanceof qx.core.property.Property && property.needsDereference()) {
            property.dereference(this);
          }
        }
      };

      clazz.$$destructor = destructDereferencer;
      qx.Bootstrap.setDisplayName(destructDereferencer, className, "destruct");

      // If there's a specified classname...
      let basename;
      if (className) {
        // Create that namespace
        basename = qx.Bootstrap.createNamespace(className, clazz);

        // Store class reference in global class registry
        qx.Bootstrap.$$registry[className] = clazz;
      }
      clazz.basename = basename || "";
      if (clazz.prototype) {
        clazz.prototype.basename = clazz.basename;
      }

      // Now that the class has been defined, arrange to call its
      // (optional) defer function
      if (config.defer) {
        // Execute defer section
        qx.Bootstrap.addPendingDefer(clazz, () => {
          config.defer(clazz, clazz.prototype, {
            add(name, config) {
              qx.Class.addProperties(clazz, { [name]: config }, true);
            }
          });
        });
      }

      return clazz;
    },

    _extend(classname, config) {
      let type = config.type || "class";
      let superclass = config.extend || Object;
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

          // add abstract and singleton checks
          if (type === "abstract") {
            if (this.classname === classname) {
              throw new Error("The class '," + classname + "' is abstract! It is not possible to instantiate it.");
            }
          }

          if (type === "singleton") {
            if (!this.constructor.$$allowconstruct) {
              throw new Error(
                "The class '" +
                  classname +
                  "' is a singleton! It is not possible to instantiate it " +
                  "directly. Use the static getInstance() method instead."
              );
            }
          }

          // At the time this function is called, config.construct, even
          // if undefined in the configuration, will have been set to a
          // trivial function. We therefore look at its initial value to
          // decide whether to call it, or the superclass constructor.
          if (initialConstruct) {
            ret = initialConstruct.apply(this, args);
          } else {
            ret = superclass.apply(this, args);
          }

          // Call any mixins' constructors and those mixins'
          // dependency mixins' constructors
          if (subclass.constructor.$$flatIncludes) {
            subclass.constructor.$$flatIncludes.forEach(mixin => {
              if (mixin.$$constructor) {
                mixin.$$constructor.apply(this, args);
              }
            });
          }

          let initDuringConstruct = qx.core.Environment.get("qx.core.property.Property.applyDuringConstruct");
          let excludeAutoApply = qx.core.Environment.get("qx.core.property.Property.excludeAutoApply") || [];


          //Init properties
          //Call apply function for properties of this class which have an init value and which haven't been initialized yet.
          //This must be done once per instantiation, after the constructor of the concrete class has finished.
          if (this.constructor === subclass) {
            for (let property of Object.values(subclass.prototype.$$allProperties)) {
              if (!(property instanceof qx.core.property.Property)) {
                continue;
              }
              let def = property.getDefinition();
              let modernFeatures = def && (def.autoApply || def.initFunction);
              let excluded = property.getClass().classname ? excludeAutoApply.find(match => property.getClass().classname.match(match)) : !modernFeatures;
              if (
                !property.isPseudoProperty() &&
                def.autoApply !== false &&
                property.hasInitValue() &&
                !property.getPropertyState(this).initMethodCalled &&
                ((initDuringConstruct === true && !excluded) || modernFeatures)
              ) {
                property.init(this);
              }
            }
          }

          if (config.delegate) {
            return new Proxy(this, {
              get(target, propertyName, receiver) {
                if (typeof config.delegate.get == "function") {
                  return config.delegate.get.call(target, propertyName);
                }
                let value = Reflect.get(target, propertyName, receiver);
                return value;
              },

              set(target, propertyName, value) {
                if (typeof config.delegate.set == "function") {
                  return config.delegate.set.call(target, propertyName, value);
                }
                return Reflect.set(target, propertyName, value);
              },

              deleteProperty(target, propertyName) {
                if (typeof config.delegate.delete == "function") {
                  return config.delegate.delete.call(target, propertyName);
                }
                return Reflect.deleteProperty(target, propertyName);
              }
            });
          }

          return this;
        };
      } else {
        subclass = function () {
          throw new Error(`${classname}: can not instantiate a static class`);
        };
      }

      // Allow easily identifying this class
      qx.Bootstrap.setDisplayName(subclass, classname);

      // This is a class
      subclass.$$type = "Class";

      // If its class type was specified, save it
      if (config.type) {
        subclass.$$classtype = config.type;
      }

      // Ensure there's something unique to compare constructors to.
      if (!config.construct) {
        config.construct = function () {};
      }

      // Keep track of the original constructor so we know when to
      // construct mixins
      subclass.$$originalConstructor = config.construct;

      qx.Bootstrap.extendClass(subclass, config.construct, superclass, classname);

      let superProperties = superclass.prototype.$$allProperties || {};

      // Save this object's properties
      Object.defineProperty(subclass.prototype, "$$properties", {
        value: {},
        writable: qx.Class.$$options.propsAccessible || false,
        configurable: qx.Class.$$options.propsAccessible || false,
        enumerable: qx.Class.$$options.propsAccessible || false
      });

      // Save the super properties for this class
      Object.defineProperty(subclass.prototype, "$$superProperties", {
        value: superProperties,
        writable: qx.Class.$$options.propsAccessible || false,
        configurable: qx.Class.$$options.propsAccessible || false,
        enumerable: qx.Class.$$options.propsAccessible || false
      });

      // Save the full chain of properties for this class
      Object.defineProperty(subclass.prototype, "$$allProperties", {
        value: Object.assign({}, superProperties),
        writable: qx.Class.$$options.propsAccessible || false,
        configurable: qx.Class.$$options.propsAccessible || false,
        enumerable: qx.Class.$$options.propsAccessible || false
      });

      // Save any init functions that need to be called upon instantiation
      Object.defineProperty(subclass.prototype, "$$initFunctions", {
        value: [],
        writable: qx.Class.$$options.propsAccessible || false,
        configurable: qx.Class.$$options.propsAccessible || false,
        enumerable: qx.Class.$$options.propsAccessible || false
      });

      return subclass;
    },

    /**
     * Removes a class from qooxdoo defined by {@link #define}
     *
     * @param name {String}
     *   Name of the class
     */
    undefine: qx.Bootstrap.undefine,

    /**
     * Attach members to a class
     *
     * @param clazz {Class}
     *   Class to add members to
     *
     * @param members {Map}
     *   The map of members to attach
     *
     * @param patch {Boolean ? false}
     *   Enable patching
     */
    addMembers(clazz, members, events, patch) {
      let proto = clazz.prototype;
      let classOwnMembers = {}; // Track class members to restore after mixin addition

      for (let key in members) {
        let member = members[key];

        if (qx.core.Environment.get("qx.debug")) {
          if (key.charAt(0) === "@") {
            var annoKey = key.substring(1);
            if (members[annoKey] === undefined && proto[annoKey] === undefined) {
              throw new Error(`Annotation for ${annoKey} of Class ${clazz.classname} does not exist`);
            }

            if (key.charAt(1) === "_" && key.charAt(2) === "_") {
              throw new Error(`Cannot annotate private member ${key.substring(1)} ` + `of Class ${clazz.classname}`);
            }
          } else {
            // Check if we're trying to overwrite an existing member
            let isOverwriting = (proto.$$allProperties.hasOwnProperty(key) || proto.hasOwnProperty(key)) &&
                                key != "_createQxObjectImpl";

            if (isOverwriting && patch !== true) {
              // Check if conflicting with a property - this is never allowed
              let isProperty = proto.$$allProperties.hasOwnProperty(key);

              if (isProperty) {
                // Conflicting with a property - always throw error
                throw new Error(
                  clazz.classname +
                    ': Overwriting member or property "' +
                    key +
                    '" of Class "' +
                    clazz.classname +
                    '" is not allowed! (Members and properties are in the same namespace.)'
                );
              }

              // Check if this is a class-defined member overriding a mixin method (issue #9142)
              // Classes should be able to override mixin methods
              let isOwnMember = proto.$$ownMembers && proto.$$ownMembers.hasOwnProperty(key);

              if (isOwnMember) {
                // Save the class member to restore it after the mixin member is added
                // This allows super to work: mixin member is added, then class member
                // overwrites it but can call super.method() to access the mixin version
                classOwnMembers[key] = proto[key];
                // Don't skip - let the mixin member be added, then we'll restore the class member
              } else {
                // Not an own member and not a property, so this is a mixin-to-mixin conflict
                throw new Error(
                  clazz.classname +
                    ': Overwriting member or property "' +
                    key +
                    '" of Class "' +
                    clazz.classname +
                    '" is not allowed! (Members and properties are in the same namespace.)'
                );
              }
            } else if (proto[key] !== undefined && key.charAt(0) === "_" && key.charAt(1) === "_") {
              throw new Error(`Overwriting private member "${key}" ` + `of Class "${clazz.classname}" ` + "is not allowed");
            }
          }
        }

        // Annotations are not members
        if (key.charAt(0) === "@") {
          let annoKey = key.substring(1);
          if (members[annoKey] === undefined) {
            // An annotation for a superclass' member
            qx.Class._attachAnno(clazz, "members", annoKey, member);
          }

          continue;
        }

        if (typeof member == "function") {
          // If patching, we need to wrap the member function so that
          // `member.base` is unique when a mixin is added to more than
          // one class
          if (patch) {
            let f = member;
            member = function (...args) {
              return f.apply(this, args);
            };
          }

          // Allow easily identifying this method
          qx.Bootstrap.setDisplayName(member, clazz.classname, `prototype.${key}`);

          if (qx.core.Environment.get("qx.aspects")) {
            member = qx.core.Aspect.wrap(clazz.classname, member, key);
          }

          // Allow base calls
          if (key in clazz.prototype) {
            if (patch && typeof member == "function") {
              member.self = clazz;
            }
            member.base = clazz.prototype[key];
          }

          // Create the storage for this member
          patch && delete clazz.prototype[key];
          Object.defineProperty(clazz.prototype, key, {
            value: member,
            writable: qx.Class.$$options.propsAccessible || true,
            configurable: qx.Class.$$options.propsAccessible || true,
            enumerable: qx.Class.$$options.propsAccessible || true
          });

          // Attach annotations
          qx.Class._attachAnno(clazz, "members", key, members["@" + key]);
        } else {
          Object.defineProperty(clazz.prototype, key, {
            value: member,
            writable: qx.Class.$$options.propsAccessible || true,
            configurable: qx.Class.$$options.propsAccessible || true,
            enumerable: qx.Class.$$options.propsAccessible || true
          });
        }
      }

      // Restore class-defined members that were overridden by mixin members (issue #9142)
      // This allows classes to override mixin methods while still supporting base calls
      for (let key in classOwnMembers) {
        let classMember = classOwnMembers[key];

        // Re-add the class member, which will now have member.base set to the mixin version
        if (typeof classMember == "function") {
          // Save the mixin member that's currently in the prototype
          let mixinMember = proto[key];

          // Set up base call: the class member's base should point to the mixin member
          // This is crucial for this.base(arguments) to work correctly
          classMember.base = mixinMember;

          // Also set member.self for proper context (similar to patch behavior)
          classMember.self = clazz;

          // Delete the mixin member and replace with the class member
          delete proto[key];
          Object.defineProperty(proto, key, {
            value: classMember,
            writable: qx.Class.$$options.propsAccessible || true,
            configurable: qx.Class.$$options.propsAccessible || true,
            enumerable: qx.Class.$$options.propsAccessible || true
          });
        }
      }

      for (let key in members) {
        if ((key.length > 3) & key.startsWith("get") && key.charAt(3) === key.charAt(3).toUpperCase()) {
          let propertyName = key.charAt(3).toLowerCase() + key.substr(4);
          if (clazz.prototype.$$allProperties[propertyName]) {
            continue;
          }
          let eventName = "change" + key.substr(3);
          if (events && events[eventName]) {
            let superProperty = clazz.prototype.$$superProperties ? clazz.prototype.$$superProperties[propertyName] : null;
            if (superProperty) {
              throw new Error(`${clazz.classname}: ` + `Overwriting property "${propertyName}" with a pseudo-property is not allowed`);
            }
            let property = new qx.core.property.Property(propertyName, clazz);
            property.configurePseudoProperty();
            clazz.prototype.$$properties[propertyName] = property;
            clazz.prototype.$$allProperties[propertyName] = property;
            property.defineProperty(clazz, patch);
          }
        }
      }
    },

    /**
     * Attach properties to classes
     *
     * @param clazz {Class}
     *   Class to add the properties to
     *
     * @param properties {Map}
     *   Map of properties
     *
     * @param patch {Boolean ? false}
     *   Overwrite property with the limitations of a property which
     *   means you are able to refine but not to replace (esp. for
     *   new properties)
     */
    addProperties(clazz, properties, patch) {
      let addImpl = groupProperties => {
        for (let propertyName in properties) {
          let def = properties[propertyName];
          if ((groupProperties && !def.group) || (!groupProperties && def.group)) {
            continue;
          }

          let superProperty =
            clazz.prototype.$$superProperties &&
            clazz.prototype.$$superProperties.hasOwnProperty(propertyName) &&
            clazz.prototype.$$superProperties[propertyName];
          let property;
          if (superProperty) {
            if (!def.refine) {
              throw new Error(`${clazz.classname}: ` + `Overwriting property "${propertyName}" without "refine: true"`);
            }
            property = superProperty.clone(clazz);
          } else if (def.group) {
            property = new qx.core.property.GroupProperty(propertyName, clazz);
          } else {
            property = new qx.core.property.Property(propertyName, clazz);
          }

          clazz.prototype.$$properties[propertyName] = property;
          clazz.prototype.$$allProperties[propertyName] = property;
          property.configure(def);

          property.defineProperty(clazz, patch);
          let eventName = property.getEventName();
          if (eventName) {
            let events = {
              [eventName]: "qx.event.type.Data"
            };

            qx.Class.addEvents(clazz, events, true);
          }

          // Add annotations
          qx.Class._attachAnno(clazz, "properties", propertyName, def["@"]);
        }
      };
      addImpl(false);
      addImpl(true);
    },

    /**
     * Attach events to the class
     *
     * @param clazz {Class}
     *   Class to add the events to
     *
     * @param events {Map}
     *   Map of event names the class fires
     *
     * @param patch {Boolean ? false}
     *   Enable redefinition of event type?
     */
    addEvents(clazz, events, patch) {
      let key;

      if (qx.core.Environment.get("qx.debug")) {
        if (typeof events !== "object" || qx.Bootstrap.getClass(events) === "Array") {
          throw new Error(clazz.classname + ": the events must be defined as map!");
        }

        for (key in events) {
          let type = events[key];

          if (type !== undefined && typeof type !== "string") {
            throw new Error(
              clazz.classname +
                "/" +
                key +
                ": the event value needs to be a string with the class name " +
                "of the event object which will be fired."
            );
          }
        }

        // Compare old and new event type/value if patching is disabled
        if (clazz.$$events && patch !== true) {
          for (key in events) {
            if (clazz.$$events[key] !== undefined && clazz.$$events[key] !== events[key]) {
              throw new Error(
                clazz.classname + "/" + key + ": the event value/type cannot be changed from " + clazz.$$events[key] + " to " + events[key]
              );
            }
          }
        }
      }

      if (clazz.$$events) {
        for (key in events) {
          clazz.$$events[key] = events[key];
        }
      } else {
        clazz.$$events = events;
      }
    },

    /**
     * Include all features of the mixin into the given class, recursively.
     *
     * @param clazz {Class}
     *   The class onto which the mixin should be attached
     *
     * @param mixin {Mixin}
     *   Include all features of this mixin
     *
     * @param patch {Boolean}
     *   Overwrite existing fields, functions and properties
     */
    addMixin(clazz, mixin, patch) {
      if (qx.core.Environment.get("qx.debug")) {
        if (!clazz || !mixin) {
          throw new Error("Incomplete parameters!");
        }
      }

      if (this.hasMixin(clazz, mixin)) {
        return;
      }

      // Attach content
      let list = qx.Mixin.flatten([mixin]);
      list.forEach(entry => {
        // Attach events
        if (entry.$$events) {
          qx.Class.addEvents(clazz, entry.$$events, patch);
        }

        // Attach members
        if (entry.$$members) {
          qx.Class.addMembers(clazz, entry.$$members, entry.$$events, patch);
        }

        // Attach properties
        if (entry.$$properties) {
          qx.Class.addProperties(clazz, entry.$$properties, patch);
        }
      });

      // Store mixin reference
      if (clazz.$$includes) {
        clazz.$$includes.push(mixin);
        clazz.$$flatIncludes.push.apply(clazz.$$flatIncludes, list);
      } else {
        clazz.$$includes = [mixin];
        clazz.$$flatIncludes = list;
      }
    },

    /**
     * Add a single interface to a class
     *
     * @param clazz {Class} class to add interface to
     * @param iface {Interface} the Interface to add
     */
    addInterface(clazz, iface) {
      if (qx.core.Environment.get("qx.debug")) {
        if (!clazz || !iface) {
          throw new Error("Incomplete parameters");
        }

        // This differs from mixins, we only check if the interface
        // is already directly used by this class. It is allowed
        // however, to have an interface included multiple times by
        // extends in the interfaces etc.
        if (this.hasOwnInterface(clazz, iface)) {
          throw new Error(`Interface ${iface.name} is already used by ` + `Class ${clazz.classname}`);
        }

        // Check interface and wrap members
        if (clazz.$$classtype !== "abstract") {
          qx.Interface.assert(clazz, iface, true);
        }
      }

      // Store interface reference
      let list = qx.Interface.flatten([iface]);
      if (clazz.$$implements) {
        clazz.$$implements.push(iface);
        clazz.$$flatImplements.push.apply(clazz.$$flatImplements, list);
      } else {
        clazz.$$implements = [iface];
        clazz.$$flatImplements = list;
      }
    },

    /**
     * Adds the objects definition to the class
     *
     * @param {qx.Class} clazz class which is being defined
     * @param {*} objects the `object` property in the definition
     */
    __addObjects(clazz, objects) {
      function validateCachedObject(key, value) {
        if (typeof value !== "function") {
          throw new Error("Invalid cached object definition for " + key + " in " + clazz.classname);
        }

        if (typeof key != "string") {
          throw new Error("Invalid cached object key for " + key + " in " + clazz.classname);
        }
      }

      if (!(objects instanceof Object)) {
        throw new Error("Invalid objects definition for " + clazz.classname);
      }

      if (qx.core.Environment.get("qx.debug")) {
        for (let key in objects) {
          validateCachedObject(key, objects[key]);
        }
      }

      clazz.$$objects = objects;
    },

    /**
     * Include all features of the given mixin into the class. The
     * mixin must not include any methods or properties that are
     * already available in the class. This would only be possible
     * using the {@link #patch} method.
     *
     * @param clazz {Class}
     *   An existing class which should be augmented by including a mixin.
     *
     * @param mixin {Mixin}
     *   The mixin to be included.
     */
    include(clazz, mixin) {
      if (qx.core.Environment.get("qx.debug")) {
        if (!mixin) {
          throw new Error(`The mixin to include into class ${clazz.classname} ` + "is undefined or null");
        }

        qx.Mixin.isCompatible(mixin, clazz);
      }

      qx.Class.addMixin(clazz, mixin, false);
    },

    /**
     * Include all features of the given mixin into the class. The
     * mixin may include features, which are already defined in the
     * target class. Existing features of equal name will be
     * overwritten. Please keep in mind that this functionality is
     * not intended for regular use, but as a formalized way (and a
     * last resort) in order to patch existing classes.
     *
     * <b>WARNING</b>: You may break working classes and features.
     *
     * @param clazz {Class}
     *   An existing class which should be modified by including a mixin.
     *
     * @param mixin {Mixin}
     *   The mixin to be included.
     *
     * @return {Class}
     *   The new class definition
     */
    patch(clazz, mixin) {
      if (qx.core.Environment.get("qx.debug")) {
        if (!mixin) {
          throw new Error(`The mixin to patch class ${clazz.classname} ` + "is undefined or null");
        }

        qx.Mixin.isCompatible(mixin, clazz);
      }

      qx.Class.addMixin(clazz, mixin, true);
      return qx.Class.getByName(clazz.classname);
    },

    /**
     * Validates the interfaces required by abstract base classes
     *
     * @signature function(clazz)
     *
     * @param clazz {Class}
     *   The configured class.
     */
    validateAbstractInterfaces(clazz) {
      let superclass = clazz.superclass;
      while (superclass) {
        if (superclass.$$classtype !== "abstract") {
          break;
        }

        var interfaces = superclass.$$implements;
        if (interfaces) {
          for (let i = 0; i < interfaces.length; i++) {
            qx.Interface.assert(clazz, interfaces[i], true);
          }
        }
        superclass = superclass.superclass;
      }
    },

    /**
     * Attaches an annotation to a class
     *
     * @param clazz {Map} Static methods or fields
     * @param group {String} Group name
     * @param key {String} Name of the annotated item
     * @param anno {Object} Annotation object
     */
    _attachAnno(clazz, group, key, anno) {
      // If there's no annotation, we have nothing to do
      if (anno === undefined) {
        return;
      }

      if (clazz.$$annotations === undefined) {
        clazz.$$annotations = {};
        clazz.$$annotations[group] = {};
      } else if (clazz.$$annotations[group] === undefined) {
        clazz.$$annotations[group] = {};
      }

      if (!Array.isArray(anno)) {
        anno = [anno];
      }

      if (key) {
        clazz.$$annotations[group][key] = anno;
      } else {
        clazz.$$annotations[group] = anno;
      }
    },

    /**
     * Validates an incoming configuration and checks for proper keys and values
     *
     * @signature function(name, config)
     *
     * @param name {String}
     *   The name of the class
     *
     * @param config {Map}
     *   Configuration map
     */
    _validateConfig: qx.core.Environment.select("qx.debug", {
      true(name, config) {
        // Validate type
        if (config.type && !(config.type === "static" || config.type === "abstract" || config.type === "singleton")) {
          throw new Error('Invalid type "' + config.type + '" definition for class "' + name + '"!');
        }

        // Validate non-static class on the "extend" key
        if (config.type && config.type !== "static" && !config.extend) {
          throw new Error(`${name}: invalid config. ` + "Non-static class must extend at least the `qx.core.Object` class");
        }

        // Validate maps
        let maps = ["statics", "properties", "members", "environment", "settings", "variants", "events"];

        for (let i = 0, l = maps.length; i < l; i++) {
          var key = maps[i];

          if (
            config[key] !== undefined &&
            (config[key] === null || config[key].$$hash !== undefined || !qx.Bootstrap.isObject(config[key]))
          ) {
            throw new Error('Invalid key "' + key + '" in class "' + name + '". The value needs to be a map.');
          }
        }

        // Validate include definition
        if (config.include) {
          if (qx.Bootstrap.getClass(config.include) === "Array") {
            for (let i = 0, a = config.include, l = a.length; i < l; i++) {
              if (a[i] == null || a[i].$$type !== "Mixin") {
                throw new Error('The include definition in class "' + name + '" contains an invalid mixin at position ' + i + ": " + a[i]);
              }
            }
          } else {
            throw new Error('Invalid include definition in class "' + name + '"! Only mixins and arrays of mixins are allowed!');
          }

          if (config.type == "static") {
            config.include.forEach(mixin => {
              if (mixin.$$members) {
                throw new Error(`Mixin ${mixin.mixinName} applied to class ${name}: ` + "class is static, but mixin has members");
              }
            });
          }
        }

        // Validate implement definition
        if (config.implement) {
          if (qx.Bootstrap.getClass(config.implement) === "Array") {
            for (let i = 0, a = config.implement, l = a.length; i < l; i++) {
              if (a[i] == null || a[i].$$type !== "Interface") {
                throw new Error(
                  'The implement definition in class "' + name + '" contains an invalid interface at position ' + i + ": " + a[i]
                );
              }
            }
          } else {
            throw new Error('Invalid implement definition in class "' + name + '"! Only interfaces and arrays of interfaces are allowed!');
          }
        }

        // Check mixin compatibility
        if (config.include) {
          try {
            qx.Mixin.checkCompatibility(config.include);
          } catch (ex) {
            throw new Error('Error in include definition of class "' + name + '"! ' + ex.message);
          }
        }

        // Validate environment
        if (config.environment) {
          for (let key in config.environment) {
            if (key.substr(0, key.indexOf(".")) != name.substr(0, name.indexOf("."))) {
              throw new Error(
                'Forbidden environment setting "' +
                  key +
                  '" found in "' +
                  name +
                  '". It is forbidden to define a ' +
                  "environment setting for an external namespace!"
              );
            }
          }
        }

        // Validate settings
        if (config.settings) {
          for (let key in config.settings) {
            if (key.substr(0, key.indexOf(".")) != name.substr(0, name.indexOf("."))) {
              throw new Error(
                'Forbidden setting "' +
                  key +
                  '" found in "' +
                  name +
                  '". It is forbidden to define a default setting for ' +
                  "an external namespace!"
              );
            }
          }
        }

        // Validate variants
        if (config.variants) {
          for (let key in config.variants) {
            if (key.substr(0, key.indexOf(".")) != name.substr(0, name.indexOf("."))) {
              throw new Error(
                'Forbidden variant "' +
                  key +
                  '" found in "' +
                  name +
                  '". It is forbidden to define a variant for ' +
                  "an external namespace!"
              );
            }
          }
        }
      },

      default() {
        // do nothing when debug is disabled
      }
    }),

    _validatePropertyDefinitions: qx.core.Environment.select("qx.debug", {
      true(className, config) {
        let allowedKeys;
        let properties = config.properties || {};

        // Ensure they're not passing a qx.core.Object descendent as property map
        if (qx.core.Environment.get("qx.debug")) {
          if (config.properties !== undefined && qx.Bootstrap.isQxCoreObject(config.properties)) {
            throw new Error(`${className}: ` + "Can't use qx.core.Object descendent as property map");
          }
        }

        for (let prop in properties) {
          let property = properties[prop];

          // Ensure they're not passing a qx.core.Object descendent as a property
          if (qx.core.Environment.get("qx.debug")) {
            if (qx.Bootstrap.isQxCoreObject(property)) {
              throw new Error(`${prop} in ${className}: ` + "Can't use qx.core.Object descendent as property");
            }
          }

          // Set allowed keys based on whether this is a grouped
          // property or not
          allowedKeys = property.group ? qx.Class._allowedPropGroupKeys : qx.Class._allowedPropKeys;

          // Ensure only allowed keys were provided
          Object.keys(property).forEach(key => {
            let allowed = allowedKeys[key];

            if (!(key in allowedKeys)) {
              throw new Error(
                `${className}: ` + (property.group ? "group " : "") + `property '${prop}' defined with unrecognized key '${key}'`
              );
            }

            // Flag any deprecated keys
            if (key in qx.Class.$$deprecatedPropKeys) {
              console.warn(`Property '${prop}': ` + `${qx.Class.$$deprecatedPropKeys[key]}`);
            }

            if (allowed !== null) {
              // Convert non-array 'allowed' values to an array
              if (!Array.isArray(allowed)) {
                allowed = [allowed];
              }

              if (!allowed.includes(typeof property[key])) {
                throw new Error(
                  `${className}: ` +
                    (property.group ? "group " : "") +
                    `property '${prop}' defined with wrong value type ` +
                    `for key '${key}' (found ${typeof property[key]})`
                );
              }
            }
          });
        }
      },

      default(className, config) {
        // do nothing when debug is disabled
      }
    }),

    /**
     * Find a class by its name
     *
     * @signature function(name)
     *
     * @param name {String}
     *   Class name to resolve
     *
     * @return {Class}
     *   The class
     */
    getByName: qx.Bootstrap.getByName,

    /**
     * Returns the class or one of its superclasses which contains the
     * declaration for the given mixin. Returns null if the mixin is not
     * specified anywhere.
     *
     * @param clazz {Class}
     *   Class to look for the mixin
     *
     * @param mixin {Mixin}
     *   Mixin to look for
     *
     * @return {Class | null}
     *   The class which directly includes the given mixin
     */
    getByMixin(clazz, mixin) {
      while (clazz) {
        if (clazz.$$includes) {
          let list = clazz.$$flatIncludes;

          for (let i = 0, l = list.length; i < l; i++) {
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
     * Whether a given class or any of its superclasses includes a given mixin.
     *
     * @param clazz {Class}
     *   Class to check
     *
     * @param mixin {Mixin}
     *   The mixin to check for
     *
     * @return {Boolean}
     *   Whether the class includes the mixin.
     */
    hasMixin(clazz, mixin) {
      return !!this.getByMixin(clazz, mixin);
    },

    /**
     * Whether a given class directly includes an interface.
     *
     * This function will only return "true" if the interface was
     * defined in the class declaration ({@link qx.Class#define})
     * using the "implement" key.
     *
     * @param clazz {Class}
     *   Class or instance to check
     *
     * @param iface {Interface}
     *   The interface to check for
     *
     * @return {Boolean}
     *   Whether the class includes the mixin directly.
     */
    hasOwnInterface(clazz, iface) {
      return clazz.$$implements && clazz.$$implements.includes(iface);
    },

    /**
     * Returns the class or one of its super classes which contains the
     * declaration of the given interface. Returns null if the interface is
     * not specified anywhere.
     *
     * @signature function(clazz, iface)
     *
     * @param clazz {Class}
     *   Class to look for the interface
     *
     * @param iface {Interface}
     *   Interface to look for
     *
     * @return {Class | null}
     *   The class which directly implements the given interface
     */
    getByInterface: qx.util.OOUtil.getByInterface,

    /**
     * Returns a list of all interfaces a given class has to implement.
     *
     * @param clazz {Class}
     *   Class which should be inspected
     *
     * @return {Interface[]}
     *   Array of interfaces this class implements
     */
    getInterfaces(clazz) {
      let list = [];

      while (clazz) {
        if (clazz.$$implements) {
          list.push.apply(list, clazz.$$flatImplements);
        }

        clazz = clazz.superclass;
      }

      return list;
    },

    /**
     * Whether a given class or any of its super classes includes a
     * given interface.
     *
     * This function will return "true" if the interface was defined
     * in the class declaration ({@link qx.Class#define}) of the
     * class or any of its super classes using the "implement" key.
     *
     * @signature function(clazz, iface)
     *
     * @param clazz {Class}
     *   Class to check
     *
     * @param iface {Interface}
     *   The interface to check for
     *
     * @return {Boolean}
     *   Whether the class includes the interface.
     */
    hasInterface: qx.util.OOUtil.hasInterface,

    /**
     * Whether a given class complies to an interface.
     *
     * Checks whether all methods defined in the interface are
     * implemented. The class does not need to implement
     * the interface explicitly in the <code>extend</code> key.
     *
     * @param obj {Object}
     *   Class to check
     *
     * @param iface {Interface}
     *   The interface to check for
     *
     * @return {Boolean}
     *   Whether the class conforms to the interface.
     */
    implementsInterface(obj, iface) {
      let clazz = obj.constructor;

      if (this.hasInterface(clazz, iface)) {
        return true;
      }

      if (qx.Interface.objectImplements(obj, iface)) {
        return true;
      }

      if (qx.Interface.classImplements(clazz, iface)) {
        return true;
      }

      return false;
    },

    /**
     * Whether the given class exists
     *
     * @signature function(name)
     * @param name {String} class name to check
     * @return {Boolean} true if class exists
     */
    isDefined: qx.util.OOUtil.classIsDefined,

    /**
     * Detects whether the object is a Class (and not an instance of a class)
     *
     *  @param obj {Object?} the object to inspect
     *  @return {Boolean} true if it is a class, false if it is anything else
     */
    isClass(obj) {
      return obj && obj.$$type === "Class" && obj.constructor === obj;
    },

    /**
     * Whether a class is a direct or indirect sub class of another class,
     * or both classes coincide.
     *
     * @param clazz {Class} the class to check.
     * @param superClass {Class} the potential super class
     * @return {Boolean} whether clazz is a sub class of superClass.
     */
    isSubClassOf(clazz, superClass) {
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
     * Retreive all subclasses of a given class
     *
     * @param clazz {Class}
     *   The class which should be inspected
     *
     * @return {Object}
     *   Class name hash holding the references to the subclasses or
     *   null if the class does not exist.
     */
    getSubclasses(clazz) {
      if (!clazz) {
        return null;
      }

      let subclasses = {};
      let registry = qx.Bootstrap.$$registry;

      for (let name in registry) {
        if (registry[name].superclass && registry[name].superclass == clazz) {
          subclasses[name] = registry[name];
        }
      }

      return subclasses;
    },

    /**
     * Returns the definition of the given property. Returns null
     * if the property does not exist.
     *
     * @signature function(clazz, name)
     * @param clazz {Class} class to check
     * @param name {String} name of the class to check for
     * @return {Map|null} whether the object support the given event.
     */
    getPropertyDefinition: qx.util.OOUtil.getPropertyDefinition,

    /**
     * Returns a list of all properties supported by the given class
     *
     * @param clazz {Class} Class to query
     * @return {String[]} List of all property names
     */
    getProperties(clazz) {
      return Object.keys(clazz.prototype.$$allProperties);
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
    getByProperty(clazz, name) {
      return clazz.prototype.$$allProperties?.[name] ?? null;
    },

    /**
     * Returns the property descriptor (Property object) of the given property.
     * Returns null if the property does not exist.
     *
     * This provides access to the first-class Property object in qooxdoo v8,
     * which contains the property configuration and metadata.
     *
     * When an instance is provided, the returned descriptor's set() and get() methods
     * are bound to that instance, allowing direct calls like descriptor.set(value).
     *
     * @param clazz {Class} class to check
     * @param name {String} name of the property to check for
     * @param instance {qx.core.Object?} optional instance to bind the descriptor to
     * @return {qx.core.property.Property|null} Property object or null if not found
     */
    getPropertyDescriptor(clazz, name, instance) {
      let property = this.getByProperty(clazz, name);
      if (!property) {
        return null;
      }

      // Create a wrapper that delegates to the property
      let descriptor = Object.create(property);

      if (instance) {
        // If instance is provided, bind set/get methods to the instance
        // This allows descriptor.set(value) instead of descriptor.set.call(instance, value)
        descriptor.set = function(value) {
          property.set(instance, value);
        };

        descriptor.get = function() {
          return property.get(instance);
        };
      } else {
        // Without instance, provide unbound methods that work with .call()
        descriptor.set = function(value) {
          property.set(this, value);
        };

        descriptor.get = function() {
          return property.get(this);
        };
      }

      return descriptor;
    },

    /**
     * Whether a class has the given property
     *
     * @signature function(clazz, name)
     * @param clazz {Class} class to check
     * @param name {String} name of the property to check for
     * @return {Boolean} whether the class includes the given property.
     */
    hasProperty: qx.util.OOUtil.hasProperty,

    /**
     * Detects whether a property has been initialized
     *
     * @param {qx.core.Object} object
     * @param {String} name
     * @returns {Boolean}
     */
    isPropertyInitialized(object, name) {
      let property = object.constructor.prototype.$$allProperties[name];
      return !!(property && property.isInitialized(object));
    },

    /**
     * Returns the event type of the given event. Returns null if
     * the event does not exist.
     *
     * @signature function(clazz, name)
     * @param clazz {Class} class to check
     * @param name {String} name of the event
     * @return {String|null} Event type of the given event.
     */
    getEventType: qx.util.OOUtil.getEventType,

    /**
     * Whether a class supports the given event type
     *
     * @signature function(clazz, name)
     * @param clazz {Class} class to check
     * @param name {String} name of the event to check for
     * @return {Boolean} whether the class supports the given event.
     */
    supportsEvent: qx.util.OOUtil.supportsEvent,

    /**
     * Determine the total number of classes
     *
     * @return {Number} the total number of classes
     */
    getTotalNumber() {
      return qx.Bootstrap.objectGetLength(qx.Bootstrap.$$registry);
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
          (value && qx.data && qx.data.IListData && qx.util.OOUtil.hasInterface(value.constructor, qx.data.IListData)) ||
          qx.Bootstrap.getClass(value) === "Array" ||
          (!!value && !!value.$$isArray))
      );
    }
  }
});
