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

// To be imlemented in the future
let FUTURE = false;

// The opposite
let BROKEN = false;


qx.Bootstrap.define(
  "qx.Class",
  {
    type : "static",

    statics :
    {
      /**
       * Options configured mostly by unit tests
       *
       * @internal
       */
      $$options :
      {
        /**
         * Whether to warn if a member variable is assigned without
         * being declared in the "members" section
         */
        "Warn member not declared" : true,

        /*
         * Allow all private properties, e.g., those beginning with $$, to be
         * enumerated, configured, and written to. Ideally, this is set to
         * `false`, so that those private properties don't get mucked with.
         * The unit tests, though, require that they be enumerable,
         * configurable and writable. Setting this to `false` breaks those
         * tests, and although we could set it to 'true' only for the tests,
         * we'd then be testing different behavior than what normal apps would
         * use. I think we'll just live with all properties being enumerable,
         * configurable, and writable for the time being.
         */
        "allAccessible" : true
      },

      /** Supported keys for property definitions */
      _allowedPropKeys :
        {
          "@": null,                          // Anything
          name: "string",                     // String
          dereference: "boolean",             // Boolean
          inheritable: "boolean",             // Boolean
          nullable: "boolean",                // Boolean
          themeable: "boolean",               // Boolean
          refine: "boolean",                  // Boolean
          init: null,                         // var
          apply: [ "string", "function" ],    // String, Function
          event: [ "string", "object" ],      // String or null
          check: null,                        // Array, String, Function
          transform: null,                    // String, Function
          async: "boolean",                   // Boolean
          deferredInit: "boolean",            // Boolean
          validate: [ "string", "function" ], // String, Function
          isEqual: [ "string", "function" ],  // String, Function

          // Not in original set of allowed keys:
          get: [ "string", "function" ],      // String, Function
          initFunction: "function",           // Function
          storage: "function",   // implements qx.core.propertystorage.IStorage
          immutable: "string"                 // String
        },

      /** Supported keys for property group definitions */
      _allowedPropGroupKeys :
        {
          "@": null,                  // Anything
          name: "string",             // String
          group: "object",            // Array
          mode: "string",             // String
          themeable: "boolean"        // Boolean
        },

      /** Deprecated keys for properties, that we want to warn about */
      $$deprecatedPropKeys :
        {
        },

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
       *         <th>proxyHandler</th>
       *         <td>Map</td>
       *         <td>
       *           Special use-case handling of setters/getters. See the
       *           developer documentation.
       *         </td>
       *       </tr>
       *     </table>
       *
       * @return {Class}
       *   The defined class
       */
      define : function(className, config)
      {
        let             clazz;
        let             proxy;
        let             handler;
        let             path;
        let             classnameComponents;
        let             implicitType = false;

        // Ensure the desginated class has not already been defined
        if (className && qx.Bootstrap.$$registry[className])
        {
          throw new Error(
            `${className} is already defined; cannot redefine a class`);
        }

        // Process environment
        let environment = config.environment || {};
        for (let key in environment)
        {
          qx["core"]["Environment"].add(key, environment[key]);
        }

        // Normalize include to array
        if (config.include && qx.Bootstrap.getClass(config.include) != "Array")
        {
          config.include = [ config.include ];
        }

        // Normalize implement to array
        if (config.implement &&
            qx.Bootstrap.getClass(config.implement) != "Array")
        {
          config.implement = [ config.implement ];
        }

        // Explicit null `extend` key means extend from Object. Otherwise,
        // falsy `extend` means it's a static class.
        if (config.extend === null)
        {
          config.extend = Object;
        }
        else if (! config.extend)
        {
          if (qx["core"]["Environment"].get("qx.debug"))
          {
            if (config.type && config.type != "static")
            {
              throw new Error(
                `${className}: ` +
                  `No 'extend' key, but 'type' is not 'static' ` +
                  `(found ${config.type})`);
            }
          }

          implicitType = true;
          config.type = "static";
        }

        if (qx["core"]["Environment"].get("qx.debug"))
        {
          Object.keys(config).forEach(
            (key) =>
            {
              let allowedKeys = (config.type == "static"
                                 ? qx.Bootstrap._allowedStaticKeys
                                 : qx.Bootstrap._allowedNonStaticKeys);

              // Ensure this key is allowed
              if (! (key in allowedKeys))
              {
                if (config.type == "static")
                {
                  throw new Error(
                    `${className}: ` +
                      `disallowed key in static class configuration: ${key}`);
                }
                else
                {
                  throw new Error(
                    `${className}: ` +
                      `unrecognized key in class configuration: ${key}`);
                }
              }

              // Ensure its value is of the correct type
              if (typeof config[key] != allowedKeys[key])
              {
                throw new Error(
                  `${className}: ` +
                    `typeof value for key ${key} must be ${allowedKeys[key]}; ` +
                    `found ${typeof config[key]}`);
              }
            });

          try
          {
            qx.Class._validateConfig(className, config);
          }
          catch (e)
          {
            if (implicitType)
            {
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
        ["@", "@construct", "@destruct"].forEach(
          (id) =>
          {
            qx.Class._attachAnno(clazz, id, null, config[id]);
          });

        // Add singleton getInstance()
        if (config.type === "singleton")
        {
          clazz.getInstance = qx.Bootstrap.getInstance;
        }

        clazz.classname = className;
        qx.Bootstrap.setDisplayName(clazz, className, "constructor");

        // Attach toString
        if (! clazz.hasOwnProperty("toString"))
        {
          clazz.toString = qx.Bootstrap.genericToString;
        }

        // Add statics
        for (let key in (config.statics || {}))
        {
          let             staticFuncOrVar;

          if (qx["core"]["Environment"].get("qx.debug"))
          {
            if (key.charAt(0) === "@")
            {
              if (config.statics[key.substring(1)] === undefined)
              {
                throw new Error(
                  'Annonation for static "' +
                    key.substring(1) +
                    '" of Class "' +
                    clazz.classname +
                    '" does not exist!');
              }

              if (key.charAt(1) === "_" && key.charAt(2) === "_")
              {
                throw new Error(
                  'Cannot annotate private static "' +
                    key.substring(1) +
                    '" of Class "' +
                    clazz.classname);
              }
            }
          }

          // Do not add annotations as class properties
          if (key.charAt(0) === "@")
          {
            continue;
          }

          staticFuncOrVar = config.statics[key];

          if (typeof staticFuncOrVar == "function")
          {
            if (qx["core"]["Environment"].get("qx.aspects"))
            {
              staticFuncOrVar =
                qx.core.Aspect.wrap(className, staticFuncOrVar, "static");
            }

            // Allow easily identifying this method
            qx.Bootstrap.setDisplayName(staticFuncOrVar, className, key);
          }

          // Add this static as a class property
          Object.defineProperty(
            clazz,
            key,
            {
              value        : staticFuncOrVar,
              writable     : qx.Class.$$options.allAccessible || true,
              configurable : qx.Class.$$options.allAccessible || true,
              enumerable   : qx.Class.$$options.allAccessible || true
            });

          // Attach annotations
          qx.Class._attachAnno(
            clazz, "statics", key, config.statics["@" + key]);
        }

        // Create a place to store the property descriptor registry
        // for this class
        Object.defineProperty(
          clazz,
          `$$propertyDescriptorRegistry`,
          {
            value        : (qx.core.PropertyDescriptorRegistry
                            ? new qx.core.PropertyDescriptorRegistry()
                            : undefined),
            writable     : qx.Class.$$options.allAccessible || true,
            configurable : qx.Class.$$options.allAccessible || false,
            enumerable   : qx.Class.$$options.allAccessible || false
          });

        // Create a method to retrieve a property descriptor
        Object.defineProperty(
          clazz.prototype,
          `getPropertyDescriptor`,
          {
            value        : function(prop)
            {
              return this.constructor.$$propertyDescriptorRegistry.get(
                this, prop);
            },
            writable     : qx.Class.$$options.allAccessible || false,
            configurable : qx.Class.$$options.allAccessible || false,
            enumerable   : qx.Class.$$options.allAccessible || false
          });

        // Create a function to ascertain whether a property has been
        // initialized in some way, e.g., via init(), initFunction(), or
        // set()
        Object.defineProperty(
          clazz.prototype,
          "isPropertyInitialized",
          {
            value        : function(prop)
            {
              let             allProperties = this.constructor.$$allProperties;

              return prop in allProperties && typeof this[prop] != "undefined";
            },
            writable     : qx.Class.$$options.allAccessible || false,
            configurable : qx.Class.$$options.allAccessible || false,
            enumerable   : qx.Class.$$options.allAccessible || false
          });

        // Add a method to refresh all inheritable properties
        Object.defineProperty(
          clazz.prototype,
          "$$refreshInheritables",
          {
            value        : function()
            {
              let             allProperties = this.constructor.$$allProperties;

              // Call the refresh method of each inheritable property
              for (let prop in allProperties)
              {
                let             property = allProperties[prop];

                if (property.inheritable)
                {
                  let           propertyFirstUp = qx.Bootstrap.firstUp(prop);

                  // Call this property's refresh method
                  this[`refresh${propertyFirstUp}`]();
                }
              }
            },
            writable     : qx.Class.$$options.allAccessible || false,
            configurable : qx.Class.$$options.allAccessible || false,
            enumerable   : qx.Class.$$options.allAccessible || false
          });

        // Members, properties, events, and mixins are only allowed for
        // non-static classes.
        if (config.extend)
        {
          // Add members
          if (config.members)
          {
            qx.Class.addMembers(clazz, config.members, false);
          }

          // Add properties
          if (config.properties)
          {
            qx.Class.addProperties(clazz, config.properties, false);
          }

          // Add events
          if (config.events)
          {
            qx.Class.addEvents(clazz, config.events, false);
          }

          // Include mixins
          // Must be here, after members and properties, to detect conflicts
          if (config.include)
          {
            config.include.forEach(mixin => this.addMixin(clazz, mixin, false));
          }
        }

        // Add interfaces
        // We ensure that `this.addInterface` exists, because the default
        // property storage implements an interface and during bootstrap
        // time, we want to ignore that.
        if (this.addInterface)
        {
          if (config.implement)
          {
            config.implement.forEach((iface) => this.addInterface(clazz, iface));
          }

          if (qx["core"]["Environment"].get("qx.debug"))
          {
            this.validateAbstractInterfaces(clazz);
          }
        }

        //
        // Store destruct onto class. We wrap their function (or an empty
        // function) in code that also handles any properties that
        // require `dereference : true`
        //
        let             destruct = config.destruct || function() {};

        if (qx["core"]["Environment"].get("qx.aspects"))
        {
          destruct = qx.core.Aspect.wrap(className, destruct, "destructor");
        }

        // Wrap the destructor in a function that calls the original
        // destructor and then deletes any property remnants for
        // properties that are marked as `dereference : true`.
        let destructDereferencer = function()
        {
          let             properties = this.constructor.$$allProperties;

          // First call the original or aspect-wrapped destruct method
          destruct.call(this);

          // Now ensure all properties marked with `derefrence : true`
          // have their saved values removed from this object.
          for (let prop in properties)
          {
            let           property = properties[prop];

            // If this property is specified to be dereference upon dispose,
            // or its check indicates that it's a type that requires being
            // dereferenced...
            if (property.dereference ||
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
                  "Event",
                ].includes(property.config))
            {
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
        qx.Bootstrap.setDisplayName(
          destructDereferencer, className, "destruct");

        // If there's a specified classname...
        if (className)
        {
          // Create that namespace
          qx.Bootstrap.createNamespace(className, clazz);

          // Store class reference in global class registry
          qx.Bootstrap.$$registry[className] = clazz;
        }

        // Now that the class has been defined, arrange to call its
        // (optional) defer function
        if (config.defer)
        {
          // Execute defer section
          qx.Bootstrap.addPendingDefer(
            clazz,
            () =>
            {
              config.defer(
                clazz,
                clazz.prototype,
                {
                  add(name, config)
                  {
                    qx.Class.addProperties(clazz, { [name] : config }, true);
                  }
                });
            });
        }

        return clazz;
      },

      _extend : function(className, config)
      {
        const           type = config.type || "class";
        const           superclass = config.extend || Object;
        const           properties = config.properties;
        const           customProxyHandler = config.proxyHandler;
        let             allProperties = superclass.$$allProperties || {};
        let             initFunctions = [];
        let             subclass;
        let             initialConstruct = config.construct;

        if (config.type != "static")
        {
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
          subclass = function(...args)
          {
            // At the time this function is called, config.construct, even
            // if undefined in the configuration, will have been set to a
            // trivial function. We therefore look at its initial value to
            // decide whether to call it, or the superclass constructor.
            if (initialConstruct)
            {
              initialConstruct.apply(this, args);
            }
            else
            {
              superclass.apply(this, args);
            }

            // Call any mixins' constructors and those mixins'
            // dependency mixins' constructors
            if (subclass.constructor.$$flatIncludes)
            {
              subclass.constructor.$$flatIncludes.forEach(
                (mixin) =>
                {
                  if (mixin.$$constructor)
                  {
                    mixin.$$constructor.apply(this, args);
                  }
                });
            }
          };
        }
        else
        {
          subclass = function()
          {
            throw new Error(
              `${className}: can not instantiate a static class`);
          };
        }

        // Ensure there are no properties defined that overwrite
        // superclasses' properties, unless "refine : true" is
        // specified. For now, we allow a property to be entirely
        // overwritten if refine: true is specified.
        for (let property in properties)
        {
          let             refined = false;

          if (property in allProperties && ! properties[property].refine)
          {
            throw new Error(
              `${className}: ` +
                `Overwriting property "${property}" without "refine: true"`);
          }

          // Allow only changing the init or initFunction values if
          // refine is true
          if (properties[property].refine)
          {
            let redefinitions =
                Object.keys(properties[property])
                .filter(
                  key =>
                    ! ["refine", "init", "initFunction", "@"].includes(key));
            if (redefinitions.length > 0)
            {
              throw new Error(
                `${className}: ` +
                  `Property "${property}" ` +
                  `redefined with other than "init", "initFunction", "@"`);
            }

            // Create a modified property definition using the prior
            // definition (if one exists) as the basis, and adding
            // properties provided in the redefinition (except for "refine")
            delete properties[property].refine;
            properties[property] =
              Object.assign(
                {}, allProperties[property] || {}, properties[property]);

            // We only get here if `refine : true` was in the configuration.
            // That doesn't say whether there was actually a superclass
            // property for it to refine. It's not an error to refine a
            // non-existing property. Keep track of whether we actually
            // refined a property.
            refined = property in allProperties;
          }

          // Ensure that this property isn't attempting to override a
          // method name from within this configuration. (Never acceptable)
          if ("members" in config && property in config.members)
          {
            throw new Error(
              `${className}: ` +
                `Overwriting member "${property}" ` +
                `with property "${property}"`);
          }

          // Ensure that this property isn't attempting to override a
          // member name from the superclass prototype chain that
          // isn't a refined property.
          if (superclass &&
              "property" in superclass &&
              property in superclass.prototype &&
              ! refined)
          {
            throw new Error(
              `${className}: ` +
                `Overwriting superclass member "${property}" ` +
                `with property "${property}"`);
          }

          // Does this property have an initFunction?
          if (properties[property].initFunction)
          {
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
        if (config.type)
        {
          subclass.$$classtype = config.type;
        }

        // Provide access to the superclass for base calls
        subclass.base = superclass;

        // Ensure there's something unique to compare constructors to.
        if (! config.construct)
        {
          config.construct = function() {};
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
        Object.defineProperty(
          subclass,
          "$$properties",
          {
            value        : properties || {},
            writable     : qx.Class.$$options.allAccessible || false,
            configurable : qx.Class.$$options.allAccessible || false,
            enumerable   : qx.Class.$$options.allAccessible || false
          });

        // Save the full chain of properties for this class
        allProperties = Object.assign({}, allProperties, properties || {});
        Object.defineProperty(
          subclass,
          "$$allProperties",
          {
            value        : allProperties,
            writable     : qx.Class.$$options.allAccessible || false,
            configurable : qx.Class.$$options.allAccessible || false,
            enumerable   : qx.Class.$$options.allAccessible || false
          });

        // Save any init functions that need to be called upon instantiation
        Object.defineProperty(
          subclass,
          "$$initFunctions",
          {
            value        : initFunctions,
            writable     : qx.Class.$$options.allAccessible || false,
            configurable : qx.Class.$$options.allAccessible || false,
            enumerable   : qx.Class.$$options.allAccessible || false
          });

        // Proxy the subclass so we can watch for property changes
        subclass.constructor = subclass.prototype.constructor = new Proxy(
          subclass,
          {
            construct : function(target, args)
            {
              let             proxy;
              let             handler;
              let             obj = Object.create(subclass.prototype);

              // add abstract and singleton checks
              if (type === "abstract")
              {
                if (target.classname === className)
                {
                  throw new Error(
                    "The class '," +
                      className +
                      "' is abstract! It is not possible to instantiate it."
                  );
                }
              }

              if (type === "singleton")
              {
                if (! target.$$allowconstruct)
                {
                  throw new Error(
                    "The class '" +
                      className +
                      "' is a singleton! It is not possible to instantiate it " +
                      "directly. Use the static getInstance() method instead."
                  );
                }
              }

              // Create the proxy handler
              handler =
                {
                  get : function(obj, prop)
                  {
                    let             property = subclass.$$allProperties[prop];
                    const           storage =
                      property && property.storage
                          ? property.storage
                          : qx.core.propertystorage.Default; // for member var getter

                    // If there's a custom proxy handler, try it
                    if (customProxyHandler && customProxyHandler.get)
                    {
                      let value = customProxyHandler.get(obj, prop);
                      if (typeof value != "undefined")
                      {
                        return value;
                      }
                    }

                    return storage.get.call(obj, prop);
                  },

                  set : function(obj, prop, value)
                  {
                    let             origValue = value;
                    let             old = Reflect.get(obj, prop);
                    let             oldForCallback;
                    let             property = subclass.$$allProperties[prop];
                    let             tracker = {};
                    const           storage =
                      property && property.storage
                          ? property.storage
                          : qx.core.propertystorage.Default; // for member var setter

                    oldForCallback = old === undefined ? null : old;
                    if (proxy[`$$variant_${prop}`] == "init")
                    {
                      oldForCallback = null;
                    }

                    // Is this a property?
                    if (property)
                    {
                      if (property.immutable == "readonly")
                      {
                        throw new Error(
                          `Attempt to set value of readonly property ${prop}`);
                      }

                      // We can handle a group property by simply
                      // calling its setter
                      if (property.group)
                      {
                        let       propertyFirstUp = qx.Bootstrap.firstUp(prop);

                        obj[`set${propertyFirstUp}`].call(proxy, value);
                        return undefined;
                      }

                      // Ensure they're not writing to a read-only property
                      if (property.immutable == "readonly")
                      {
                        throw new Error(
                          `Attempt to set value of readonly property ${prop}`);
                      }

                      // Ensure they're not setting null to a non-nullable property
                      if (! property.nullable && value === null)
                      {
                        throw new Error(
                          `${className}: ` +
                            `attempt to set non-nullable property ${prop} to null`);
                      }

                      // Yup. Does it have a transform method?
                      if (property.transform)
                      {
                        // It does. Call it. It returns the new value.
                        if (typeof property.transform == "function")
                        {
                          value = property.transform.call(proxy, value, old);
                        }
                        else // otherwise it's a string
                        {
                          value = obj[property.transform].call(proxy, value, old);
                        }
                      }

                      // Does it have a check to be done? If nullable and
                      // the value is null, we don't run the check
                      if (property.check)
                      {
                        let $$checks = new Map(
                          [
                            [
                              "Boolean",
                              v => qx.lang.Type.isBoolean(v)
                            ],
                            [
                              "String",
                              v => qx.lang.Type.isString(v)
                            ],
                            [
                              "Number",
                              v => qx.lang.Type.isNumber(v) && isFinite(v)
                            ],
                            [
                              "Integer",
                              v =>
                                qx.lang.Type.isNumber(v) &&
                                  isFinite(v) && v % 1 === 0
                            ],
                            [
                              "PositiveNumber",
                              v => qx.lang.Type.isNumber(v) && isFinite(v) && v >= 0
                            ],
                            [
                              "PositiveInteger",
                              v =>
                                qx.lang.Type.isNumber(v ) &&
                                  isFinite(v) && v % 1 === 0 && v >= 0
                            ],
                            [
                              "Error",
                              v => v instanceof Error
                            ],
                            [
                              "RegExp",
                              v => v instanceof RegExp
                            ],
                            [
                              "Object",
                              v =>
                                v !== null &&
                                  (qx.lang.Type.isObject(v) || typeof v === "object")
                            ],
                            [
                              "Array",
                              v => qx.lang.Type.isArray(v)
                            ],
                            [
                              "Map",
                              v => qx.lang.Type.isObject(v)
                            ],
                            [
                              "Function",
                              v => qx.lang.Type.isFunction(v)
                            ],
                            [
                              "Date",
                              v => v instanceof Date
                            ],
                            [
                              "Node",
                              v => v !== null && v.nodeType !== undefined
                            ],
                            [
                              "Element",
                              v => v !== null && v.nodeType === 1 && v.attributes
                            ],
                            [
                              "Document",
                              v =>
                                v !== null && v.nodeType === 9 && v.documentElement
                            ],
                            [
                              "Window",
                              v => v !== null && v.document
                            ],
                            [
                              "Event",
                              v => v !== null && v.type !== undefined
                            ],
                            [
                              "Class",
                              v => v !== null && v.$$type === "Class"
                            ],
                            [
                              "Mixin",
                              v => v !== null && v.$$type === "Mixin"
                            ],
                            [
                              "Interace",
                              v => v !== null && v.$$type === "Interface"
                            ],
                            [
                              "Theme",
                              v => v !== null && v.$$type === "Theme"
                            ],
                            [
                              "Color",
                              v => (qx.lang.Type.isString(v) &&
                                   qx.util.ColorUtil.isValidPropertyValue(v))
                            ],
                            [
                              "Decorator",
                              v =>
                              {
                                let themeManager =
                                    qx.theme.manager.Decoration.getInstance();
                                return (v !== null &&
                                        themeManager.isValidPropertyValue(v));
                              }
                            ],
                            [
                              "Font",
                              v =>
                              {
                                let fontManager =
                                    qx.theme.manager.Font.getInstance();
                                return v !== null && fontManager.isDynamic(v);
                              }
                            ]
                          ]);

                        // If the property is nullable and the value is null...
                        if (property.nullable && value === null)
                        {
                          // ... then we don't do the check
                        }
                        else if (property.inheritable && value == "inherit")
                        {
                          // Request to explicitly inherit from
                          // parent. Ignore check.
                        }
                        else if ($$checks.has(property.check))
                        {
                          if (! $$checks.get(property.check)(value))
                          {
                            throw new Error(
                              `${prop}: ` +
                                `Expected value to be of type ${property.check}; ` +
                                `value=${value}`);
                          }
                        }
                        else if (typeof property.check == "function")
                        {
                          if (! property.check.call(proxy, value))
                          {
                            throw new Error(
                              `${prop}: ` +
                                `Check function indicates wrong type value; ` +
                                `value=${value}`);
                          }
                        }
                        else if (Array.isArray(property.check))
                        {
                          if (value instanceof String)
                          {
                            value = value.valueOf();
                          }

                          qx.core.Assert.assertInArray(
                            value,
                            property.check,
                            "Expected value to be one of: [" +
                              property.check +
                              "]");
                        }
                        else if (typeof property.check == "string")
                        {
                          if (qx.Class.isDefined(property.check))
                          {
                            qx.core.Assert.assertInstance(
                              value,
                              qx.Class.getByName(property.check),
                              "Expected value to be an instance of " +
                                property.check);
                          }
                          else if (qx.Interface &&
                                   qx.Interface.isDefined(property.check))
                          {
                              qx.core.Assert.assertInterface(
                                value,
                                qx.Interface.getByName(property.check),
                                "Expected value to implement " +
                                  property.check);
                          }
                          else
                          {
                            if (FUTURE)
                            {
                              // Next  try to parse the check string as JSDoc
                              let             bJSDocParsed = false;
                              try
                              {
                                const   { parse } = require("jsdoctypeparser");
                                const   ast = parse(property.check);

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
                                  prop, value, ast, property.check);
                              }
                              catch(e)
                              {
                                // If we successfully parsed, rethrow
                                // the check error
                                if (bJSDocParsed)
                                {
                                  throw e;
                                }

                                // Couldn't parse JSDoc so the check string is
                                // not a JSDoc one. Fall through to next
                                // possible use of the check string.
                                //
                                // FALL THROUGH
                              }
                            }

                            if (! BROKEN)
                            {

                              // Try executing the string as a function
                              let             code;
                              let             fCheck;

                              try
                              {
                                code = `return (${property.check});`;

                                // This can cause "too much recursion"
                                // errors, and there's no aparent
                                // means to debug it. This is a kludgy
                                // and inefficient feature anyway.
                                fCheck = new Function("value", code);
                              }
                              catch(e)
                              {
                                throw new Error(
                                  `${prop}: ` +
                                    "Error creating check function: " +
                                    `${property.check}: ` + e);
                              }

                              try
                              {
                                if (! fCheck.call(proxy, value))
                                {
                                  throw new Error(
                                    `${prop}: ` +
                                    `Check code indicates wrong type value; ` +
                                    `value=${value}`);
                                }
                              }
                              catch(e)
                              {
                                throw new Error(
                                  `${prop}: ` +
                                    `Check code threw error: ${e}`);
                              }
                            }
                            else
                            {
                              throw new Error(
                                `${prop}: pseudo function as string ` +
                                  `is no longer supported: ${property.check}`);
                            }
                          }
                        }
                        else
                        {
                          throw new Error(
                            `${prop}: Unrecognized check type: ${property.check}`);
                        }
                      }

                      // Does it have a validation function?
                      if (property.validate)
                      {
                        // It does. Call it. It throws an error on
                        // validation failure
                        if (typeof property.validate == "function")
                        {
                          property.validate.call(proxy, value);
                        }
                        else // otherwise it's a string
                        {
                          obj[property.validate].call(proxy, value);
                        }
                      }

                      // Save the (possibly updated) value
                      storage.set.call(obj, prop, value);

                      // Is it a synchronous property with an apply
                      // method? (Async properties' apply method is
                      // called directly from setPropertyNameAsync() )
                      let variant = null;
                      if (property.apply &&
                          ! property.async &&
                          (! property.isEqual.call(proxy, value, oldForCallback) ||
                           ["init", "init->set"].includes(obj[`$$variant_${prop}`])))
                      {
                        variant = obj[`$$variant_${prop}`];
                        proxy[`$$variant_${prop}`] =
                          variant == "init" ? null : "set";

                        // Yes. Call it.
                        if (typeof property.apply == "function")
                        {
                          property.apply.call(proxy, value, oldForCallback, prop);
                        }
                        else // otherwise it's a string
                        {
                          obj[property.apply].call(proxy, value, oldForCallback, prop);
                        }
                      }

                      // Are we requested to generate an event?
                      if (property.event &&
                          ! property.async &&
                          (! property.isEqual.call(proxy, value, oldForCallback) ||
                           ["init", "init->set"].includes(variant)))
                      {
                        const Reg = qx.event.Registration;

                        // Yes. Generate a sync event if needed
                        if (Reg.hasListener(obj, property.event))
                        {
                          qx.event.Utils.track(
                            tracker,
                            Reg.fireEvent(
                              proxy,
                              property.event,
                              qx.event.type.Data,
                              [ value, oldForCallback ]));
                        }

                        // Also generate an async event, if needed
                        if (Reg.hasListener(obj, property.event + "Async"))
                        {
                          qx.event.Utils.track(
                            tracker,
                            Reg.fireEvent(
                              proxy,
                              property.event + "Async",
                              qx.event.type.Data,
                              [ qx.Promise.resolve(value), oldForCallback ]));
                        }
                      }

                      // Update inherited values of child objects
                      if (property.inheritable &&
                          obj.prototype &&
                          obj.prototype._getChildren)
                      {
                        let children = obj._getChildren();
                        if (children)
                        {
                          children.forEach(
                            (child) =>
                            {
                              let { refresh } =
                                  this.constructor.$$propertyDescriptorRegistry.get(
                                    child, prop);
                              refresh();
                            });
                        }
                      }

                      if (tracker.promise)
                      {
                        return tracker.promise.then(() => value);
                      }

                      return value;
                    }

                    // If there's a custom proxy handler, call it
                    if (customProxyHandler && customProxyHandler.set)
                    {
                      customProxyHandler.set.call(proxy, prop, value);
                      return true;
                    }

                    // Require that members be declared in the "members"
                    // section of the configuration passed to qx.Class.define
                    if (qx.Class.$$options["Warn member not declared"] &&
                        qx.Bootstrap.isQxCoreObject(obj) &&
                        ! (prop in obj))
                    {
                      if (isNaN(prop) && ! prop.startsWith("$$"))
                      {
                        let undeclared = qx.Bootstrap.$$undeclared;

                        if (! undeclared[obj.constructor.classname])
                        {
                          undeclared[obj.constructor.classname] = {};
                        }

                        if (! undeclared[obj.constructor.classname][prop])
                        {
                          console.error(
                            "Warning: member not declared: " +
                              `${obj.constructor.classname}: ${prop}`);
                          undeclared[obj.constructor.classname][prop] = true;
                        }
                      }
                    }

                    storage.set.call(obj, prop, value);
                    return true;
                  },

                  getPrototypeOf : function(target)
                  {
                    return Reflect.getPrototypeOf(target);
                  },

                  defineProperty : function(target, key, descriptor)
                  {
                    return Reflect.defineProperty(target, key, descriptor);
                  }
                };

              // Create the instance proxy which manages properties, etc.
              proxy = new Proxy(obj, handler);

              // Call any initFunctions defined for properties of this class
              target.$$initFunctions.forEach(
                (prop) =>
                {
                  let           propertyFirstUp = qx.Bootstrap.firstUp(prop);

                  // Initialize this property
                  obj[`init${propertyFirstUp}`]();
                  proxy[`$$variant_${prop}`] = "init";
                });

              this.apply(target, proxy, args);

              return proxy;
            },

            apply : function(target, _this, args)
            {
              // Call the constructor
              subclass.apply(_this, args);
            },

            getPrototypeOf : function(target)
            {
              return Reflect.getPrototypeOf(target);
            }
          });

        return subclass.prototype.constructor;
      },

      /**
       * Removes a class from qooxdoo defined by {@link #define}
       *
       * @param name {String}
       *   Name of the class
       */
      undefine : qx.Bootstrap.undefine,

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
      addMembers : function(clazz, members, patch)
      {
        for (let key in members)
        {
          let             member = members[key];
          let             proto = clazz.prototype;

          if (qx["core"]["Environment"].get("qx.debug"))
          {
            if (key.charAt(0) === '@')
            {
              var annoKey = key.substring(1);
              if (members[annoKey] === undefined && proto[annoKey] === undefined)
              {
                throw new Error(
                  `Annotation for ${annoKey} of Class ${clazz.classname} ` +
                    "does not exist");
              }

              if (key.charAt(1) === "_" && key.charAt(2) === "_")
              {
                throw new Error(
                  `Cannot annotate private member ${key.substring(1)} ` +
                    `of Class ${clazz.classname}`);
              }
            }
            else
            {
              if (proto[key] !== undefined &&
                  key.charAt(0) === "_" &&
                  key.charAt(1) === "_")
              {
                throw new Error(
                  `Overwriting private member "${key}" ` +
                    `of Class "${clazz.classname}" ` +
                    "is not allowed");
              }

              if (patch !== true && proto.hasOwnProperty(key))
              {
                throw new Error(
                  `Overwriting member or property "${key}" ` +
                    `of Class "${clazz.classname}" ` +
                    "is not allowed. " +
                  "(Members and properties are in the same namespace.)");
              }
            }
          }

          // Annotations are not members
          if (key.charAt(0) === "@")
          {
            let annoKey = key.substring(1);
            if (members[annoKey] === undefined)
            {
              // An annotation for a superclass' member
              qx.Class._attachAnno(clazz, "members", annoKey, member);
            }

            continue;
          }

          if (typeof member == "function")
          {
            // If patching, we need to wrap the member function so that
            // `member.base` is unique when a mixin is added to more than
            // one class
            if (patch)
            {
              let f = member;
              member =
                function(...args)
                {
                  return f.apply(this, args);
                };
            }

            // Allow easily identifying this method
            qx.Bootstrap.setDisplayName(
              member, clazz.classname, `prototype.${key}`);

            if (qx["core"]["Environment"].get("qx.aspects"))
            {
              member = qx.core.Aspect.wrap(clazz.classname, member, key);
            }

            // Allow base calls
            if (key in clazz.prototype)
            {
              if (patch && typeof member == "function")
              {
                member.self = clazz;
              }
              member.base = clazz.prototype[key];
            }
          }

          // Create the storage for this member
          patch && delete clazz.prototype[key];
          Object.defineProperty(
            clazz.prototype,
            key,
            {
              value        : member,
              writable     : qx.Class.$$options.allAccessible || true,
              configurable : qx.Class.$$options.allAccessible || true,
              enumerable   : qx.Class.$$options.allAccessible || true
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
      addProperties : function(clazz, properties, patch)
      {
        let groupProperties = {};

        // Factories for property methods
        let propertyMethodFactory =
            {
              get : function(prop, property)
              {
                let propertyFirstUp = qx.Bootstrap.firstUp(prop);
                let f = function()
                {
                  let value = this[prop];

                  if (value === undefined)
                  {
                    if (property.nullable)
                    {
                      value = null;
                    }

                    if (property.check == "Boolean")
                    {
                      value = false;
                    }
                  }

                  return value;
                };

                qx.Bootstrap.setDisplayName(
                  f, clazz.classname, `prototype.get${propertyFirstUp}`);

                return f;
              },

              set : function(prop, property)
              {
                let propertyFirstUp = qx.Bootstrap.firstUp(prop);
                let f = function(value)
                {
                  if (this[`$$variant_${prop}`] == "init")
                  {
                    this[`$$variant_${prop}`] = "init->set";
                  }

                  // Debugging hint: this will trap into setter code.
                  this[prop] = value;
                  this[`$$user_${prop}`] = value;

                  this[`$$variant_${prop}`] = "set";
                  return value;
                };

                qx.Bootstrap.setDisplayName(
                  f, clazz.classname, `prototype.set${propertyFirstUp}`);

                return f;
              },

              reset : function(prop, property)
              {
                let propertyFirstUp = qx.Bootstrap.firstUp(prop);
                let f = function(value)
                {
                  // Get the current inherited and init values
                  let             inheritValue =
                      (property.inheritable
                       ? this[`$$inherit_${prop}`]
                       : undefined);
                  let             initValue =
                      (property.initFunction
                       ? property.initFunction.call(this)
                       : ("init" in property
                          ? property.init
                          : (property.nullable
                             ? null
                             : (property.check == "Boolean"
                                ? false
                                : undefined))));

                  // Unset the user value
                  this[`$$user_${prop}`] = undefined;
                  this[`$$variant_${prop}`] = null;

                  // Save the init value
                  this[`$$init_${prop}`] = initValue;

                  // Select the new value
                  // Debugging hint: this will trap into setter code.
                  this[prop] = (inheritValue !== undefined
                                ? inheritValue
                                : initValue);
                };

                qx.Bootstrap.setDisplayName(
                  f, clazz.classname, `prototype.reset${propertyFirstUp}`);

                return f;
              },

              refresh : function(prop, property)
              {
                let propertyFirstUp = qx.Bootstrap.firstUp(prop);
                let f = function()
                {
                  let             inheritedValue;
                  let             layoutParent;
                  let             userValue = this[`$$user_${prop}`];

                  // If there's a user value, it takes precedence
                  if (typeof userValue != "undefined")
                  {
                    // Use the user value as the property value
                    // Debugging hint: this will trap into setter code.
                    this[prop] = userValue;
                    this[`$$variant_${prop}`] = null;
                    return;
                  }

                  // If there's an init value, inherited value is not applied
                  if (typeof property.init != "undefined" ||
                      property.initFunction)
                  {
                    return;
                  }

                  // If there's a layout parent and if it has a property (not
                  // a member!) of this name, ...
                  layoutParent =
                    (typeof this.getLayoutParent == "function"
                     ? this.getLayoutParent()
                     : undefined);
                  if (layoutParent &&
                      typeof layoutParent[prop] != "undefined" &&
                      prop in layoutParent.constructor.$$allProperties)
                  {
                    // ... then retrieve its value
                    inheritedValue = layoutParent[prop];

                    // If we found a value to inherit...
                    if (typeof inheritedValue != "undefined")
                    {
                      // ... then save the inherited value, ...
                      this[`$$inherit_${prop}`] = inheritedValue;

                      // ... and also use the inherited value as the
                      // property value
                      // Debugging hint: this will trap into setter code.
                      this[prop] = inheritedValue;
                    }
                  }
                };

                qx.Bootstrap.setDisplayName(
                  f, clazz.classname, `prototype.refresh${propertyFirstUp}`);

                return f;
              },

              setThemed : function(prop, property)
              {
                let propertyFirstUp = qx.Bootstrap.firstUp(prop);
                let f = function(value)
                {
                  // Get the current user-specified value
                  let             userValue = this[`$$user_${prop}`];

                  // Save the provided themed value
                  this[`$$theme_${prop}`] = value;

                  // User value has precedence, so if it's not set,
                  // use theme value
                  if (userValue === undefined)
                  {
                    // Debugging hint: this will trap into setter code.
                    this[prop] = value;
                    this[`$$variant_${prop}`] = null;
                  }
                };

                qx.Bootstrap.setDisplayName(
                  f, clazz.classname, `prototype.setThemed${propertyFirstUp}`);

                return f;
              },

              resetThemed : function(prop, property)
              {
                let propertyFirstUp = qx.Bootstrap.firstUp(prop);
                let f = function()
                {
                  // Get the current user-specified value
                  let             userValue = this[`$$user_${prop}`];
                  let             initValue =
                      (property.initFunction
                       ? property.initFunction.call(this)
                       : ("init" in property
                          ? property.init
                          : null));

                  // Unset the themed value
                  this[`$$theme_${prop}`] = undefined;

                  // Select the new value
                  // Debugging hint: this will trap into setter code.
                  this[prop] = userValue !== undefined ? userValue : initValue;
                  this[`$$variant_${prop}`] = null;
                };

                qx.Bootstrap.setDisplayName(
                  f, clazz.classname, `prototype.resetThemed${propertyFirstUp}`);

                return f;
              },

              init : function(prop, property)
              {
                let propertyFirstUp = qx.Bootstrap.firstUp(prop);
                let f = function(value)
                {
                  if (typeof value != "undefined")
                  {
                    property.storage.set.call(this, prop, value);
                  }
                  else if (property.initFunction)
                  {
                    value = property.initFunction.call(this, prop);
                    property.storage.set.call(this, prop, value);
                  }
                  else if (typeof property.init != "undefined")
                  {
                    value = property.init;
                    property.storage.set.call(this, prop, value);
                  }

                  if (value === undefined)
                  {
                    if (property.nullable)
                    {
                      value = null;
                    }

                    if (property.check == "Boolean")
                    {
                      value = false;
                    }
                  }

                  this[`$$init_${prop}`] = value;
                  this[`$$variant_${prop}`] = "init";
                };

                qx.Bootstrap.setDisplayName(
                  f, clazz.classname, `prototype.init${propertyFirstUp}`);

                return f;
              },

              is : function(prop, property)
              {
                let propertyFirstUp = qx.Bootstrap.firstUp(prop);
                let f = function()
                {
                  return !! this[prop];
                };

                qx.Bootstrap.setDisplayName(
                  f, clazz.classname, `prototype.is${propertyFirstUp}`);

                return f;
              },

              toggle : function(prop, property)
              {
                let propertyFirstUp = qx.Bootstrap.firstUp(prop);
                let f = function()
                {
                  // Debugging hint: this will trap into setter code.
                  this[prop] = ! this[prop];
                };

                qx.Bootstrap.setDisplayName(
                  f, clazz.classname, `prototype.toggle${propertyFirstUp}`);

                return f;
              },

              isAsyncSetActive : function(prop, property)
              {
                let propertyFirstUp = qx.Bootstrap.firstUp(prop);
                let f = function()
                {
                  return this[`$$activePromise${propertyFirstUp}`] !== null;
                };

                qx.Bootstrap.setDisplayName(
                  f, clazz.classname, `prototype.isAsyncSetActive${propertyFirstUp}`);

                return f;
              },

              getAsync : function(prop, property, get)
              {
                let propertyFirstUp = qx.Bootstrap.firstUp(prop);
                let f = async function()
                {
                  let value = get.call(this);

                  if (value === undefined)
                  {
                    if (property.nullable)
                    {
                      value = null;
                    }

                    if (property.check == "Boolean")
                    {
                      value = false;
                    }
                  }

                  return value;
                };

                qx.Bootstrap.setDisplayName(
                  f, clazz.classname, `prototype.getAsync${propertyFirstUp}`);

                return f;
              },

              setAsync : function(prop, property, apply)
              {
                let propertyFirstUp = qx.Bootstrap.firstUp(prop);
                let f = async function(value)
                {
                  let  activePromise;
                  let  propertyFirstUp = qx.Bootstrap.firstUp(prop);
                  let  activePromiseProp = `$$activePromise${propertyFirstUp}`;

                  const           setImpl = async function()
                  {
                    let      old;
                    let      oldForCallback;

                    // Save the new property value. This is before any async calls
                    if (property.immutable == "readonly")
                    {
                      throw new Error(
                        `Attempt to set value of readonly property ${prop}`);
                    }

                    value = qx.Promise.resolve(value);

                    // Obtain the old value, via its async request
                    old = await this[`get${propertyFirstUp}Async`]();

                    // If the value has changed since last time...
                    let variant = null;
                    if (! property.isEqual.call(this, value, old) ||
                        ["init", "init->set"].includes(this[`$$variant_${prop}`]))
                    {
                      property.storage.set.call(this, prop, value);

                      oldForCallback = old === undefined ? null : old;
                      if (this[`$$variant_${prop}`] == "init")
                      {
                        oldForCallback = null;
                      }

                      variant = this[`$$variant_${prop}`];
                      this[`$$variant_${prop}`] =
                        variant == "init" ? null : "set";

                      // Call the apply function
                      await apply.call(this, value, oldForCallback, prop);

                      // Now that apply has resolved, fire the change event
                      let promiseData = qx.Promise.resolve(value);

                      if (property.event &&
                          (! property.isEqual.call(this,
                                                   value,
                                                   oldForCallback) ||
                           ["init", "init->set"].includes(variant)))
                      {
                        const Reg = qx.event.Registration;

                        // Yes. Generate a sync event if needed
                        if (Reg.hasListener(this, property.event))
                        {
                          await Reg.fireEventAsync(
                            this,
                            property.event,
                            qx.event.type.Data,
                            [ value, oldForCallback ]);
                        }

                        // Also generate an async event, if needed
                        if (Reg.hasListener(this, property.event + "Async"))
                        {
                          await Reg.fireEventAsync(
                            this,
                          property.event + "Async",
                          qx.event.type.Data,
                          [ promiseData, oldForCallback ]);
                        }
                      }

                      // Update inherited values of child objects
                      if (property.inheritable &&
                          this.prototype &&
                          this.prototype._getChildren)
                      {
                        let children = this._getChildren();
                        if (children)
                        {
                          children.forEach(
                            (child) =>
                            {
                              let { refresh } =
                                  this.constructor.$$propertyDescriptorRegistry.get(
                                    child, prop);
                              refresh();
                            });
                        }
                      }
                    }

                    // If we are the last promise, dispose of the promise
                    if (activePromise === this[activePromiseProp])
                    {
                      this[activePromiseProp] = null;
                    }
                  }.bind(this);

                  // If this property already has an active promise...
                  if (this[activePromiseProp])
                  {
                    // ... then add this request to the promise chain
                    activePromise =
                      this[activePromiseProp].then(setImpl);
                  }
                  else
                  {
                    // There are no pending requests. Begin this one right now.
                    activePromise = setImpl();
                  }

                  this[activePromiseProp] = activePromise;
                  return activePromise;
                };

                qx.Bootstrap.setDisplayName(
                  f, clazz.classname, `prototype.setAsync${propertyFirstUp}`);

                return f;
              },

              groupSet : function(prop, property)
              {
                let propertyFirstUp = qx.Bootstrap.firstUp(prop);
                let f = function(...args)
                {
                  // We can have received separate arguments, or a single
                  // array of arguments. Convert the former to the latter if
                  // necessary. Make a copy, in any case, because we might
                  // muck with the array.
                  args = (args[0] instanceof Array
                          ? args[0].concat()
                          : args);

                  for (let i = 0;
                       i < property.group.length && args.length > 0;
                       i++)
                  {
                    // Get the next value to set
                    let             value = args.shift();

                    // Set the next property in the group
                    this[property.group[i]] = value;

                    // If we're in shorthand mode, we may reuse that
                    // value. Put it back at the end of the argument
                    // list.
                    if (property.mode == "shorthand")
                    {
                      args.push(value);
                    }
                  }
                };

                qx.Bootstrap.setDisplayName(
                  f, clazz.classname, `prototype.groupSet${propertyFirstUp}`);

                return f;
              },

              groupReset : function(prop, property)
              {
                let propertyFirstUp = qx.Bootstrap.firstUp(prop);
                let f = function()
                {
                  for (let i = 0; i < property.group.length; i++)
                  {
                    let propertyFirstUp = qx.Bootstrap.firstUp(property.group[i]);

                    // Reset the property
                    this[`reset${propertyFirstUp}`]();
                  }
                };

                qx.Bootstrap.setDisplayName(
                  f, clazz.classname, `prototype.groupReset${propertyFirstUp}`);

                return f;
              },

              groupSetThemed : function(prop, property)
              {
                let propertyFirstUp = qx.Bootstrap.firstUp(prop);
                let f = function(args)
                {
                  // We can have received separate arguments, or a single
                  // array of arguments. Convert the former to the latter if
                  // necessary. Make a copy, in any case, because we might
                  // muck with the array.
                  args = (args instanceof Array
                          ? args.concat()
                          : Array.prototype.concat.call(args));

                  for (let i = 0;
                       i < property.group.length && args.length > 0;
                       i++)
                  {
                    // Get the next value to set
                    let    value = args.shift();
                    let    propertyFirstUp = qx.Bootstrap.firstUp(property.group[i]);

                    // Set the next property in the group
                    this[`setThemed${propertyFirstUp}`](value);

                    // If we're in shorthand mode, we may reuse that
                    // value. Put it back at the end of the argument
                    // list.
                    args.push(value);
                  }
                };

                qx.Bootstrap.setDisplayName(
                  f, clazz.classname, `prototype.groupSetThemed${propertyFirstUp}`);

                return f;
              },

              groupResetThemed : function(prop, property)
              {
                let propertyFirstUp = qx.Bootstrap.firstUp(prop);
                let f = function()
                {
                  for (let i = 0; i < property.group.length; i++)
                  {
                    let propertyFirstUp = qx.Bootstrap.firstUp(property.group[i]);

                    // Reset the property
                    this[`resetThemed${propertyFirstUp}`]();
                  }
                };

                qx.Bootstrap.setDisplayName(
                  f, clazz.classname, `prototype.groupResetThemed${propertyFirstUp}`);

                return f;
              }
            };

        // Default comparison for whether to call apply method and
        // generate an event
        let isEqual = (a, b) => a === b;

        for (let key in properties)
        {
          let             get;
          let             apply;
          let             property = properties[key];
          let             propertyFirstUp = qx.Bootstrap.firstUp(key);
          let             storage;
          const           proto = clazz.prototype;

          if (qx["core"]["Environment"].get("qx.debug"))
          {
            if (proto[key] !== undefined &&
                key.charAt(0) === "_" &&
                key.charAt(1) === "_")
            {
              throw new Error(
                `Overwriting private member "${key}" ` +
                  `of Class "${clazz.classname}" ` +
                  "is not allowed");
            }

            if (patch !== true && proto.hasOwnProperty(key))
            {
              throw new Error(
                `Overwriting member or property "${key}" ` +
                  `of Class "${clazz.classname}" ` +
                  "is not allowed. " +
                  "(Members and properties are in the same namespace.)");
            }
          }

          // Handle group properties last so we can ensure group member
          // properties exist before the group is created
          if (property.group)
          {
            groupProperties[key] = properties[key];
            continue;
          }

          // If there's no comparison function specified for this property...
          if (! property.isEqual)
          {
            // ... then create the default comparison function
            property.isEqual = isEqual;
          }
          else if (typeof property.isEqual == "string")
          {
            let origIsEqual = property.isEqual;
            property.isEqual =
              function (a, b)
              {
                // First see if isEqual names a member function
                if (typeof this[origIsEqual] == "function")
                {
                  return this[origIsEqual](a, b);
                }

                // Otherwise, assume the string is the contents of a function,
                // e.g., "Object.is(a, b)"
                let arbitrary = new Function("a", "b", `return ${origIsEqual}`);
                return arbitrary.call(this, a, b);
              };
          }

          // If there's no storage mechanism specified for this property...
          if (! property.storage)
          {
            // ... then select a storage mechanism for it
            if (property.immutable == "replace")
            {
              if (property.check == "Array")
              {
                property.storage = qx.core.propertystorage.ImmutableArray;
              }
              else if (property.check == "Object")
              {
                property.storage = qx.core.propertystorage.ImmutableObject;
              }
              else if (property.check == "qx.data.Array")
              {
                property.storage = qx.core.propertystorage.ImmutableDataArray;
              }
              else
              {
                throw new Error(
                  `${key}: ` +
                    "only `check : 'Array'` and `check : 'Object'` " +
                    "properties may have `immutable : 'replace'`.");
              }

            }
            else
            {
              property.storage = qx.core.propertystorage.Default;
            }
          }

          if (qx["core"]["Environment"].get("qx.debug"))
          {
            if (typeof property.storage.init != "function" ||
                typeof property.storage.get != "function" ||
                typeof property.storage.set != "function" ||
                typeof property.storage.dereference != "function")
            {
              throw new Error(
                `${key}: ` +
                  "property storage does not implement the static methods of" +
                  "qx.core.propertystorage.IStorage");
            }
          }

          storage = property.storage;

          // Initialize the property
          storage.init(key, Object.assign({}, property), clazz);

          // We always generate an event unless `property.event` is
          // explicitly set to null. If the event name isn't specified, use
          // the default name.
          if (property.event !== null)
          {
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
          Object.defineProperty(
            clazz.prototype,
            `$$init_${key}`,
            {
              value        : property.init,
              writable     : qx.Class.$$options.allAccessible || true,
              configurable : qx.Class.$$options.allAccessible || false,
              enumerable   : qx.Class.$$options.allAccessible || false
            });

          // user-specified
          patch && delete clazz.prototype[`$$user_${key}`];
          Object.defineProperty(
            clazz.prototype,
            `$$user_${key}`,
            {
              value        : undefined,
              writable     : qx.Class.$$options.allAccessible || true,
              configurable : qx.Class.$$options.allAccessible || false,
              enumerable   : qx.Class.$$options.allAccessible || false
            });

          // theme-specified
          if (property.themeable)
          {
            patch && delete clazz.prototype[`$$theme_${key}`];
            Object.defineProperty(
              clazz.prototype,
              `$$theme_${key}`,
              {
                value        : undefined,
                writable     : qx.Class.$$options.allAccessible || true,
                configurable : qx.Class.$$options.allAccessible || false,
                enumerable   : qx.Class.$$options.allAccessible || false
              });
          }

          // whether to call apply after setting init value
          Object.defineProperty(
            clazz.prototype,
            `$$variant_${key}`,
            {
              value        : (typeof property.init != "undefined" ||
                              typeof property.initFunction == "function"
                              ? "init"
                              : null),
              writable     : qx.Class.$$options.allAccessible || true,
              configurable : qx.Class.$$options.allAccessible || false,
              enumerable   : qx.Class.$$options.allAccessible || false
            });

          // inheritable
          if (property.inheritable)
          {
            patch && delete clazz.prototype[`$$inherit_${key}`];
            Object.defineProperty(
              clazz.prototype,
              `$$inherit_${key}`,
              {
                value        : undefined,
                writable     : qx.Class.$$options.allAccessible || true,
                configurable : qx.Class.$$options.allAccessible || false,
                enumerable   : qx.Class.$$options.allAccessible || false
              });
          }

          if (property.async)
          {
            // Obtain the required get function
            if (typeof property.get == "function")
            {
              get = property.get;
            }
            else if (typeof property.get == "string")
            {
              get = clazz.prototype[property.get];
            }

            // Obtain the required apply function
            if (typeof property.apply == "function")
            {
              apply = property.apply;
            }
            else if (typeof property.apply == "string")
            {
              apply = clazz.prototype[property.apply];
            }

            // Both get and apply must be provided
            if (typeof get != "function" || typeof apply != "function")
            {
              throw new Error(
                `${key}: ` +
                  `async property requires that both 'get' and 'apply' be provided`);
            }
          }

          // Call the factories to generate each of the property functions
          // for the current property of the class
          let propertyDescriptor =
              {
                // The complete property definition
                definition : Object.assign({}, property),

                // Property methods
                get : propertyMethodFactory.get(key, property),
                set : propertyMethodFactory.set(key, property),
                reset : propertyMethodFactory.reset(key, property),
              };

          if (property.inheritable)
          {
            Object.assign(
              propertyDescriptor,
              {
                refresh : propertyMethodFactory.refresh(key, property)
              });
          }

          if (property.themeable)
          {
            Object.assign(
              propertyDescriptor, 
              {
                setThemed : propertyMethodFactory.setThemed(key, property),
                resetThemed : propertyMethodFactory.resetThemed(key, property)
              });
          }

          if (typeof property.init != "undefined" ||
              typeof property.initFunction == "function" ||
              typeof property.apply != "undefined" ||
              typeof property.check == "Boolean" ||
              property.deferredInit ||
              property.inheritable)
          {
            Object.assign(
              propertyDescriptor,
              {
                init : propertyMethodFactory.init(key, property)
              });
          }

          if (property.check == "Boolean")
          {
            Object.assign(
              propertyDescriptor,
              {
                is : propertyMethodFactory.is(key, property),
                toggle : propertyMethodFactory.toggle(key, property)
              });
          }

          if (property.async)
          {
            Object.assign(
              propertyDescriptor,
              {
                isAsyncSetActive :
                    propertyMethodFactory.isAsyncSetActive(key, property),
                getAsync : propertyMethodFactory.getAsync(key, property, get),
                setAsync : propertyMethodFactory.setAsync(key, property, apply)
              });
          }

          // Freeze the property descriptor so user doesn't muck it up
          Object.freeze(propertyDescriptor);

          // Store it in the registry
          if (clazz.$$propertyDescriptorRegistry)
          {
            clazz.$$propertyDescriptorRegistry.register(
              clazz.classname, key, propertyDescriptor);
          }

          // Create the legacy property getter, getPropertyName
          patch && delete clazz.prototype[`get${propertyFirstUp}`];
          if (! clazz.prototype.hasOwnProperty(`get${propertyFirstUp}`))
          {
            Object.defineProperty(
              clazz.prototype,
              `get${propertyFirstUp}`,
              {
                value        : propertyDescriptor.get,
                writable     : qx.Class.$$options.allAccessible || false,
                configurable : qx.Class.$$options.allAccessible || true,
                enumerable   : qx.Class.$$options.allAccessible || false
              });
          }

          // Create the legacy property setter, setPropertyName.
          patch && delete clazz.prototype[`set${propertyFirstUp}`];
          if (! clazz.prototype.hasOwnProperty(`set${propertyFirstUp}`))
          {
            Object.defineProperty(
              clazz.prototype,
              `set${propertyFirstUp}`,
              {
                value        : propertyDescriptor.set,
                writable     : qx.Class.$$options.allAccessible || false,
                configurable : qx.Class.$$options.allAccessible || true,
                enumerable   : qx.Class.$$options.allAccessible || false
              });
          }

          // Create this property's resetProperty method
          patch && delete clazz.prototype[`reset${propertyFirstUp}`];
          if (! clazz.prototype.hasOwnProperty(`reset${propertyFirstUp}`))
          {
            Object.defineProperty(
              clazz.prototype,
              `reset${propertyFirstUp}`,
              {
                value        : propertyDescriptor.reset,
                writable     : qx.Class.$$options.allAccessible || false,
                configurable : qx.Class.$$options.allAccessible || true,
                enumerable   : qx.Class.$$options.allAccessible || false
              });
          }

          if (property.inheritable)
          {
            // Create this property's refreshProperty method
            patch && delete clazz.prototype[`refresh${propertyFirstUp}`];
            if (! clazz.prototype.hasOwnProperty(`refresh${propertyFirstUp}`))
            {
              Object.defineProperty(
                clazz.prototype,
                `refresh${propertyFirstUp}`,
                {
                  value        : propertyDescriptor.refresh,
                  writable     : qx.Class.$$options.allAccessible || false,
                  configurable : qx.Class.$$options.allAccessible || true,
                  enumerable   : qx.Class.$$options.allAccessible || false
                });
            }
          }

          if (property.themeable)
          {
            // Create this property's setThemedProperty method
            patch && delete clazz.prototype[`setThemed${propertyFirstUp}`];
            if (! clazz.prototype.hasOwnProperty(`setThemed${propertyFirstUp}`))
            {
              Object.defineProperty(
                clazz.prototype,
                `setThemed${propertyFirstUp}`,
                {
                  value        : propertyDescriptor.setThemed,
                  writable     : qx.Class.$$options.allAccessible || false,
                  configurable : qx.Class.$$options.allAccessible || true,
                  enumerable   : qx.Class.$$options.allAccessible || false
                });
            }

            // Create this property's resetThemedProperty method
            patch && delete clazz.prototype[`resetThemed${propertyFirstUp}`];
            if (! clazz.prototype.hasOwnProperty(`resetThemed${propertyFirstUp}`))
            {
              Object.defineProperty(
                clazz.prototype,
                `resetThemed${propertyFirstUp}`,
                {
                  value        : propertyDescriptor.resetThemed,
                  writable     : qx.Class.$$options.allAccessible || false,
                  configurable : qx.Class.$$options.allAccessible || true,
                  enumerable   : qx.Class.$$options.allAccessible || false
                });
            }
          }

          // If there's an init or initFunction handler, ...
          if (typeof property.init != "undefined" ||
              typeof property.initFunction == "function" ||
              typeof property.apply != "undefined" ||
              typeof property.check == "Boolean" ||
              property.deferredInit ||
              property.inheritable)
          {
            // ... then create initPropertyName
            patch && delete clazz.prototype[`init${propertyFirstUp}`];
            if (! clazz.prototype.hasOwnProperty(`init${propertyFirstUp}`))
            {
              Object.defineProperty(
                clazz.prototype,
                `init${propertyFirstUp}`,
                {
                  value        : propertyDescriptor.init,
                  writable     : qx.Class.$$options.allAccessible || false,
                  configurable : qx.Class.$$options.allAccessible || true,
                  enumerable   : qx.Class.$$options.allAccessible || false
                });
            }
          }

          // If this is a boolean, as indicated by check : "Boolean" ...
          if (property.check == "Boolean")
          {
            // ... then create isPropertyName and togglePropertyName
            patch && delete clazz.prototype[`is${propertyFirstUp}`];
            if (! clazz.prototype.hasOwnProperty(`is${propertyFirstUp}`))
            {
              Object.defineProperty(
                clazz.prototype,
                `is${propertyFirstUp}`,
                {
                  value        : propertyDescriptor.is,
                  writable     : qx.Class.$$options.allAccessible || false,
                  configurable : qx.Class.$$options.allAccessible || true,
                  enumerable   : qx.Class.$$options.allAccessible || false
                });
            }

            patch && delete clazz.prototype[`toggle${propertyFirstUp}`];
            if (! clazz.prototype.hasOwnProperty(`toggle${propertyFirstUp}`))
            {
              Object.defineProperty(
                clazz.prototype,
                `toggle${propertyFirstUp}`,
                {
                  value        : propertyDescriptor.toggle,
                  writable     : qx.Class.$$options.allAccessible || false,
                  configurable : qx.Class.$$options.allAccessible || true,
                  enumerable   : qx.Class.$$options.allAccessible || false
                });
            }
          }

          if (property.async)
          {
            let             get;
            let             apply;

            // Create a place to store the current promise for the async setter
            patch && delete clazz.prototype[`$$activePromises${propertyFirstUp}`];
            Object.defineProperty(
              clazz.prototype,
              `$$activePromise${propertyFirstUp}`,
              {
                value        : null,
                writable     : qx.Class.$$options.allAccessible || true,
                configurable : qx.Class.$$options.allAccessible || true,
                enumerable   : qx.Class.$$options.allAccessible || false
              });

            // Create a function that tells the user whether there is still
            // an active async setter running
            patch && delete clazz.prototype[`isAsyncSetActive${propertyFirstUp}`];
            if (! clazz.prototype.hasOwnProperty(`isAsyncSetActive${propertyFirstUp}`))
            {
              Object.defineProperty(
                clazz.prototype,
                `isAsyncSetActive${propertyFirstUp}`,
                {
                  value        : propertyDescriptor.isAsyncSetActive,
                  writable     : qx.Class.$$options.allAccessible || false,
                  configurable : qx.Class.$$options.allAccessible || true,
                  enumerable   : qx.Class.$$options.allAccessible || false
                });
            }

            // Create the async property getter, getPropertyNameAsync
            patch && delete clazz.prototype[`get${propertyFirstUp}Async`];
            if (! clazz.prototype.hasOwnProperty(`get${propertyFirstUp}Async`))
            {
              Object.defineProperty(
                clazz.prototype,
                `get${propertyFirstUp}Async`,
                {
                  value        : propertyDescriptor.getAsync,
                  writable     : qx.Class.$$options.allAccessible || false,
                  configurable : qx.Class.$$options.allAccessible || true,
                  enumerable   : qx.Class.$$options.allAccessible || false
                });
            }

            // Create the async property setter, setPropertyNameAsync.
            patch && delete clazz.prototype[`set${propertyFirstUp}Async`];
            if (! clazz.prototype.hasOwnProperty(`set${propertyFirstUp}Async`))
            {
              Object.defineProperty(
                clazz.prototype,
                `set${propertyFirstUp}Async`,
                {
                  value        : propertyDescriptor.setAsync,
                  writable     : qx.Class.$$options.allAccessible || false,
                  configurable : qx.Class.$$options.allAccessible || true,
                  enumerable   : qx.Class.$$options.allAccessible || false
                });
            }
          }

          // Add the event name for this property to the list of events
          // fired by this class
          let eventName = property.event;
          let events =
              {
                [eventName] : "qx.event.type.Data"
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
        for (let key in groupProperties)
        {
          let             property = groupProperties[key];
          let             propertyFirstUp = qx.Bootstrap.firstUp(key);
          let             allProperties = clazz.$$allProperties;

          if (qx["core"]["Environment"].get("qx.debug"))
          {
            // Validate that group contains only existing properties, and if
            // themeable contains only themeable properties
            for (let prop of property.group)
            {
              if (! (prop in allProperties))
              {
                throw new Error(
                  `Class ${clazz.classname}: ` +
                    `Property group '${key}': ` +
                    `property '${prop}' does not exist`);
              }

              if (allProperties[prop].group)
              {
                throw new Error(
                  `Class ${clazz.classname}: ` +
                    `Property group '${key}': ` +
                    `can not add group '${prop}' to a group`);
              }

              if (property.themeable && ! allProperties[prop].themeable)
              {
                throw new Error(
                  `Class ${clazz.classname}: ` +
                    `Property group '${key}': ` +
                    `can not add themeable property '${prop}' to ` +
                    "non-themeable group");
              }
            }
          }

          // Call the factories to generate each of the property functions
          // for the current property of the class
          let propertyDescriptor =
              {
                // The complete property definition
                definition : Object.assign({}, property),

                // Property methods
                set : propertyMethodFactory.groupSet(key, property),
                reset : propertyMethodFactory.groupReset(key, property),
              };

          if (property.themeable)
          {
            Object.assign(
              propertyDescriptor,
              {
                setThemed : propertyMethodFactory.groupSetThemed(key, property),
                resetThemed : propertyMethodFactory.groupResetThemed(key, property)
              });
          }

          // Freeze the property descriptor so user doesn't muck it up
          Object.freeze(propertyDescriptor);

          // Store it in the registry
          if (clazz.$$propertyDescriptorRegistry)
          {
            clazz.$$propertyDescriptorRegistry.register(
              clazz.classname, key, propertyDescriptor);
          }

          // Create the property setter, setPropertyName.
          patch && delete clazz.prototype[`set${propertyFirstUp}`];
          if (! clazz.prototype.hasOwnProperty(`set${propertyFirstUp}`))
          {
            Object.defineProperty(
              clazz.prototype,
              `set${propertyFirstUp}`,
              {
                value        : propertyDescriptor.set,
                writable     : qx.Class.$$options.allAccessible || false,
                configurable : qx.Class.$$options.allAccessible || true,
                enumerable   : qx.Class.$$options.allAccessible || false
              });
          }

          // Create the property setter, setPropertyName.
          patch && delete clazz.prototype[`reset${propertyFirstUp}`];
          if (! clazz.prototype.hasOwnProperty(`reset${propertyFirstUp}`))
          {
            Object.defineProperty(
              clazz.prototype,
              `reset${propertyFirstUp}`,
              {
                value        : propertyDescriptor.reset,
                writable     : qx.Class.$$options.allAccessible || false,
                configurable : qx.Class.$$options.allAccessible || true,
                enumerable   : qx.Class.$$options.allAccessible || false
              });
          }

          // If group is themeable, add the styler and unstyler
          if (property.themeable)
          {
            patch && delete clazz.prototype[`setThemed${propertyFirstUp}`];
            if (! clazz.prototype.hasOwnProperty(`setThemed${propertyFirstUp}`))
            {
              Object.defineProperty(
                clazz.prototype,
                `setThemed${propertyFirstUp}`,
                {
                  value        : propertyDescriptor.setThemed,
                  writable     : qx.Class.$$options.allAccessible || false,
                  configurable : qx.Class.$$options.allAccessible || true,
                  enumerable   : qx.Class.$$options.allAccessible || false
                });
            }

            patch && delete clazz.prototype[`resetThemed${propertyFirstUp}`];
            if (! clazz.prototype.hasOwnProperty(`resetThemed${propertyFirstUp}`))
            {
              Object.defineProperty(
                clazz.prototype,
                `resetThemed${propertyFirstUp}`,
                {
                  value        : propertyDescriptor.resetThemed,
                  writable     : qx.Class.$$options.allAccessible || false,
                  configurable : qx.Class.$$options.allAccessible || true,
                  enumerable   : qx.Class.$$options.allAccessible || false
                });
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
      addEvents : function(clazz, events, patch)
      {
        let             key;

        if (qx["core"]["Environment"].get("qx.debug"))
        {
          if (typeof events !== "object" ||
              qx.Bootstrap.getClass(events) === "Array")
          {
            throw new Error(
              clazz.classname + ": the events must be defined as map!");
          }

          for (key in events)
          {
            let type = events[key];

            if (type !== undefined && typeof type !== "string")
            {
              throw new Error(
                clazz.classname +
                  "/" +
                  key +
                  ": the event value needs to be a string with the class name " +
                  "of the event object which will be fired.");
            }
          }

          // Compare old and new event type/value if patching is disabled
          if (clazz.$$events && patch !== true)
          {
            for (key in events)
            {
              if (clazz.$$events[key] !== undefined &&
                  clazz.$$events[key] !== events[key])
              {
                throw new Error(
                  clazz.classname +
                    "/" +
                    key +
                    ": the event value/type cannot be changed from " +
                    clazz.$$events[key] +
                    " to " +
                    events[key]);
              }
            }
          }
        }

        if (clazz.$$events)
        {
          for (key in events)
          {
            clazz.$$events[key] = events[key];
          }
        }
        else
        {
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
      addMixin : function(clazz, mixin, patch)
      {
        if (qx.core.Environment.get("qx.debug"))
        {
          if (! clazz || ! mixin)
          {
            throw new Error("Incomplete parameters!");
          }
        }

        if (this.hasMixin(clazz, mixin))
        {
          return;
        }

        // Attach content
        let list = qx.Mixin.flatten( [ mixin ] );
        list.forEach(
          (entry) =>
          {
            // Attach events
            if (entry.$$events)
            {
              qx.Class.addEvents(clazz, entry.$$events, patch);
            }

            // Attach properties
            if (entry.$$properties)
            {
              qx.Class.addProperties(clazz, entry.$$properties, patch);
            }

            // Attach members
            if (entry.$$members)
            {
              qx.Class.addMembers(clazz, entry.$$members, patch);
            }
          });

        // Store mixin reference
        if (clazz.$$includes)
        {
          clazz.$$includes.push(mixin);
          clazz.$$flatIncludes.push.apply(clazz.$$flatIncludes, list);
        }
        else
        {
          clazz.$$includes = [ mixin ];
          clazz.$$flatIncludes = list;
        }
      },

      /**
       * Add a single interface to a class
       *
       * @param clazz {Class} class to add interface to
       * @param iface {Interface} the Interface to add
       */
      addInterface : function(clazz, iface)
      {
        if (qx.core.Environment.get("qx.debug"))
        {
          if (! clazz || ! iface)
          {
            throw new Error("Incomplete parameters");
          }

          // This differs from mixins, we only check if the interface
          // is already directly used by this class. It is allowed
          // however, to have an interface included multiple times by
          // extends in the interfaces etc.
          if (this.hasOwnInterface(clazz, iface))
          {
            throw new Error(
              `Interface ${iface.name} is already used by ` +
                `Class ${clazz.classname}`);
          }

          // Check interface and wrap members
          if (clazz.$$classtype !== "abstract")
          {
            qx.Interface.assert(clazz, iface, true);
          }
        }

        // Store interface reference
        let list = qx.Interface.flatten([iface]);
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
      include : function(clazz, mixin)
      {
        if (qx.core.Environment.get("qx.debug"))
        {
          if (! mixin) {
            throw new Error(
              `The mixin to include into class ${clazz.classname} ` +
                "is undefined or null");
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
      patch : function(clazz, mixin)
      {
        if (qx.core.Environment.get("qx.debug"))
        {
          if (! mixin) {
            throw new Error(
              `The mixin to patch class ${clazz.classname} ` +
                "is undefined or null");
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
      validateAbstractInterfaces : function(clazz)
      {
        let superclass = clazz.superclass;
        while (superclass)
        {
          if (superclass.$$classtype !== "abstract")
          {
            break;
          }

          var interfaces = superclass.$$implements;
          if (interfaces)
          {
            for (let i=0; i<interfaces.length; i++)
            {
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
      _attachAnno : function(clazz, group, key, anno)
      {
        // If there's no annotation, we have nothing to do
        if (anno === undefined)
        {
          return;
        }

        if (clazz.$$annotations === undefined)
        {
          clazz.$$annotations = {};
          clazz.$$annotations[group] = {};
        }
        else if (clazz.$$annotations[group] === undefined)
        {
          clazz.$$annotations[group] = {};
        }

        if (! Array.isArray(anno))
        {
          anno = [anno];
        }

        if (key)
        {
          clazz.$$annotations[group][key] = anno;
        }
        else
        {
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
      _validateConfig : qx.core.Environment.select(
        "qx.debug",
        {
          true : function _validateConfig(name, config)
          {
            // Validate type
            if (config.type &&
                ! (config.type === "static" ||
                   config.type === "abstract" ||
                   config.type === "singleton"))
            {
              throw new Error(
                'Invalid type "' +
                  config.type +
                  '" definition for class "' +
                  name +
                  '"!'
              );
            }

            // Validate non-static class on the "extend" key
            if (config.type && config.type !== "static" && ! config.extend)
            {
              throw new Error(
                `${name}: invalid config. ` +
                  "Non-static class must extend at least the `qx.core.Object` class");
            }

            // Validate maps
            let maps =
                [
                  "statics",
                  "properties",
                  "members",
                  "environment",
                  "settings",
                  "variants",
                  "events"
                ];

            for (let i = 0, l = maps.length; i < l; i++)
            {
              var key = maps[i];

              if (config[key] !== undefined &&
                  (config[key] === null ||
                   config[key].$$hash !== undefined ||
                   ! qx.Bootstrap.isObject(config[key])))
              {
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
            if (config.include)
            {
              if (qx.Bootstrap.getClass(config.include) === "Array")
              {
                for (let i = 0, a = config.include, l = a.length; i < l; i++)
                {
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
              }
              else
              {
                throw new Error(
                  'Invalid include definition in class "' +
                    name +
                    '"! Only mixins and arrays of mixins are allowed!'
                );
              }

              if (config.type == "static")
              {
                config.include.forEach(
                  (mixin) =>
                  {
                    if (mixin.$$members)
                    {
                      throw new Error(
                        `Mixin ${mixin.name} applied to class ${name}: ` +
                          "class is static, but mixin has members");
                    }
                  });
              }
            }

            // Validate implement definition
            if (config.implement)
            {
              if (qx.Bootstrap.getClass(config.implement) === "Array")
              {
                for (let i = 0, a = config.implement, l = a.length; i < l; i++)
                {
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
            if (config.include)
            {
              try
              {
                qx.Mixin.checkCompatibility(config.include);
              }
              catch (ex)
              {
                throw new Error(
                  'Error in include definition of class "' +
                    name +
                    '"! ' +
                    ex.message
                );
              }
            }

            // Validate environment
            if (config.environment)
            {
              for (let key in config.environment) {
                if (key.substr(0, key.indexOf(".")) !=
                    name.substr(0, name.indexOf(".")))
                {
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
            if (config.settings)
            {
              for (let key in config.settings)
              {
                if (key.substr(0, key.indexOf(".")) !=
                    name.substr(0, name.indexOf(".")))
                {
                  throw new Error(
                    'Forbidden setting "' +
                      key +
                      '" found in "' +
                      name +
                      '". It is forbidden to define a default setting for ' +
                      'an external namespace!'
                  );
                }
              }
            }

            // Validate variants
            if (config.variants)
            {
              for (let key in config.variants)
              {
                if (key.substr(0, key.indexOf(".")) !=
                    name.substr(0, name.indexOf(".")))
                {
                  throw new Error(
                    'Forbidden variant "' +
                      key +
                      '" found in "' +
                      name +
                      '". It is forbidden to define a variant for ' +
                      'an external namespace!'
                  );
                }
              }
            }
          },

          default : function _validateConfig()
          {
            // do nothing when debug is disabled
          }
        }),


      _validatePropertyDefinitions : qx.core.Environment.select(
        "qx.debug",
        {
          true : function(className, config)
          {
            let             allowedKeys;
            let             properties = config.properties || {};

            // Ensure they're not passing a qx.core.Object descendent as property map
            if (qx["core"]["Environment"].get("qx.debug"))
            {
              if (config.properties !== undefined &&
                  qx.Bootstrap.isQxCoreObject(config.properties))
              {
                throw new Error(
                  `${className}: ` +
                    "Can't use qx.core.Object descendent as property map");
              }
            }

            for (let prop in properties)
            {
              let             property = properties[prop];

              // Ensure they're not passing a qx.core.Object descendent as a property
              if (qx["core"]["Environment"].get("qx.debug"))
              {
                if (qx.Bootstrap.isQxCoreObject(property))
                {
                  throw new Error(
                    `${prop} in ${className}: ` +
                      "Can't use qx.core.Object descendent as property");
                }
              }

              // Set allowed keys based on whether this is a grouped
              // property or not
              allowedKeys = (property.group
                             ? qx.Class._allowedPropGroupKeys
                             : qx.Class._allowedPropKeys);

              // Ensure only allowed keys were provided
              Object.keys(property).forEach(
                (key) =>
                {
                  let             allowed = allowedKeys[key];

                  if (! (key in allowedKeys))
                  {
                    throw new Error(
                      `${className}: ` +
                        (property.group ? "group " : "") +
                        `property '${prop}' defined with unrecognized key '${key}'`);
                  }

                  // Flag any deprecated keys
                  if (key in qx.Class.$$deprecatedPropKeys)
                  {
                    console.warn(
                      `Property '${prop}': ` +
                        `${qx.Class.$$deprecatedPropKeys[key]}`);
                  }

                  if (allowed !== null)
                  {
                    // Convert non-array 'allowed' values to an array
                    if (! Array.isArray(allowed))
                    {
                      allowed = [ allowed ];
                    }

                    if (! allowed.includes(typeof property[key]))
                    {
                      throw new Error(
                        `${className}: ` +
                          (property.group ? "group " : "") +
                          `property '${prop}' defined with wrong value type ` +
                          `for key '${key}' (found ${typeof property[key]})`);
                    }
                  }
                });
            }
          },

          default : function(className, config)
          {
            // do nothing when debug is disabled
          }
        }),

      _checkValueAgainstJSdocAST : qx.core.Environment.select(
        "qx.debug",
        {
          true : function(prop, value, ast, check)
          {
            console.log(
              `JSDoc AST of ${check}:\n` + JSON.stringify(ast, null, "  "));

            // TODO: implement this
            throw new Error(
              `${prop}: ` +
                `JSDoc type checking is not yet implemented`);
          },

          default : function(prop, value, ast, check)
          {
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
      getByName : qx.Bootstrap.getByName,

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
      getByMixin : function(clazz, mixin)
      {
        while (clazz)
        {
          if (clazz.$$includes)
          {
            let list = clazz.$$flatIncludes;

            for (let i = 0, l = list.length; i < l; i++)
            {
              if (list[i] === mixin)
              {
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
      hasMixin : function(clazz, mixin)
      {
        return !! this.getByMixin(clazz, mixin);
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
      hasOwnInterface : function(clazz, iface)
      {
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
      getByInterface : qx.util.OOUtil.getByInterface,


      /**
       * Returns a list of all interfaces a given class has to implement.
       *
       * @param clazz {Class}
       *   Class which should be inspected
       *
       * @return {Interface[]}
       *   Array of interfaces this class implements
       */
      getInterfaces : function(clazz)
      {
        let list = [];

        while (clazz)
        {
          if (clazz.$$implements)
          {
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
      hasInterface : qx.util.OOUtil.hasInterface,


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
      implementsInterface : function(obj, iface)
      {
        let clazz = obj.constructor;

        if (this.hasInterface(clazz, iface))
        {
          return true;
        }

        if (qx.Interface.objectImplements(obj, iface))
        {
          return true;
        }

        if (qx.Interface.classImplements(clazz, iface))
        {
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
      getSubclasses(clazz)
      {
        if (!clazz)
        {
          return null;
        }

        let subclasses = {};
        let registry = qx.Bootstrap.$$registry;

        for (let name in registry)
        {
          if (registry[name].superclass &&
              registry[name].superclass == clazz)
          {
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
        var list = [];

        while (clazz) {
          if (clazz.$$properties) {
            list.push.apply(list, Object.keys(clazz.$$properties));
          }

          clazz = clazz.superclass;
        }

        return list;
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
      getTotalNumber()
      {
        return qx.Bootstrap.objectGetLength(qx.Bootstrap.$$registry);
      },
      
      /**
       * Whether the value is an array.
       *
       * @param value {var} Value to check.
       * @return {Boolean} Whether the value is an array.
       */
      isArray : function(value)
      {
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
