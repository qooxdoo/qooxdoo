/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2022 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

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
    objectProperties: new Set([
      "hasOwnProperty",
      "isPrototypeOf",
      "propertyIsEnumerable",
      "toLocaleString",
      "toString",
      "valueOf"
    ]),

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

      // Not in original set of allowed keys:
      get: ["string", "function"], // String, Function
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
     * @param name {String?null}
     *   Name of the class. If <code>null</code>, the class will not be
     *   added to any namespace which could be handy for testing.
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
        qx.core.Environment.add(key, environment[key]);
      }

      // Normalize include to array
      if (config.include && qx.Bootstrap.getClass(config.include) != "Array") {
        config.include = [config.include];
      }

      // Normalize implement to array
      if (
        config.implement &&
        qx.Bootstrap.getClass(config.implement) != "Array"
      ) {
        config.implement = [config.implement];
      }

      // Explicit null `extend` key means extend from Object. Otherwise,
      // falsy `extend` means it's a static class.
      if (config.extend === null) {
        config.extend = Object;
      } else if (!config.extend) {
        if (qx.core.Environment.get("qx.debug")) {
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
      } else if (
        qx.core.Environment.get("qx.debug") &&
        config.extend.toString()?.includes("_classCallCheck(this")
      ) {
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

        try {
          qx.Class._validateConfig(className, config);
        } catch (e) {
          if (implicitType) {
            e.message =
              'Assumed static class because no "extend" key was found. ' +
              e.message;
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
              throw new Error(
                'Annonation for static "' +
                  key.substring(1) +
                  '" of Class "' +
                  clazz.classname +
                  '" does not exist!'
              );
            }

            if (key.charAt(1) === "_" && key.charAt(2) === "_") {
              throw new Error(
                'Cannot annotate private static "' +
                  key.substring(1) +
                  '" of Class "' +
                  clazz.classname
              );
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
            staticFuncOrVar = qx.core.Aspect.wrap(
              className,
              staticFuncOrVar,
              "static"
            );
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

      // Create a place to store the property descriptor registry
      // for this class
      Object.defineProperty(clazz, `$$propertyDescriptorRegistry`, {
        value: qx.core.PropertyDescriptorRegistry
          ? new qx.core.PropertyDescriptorRegistry()
          : undefined,
        writable: qx.Class.$$options.propsAccessible || true,
        configurable: qx.Class.$$options.propsAccessible || false,
        enumerable: qx.Class.$$options.propsAccessible || false
      });

      // Create a method to retrieve a property descriptor
      Object.defineProperty(clazz.prototype, `getPropertyDescriptor`, {
        value(prop) {
          return this.constructor.$$propertyDescriptorRegistry.get(this, prop);
        },
        writable: qx.Class.$$options.propsAccessible || false,
        configurable: qx.Class.$$options.propsAccessible || false,
        enumerable: qx.Class.$$options.propsAccessible || false
      });

      // Create a function to ascertain whether a property has been
      // initialized in some way, e.g., via init(), initFunction(), or
      // set()
      Object.defineProperty(clazz.prototype, "isPropertyInitialized", {
        value(prop) {
          let allProperties = this.constructor.$$allProperties;

          return prop in allProperties && typeof this[prop] != "undefined";
        },
        writable: qx.Class.$$options.propsAccessible || false,
        configurable: qx.Class.$$options.propsAccessible || false,
        enumerable: qx.Class.$$options.propsAccessible || false
      });

      // Add a method to refresh all inheritable properties
      Object.defineProperty(clazz.prototype, "$$refreshInheritables", {
        value() {
          let allProperties = this.constructor.$$allProperties;

          // Call the refresh method of each inheritable property
          for (let prop in allProperties) {
            let property = allProperties[prop];

            if (property.inheritable) {
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
        // Add members
        if (config.members) {
          qx.Class.addMembers(clazz, config.members, false);
        }

        // Add properties
        if (config.properties) {
          qx.Class.addProperties(clazz, config.properties, false);
        }

        // Add events
        if (config.events) {
          qx.Class.addEvents(clazz, config.events, false);
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
        let properties = this.constructor.$$allProperties;

        // First call the original or aspect-wrapped destruct method
        destruct.call(this);

        // Now ensure all properties marked with `derefrence : true`
        // have their saved values removed from this object.
        for (let prop in properties) {
          let property = properties[prop];

          // If this property is specified to be dereference upon dispose,
          // or its check indicates that it's a type that requires being
          // dereferenced...
          if (
            property.dereference ||
            [
              // Perform magic. These types (as indicated by their
              // `check`, need to be dereferenced even if `dereference`
              // isn't specified for the propery. Or rather, in old IE
              // days, they needed to be explicitly removed from the
              // object. They may not need to be any longer, but it
              // doesn't hurt terribly to continue to do so.
              "Node",
              "Element",
              "Document",
              "Window",
              "Event"
            ].includes(property.config)
          ) {
            // If the storage mechanism has a dereference method, let it
            // do its thing
            property.storage.dereference &&
              property.storage.dereference.call(this, prop, property);

            // Get rid of our internal storage of the various possible
            // values for this property
            delete this[`$$user_${prop}`];
            delete this[`$$theme_${prop}`];
            delete this[`$$inherit_${prop}`];
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

    _extend(className, config) {
      const type = config.type || "class";
      const superclass = config.extend || Object;
      const properties = config.properties;
      const customProxyHandler = config.proxyHandler;
      const _this = this;
      let allProperties = superclass.$$allProperties || {};
      let superProperties = superclass.$$superProperties || {};
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

          // Call any mixins' constructors and those mixins'
          // dependency mixins' constructors
          if (subclass.constructor.$$flatIncludes) {
            subclass.constructor.$$flatIncludes.forEach(mixin => {
              if (mixin.$$constructor) {
                mixin.$$constructor.apply(this, args);
              }
            });
          }

          return ret;
        };
      } else {
        subclass = function () {
          throw new Error(`${className}: can not instantiate a static class`);
        };
      }

      // Ensure there are no properties defined that overwrite
      // superclasses' properties, unless "refine : true" is
      // specified.
      for (let property in properties) {
        let refined = false;

        if (
          property in superProperties &&
          !qx.Class.objectProperties.has(property) &&
          !properties[property].refine
        ) {
          throw new Error(
            `${className}: ` +
              `Overwriting property "${property}" without "refine: true"`
          );
        }

        // Allow only changing the init or initFunction values if
        // refine is true
        if (properties[property].refine) {
          let redefinitions = Object.keys(properties[property]).filter(
            key => !["refine", "init", "initFunction", "@"].includes(key)
          );

          if (redefinitions.length > 0) {
            throw new Error(
              `${className}: ` +
                `Property "${property}" ` +
                `redefined with other than "init", "initFunction", "@"`
            );
          }

          // Create a modified property definition using the prior
          // definition (if one exists) as the basis, and adding
          // properties provided in the redefinition (except for "refine")
          delete properties[property].refine;
          properties[property] = Object.assign(
            {},
            allProperties[property] || {},
            properties[property]
          );

          // We only get here if `refine : true` was in the configuration.
          // That doesn't say whether there was actually a superclass
          // property for it to refine. It's not an error to refine a
          // non-existing property. Keep track of whether we actually
          // refined a property.
          refined = property in allProperties;
        }

        // Ensure that this property isn't attempting to override a
        // method name from within this configuration. (Never acceptable)
        if ("members" in config && property in config.members) {
          throw new Error(
            `${className}: ` +
              `Overwriting member "${property}" ` +
              `with property "${property}"`
          );
        }

        // Ensure that this property isn't attempting to override a
        // member name from the superclass prototype chain that
        // isn't a refined property.
        if (
          superclass &&
          "property" in superclass &&
          property in superclass.prototype &&
          !refined
        ) {
          throw new Error(
            `${className}: ` +
              `Overwriting superclass member "${property}" ` +
              `with property "${property}"`
          );
        }

        // Does this property have an initFunction?
        if (properties[property].initFunction) {
          // Yup. Keep track of it.
          initFunctions.push(property);
        }
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

      // Save this object's properties
      Object.defineProperty(subclass, "$$properties", {
        value: properties || {},
        writable: qx.Class.$$options.propsAccessible || false,
        configurable: qx.Class.$$options.propsAccessible || false,
        enumerable: qx.Class.$$options.propsAccessible || false
      });

      // Save the super properties for this class
      Object.defineProperty(subclass, "$$superProperties", {
        value: allProperties,
        writable: qx.Class.$$options.propsAccessible || false,
        configurable: qx.Class.$$options.propsAccessible || false,
        enumerable: qx.Class.$$options.propsAccessible || false
      });

      // Save the full chain of properties for this class
      allProperties = Object.assign({}, allProperties, properties || {});
      Object.defineProperty(subclass, "$$allProperties", {
        value: allProperties,
        writable: qx.Class.$$options.propsAccessible || false,
        configurable: qx.Class.$$options.propsAccessible || false,
        enumerable: qx.Class.$$options.propsAccessible || false
      });

      // Save any init functions that need to be called upon instantiation
      Object.defineProperty(subclass, "$$initFunctions", {
        value: initFunctions,
        writable: qx.Class.$$options.propsAccessible || false,
        configurable: qx.Class.$$options.propsAccessible || false,
        enumerable: qx.Class.$$options.propsAccessible || false
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
                let value;
                let property = subclass.$$allProperties[prop];
                const storage =
                  property && property.storage
                    ? property.storage
                    : config.delegate
                    ? config.delegate
                    : qx.core.propertystorage.Default; // for member var getter

                value = storage.get.call(obj, prop);

                // If it's a property and the value is undefined,
                // there are some property characteristics that
                // can give it a known replacement value.
                if (property && value === undefined) {
                  if (property.nullable || property.inheritable) {
                    value = null;
                  } else if (property.check == "Boolean") {
                    value = false;
                  }
                }

                return value;
              },

              set(obj, prop, value) {
                let origValue = value;
                let old = Reflect.get(obj, prop);
                let oldForCallback;
                let property = subclass.$$allProperties[prop];
                const storage =
                  property && property.storage
                    ? property.storage
                    : config.delegate
                    ? config.delegate
                    : qx.core.propertystorage.Default; // for member var setter

                // Require that members be declared in the "members"
                // section of the configuration passed to qx.Class.define
                if (qx.core.Environment.get("qx.debug")) {
                  if (
                    !property &&
                    qx.Class.$$options["Warn member not declared"] &&
                    qx.Bootstrap.isQxCoreObject(obj) &&
                    !(prop in obj)
                  ) {
                    if (isNaN(prop) && !prop.startsWith("$$")) {
                      let undeclared = qx.Bootstrap.$$undeclared;

                      if (!undeclared[obj.constructor.classname]) {
                        undeclared[obj.constructor.classname] = {};
                      }

                      if (!undeclared[obj.constructor.classname][prop]) {
                        console.error(
                          "Warning: member not declared: " +
                            `${obj.constructor.classname}: ${prop}`
                        );

                        undeclared[obj.constructor.classname][prop] = true;
                      }
                    }
                  }
                }

                // If this is not a property being set, or is a
                // storage call, just immediately set value
                if (!property || proxy[`$$variant_${prop}`] == "immediate") {
                  storage.set.call(obj, prop, value);
                  return true;
                }

                //
                // Anything from here on, is a property
                //

                if (proxy[`$$variant_${prop}`] == "init") {
                  proxy[`$$variant_${prop}`] = "init->set";
                }

                proxy[`$$user_${prop}`] = value;

                // Calculate the `old` value to pass to the
                // `apply` method and for change events
                oldForCallback = old === undefined ? null : old;
                if (proxy[`$$variant_${prop}`] == "init") {
                  oldForCallback = null;
                }

                // Ensure they're not writing to a read-only property
                if (property.immutable == "readonly") {
                  throw new Error(
                    `${className}: ` +
                      `attempt to set value of readonly property ${prop}`
                  );
                }

                // We can handle a group property by simply
                // calling its setter
                if (property.group) {
                  let propertyFirstUp = qx.Bootstrap.firstUp(prop);

                  obj[`set${propertyFirstUp}`].call(proxy, value);
                  return true;
                }

                // Ensure they're not setting null to a
                // non-nullable, non-inheritable property
                if (
                  !property.nullable &&
                  !property.inheritable &&
                  value === null
                ) {
                  throw new Error(
                    `${className}: ` +
                      `attempt to set non-nullable, non-inheritable ` +
                      `property ${prop} to null`
                  );
                }

                // Does it have a transform method?
                if (property.transform) {
                  // It does. Call it. It returns the new value.
                  if (typeof property.transform == "function") {
                    value = property.transform.call(proxy, value, old);
                  } else {
                    // It's a string (function name) rather than a function reference
                    value = obj[property.transform].call(proxy, value, old);
                  }
                }

                // Does it have a check to be done? If the variant
                // is "reset" we allow the `init` value to be
                // reassigned without checking it.
                if (property.check && obj[`$$variant_${prop}`] != "reset") {
                  _this._check(obj, proxy, property, prop, value);
                }

                // Does it have a validation function?
                if (property.validate) {
                  // It does. Call it. It throws an error on
                  // validation failure
                  if (typeof property.validate == "function") {
                    property.validate.call(proxy, value);
                  } else {
                    // It's a string (function name) rather than a function reference
                    obj[property.validate].call(proxy, value);
                  }
                }

                // Save the (possibly updated) value
                storage.set.call(obj, prop, value);

                // If the value being set is a promise, and the
                // property does not have a `check:"Promise"`
                // constraint, then store the resolved result
                // when it is available.
                if (
                  property.check != "Promise" &&
                  qx.lang.Type.isPromise(value)
                ) {
                  value.then(resolvedValue => {
                    storage.set.call(obj, prop, resolvedValue);
                  });
                }

                // If we're called in state variant "init" or
                // "init->set", it means this is the first call
                // where the _apply method may be called or the
                // event generated. Tradition (BC) dictates that
                // that first time, the _apply method is always
                // called even if the new value matches the old
                // (init) value. Similarly, the event always is
                // generated that first time.
                //
                // Keep track of that variant, but reset the
                // $$variant variable to its new state
                let variant = null;
                if (["init", "init->set"].includes(obj[`$$variant_${prop}`])) {
                  variant = obj[`$$variant_${prop}`];
                  proxy[`$$variant_${prop}`] = variant == "init" ? null : "set";
                }

                // Call the `apply` method and fire the change
                // event, if necessary.
                qx.Class.__applyAndFireEvent(
                  proxy,
                  property,
                  prop,
                  value,
                  oldForCallback,
                  variant,
                  origValue
                );

                // Update inherited values of child objects
                if (property.inheritable && obj._getChildren) {
                  let children = obj._getChildren();

                  // For each child..
                  children.forEach(child => {
                    // Does this child have a property of the
                    // given name, and is it inheritable?
                    let property = child.constructor.$$allProperties[prop];

                    if (
                      child[`$$user_${prop}`] === undefined &&
                      property &&
                      property.inheritable
                    ) {
                      // Yup. Save the new value
                      child[`$$inherit_${prop}`] = value;
                      child[prop] = value;

                      // The setter code (incorrectly, in this
                      // case) saved the value as the $$user
                      // value. Reset it to its original
                      // value.
                      child[`$$user_${prop}`] = undefined;
                    }
                  });
                }

                proxy[`$$variant_${prop}`] = "set";
                return true;
              },

              deleteProperty(obj, prop) {
                if (config.delegate && config.delegate.delete) {
                  return config.delegate.delete.call(obj, prop);
                }
                return Reflect.deleteProperty(obj, prop);
              },

              getPrototypeOf(obj) {
                return Reflect.getPrototypeOf(obj);
              },

              defineProperty(obj, key, descriptor) {
                return Reflect.defineProperty(obj, key, descriptor);
              }
            };

            // Create the instance proxy which manages properties, etc.
            proxy = new Proxy(obj, handler);

            // Call any initFunctions defined for properties of this class
            target.$$initFunctions.forEach(prop => {
              let propertyFirstUp = qx.Bootstrap.firstUp(prop);

              // Initialize this property
              obj[`init${propertyFirstUp}`]();
              proxy[`$$variant_${prop}`] = "init";
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

    _check(obj, proxy, property, prop, value) {
      let $$checks = new Map([
        ["Boolean", v => qx.lang.Type.isBoolean(v)],

        ["String", v => qx.lang.Type.isString(v)],

        ["Number", v => qx.lang.Type.isNumber(v) && isFinite(v)],

        [
          "Integer",
          v => qx.lang.Type.isNumber(v) && isFinite(v) && v % 1 === 0
        ],

        [
          "PositiveNumber",
          v => qx.lang.Type.isNumber(v) && isFinite(v) && v >= 0
        ],

        [
          "PositiveInteger",
          v => qx.lang.Type.isNumber(v) && isFinite(v) && v % 1 === 0 && v >= 0
        ],

        ["Error", v => v instanceof Error],

        ["RegExp", v => v instanceof RegExp],

        [
          "Object",
          v => v !== null && (qx.lang.Type.isObject(v) || typeof v === "object")
        ],

        ["Array", v => qx.lang.Type.isArray(v)],

        ["Map", v => qx.lang.Type.isObject(v)],

        ["Function", v => qx.lang.Type.isFunction(v)],

        ["Date", v => v instanceof Date],

        ["Node", v => v !== null && v.nodeType !== undefined],

        ["Element", v => v !== null && v.nodeType === 1 && v.attributes],

        ["Document", v => v !== null && v.nodeType === 9 && v.documentElement],

        ["Window", v => v !== null && v.document],

        ["Event", v => v !== null && v.type !== undefined],

        ["Class", v => v !== null && v.$$type === "Class"],

        ["Mixin", v => v !== null && v.$$type === "Mixin"],

        ["Interace", v => v !== null && v.$$type === "Interface"],

        ["Promise", v => qx.lang.Type.isPromise(v)],

        ["Theme", v => v !== null && v.$$type === "Theme"],

        [
          "Color",
          v =>
            qx.lang.Type.isString(v) &&
            qx.util.ColorUtil.isValidPropertyValue(v)
        ],

        [
          "Decorator",
          v => {
            let themeManager = qx.theme.manager.Decoration.getInstance();
            return v !== null && themeManager.isValidPropertyValue(v);
          }
        ],

        [
          "Font",
          v => {
            let fontManager = qx.theme.manager.Font.getInstance();
            return v !== null && fontManager.isDynamic(v);
          }
        ]
      ]);

      // If the property is nullable and the value is null...
      if (property.nullable && value === null) {
        // ... then we don't do the check
      } else if (property.inheritable && value == "inherit") {
        // Request to explicitly inherit from
        // parent. Ignore check.
      } else if ($$checks.has(property.check)) {
        if (!$$checks.get(property.check)(value)) {
          throw new Error(
            `${prop}: ` +
              `Expected value to be of type ${property.check}; ` +
              `value=${value}`
          );
        }
      } else if (typeof property.check == "function") {
        if (!property.check.call(proxy, value)) {
          throw new Error(
            `${prop}: ` +
              `Check function indicates wrong type value; ` +
              `value=${value}`
          );
        }
      } else if (Array.isArray(property.check)) {
        if (value instanceof String) {
          value = value.valueOf();
        }

        qx.core.Assert.assertInArray(
          value,
          property.check,
          "Expected value to be one of: [" + property.check + "]"
        );
      } else if (typeof property.check == "string") {
        if (qx.Class.isDefined(property.check)) {
          qx.core.Assert.assertInstance(
            value,
            qx.Class.getByName(property.check),
            "Expected value to be an instance of " + property.check
          );
        } else if (qx.Interface && qx.Interface.isDefined(property.check)) {
          qx.core.Assert.assertInterface(
            value,
            qx.Interface.getByName(property.check),
            "Expected value to implement " + property.check
          );
        } else {
          if (qx.core.Environment.get("qx.Class.futureCheckJsDoc")) {
            // Next  try to parse the check string as JSDoc
            let bJSDocParsed = false;
            try {
              const { parse } = require("jsdoctypeparser");
              const ast = parse(property.check);

              // Temporarily, while we don't yet
              // support checks based on the jsdoc
              // AST, flag whether we successfully
              // parsed the type. If so, we'll stop
              // the check when the error is thrown
              // by _checkValueAgainstJSdocAST(); If
              // not, we want to fall through to
              // additional checks.
              bJSDocParsed = true;
              qx.Class._checkValueAgainstJSdocAST(
                prop,
                value,
                ast,
                property.check
              );
            } catch (e) {
              // If we successfully parsed, rethrow
              // the check error
              if (bJSDocParsed) {
                throw e;
              }

              // Couldn't parse JSDoc so the check string is
              // not a JSDoc one. Fall through to next
              // possible use of the check string.
              //
              // FALL THROUGH
            }
          }

          if (!BROKEN) {
            // Try executing the string as a function
            let code;
            let fCheck;

            try {
              code = `return (${property.check});`;

              // This can cause "too much recursion"
              // errors, and there's no aparent
              // means to debug it. This is a kludgy
              // and inefficient feature anyway.
              fCheck = new Function("value", code);
            } catch (e) {
              throw new Error(
                `${prop}: ` +
                  "Error creating check function: " +
                  `${property.check}: ` +
                  e
              );
            }

            try {
              if (!fCheck.call(proxy, value)) {
                throw new Error(
                  `${prop}: ` +
                    `Check code indicates wrong type value; ` +
                    `value=${value}`
                );
              }
            } catch (e) {
              throw new Error(`${prop}: ` + `Check code threw error: ${e}`);
            }
          } else {
            throw new Error(
              `${prop}: pseudo function as string ` +
                `is no longer supported for property check: ` +
                `${property.check}`
            );
          }
        }
      } else {
        throw new Error(`${prop}: Unrecognized check type: ${property.check}`);
      }
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
    addMembers(clazz, members, patch) {
      for (let key in members) {
        let member = members[key];
        let proto = clazz.prototype;

        if (qx.core.Environment.get("qx.debug")) {
          if (key.charAt(0) === "@") {
            var annoKey = key.substring(1);
            if (
              members[annoKey] === undefined &&
              proto[annoKey] === undefined
            ) {
              throw new Error(
                `Annotation for ${annoKey} of Class ${clazz.classname} ` +
                  "does not exist"
              );
            }

            if (key.charAt(1) === "_" && key.charAt(2) === "_") {
              throw new Error(
                `Cannot annotate private member ${key.substring(1)} ` +
                  `of Class ${clazz.classname}`
              );
            }
          } else {
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

            if (
              patch !== true &&
              (proto.hasOwnProperty(key) ||
                (key in proto &&
                  key in clazz.$$allProperties &&
                  !qx.Class.objectProperties.has(key)))
            ) {
              throw new Error(
                `Overwriting member or property "${key}" ` +
                  `of Class "${clazz.classname}" ` +
                  "is not allowed. " +
                  "(Members and properties are in the same namespace.)"
              );
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
          qx.Bootstrap.setDisplayName(
            member,
            clazz.classname,
            `prototype.${key}`
          );

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
      const _this = this;
      let groupProperties = {};

      // Factories for property methods
      let propertyMethodFactory = {
        get(prop, property) {
          let propertyFirstUp = qx.Bootstrap.firstUp(prop);
          let f = function () {
            // *** CAUTION FOR DEVELOPERS!!! ***
            // Do not put any code other than `return
            // this[prop]` into the `get` property method here.
            // This code is called only via `value = o.getX()`
            // and not via `value = o.x`. To ensure the
            // reliability of first-class properties, i.e., that
            // those two statements work identically, all code
            // for getting must be in the proxy `get` handler, not
            // here.
            // *** CAUTION FOR DEVELOPERS!!! ***

            return this[prop];
          };

          qx.Bootstrap.setDisplayName(
            f,
            clazz.classname,
            `prototype.get${propertyFirstUp}`
          );

          return f;
        },

        set(prop, property) {
          let propertyFirstUp = qx.Bootstrap.firstUp(prop);
          let syncSetResultProp = `$$syncSetResult${propertyFirstUp}`;
          let f = function (value) {
            // *** CAUTION FOR DEVELOPERS!!! ***
            // Do not put any code other than `this[prop] =
            // value` into the `set` property method here. This
            // code is called only via `o.setX(value)` and not
            // via `o.x = value`. To ensure the reliability of
            // first-class properties, i.e., that those two
            // statements work identically, all code for setting
            // must be in the proxy `set` handler, not here.
            // *** CAUTION FOR DEVELOPERS!!! ***

            // Debugging hint: this will trap into setter code.
            this[prop] = value;

            // The only actual difference between
            // `o.setX(value)` and `o.x = value` is that in the
            // former case, the setter returns the (possible)
            // promise resulting from the `apply` method or
            // change event handler returning a promise. In the
            // `o.x = value` case, that potential promise can be
            // retrieved by calling `o.getLastSyncSetResult()`
            return this[syncSetResultProp];
          };

          qx.Bootstrap.setDisplayName(
            f,
            clazz.classname,
            `prototype.set${propertyFirstUp}`
          );

          return f;
        },

        reset(prop, property) {
          let propertyFirstUp = qx.Bootstrap.firstUp(prop);
          let f = function () {
            let value;
            // Get the current inherited, theme, and init values
            let inheritValue = property.inheritable
              ? this[`$$inherit_${prop}`]
              : undefined;
            let themeValue = property.themeable
              ? this[`$$theme_${prop}`]
              : undefined;
            let initValue = this[`$$init_${prop}`];

            // Unset the user value
            this[`$$user_${prop}`] = undefined;
            this[`$$variant_${prop}`] = "reset"; // don't use `check`

            // Calculate the new value
            value =
              themeValue !== undefined
                ? themeValue
                : inheritValue !== undefined
                ? inheritValue
                : initValue;

            if (value === undefined) {
              if (property.nullable) {
                value = null;
              }

              if (property.check == "Boolean") {
                value = false;
              }
            }

            // Select the new value
            // Debugging hint: this will trap into setter code.
            this[prop] = value;

            this[`$$variant_${prop}`] = null;

            // The setter code (incorrectly, in this case) saved
            // the value as the $$user value. Reset it to the
            // value we gave it.
            this[`$$user_${prop}`] = undefined;
          };

          qx.Bootstrap.setDisplayName(
            f,
            clazz.classname,
            `prototype.reset${propertyFirstUp}`
          );

          return f;
        },

        refresh(prop, property) {
          let propertyFirstUp = qx.Bootstrap.firstUp(prop);
          let f = function () {
            let inheritedValue;
            let layoutParent;
            let userValue = this[`$$user_${prop}`];

            // If there's a user value, it takes precedence
            if (typeof userValue != "undefined") {
              // Use the user value as the property value
              // Debugging hint: this will trap into setter code.
              this[prop] = userValue;
              this[`$$variant_${prop}`] = null;
              return;
            }

            // If there's a layout parent and if it has a property (not
            // a member!) of this name, ...
            layoutParent =
              typeof this.getLayoutParent == "function"
                ? this.getLayoutParent()
                : undefined;
            if (
              layoutParent &&
              typeof layoutParent[prop] != "undefined" &&
              prop in layoutParent.constructor.$$allProperties
            ) {
              // ... then retrieve its value
              inheritedValue = layoutParent[prop];

              // If we found a value to inherit...
              if (typeof inheritedValue != "undefined") {
                // ... then save the inherited value, ...
                this[`$$inherit_${prop}`] = inheritedValue;

                // ... and also use the inherited value as the
                // property value
                // Debugging hint: this will trap into setter code.
                this[prop] = inheritedValue;

                // The setter code (incorrectly, in this case)
                // saved the value as the $$user value. Reset
                // it to its original value.
                this[`$$user_${prop}`] = userValue;
              }
            }
          };

          qx.Bootstrap.setDisplayName(
            f,
            clazz.classname,
            `prototype.refresh${propertyFirstUp}`
          );

          return f;
        },

        setThemed(prop, property) {
          let propertyFirstUp = qx.Bootstrap.firstUp(prop);
          let f = function (value) {
            // Get the current user-specified value
            let userValue = this[`$$user_${prop}`];

            // Save the provided themed value
            this[`$$theme_${prop}`] = value;

            // User value has precedence, so if it's not set,
            // use theme value
            if (userValue === undefined) {
              // Debugging hint: this will trap into setter code.
              this[prop] = value;

              this[`$$variant_${prop}`] = null;

              // The setter code (incorrectly, in this case)
              // saved the value as the $$user value. Reset
              // it to its original value.
              this[`$$user_${prop}`] = userValue;
            }

            return value;
          };

          qx.Bootstrap.setDisplayName(
            f,
            clazz.classname,
            `prototype.setThemed${propertyFirstUp}`
          );

          return f;
        },

        resetThemed(prop, property) {
          let propertyFirstUp = qx.Bootstrap.firstUp(prop);
          let f = function () {
            // Get the current user-specified value
            let value;
            let userValue = this[`$$user_${prop}`];
            let initValue = property.initFunction
              ? property.initFunction.call(this)
              : "init" in property
              ? property.init
              : property.nullable
              ? null
              : property.check == "Boolean"
              ? false
              : undefined;

            // Unset the themed value
            this[`$$theme_${prop}`] = undefined;

            // Select the new value
            value = userValue !== undefined ? userValue : initValue;

            // Debugging hint: this will trap into setter code.
            this[prop] = value;
            this[`$$variant_${prop}`] = null;

            // The setter code (possibly incorrectly, in this
            // case) saved the value as the $$user value. Reset
            // it to its original value.
            if (userValue === undefined) {
              this[`$$user_${prop}`] = userValue;
            }

            return value;
          };

          qx.Bootstrap.setDisplayName(
            f,
            clazz.classname,
            `prototype.resetThemed${propertyFirstUp}`
          );

          return f;
        },

        init(prop, property) {
          let propertyFirstUp = qx.Bootstrap.firstUp(prop);
          let f = function (value) {
            if (typeof value != "undefined") {
              property.storage.set.call(this, prop, value);
            } else if (property.initFunction) {
              value = property.initFunction.call(this, prop);
              property.storage.set.call(this, prop, value);
            } else if (typeof property.init != "undefined") {
              value = property.init;
              property.storage.set.call(this, prop, value);
            }

            if (value === undefined) {
              if (property.nullable) {
                value = null;
              }

              if (property.check == "Boolean") {
                value = false;
              }
            }

            this[`$$init_${prop}`] = value;
            this[`$$variant_${prop}`] = "init";

            // Call the `apply` method and fire the change
            // event, if necessary
            qx.Class.__applyAndFireEvent(
              this,
              property,
              prop,
              value,
              null,
              "init"
            );

            return value;
          };

          qx.Bootstrap.setDisplayName(
            f,
            clazz.classname,
            `prototype.init${propertyFirstUp}`
          );

          return f;
        },

        is(prop, property) {
          let propertyFirstUp = qx.Bootstrap.firstUp(prop);
          let f = function () {
            return !!this[prop];
          };

          qx.Bootstrap.setDisplayName(
            f,
            clazz.classname,
            `prototype.is${propertyFirstUp}`
          );

          return f;
        },

        toggle(prop, property) {
          let propertyFirstUp = qx.Bootstrap.firstUp(prop);
          let f = function () {
            // Debugging hint: this will trap into setter code.
            this[prop] = !this[prop];
          };

          qx.Bootstrap.setDisplayName(
            f,
            clazz.classname,
            `prototype.toggle${propertyFirstUp}`
          );

          return f;
        },

        getLastSyncSetResult(prop, property) {
          let propertyFirstUp = qx.Bootstrap.firstUp(prop);
          let syncSetResultProp = `$$syncSetResult${propertyFirstUp}`;
          let f = function () {
            return this[syncSetResultProp];
          };

          qx.Bootstrap.setDisplayName(
            f,
            clazz.classname,
            `prototype.getLastSyncSetResult${propertyFirstUp}`
          );

          return f;
        },

        isSyncSetActive(prop, property) {
          let propertyFirstUp = qx.Bootstrap.firstUp(prop);
          let syncSetInProgressProp = `$$syncSetInProgress${propertyFirstUp}`;
          let f = function () {
            // Do we already have a promise that will be completed?
            if (this[syncSetInProgressProp]?.onSyncSetComplete) {
              return this[syncSetInProgressProp].onSetCompletePromise;
            }

            // Is a set in progress? If so, then we need a
            // promise to be completed
            if (this[syncSetInProgressProp]?.refCount) {
              this[syncSetInProgressProp].onSetCompletePromise =
                new qx.Promise();
              return this[syncSetInProgressProp].onSetCompletePromise;
            }

            // Not being set
            return null;
          };

          qx.Bootstrap.setDisplayName(
            f,
            clazz.classname,
            `prototype.isSyncSetActive${propertyFirstUp}`
          );

          return f;
        },

        isAsyncSetActive(prop, property) {
          let propertyFirstUp = qx.Bootstrap.firstUp(prop);
          let f = function () {
            return this[`$$asyncSetPromise${propertyFirstUp}`] !== null;
          };

          qx.Bootstrap.setDisplayName(
            f,
            clazz.classname,
            `prototype.isAsyncSetActive${propertyFirstUp}`
          );

          return f;
        },

        getAsync(prop, property, get) {
          let propertyFirstUp = qx.Bootstrap.firstUp(prop);
          let f = async function () {
            let value = get.call(this);

            if (value === undefined) {
              if (property.nullable) {
                value = null;
              }

              if (property.check == "Boolean") {
                value = false;
              }
            }

            return value;
          };

          qx.Bootstrap.setDisplayName(
            f,
            clazz.classname,
            `prototype.getAsync${propertyFirstUp}`
          );

          return f;
        },

        setAsync(prop, property, apply) {
          let propertyFirstUp = qx.Bootstrap.firstUp(prop);
          let f = async function (value) {
            let asyncSetPromise;
            let propertyFirstUp = qx.Bootstrap.firstUp(prop);
            let asyncSetPromiseProp = `$$asyncSetPromise${propertyFirstUp}`;

            const setImpl = async function () {
              let old;
              let oldForCallback;
              let variant = this[`$$variant_${prop}`];

              // Save the new property value. This is before any async calls
              if (property.immutable == "readonly") {
                throw new Error(
                  `Attempt to set value of readonly property ${prop}`
                );
              }

              // Obtain the old value, via its async request
              old = await this[`get${propertyFirstUp}Async`]();

              // If the set value is a promise, be sure it's
              // resolved before `apply` is called, unless a
              // promise is the specified type fot this property
              if (property.check != "Promise") {
                value = await value;
              }

              // Cache the new value
              property.storage.set.call(this, prop, value);

              // Yup. Does it have a transform method?
              if (property.transform) {
                // It does. Call it. It returns the new value.
                if (typeof property.transform == "function") {
                  value = property.transform.call(this, value, old);
                }
                // otherwise it's a string
                else {
                  value = this[property.transform].call(this, value, old);
                }
              }

              // Does it have a check to be done? If the variant
              // is "reset" we allow the `init` value to be
              // reassigned without checking it.
              if (property.check && this[`$$variant_${prop}`] != "reset") {
                _this._check(this, this, property, prop, value);
              }

              // Do we need to call the async apply method?
              if (
                !property.isEqual.call(this, value, old) ||
                ["init", "init->set"].includes(variant)
              ) {
                // Yup. Prep for it.
                oldForCallback = old === undefined ? null : old;
                if (this[`$$variant_${prop}`] == "init") {
                  oldForCallback = null;
                }

                // Set the variant to its next value
                this[`$$variant_${prop}`] = variant == "init" ? null : "set";

                // Call the apply function
                await apply.call(this, value, oldForCallback, prop);

                // Now that apply has resolved, fire the change event
                let promiseData = qx.Promise.resolve(value);

                if (property.event) {
                  const Reg = qx.event.Registration;

                  // Yes. Generate a sync event if needed
                  if (Reg.hasListener(this, property.event)) {
                    await Reg.fireEvent(
                      this,
                      property.event,
                      qx.event.type.Data,
                      [value, oldForCallback]
                    );
                  }

                  // Also generate an async event, if needed
                  if (Reg.hasListener(this, property.event + "Async")) {
                    await Reg.fireEventAsync(
                      this,
                      property.event + "Async",
                      qx.event.type.Data,
                      [promiseData, oldForCallback]
                    );
                  }
                }

                // Update inherited values of child objects
                if (property.inheritable && this._getChildren) {
                  let children = this._getChildren();

                  // For each child..
                  children.forEach(child => {
                    // Does this child have a property of the
                    // given name, and is it inheritable?
                    let property = child.constructor.$$allProperties[prop];

                    if (
                      child[`$$user_${prop}`] === undefined &&
                      property &&
                      property.inheritable
                    ) {
                      // Yup. Save the new value
                      child[`$$inherit_${prop}`] = value;
                      child[prop] = value;

                      // The setter code ( incorrectly, in
                      // this case) saved the value as the
                      // $$user value. Reset it to its
                      // original value.
                      child[`$$user_${prop}`] = undefined;
                    }
                  });
                }
              }

              // If we are the last promise, dispose of the promise
              if (asyncSetPromise === this[asyncSetPromiseProp]) {
                this[asyncSetPromiseProp] = null;
              }

              // If the value is a promise...
              if (qx.lang.Type.isPromise(value)) {
                // ... then arrange to store the resolved value
                // when it's available
                value.then(resolvedValue => {
                  property.storage.set.call(this, prop, resolvedValue);
                });

                // Give 'em the promise
                return value;
              }

              // Objerwise, give 'em a promise for the new value
              return qx.Promise.resolve(value);
            }.bind(this);

            // If this property already has an active promise...
            if (this[asyncSetPromiseProp]) {
              // ... then add this request to the promise chain
              asyncSetPromise = this[asyncSetPromiseProp].then(setImpl);
            } else {
              // There are no pending requests. Begin this one right now.
              asyncSetPromise = setImpl();
            }

            this[asyncSetPromiseProp] = asyncSetPromise;
            return asyncSetPromise;
          };

          qx.Bootstrap.setDisplayName(
            f,
            clazz.classname,
            `prototype.setAsync${propertyFirstUp}`
          );

          return f;
        },

        groupSet(prop, property) {
          let propertyFirstUp = qx.Bootstrap.firstUp(prop);
          let f = function (...args) {
            // We can have received separate arguments, or a single
            // array of arguments. Convert the former to the latter if
            // necessary. Make a copy, in any case, because we might
            // muck with the array.
            args = args[0] instanceof Array ? args[0].concat() : args;

            for (let i = 0; i < property.group.length && args.length > 0; i++) {
              // Get the next value to set
              let value = args.shift();
              let prop = property.group[i];

              // Set the next property in the group
              this[`$$variant_${prop}`] = "set";
              this[prop] = value;

              // If we're in shorthand mode, we may reuse that
              // value. Put it back at the end of the argument
              // list.
              if (property.mode == "shorthand") {
                args.push(value);
              }
            }
          };

          qx.Bootstrap.setDisplayName(
            f,
            clazz.classname,
            `prototype.groupSet${propertyFirstUp}`
          );

          return f;
        },

        groupReset(prop, property) {
          let propertyFirstUp = qx.Bootstrap.firstUp(prop);
          let f = function () {
            for (let i = 0; i < property.group.length; i++) {
              let propertyFirstUp = qx.Bootstrap.firstUp(property.group[i]);

              // Reset the property
              this[`reset${propertyFirstUp}`]();
            }
          };

          qx.Bootstrap.setDisplayName(
            f,
            clazz.classname,
            `prototype.groupReset${propertyFirstUp}`
          );

          return f;
        },

        groupSetThemed(prop, property) {
          let propertyFirstUp = qx.Bootstrap.firstUp(prop);
          let f = function (args) {
            // We can have received separate arguments, or a single
            // array of arguments. Convert the former to the latter if
            // necessary. Make a copy, in any case, because we might
            // muck with the array.
            args =
              args instanceof Array
                ? args.concat()
                : Array.prototype.concat.call(args);

            for (let i = 0; i < property.group.length && args.length > 0; i++) {
              // Get the next value to set
              let value = args.shift();
              let propertyFirstUp = qx.Bootstrap.firstUp(property.group[i]);

              // Set the next property in the group
              this[`setThemed${propertyFirstUp}`](value);

              // If we're in shorthand mode, we may reuse that
              // value. Put it back at the end of the argument
              // list.
              args.push(value);
            }
          };

          qx.Bootstrap.setDisplayName(
            f,
            clazz.classname,
            `prototype.groupSetThemed${propertyFirstUp}`
          );

          return f;
        },

        groupResetThemed(prop, property) {
          let propertyFirstUp = qx.Bootstrap.firstUp(prop);
          let f = function () {
            for (let i = 0; i < property.group.length; i++) {
              let propertyFirstUp = qx.Bootstrap.firstUp(property.group[i]);

              // Reset the property
              this[`resetThemed${propertyFirstUp}`]();
            }
          };

          qx.Bootstrap.setDisplayName(
            f,
            clazz.classname,
            `prototype.groupResetThemed${propertyFirstUp}`
          );

          return f;
        }
      };

      // Default comparison for whether to call apply method and
      // generate an event
      let isEqual = (a, b) => a === b;

      for (let key in properties) {
        let get;
        let apply;
        let property = properties[key];
        let propertyFirstUp = qx.Bootstrap.firstUp(key);
        let storage;
        const proto = clazz.prototype;

        if (qx.core.Environment.get("qx.debug")) {
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

          if (
            patch !== true &&
            (proto.hasOwnProperty(key) ||
              qx.Class.objectProperties.has(key) ||
              (key in proto && !(key in clazz.$$superProperties)))
          ) {
            throw new Error(
              `Overwriting member or property "${key}" ` +
                `of Class "${clazz.classname}" ` +
                "is not allowed. " +
                "(Members and properties are in the same namespace.)"
            );
          }
        }

        // Handle group properties last so we can ensure group member
        // properties exist before the group is created
        if (property.group) {
          groupProperties[key] = properties[key];
          continue;
        }

        // If there's no comparison function specified for this property...
        if (!property.isEqual) {
          // ... then create the default comparison function
          property.isEqual = isEqual;
        } else if (typeof property.isEqual == "string") {
          let origIsEqual = property.isEqual;
          property.isEqual = function (a, b) {
            // First see if isEqual names a member function
            if (typeof this[origIsEqual] == "function") {
              return this[origIsEqual](a, b);
            }

            // Otherwise, assume the string is the contents of a function,
            // e.g., "Object.is(a, b)"
            let arbitrary = new Function("a", "b", `return ${origIsEqual}`);
            return arbitrary.call(this, a, b);
          };
        }

        // If there's no storage mechanism specified for this property...
        if (!property.storage) {
          // ... then select a storage mechanism for it
          if (property.immutable == "replace") {
            if (property.check == "Array") {
              property.storage = qx.core.propertystorage.ImmutableArray;
            } else if (property.check == "Object") {
              property.storage = qx.core.propertystorage.ImmutableObject;
            } else if (property.check == "qx.data.Array") {
              property.storage = qx.core.propertystorage.ImmutableDataArray;
            } else {
              throw new Error(
                `${key}: ` +
                  "only `check : 'Array'` and `check : 'Object'` " +
                  "properties may have `immutable : 'replace'`."
              );
            }
          } else {
            property.storage = qx.core.propertystorage.Default;
          }
        }

        if (qx.core.Environment.get("qx.debug")) {
          if (
            typeof property.storage.init != "function" ||
            typeof property.storage.get != "function" ||
            typeof property.storage.set != "function" ||
            typeof property.storage.dereference != "function"
          ) {
            throw new Error(
              `${key}: ` +
                "property storage does not implement the static methods of" +
                "qx.core.propertystorage.IStorage"
            );
          }
        }

        storage = property.storage;

        // Initialize the property
        storage.init(key, Object.assign({}, property), clazz);

        // We always generate an event unless `property.event` is
        // explicitly set to null. If the event name isn't specified, use
        // the default name.
        if (property.event !== null) {
          property.event = property.event || `change${propertyFirstUp}`;
        }

        // There are various values that may be used when
        // `resetProperty` is called:
        // - the init value
        // - the user-assigned value
        // - a theme's value (if the property is themeable)
        // - an inherited value (if the property is inheritable)
        //
        // Create the legacy names for these values, which are used at
        // various places in and around the qooxdoo framework code.

        // init (via config.init or config.initFunction())
        patch && delete clazz.prototype[`$$init_${key}`];
        Object.defineProperty(clazz.prototype, `$$init_${key}`, {
          value: property.init,
          writable: qx.Class.$$options.propsAccessible || true,
          configurable: qx.Class.$$options.propsAccessible || false,
          enumerable: qx.Class.$$options.propsAccessible || false
        });

        // user-specified
        patch && delete clazz.prototype[`$$user_${key}`];
        Object.defineProperty(clazz.prototype, `$$user_${key}`, {
          value: undefined,
          writable: qx.Class.$$options.propsAccessible || true,
          configurable: qx.Class.$$options.propsAccessible || false,
          enumerable: qx.Class.$$options.propsAccessible || false
        });

        // theme-specified
        if (property.themeable) {
          patch && delete clazz.prototype[`$$theme_${key}`];
          Object.defineProperty(clazz.prototype, `$$theme_${key}`, {
            value: undefined,
            writable: qx.Class.$$options.propsAccessible || true,
            configurable: qx.Class.$$options.propsAccessible || false,
            enumerable: qx.Class.$$options.propsAccessible || false
          });
        }

        // whether to call apply after setting init value
        Object.defineProperty(clazz.prototype, `$$variant_${key}`, {
          value:
            typeof property.init != "undefined" ||
            typeof property.initFunction == "function"
              ? "init"
              : null,
          writable: qx.Class.$$options.propsAccessible || true,
          configurable: qx.Class.$$options.propsAccessible || false,
          enumerable: qx.Class.$$options.propsAccessible || false
        });

        // inheritable
        if (property.inheritable) {
          patch && delete clazz.prototype[`$$inherit_${key}`];
          Object.defineProperty(clazz.prototype, `$$inherit_${key}`, {
            value: undefined,
            writable: qx.Class.$$options.propsAccessible || true,
            configurable: qx.Class.$$options.propsAccessible || false,
            enumerable: qx.Class.$$options.propsAccessible || false
          });
        }

        if (property.async) {
          // Obtain the optional get function
          if (typeof property.get == "function") {
            get = property.get;
          } else if (typeof property.get == "string") {
            get = clazz.prototype[property.get];
          } else {
            get = function () {
              return this[key];
            };
          }

          // Obtain the required apply function
          if (typeof property.apply == "function") {
            apply = property.apply;
          } else if (typeof property.apply == "string") {
            apply = clazz.prototype[property.apply];
          } else {
            apply = () => {};
          }
        }

        // Call the factories to generate each of the property functions
        // for the current property of the class
        let propertyDescriptor = {
          // The complete property definition
          definition: Object.assign({}, property),

          // Property methods
          get: propertyMethodFactory.get(key, property),
          set: propertyMethodFactory.set(key, property),
          reset: propertyMethodFactory.reset(key, property),
          isSyncSetActive: propertyMethodFactory.isSyncSetActive(key, property),
          getLastSyncSetResult: propertyMethodFactory.getLastSyncSetResult(
            key,
            property
          )
        };

        if (property.inheritable) {
          Object.assign(propertyDescriptor, {
            refresh: propertyMethodFactory.refresh(key, property)
          });
        }

        if (property.themeable) {
          Object.assign(propertyDescriptor, {
            setThemed: propertyMethodFactory.setThemed(key, property),
            resetThemed: propertyMethodFactory.resetThemed(key, property)
          });
        }

        if (
          typeof property.init != "undefined" ||
          typeof property.initFunction == "function" ||
          typeof property.apply != "undefined" ||
          typeof property.check == "Boolean" ||
          property.deferredInit ||
          property.inheritable
        ) {
          Object.assign(propertyDescriptor, {
            init: propertyMethodFactory.init(key, property)
          });
        }

        if (property.check == "Boolean") {
          Object.assign(propertyDescriptor, {
            is: propertyMethodFactory.is(key, property),
            toggle: propertyMethodFactory.toggle(key, property)
          });
        }

        if (property.async) {
          Object.assign(propertyDescriptor, {
            isAsyncSetActive: propertyMethodFactory.isAsyncSetActive(
              key,
              property
            ),

            getAsync: propertyMethodFactory.getAsync(key, property, get),
            setAsync: propertyMethodFactory.setAsync(key, property, apply)
          });
        }

        // Freeze the property descriptor so user doesn't muck it up
        Object.freeze(propertyDescriptor);

        // Store it in the registry
        if (clazz.$$propertyDescriptorRegistry) {
          clazz.$$propertyDescriptorRegistry.register(
            clazz.classname,
            key,
            propertyDescriptor
          );
        }

        // Create the legacy property getter, getPropertyName
        patch && delete clazz.prototype[`get${propertyFirstUp}`];
        if (!clazz.prototype.hasOwnProperty(`get${propertyFirstUp}`)) {
          Object.defineProperty(clazz.prototype, `get${propertyFirstUp}`, {
            value: propertyDescriptor.get,
            writable: qx.Class.$$options.propsAccessible || false,
            configurable: qx.Class.$$options.propsAccessible || true,
            enumerable: qx.Class.$$options.propsAccessible || false
          });
        }

        // Create the legacy property setter, setPropertyName.
        patch && delete clazz.prototype[`set${propertyFirstUp}`];
        if (!clazz.prototype.hasOwnProperty(`set${propertyFirstUp}`)) {
          Object.defineProperty(clazz.prototype, `set${propertyFirstUp}`, {
            value: propertyDescriptor.set,
            writable: qx.Class.$$options.propsAccessible || false,
            configurable: qx.Class.$$options.propsAccessible || true,
            enumerable: qx.Class.$$options.propsAccessible || false
          });
        }

        // Create this property's resetProperty method
        patch && delete clazz.prototype[`reset${propertyFirstUp}`];
        if (!clazz.prototype.hasOwnProperty(`reset${propertyFirstUp}`)) {
          Object.defineProperty(clazz.prototype, `reset${propertyFirstUp}`, {
            value: propertyDescriptor.reset,
            writable: qx.Class.$$options.propsAccessible || false,
            configurable: qx.Class.$$options.propsAccessible || true,
            enumerable: qx.Class.$$options.propsAccessible || false
          });
        }

        if (property.inheritable) {
          // Create this property's refreshProperty method
          patch && delete clazz.prototype[`refresh${propertyFirstUp}`];
          if (!clazz.prototype.hasOwnProperty(`refresh${propertyFirstUp}`)) {
            Object.defineProperty(
              clazz.prototype,
              `refresh${propertyFirstUp}`,
              {
                value: propertyDescriptor.refresh,
                writable: qx.Class.$$options.propsAccessible || false,
                configurable: qx.Class.$$options.propsAccessible || true,
                enumerable: qx.Class.$$options.propsAccessible || false
              }
            );
          }
        }

        if (property.themeable) {
          // Create this property's setThemedProperty method
          patch && delete clazz.prototype[`setThemed${propertyFirstUp}`];
          if (!clazz.prototype.hasOwnProperty(`setThemed${propertyFirstUp}`)) {
            Object.defineProperty(
              clazz.prototype,
              `setThemed${propertyFirstUp}`,
              {
                value: propertyDescriptor.setThemed,
                writable: qx.Class.$$options.propsAccessible || false,
                configurable: qx.Class.$$options.propsAccessible || true,
                enumerable: qx.Class.$$options.propsAccessible || false
              }
            );
          }

          // Create this property's resetThemedProperty method
          patch && delete clazz.prototype[`resetThemed${propertyFirstUp}`];
          if (
            !clazz.prototype.hasOwnProperty(`resetThemed${propertyFirstUp}`)
          ) {
            Object.defineProperty(
              clazz.prototype,
              `resetThemed${propertyFirstUp}`,
              {
                value: propertyDescriptor.resetThemed,
                writable: qx.Class.$$options.propsAccessible || false,
                configurable: qx.Class.$$options.propsAccessible || true,
                enumerable: qx.Class.$$options.propsAccessible || false
              }
            );
          }
        }

        // If there's an init or initFunction handler, ...
        if (
          typeof property.init != "undefined" ||
          typeof property.initFunction == "function" ||
          typeof property.apply != "undefined" ||
          typeof property.check == "Boolean" ||
          property.deferredInit ||
          property.inheritable
        ) {
          // ... then create initPropertyName
          patch && delete clazz.prototype[`init${propertyFirstUp}`];
          if (!clazz.prototype.hasOwnProperty(`init${propertyFirstUp}`)) {
            Object.defineProperty(clazz.prototype, `init${propertyFirstUp}`, {
              value: propertyDescriptor.init,
              writable: qx.Class.$$options.propsAccessible || false,
              configurable: qx.Class.$$options.propsAccessible || true,
              enumerable: qx.Class.$$options.propsAccessible || false
            });
          }
        }

        // If this is a boolean, as indicated by check : "Boolean" ...
        if (property.check == "Boolean") {
          // ... then create isPropertyName and togglePropertyName
          patch && delete clazz.prototype[`is${propertyFirstUp}`];
          if (!clazz.prototype.hasOwnProperty(`is${propertyFirstUp}`)) {
            Object.defineProperty(clazz.prototype, `is${propertyFirstUp}`, {
              value: propertyDescriptor.is,
              writable: qx.Class.$$options.propsAccessible || false,
              configurable: qx.Class.$$options.propsAccessible || true,
              enumerable: qx.Class.$$options.propsAccessible || false
            });
          }

          patch && delete clazz.prototype[`toggle${propertyFirstUp}`];
          if (!clazz.prototype.hasOwnProperty(`toggle${propertyFirstUp}`)) {
            Object.defineProperty(clazz.prototype, `toggle${propertyFirstUp}`, {
              value: propertyDescriptor.toggle,
              writable: qx.Class.$$options.propsAccessible || false,
              configurable: qx.Class.$$options.propsAccessible || true,
              enumerable: qx.Class.$$options.propsAccessible || false
            });
          }
        }

        // Create a place to store the "result" of the last trap
        // into the sync setter. This result is a promise if the
        // `apply` method or event listeners returned a promise; the
        // provided value otherwise.
        patch && delete clazz.prototype[`$$syncSetResult${propertyFirstUp}`];
        Object.defineProperty(
          clazz.prototype,
          `$$syncSetResult${propertyFirstUp}`,
          {
            value: null,
            writable: qx.Class.$$options.propsAccessible || true,
            configurable: qx.Class.$$options.propsAccessible || true,
            enumerable: qx.Class.$$options.propsAccessible || false
          }
        );

        // Create a place to store the current progress of the sync
        // setter, if the `apply` method returns a promise
        patch &&
          delete clazz.prototype[`$$syncSetInProgress${propertyFirstUp}`];
        Object.defineProperty(
          clazz.prototype,
          `$$syncSetInProgress${propertyFirstUp}`,
          {
            value: null,
            writable: qx.Class.$$options.propsAccessible || true,
            configurable: qx.Class.$$options.propsAccessible || true,
            enumerable: qx.Class.$$options.propsAccessible || false
          }
        );

        // Create a function that tells the user whether there is still
        // an active sync setter running
        patch && delete clazz.prototype[`isSyncSetActive${propertyFirstUp}`];
        if (
          !clazz.prototype.hasOwnProperty(`isSyncSetActive${propertyFirstUp}`)
        ) {
          Object.defineProperty(
            clazz.prototype,
            `isSyncSetActive${propertyFirstUp}`,
            {
              value: propertyDescriptor.isSyncSetActive,
              writable: qx.Class.$$options.propsAccessible || false,
              configurable: qx.Class.$$options.propsAccessible || true,
              enumerable: qx.Class.$$options.propsAccessible || false
            }
          );
        }

        if (property.async) {
          // Create a place to store the current promise for the async setter
          patch &&
            delete clazz.prototype[`$$asyncSetPromises${propertyFirstUp}`];
          Object.defineProperty(
            clazz.prototype,
            `$$asyncSetPromise${propertyFirstUp}`,
            {
              value: null,
              writable: qx.Class.$$options.propsAccessible || true,
              configurable: qx.Class.$$options.propsAccessible || true,
              enumerable: qx.Class.$$options.propsAccessible || false
            }
          );

          // Create a function that tells the user whether there is still
          // an active async setter running
          patch && delete clazz.prototype[`isAsyncSetActive${propertyFirstUp}`];
          if (
            !clazz.prototype.hasOwnProperty(
              `isAsyncSetActive${propertyFirstUp}`
            )
          ) {
            Object.defineProperty(
              clazz.prototype,
              `isAsyncSetActive${propertyFirstUp}`,
              {
                value: propertyDescriptor.isAsyncSetActive,
                writable: qx.Class.$$options.propsAccessible || false,
                configurable: qx.Class.$$options.propsAccessible || true,
                enumerable: qx.Class.$$options.propsAccessible || false
              }
            );
          }

          // Create the async property getter, getPropertyNameAsync
          patch && delete clazz.prototype[`get${propertyFirstUp}Async`];
          if (!clazz.prototype.hasOwnProperty(`get${propertyFirstUp}Async`)) {
            Object.defineProperty(
              clazz.prototype,
              `get${propertyFirstUp}Async`,
              {
                value: propertyDescriptor.getAsync,
                writable: qx.Class.$$options.propsAccessible || false,
                configurable: qx.Class.$$options.propsAccessible || true,
                enumerable: qx.Class.$$options.propsAccessible || false
              }
            );
          }

          // Create the async property setter, setPropertyNameAsync.
          patch && delete clazz.prototype[`set${propertyFirstUp}Async`];
          if (!clazz.prototype.hasOwnProperty(`set${propertyFirstUp}Async`)) {
            Object.defineProperty(
              clazz.prototype,
              `set${propertyFirstUp}Async`,
              {
                value: propertyDescriptor.setAsync,
                writable: qx.Class.$$options.propsAccessible || false,
                configurable: qx.Class.$$options.propsAccessible || true,
                enumerable: qx.Class.$$options.propsAccessible || false
              }
            );
          }

          // If this is an async property, add the async event name
          // for this property to the list of events fired by this
          // class
          let eventName = property.event + "Async";
          let events = {
            [eventName]: "qx.event.type.Data"
          };

          qx.Class.addEvents(clazz, events, true);
        }

        // Add the non-async event name for this property to the list
        // of events fired by this class
        let eventName = property.event;
        let events = {
          [eventName]: "qx.event.type.Data"
        };

        qx.Class.addEvents(clazz, events, true);

        // Add annotations
        qx.Class._attachAnno(clazz, "properties", key, property["@"]);

        // Add this property to the property maps
        clazz.$$properties[key] = properties[key];
        clazz.$$allProperties[key] = properties[key];
      }

      // Now handle the group properties we skipped while processing
      // properties
      for (let key in groupProperties) {
        let property = groupProperties[key];
        let propertyFirstUp = qx.Bootstrap.firstUp(key);
        let allProperties = clazz.$$allProperties;

        if (qx.core.Environment.get("qx.debug")) {
          // Validate that group contains only existing properties, and if
          // themeable contains only themeable properties
          for (let prop of property.group) {
            if (!(prop in allProperties)) {
              throw new Error(
                `Class ${clazz.classname}: ` +
                  `Property group '${key}': ` +
                  `property '${prop}' does not exist`
              );
            }

            if (allProperties[prop].group) {
              throw new Error(
                `Class ${clazz.classname}: ` +
                  `Property group '${key}': ` +
                  `can not add group '${prop}' to a group`
              );
            }

            if (property.themeable && !allProperties[prop].themeable) {
              throw new Error(
                `Class ${clazz.classname}: ` +
                  `Property group '${key}': ` +
                  `can not add themeable property '${prop}' to ` +
                  "non-themeable group"
              );
            }
          }
        }

        // Call the factories to generate each of the property functions
        // for the current property of the class
        let propertyDescriptor = {
          // The complete property definition
          definition: Object.assign({}, property),

          // Property methods
          set: propertyMethodFactory.groupSet(key, property),
          reset: propertyMethodFactory.groupReset(key, property)
        };

        if (property.themeable) {
          Object.assign(propertyDescriptor, {
            setThemed: propertyMethodFactory.groupSetThemed(key, property),
            resetThemed: propertyMethodFactory.groupResetThemed(key, property)
          });
        }

        // Freeze the property descriptor so user doesn't muck it up
        Object.freeze(propertyDescriptor);

        // Store it in the registry
        if (clazz.$$propertyDescriptorRegistry) {
          clazz.$$propertyDescriptorRegistry.register(
            clazz.classname,
            key,
            propertyDescriptor
          );
        }

        // Create the property setter, setPropertyName.
        patch && delete clazz.prototype[`set${propertyFirstUp}`];
        if (!clazz.prototype.hasOwnProperty(`set${propertyFirstUp}`)) {
          Object.defineProperty(clazz.prototype, `set${propertyFirstUp}`, {
            value: propertyDescriptor.set,
            writable: qx.Class.$$options.propsAccessible || false,
            configurable: qx.Class.$$options.propsAccessible || true,
            enumerable: qx.Class.$$options.propsAccessible || false
          });
        }

        // Create the property setter, setPropertyName.
        patch && delete clazz.prototype[`reset${propertyFirstUp}`];
        if (!clazz.prototype.hasOwnProperty(`reset${propertyFirstUp}`)) {
          Object.defineProperty(clazz.prototype, `reset${propertyFirstUp}`, {
            value: propertyDescriptor.reset,
            writable: qx.Class.$$options.propsAccessible || false,
            configurable: qx.Class.$$options.propsAccessible || true,
            enumerable: qx.Class.$$options.propsAccessible || false
          });
        }

        // If group is themeable, add the styler and unstyler
        if (property.themeable) {
          patch && delete clazz.prototype[`setThemed${propertyFirstUp}`];
          if (!clazz.prototype.hasOwnProperty(`setThemed${propertyFirstUp}`)) {
            Object.defineProperty(
              clazz.prototype,
              `setThemed${propertyFirstUp}`,
              {
                value: propertyDescriptor.setThemed,
                writable: qx.Class.$$options.propsAccessible || false,
                configurable: qx.Class.$$options.propsAccessible || true,
                enumerable: qx.Class.$$options.propsAccessible || false
              }
            );
          }

          patch && delete clazz.prototype[`resetThemed${propertyFirstUp}`];
          if (
            !clazz.prototype.hasOwnProperty(`resetThemed${propertyFirstUp}`)
          ) {
            Object.defineProperty(
              clazz.prototype,
              `resetThemed${propertyFirstUp}`,
              {
                value: propertyDescriptor.resetThemed,
                writable: qx.Class.$$options.propsAccessible || false,
                configurable: qx.Class.$$options.propsAccessible || true,
                enumerable: qx.Class.$$options.propsAccessible || false
              }
            );
          }
        }

        // Add this property to the property maps
        clazz.$$properties[key] = properties[key];
        clazz.$$allProperties[key] = properties[key];
      }
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
        if (
          typeof events !== "object" ||
          qx.Bootstrap.getClass(events) === "Array"
        ) {
          throw new Error(
            clazz.classname + ": the events must be defined as map!"
          );
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
            if (
              clazz.$$events[key] !== undefined &&
              clazz.$$events[key] !== events[key]
            ) {
              throw new Error(
                clazz.classname +
                  "/" +
                  key +
                  ": the event value/type cannot be changed from " +
                  clazz.$$events[key] +
                  " to " +
                  events[key]
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

        // Attach properties
        if (entry.$$properties) {
          qx.Class.addProperties(clazz, entry.$$properties, patch);
        }

        // Attach members
        if (entry.$$members) {
          qx.Class.addMembers(clazz, entry.$$members, patch);
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
          throw new Error(
            `Interface ${iface.name} is already used by ` +
              `Class ${clazz.classname}`
          );
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
          throw new Error(
            `The mixin to include into class ${clazz.classname} ` +
              "is undefined or null"
          );
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
          throw new Error(
            `The mixin to patch class ${clazz.classname} ` +
              "is undefined or null"
          );
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
     * Call the `apply` method and fire an event, if required. This
     * method is called by both `setX()` and by `initX()`
     *
     * @param proxy {Proxy}
     *   The object on which the property resides
     *
     * @param property {Object}
     *   The property configuration
     *
     * @param propName {String}
     *   The name of the property described by the configuration in
     *   `property`
     *
     * @param value {Any}
     *   The new property value
     *
     * @param old {Any}
     *   The current (old) property value
     *
     * @param variant {"init"|"init->set"|"set"|null}
     *   The internal variant at the time the property is being
     *   manipulated,which affects whether the `apply` method is called and
     *   the event fired.
     *
     * @param setterReturnValue {Any|undefined}
     *   When entered via the setter (vs resetter), this is the value that
     *   `setX()` should return. Undefined if not entered via the setter.
     */
    __applyAndFireEvent(
      proxy,
      property,
      propName,
      value,
      old,
      variant,
      setterReturnValue
    ) {
      let promise;
      let tracker = {};
      let propertyFirstUp = qx.Bootstrap.firstUp(propName);
      let syncSetResultProp = `$$syncSetResult${propertyFirstUp}`;
      let syncSetInProgressProp = `$$syncSetInProgress${propertyFirstUp}`;
      let isBindingTarget = `$$isBindingTarget_${propName}`;

      // If called by `setX()`, it will get the "return value" of
      // this handler by looking at the following property.
      // Initialize it, as we may return early from here if old and
      // new values are the same.
      proxy[syncSetResultProp] = setterReturnValue;

      // Ensure we're dealing with a synchronous property, and
      // either the old and new values differ, or we're in one of
      // the state variants where we need to call the `apply` method
      // and generate a change event even if old and new values are
      // the same. (Async properties' apply method is called
      // directly from `setPropertyNameAsync()`, not from here )
      //
      // We don't do this if the set is a result of a binding target, however
      if (!property.async && !proxy[isBindingTarget]) {
        if (
          property.isEqual.call(proxy, value, old) &&
          !["init", "init->set"].includes(variant)
        ) {
          return;
        }
      } else if (proxy[isBindingTarget]) {
        // Ensure we don't call apply or fire event other than the
        // first time, when binding. We know whether it's a
        // subsequent time because $$isBindingTarget_propName
        // exists, but is not true.
        proxy[isBindingTarget] = false;
      }

      // This is a synchronous setter. As an extension, though, we
      // allow the `apply` method and event handlers to return
      // promises. Change events are not fired until the `apply`
      // method's promise has resolved. Similarly, completion
      // (resolving of promises) of change event handlers is
      // awaited. The method `isSyncSetActive()` can be called to
      // ascertain if there are any promises yet unfulfilled for
      // this synchronous setter.
      if (!proxy[syncSetInProgressProp]) {
        proxy[syncSetInProgressProp] = {
          refCount: 1
        };
      } else {
        proxy[syncSetInProgressProp].refCount++;
      }

      // Is there an apply method?
      if (property.apply) {
        // Yes. Call it.
        if (typeof property.apply == "function") {
          promise = property.apply.call(proxy, value, old, propName);
        }
        // otherwise it's a string
        else {
          promise = proxy[property.apply].call(proxy, value, old, propName);
        }
      }

      if (promise) {
        qx.event.Utils.track(tracker, promise);
      }

      // Are we requested to generate an event?
      if (property.event) {
        const Reg = qx.event.Registration;

        // Yes. Generate a sync event if needed
        if (Reg.hasListener(proxy, property.event)) {
          qx.event.Utils.track(tracker, () => {
            if (property.check != "Promise" && qx.lang.Type.isPromise(value)) {
              value.then(resolvedValue => {
                value = resolvedValue;

                Reg.fireEvent(proxy, property.event, qx.event.type.Data, [
                  value,
                  old
                ]);
              });
            } else {
              Reg.fireEvent(proxy, property.event, qx.event.type.Data, [
                value,
                old
              ]);
            }

            return true;
          });
        }

        // Also generate an async event, if needed
        if (Reg.hasListener(proxy, property.event + "Async")) {
          qx.event.Utils.track(tracker, () => {
            if (property.check != "Promise" && qx.lang.Type.isPromise(value)) {
              value.then(resolvedValue => {
                value = resolvedValue;

                Reg.fireEvent(
                  proxy,
                  property.event + "Async",
                  qx.event.type.Data,
                  [qx.Promise.resolve(value), old]
                );
              });
            } else {
              Reg.fireEvent(
                proxy,
                property.event + "Async",
                qx.event.type.Data,
                [qx.Promise.resolve(value), old]
              );
            }

            Reg.fireEvent(proxy, property.event + "Async", qx.event.type.Data, [
              qx.Promise.resolve(value),
              old
            ]);

            return true;
          });
        }

        // When the last promise has resolved, ...
        qx.event.Utils.then(tracker, () => {
          // ... decrement the reference count. If there are no more...
          if (--proxy[syncSetInProgressProp].refCount === 0) {
            // ... obtain any promise created as a result of a
            // user awaiting completion
            let waiting = proxy[syncSetInProgressProp].onSyncSetComplete;

            // There is no longer a sync set in progress
            proxy[syncSetInProgressProp] = null;

            // If there was someone waiting on a promise...
            if (waiting) {
              // ... then resolve it now
              return waiting.resolve();
            }
          }

          return undefined;
        });
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
        if (
          config.type &&
          !(
            config.type === "static" ||
            config.type === "abstract" ||
            config.type === "singleton"
          )
        ) {
          throw new Error(
            'Invalid type "' +
              config.type +
              '" definition for class "' +
              name +
              '"!'
          );
        }

        // Validate non-static class on the "extend" key
        if (config.type && config.type !== "static" && !config.extend) {
          throw new Error(
            `${name}: invalid config. ` +
              "Non-static class must extend at least the `qx.core.Object` class"
          );
        }

        // Validate maps
        let maps = [
          "statics",
          "properties",
          "members",
          "environment",
          "settings",
          "variants",
          "events"
        ];

        for (let i = 0, l = maps.length; i < l; i++) {
          var key = maps[i];

          if (
            config[key] !== undefined &&
            (config[key] === null ||
              config[key].$$hash !== undefined ||
              !qx.Bootstrap.isObject(config[key]))
          ) {
            throw new Error(
              'Invalid key "' +
                key +
                '" in class "' +
                name +
                '". The value needs to be a map.'
            );
          }
        }

        // Validate include definition
        if (config.include) {
          if (qx.Bootstrap.getClass(config.include) === "Array") {
            for (let i = 0, a = config.include, l = a.length; i < l; i++) {
              if (a[i] == null || a[i].$$type !== "Mixin") {
                throw new Error(
                  'The include definition in class "' +
                    name +
                    '" contains an invalid mixin at position ' +
                    i +
                    ": " +
                    a[i]
                );
              }
            }
          } else {
            throw new Error(
              'Invalid include definition in class "' +
                name +
                '"! Only mixins and arrays of mixins are allowed!'
            );
          }

          if (config.type == "static") {
            config.include.forEach(mixin => {
              if (mixin.$$members) {
                throw new Error(
                  `Mixin ${mixin.name} applied to class ${name}: ` +
                    "class is static, but mixin has members"
                );
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
                  'The implement definition in class "' +
                    name +
                    '" contains an invalid interface at position ' +
                    i +
                    ": " +
                    a[i]
                );
              }
            }
          } else {
            throw new Error(
              'Invalid implement definition in class "' +
                name +
                '"! Only interfaces and arrays of interfaces are allowed!'
            );
          }
        }

        // Check mixin compatibility
        if (config.include) {
          try {
            qx.Mixin.checkCompatibility(config.include);
          } catch (ex) {
            throw new Error(
              'Error in include definition of class "' +
                name +
                '"! ' +
                ex.message
            );
          }
        }

        // Validate environment
        if (config.environment) {
          for (let key in config.environment) {
            if (
              key.substr(0, key.indexOf(".")) !=
              name.substr(0, name.indexOf("."))
            ) {
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
            if (
              key.substr(0, key.indexOf(".")) !=
              name.substr(0, name.indexOf("."))
            ) {
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
            if (
              key.substr(0, key.indexOf(".")) !=
              name.substr(0, name.indexOf("."))
            ) {
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
          if (
            config.properties !== undefined &&
            qx.Bootstrap.isQxCoreObject(config.properties)
          ) {
            throw new Error(
              `${className}: ` +
                "Can't use qx.core.Object descendent as property map"
            );
          }
        }

        for (let prop in properties) {
          let property = properties[prop];

          // Ensure they're not passing a qx.core.Object descendent as a property
          if (qx.core.Environment.get("qx.debug")) {
            if (qx.Bootstrap.isQxCoreObject(property)) {
              throw new Error(
                `${prop} in ${className}: ` +
                  "Can't use qx.core.Object descendent as property"
              );
            }
          }

          // Set allowed keys based on whether this is a grouped
          // property or not
          allowedKeys = property.group
            ? qx.Class._allowedPropGroupKeys
            : qx.Class._allowedPropKeys;

          // Ensure only allowed keys were provided
          Object.keys(property).forEach(key => {
            let allowed = allowedKeys[key];

            if (!(key in allowedKeys)) {
              throw new Error(
                `${className}: ` +
                  (property.group ? "group " : "") +
                  `property '${prop}' defined with unrecognized key '${key}'`
              );
            }

            // Flag any deprecated keys
            if (key in qx.Class.$$deprecatedPropKeys) {
              console.warn(
                `Property '${prop}': ` + `${qx.Class.$$deprecatedPropKeys[key]}`
              );
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

    _checkValueAgainstJSdocAST: qx.core.Environment.select("qx.debug", {
      true(prop, value, ast, check) {
        console.log(
          `JSDoc AST of ${check}:\n` + JSON.stringify(ast, null, "  ")
        );

        // TODO: implement this
        throw new Error(
          `${prop}: ` + `JSDoc type checking is not yet implemented`
        );
      },

      default(prop, value, ast, check) {
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
      let list = [];
      let unique;

      while (clazz) {
        if (clazz.$$properties) {
          list.push.apply(list, Object.keys(clazz.$$properties));
        }

        clazz = clazz.superclass;
      }

      // Since refined properties add a new entry to the prototype
      // chain, and we only want a list of unique properties returned,
      // convert the list to a Set and then back to an array, to get
      // only an array of the unique property names.
      unique = new Set(list);
      return [...unique];
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
      while (clazz) {
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
     * @signature function(clazz, name)
     * @param clazz {Class} class to check
     * @param name {String} name of the property to check for
     * @return {Boolean} whether the class includes the given property.
     */
    hasProperty: qx.util.OOUtil.hasProperty,

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
    }
  }
});
