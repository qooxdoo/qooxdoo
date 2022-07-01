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

if (typeof PROXY_TESTS != "undefined")
{
  window = typeof window != "undefined" ? window : globalThis;
}

// Undeclared member variables we've already notified the user of
let undeclared = {};

// Bootstrap the Bootstrap static class
qx = Object.assign(
  window.qx || {},
  {
    $$namespaceRoot : window,

    Bootstrap :
    {
      /** True when initially bootstrapping */
      $$BOOTSTRAPPING : true,

      /** @type {Map} Stores all defined classes */
      $$registry : {},

      define,
      genericToString,
      createNamespace,
      setRoot,
      getDisplayName,
      setDisplayName,
      setDisplayNames,
      base,
      getClass,
      getByName,
      isString,
      isArray,
      isObject,
      isFunction,
      isFunctionOrAsyncFunction,
      isQxCoreObject,
      firstUp,

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

    core :
    {
      // Bootstrap Aspect class
      Aspect :
      {
        wrap : function(fullName, f, type)
        {
          return f;
        }
      },

      // Bootstrap Environment class
      Environment :
      {
        $$environment :
        {
        },

        get(key)
        {
          return qx.core.Environment.$$environment[key];
        },

        add(key, value)
        {
          qx.core.Environment.$$environment[key] = value;
        }
      },

      propertystorage :
      {
        init(propertyName, property, clazz)
        {
          // Create the storage for this property's current value
          Object.defineProperty(
            clazz.prototype,
            propertyName,
            {
              value        : property.init,
              writable     : true, // must be true for possible initFunction
              configurable : false,
              enumerable   : false
            });
        },

        get(prop)
        {
          return this[prop];
        },

        set(prop, value)
        {
          this[prop] = value;
        },

        dereference(prop, property)
        {
          // Called immediately after the destructor, if the
          // property has `dereference : true`.
          delete this[prop];
        }
      }
    }
  });

/**
 * Supported keys for property definitions
 *
 * @internal
 */
let stringOrFunction = [ "string", "function" ];
let $$allowedPropKeys =
    {
      "@": null,                  // Anything
      name: "string",             // String
      dereference: "boolean",     // Boolean
      inheritable: "boolean",     // Boolean
      nullable: "boolean",        // Boolean
      themeable: "boolean",       // Boolean
      refine: "boolean",          // Boolean
      init: null,                 // var
      apply: stringOrFunction,    // String, Function
      event: "string",            // String
      check: null,                // Array, String, Function
      transform: null,            // String, Function
      async: "boolean",           // Boolean
      deferredInit: "boolean",    // Boolean
      validate: stringOrFunction, // String, Function
      isEqual: stringOrFunction,  // String, Function

      // Not in original set of allowed keys:
      get: stringOrFunction,      // String, Function
      initFunction: "function",   // Function
      storage: "function",        // implements qx.core.propertystorage.IStorage
      immutable: "string"         // String
    };

/**
 * Supported keys for property group definitions
 *
 * @internal
 */
let $$allowedPropGroupKeys =
    {
      "@": null,                  // Anything
      name: "string",             // String
      group: "object",            // Array
      mode: "string",             // String
      themeable: "boolean"        // Boolean
    };

/**
 * Deprecated keys for properties, that we want to warn about
 *
 * @internal
 */
let $$deprecatedPropKeys =
    {
      deferredInit :
        `'deferredInit' is deprecated and ignored. ` +
        `See the new property key 'initFunction' as a likely replacement.`
    };

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
      v => qx.lang.Type.isNumber(v) && isFinite(v) && v % 1 === 0
    ],
    [
      "PositiveNumber",
      v => qx.lang.Type.isNumber(v) && isFinite(v) && v >= 0
    ],
    [
      "PositiveInteger",
      v => qx.lang.Type.isNumber(v ) && isFinite() && v % 1 === 0 && v >= 0
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
      v => v !== null && (qx.lang.Type.isObject(v) || typeof v === "object")
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
      v => v !== null && v.nodeType === 9 && v.documentElement
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
      v => (v !== null &&
           qx.theme.manager.Decoration.getInstance().isValidPropertyValue(v))
    ],
    [
      "Font",
      v => v !== null && qx.theme.manager.Font.getInstance().isDynamic(v)
    ]
  ]);

//
// Factories for property methods
//
let propertyMethodFactory =
    {
      get : function(prop, property)
      {
        return function()
        {
          return this[prop];
        };
      },

      set : function(prop, property)
      {
        return function(value)
        {
          this[prop] = value;
          return value;
        };
      },

      reset : function(prop, property)
      {
        return function(value)
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
                  : undefined));

          // Unset the user value
          this[`$$user_${prop}`] = undefined;

          // Select the new value
          this[prop] = inheritValue !== undefined ? inheritValue : initValue;
        };
      },

      refresh : function(prop, property)
      {
        return function()
        {
          let             inheritedValue;
          let             layoutParent;
          let             userValue = this[`$$user_${prop}`];

          // If there's a user value, it takes precedence
          if (typeof userValue != "undefined")
          {
            // Use the user value as the property value
            this[prop] = userValue;
            return;
          }

          // If there's a layout parent and if it has a property of
          // this name, ...
          layoutParent =
            (typeof this.getLayoutParent == "function"
             ? this.getLayoutParent()
             : undefined);
          if (layoutParent && typeof layoutParent[prop] != "undefined")
          {
            // ... then retrieve its value
            inheritedValue = layoutParent[prop];

            // If we found a value to inherit...
            if (typeof inheritedValue != "undefined")
            {
              // ... then save the inherited value, ...
              this[`$$inherit_${prop}`] = inheritedValue;

              // ... and also use the inherited value as the property value
              this[prop] = inheritedValue;
            }
          }
        };
      },

      setThemed : function(prop, property)
      {
        return function(value)
        {
          // Get the current user-specified value
          let             userValue = this[`$$user_${prop}`];

          // Save the provided themed value
          this[`$$theme_${prop}`] = value;

          // User value has precedence, so if it's not set, use theme value
          if (userValue === undefined)
          {
            this[prop] = value;
          }
        };
      },

      resetThemed : function(prop, property)
      {
        return function(value)
        {
          // Get the current user-specified value
          let             userValue = this[`$$user_${prop}`];
          let             initValue =
              (property.initFunction
               ? property.initFunction.call(this)
               : ("init" in property
                  ? property.init
                  : undefined));

          // Unset the themed value
          this[`$$theme_${prop}`] = undefined;

          // Select the new value
          this[prop] = userValue !== undefined ? userValue : initValue;
        };
      },

      init : function(prop, property)
      {
        return function()
        {
          if (property.initFunction)
          {
            property.storage.set.call(
              this, prop, property.initFunction.call(this, prop));
          }
          else if (property.init)
          {
            property.storage.set.call(this, prop, property.init);
          }
        };
      },

      is : function(prop, property)
      {
        return function()
        {
          return !! this[prop];
        };
      },

      toggle : function(prop, property)
      {
        return function()
        {
          this[prop] = ! this[prop];
        };
      },

      isAsyncSetActive : function(prop, property)
      {
        let           propertyFirstUp = qx.Bootstrap.firstUp(prop);

        return function()
        {
          return this[`$$activePromise${propertyFirstUp}`] !== null;
        };
      },

      getAsync : function(prop, property, get)
      {
        return async function()
        {
          return get.call(this);
        };
      },

      setAsync : function(prop, property, apply)
      {
        return async function(value)
        {
          let        activePromise;
          let        propertyFirstUp = qx.Bootstrap.firstUp(prop);
          let        activePromiseProp = `$$activePromise${propertyFirstUp}`;

          const           setImpl = async function()
          {
            let      old;

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
            if (! property.isEqual(value, old))
            {
              property.storage.set.call(this, prop, value);

              // Call the apply function
              await apply.call(this, value, old, prop);

              // Now that apply has resolved, fire the change event
              if (typeof PROXY_TESTS == "undefined")
              {
                let promiseData = qx.Promise.resolve(value);

                if (property.event)
                {
                  const Reg = qx.event.Registration;

                  // Yes. Generate a sync event if needed
                  if (Reg.hasListener(this, property.event))
                  {
                    await Reg.fireEventAsync(
                      this,
                      property.event,
                      qx.event.type.Data,
                      [ value, old ]);
                  }

                  // Also generate an async event, if needed
                  if (Reg.hasListener(this, property.event + "Async"))
                  {
                    await Reg.fireEventAsync(
                      this,
                    property.event + "Async",
                    qx.event.type.Data,
                    [ promiseData, old ]);
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
              else
              {
                console.log(
                  `Would generate event type ${property.event} ` +
                    `{ value: ${value}, old: ${old} } (async event)`);
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
      },

      groupSet : function(prop, property)
      {
        return function(args)
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
            let             value = args.shift();

            // Set the next property in the group
            this[property.group[i]] = value;

            // If we're in shorthand mode, we may reuse that value. Put it
            // back at the end of the argument list.
            if (property.mode == "shortcut")
            {
              args.push(value);
            }
          }
        };
      },

      groupReset : function(prop, property)
      {
        return function()
        {
          for (let i = 0; i < property.group.length; i++)
          {
            let propertyFirstUp = qx.Bootstrap.firstUp(property.group[i]);

            // Reset the property
            this[`reset${propertyFirstUp}`]();
          }
        };
      },

      groupSetThemed : function(prop, property)
      {
        return function(args)
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

            // If we're in shorthand mode, we may reuse that value. Put it
            // back at the end of the argument list.
            args.push(value);
          }
        };
      },

      groupResetThemed : function(prop, property)
      {
        return function()
        {
          for (let i = 0; i < property.group.length; i++)
          {
            let propertyFirstUp = qx.Bootstrap.firstUp(property.group[i]);

            // Reset the property
            this[`resetThemed${propertyFirstUp}`]();
          }
        };
      }
    };

// Default comparison for whether to call apply method and generate an event
let isEqual = (a, b) => a === b;


function define(className, config)
{
  let             allowedKeys;
  let             clazz;
  let             proxy;
  let             handler;
  let             path;
  let             classnameComponents;

  // Process environment
  let environment = config.environment || {};
  for (let key in environment)
  {
    qx.core.Environment.add(key, environment[key]);
  }

  if (qx.core.Environment.get("qx.debug"))
  {
    _validatePropertyDefinitions(className, config);
  }

  // Normalize include to array
  if (config.include && qx.Bootstrap.getClass(config.include) != "Array")
  {
    config.include = [ config.include ];
  }

  // Normalize implement to array
  if (config.implement && qx.Bootstrap.getClass(config.implement) != "Array")
  {
    config.implement = [ config.implement ];
  }

  if (! config.extend)
  {
    if (qx.core.Environment.get("qx.debug"))
    {
      if (config.type && config.type != "static")
      {
        throw new Error(
          `${className}: ` +
            `No 'extend' key, but 'type' is not 'static' ` +
            `(found ${config.type})`);
      }
    }

    config.type = "static";
  }

  if (qx.core.Environment.get("qx.debug"))
  {
    if (config.type == "static")
    {
      allowedKeys =
        {
          "@": "object",
          type: "string",         // String
          include: "object",      // Mixin[]
          statics: "object",      // Map
          environment: "object",  // Map
          events: "object",       // Map
          defer: "function"       // Function
        };
    }
    else
    {
      allowedKeys =
        {
          "@": "object",
          "@construct": "object",
          "@destruct": "object",
          type: "string",         // String
          extend: "function",     // Function
          implement: "object",    // Interface[]
          include: "object",      // Mixin[]
          construct: "function",  // Function
          statics: "object",      // Map
          properties: "object",   // Map
          members: "object",      // Map
          environment: "object",  // Map
          events: "object",       // Map
          defer: "function",      // Function
          destruct: "function",    // Function
          proxyHandler: "object"   // Map
        };
    }

    Object.keys(config).forEach(
      (key) =>
      {
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
  }

  // Create the new class
  clazz = _extend(className, config);

  // Initialise class and constructor/destructor annotations
  ["@", "@construct", "@destruct"].forEach(
    (id) =>
    {
      _attachAnno(clazz, id, null, config[id]);
    });

  // Add singleton getInstance()
  if (config.type === "singleton")
  {
    clazz.getInstance = getInstance;
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

    if (qx.core.Environment.get("qx.debug"))
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
      if (qx.core.Environment.get("qx.aspects"))
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
        writable     : true,
        configurable : true,
        enumerable   : true
      });

    // Attach annotations
    _attachAnno(clazz, "statics", key, config.statics["@" + key]);
  }

  // Create a place to store the property descriptor registry for this class
  Object.defineProperty(
    clazz,
    `$$propertyDescriptorRegistry`,
    {
      value        : (qx.core.PropertyDescriptorRegistry
                      ? new qx.core.PropertyDescriptorRegistry()
                      : undefined),
      writable     : true,
      configurable : false,
      enumerable   : false
    });

  // Create a method to retrieve a property descriptor
  Object.defineProperty(
    clazz.prototype,
    `getPropertyDescriptor`,
    {
      value        : function(prop)
      {
        return this.constructor.$$propertyDescriptorRegistry.get(this, prop);
      },
      writable     : false,
      configurable : false,
      enumerable   : false
    });


  // Add a method to refresh all inheritable properties
  Object.defineProperty(
    clazz.prototype,
    "$$refresh",
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
      writable     : false,
      configurable : false,
      enumerable   : false
    });

  // Members, properties, events, and mixins are only allowed for
  // non-static classes.
  if (config.extend)
  {
    // Add members
    if (config.members)
    {
      addMembers(clazz, config.members, false);
    }

    // Add properties
    if (config.properties)
    {
      addProperties(clazz, config.properties, false);
    }

    // Add events
    if (config.events)
    {
      addEvents(clazz, config.events, false);
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

    if (qx.core.Environment.get("qx.debug"))
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

  if (qx.core.Environment.get("qx.aspects"))
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
  qx.Bootstrap.setDisplayName(destructDereferencer, className, "destruct");

  // Create the specified namespace
  if (0)
  {
    path = globalThis;
    classnameComponents = className.split(".");
    classnameComponents.forEach(
      (component, i) =>
      {
        const           bExists = component in path;
        const           isLast = i == classnameComponents.length - 1;

        if (! bExists && isLast)
        {
          path[component] = clazz;
        }
        else if (! bExists)
        {
          path[component] = {};
        }
        else if (bExists && ! isLast)
        {
          // Not last component, so is allowed to exist. Just keep traversing.
        }
        else
        {
          throw new Error(
            `Namespace component ${component} from ${className} already exists`);
        }

        path = path[component];
      });
  }
  else
  {
    qx.Bootstrap.createNamespace(className, clazz);
  }

  // Now that the class has been defined, call its (optional) defer function
  if (config.defer)
  {
    // Do not allow modification to the property map at this stage.
    config.defer(clazz, clazz.prototype, Object.assign({}, config.properties));
  }

  // Store class reference in global class registry
  qx.Bootstrap.$$registry[className] = clazz;

  return clazz;
}

function _extend(className, config)
{
  const           type = config.type || "class";
  const           superclass = config.extend || Object;
  const           properties = config.properties;
  const           customProxyHandler = config.proxyHandler;
  let             allProperties = superclass.$$allProperties || {};
  let             initFunctions = [];
  let             subclass;

  if (config.construct)
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
    // then it's not allowed by the spec to be a constructor. We must wrap it.
    //
    subclass = function(...args)
    {
      return config.construct.apply(this, args);
    };
  }
  else if (config.type == "static")
  {
    subclass = function()
    {
      throw new Error(
        `${className}: can not instantiate a static class`);
    };
  }
  else
  {
    // It's a normal class but no constructor was provided. Create one
    // that simply calls the superclass constructor, if one is available
    subclass = function(...args)
    {
      // // Locate and call the most recent constructor in the prototype chain
      // if (this.$$constructor)
      // {
      //   // Allow recursion to use next constructor in prototype chain
      //   let constructor = this.$$constructor;
      //   this.$$constructor = null;

      //   // Call the most recent superclass constructor
      //   constructor.apply(this, args);

      //   // Restore record of most recent constructor
      //   this.$$constructor = constructor;
      // }

      superclass.call(this, ...args);
    };
  }

  // Ensure there are no properties defined that overwrite
  // superclasses' properties, unless "refine : true" is specified.
  // For now, we allow a property to be entirely overwritten if refine: true
  // is specified.
  for (let property in properties)
  {
    if (property in allProperties && ! properties[property].refine)
    {
      throw new Error(
        `Overwriting property "${property}" without "refine: true"`);
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
  subclass.constructor = subclass; // point to self
  subclass.classname = className;

  // If its class type was specified, save it
  if (config.type)
  {
    subclass.$$classtype = config.type;
  }

  // Provide access to the superclass for base calls
  subclass.base = superclass;

  // But if the constructor was wrapped, above...
  if (config.construct)
  {
    // ... then we need to point to the superclass from it, too, so
    // that `base()` calls work
    config.construct.base = subclass.base;
  }

  // Some internals require that `superclass` be defined too
  subclass.superclass = superclass;

  // Create the subclass' prototype as a copy of the superclass' prototype
  subclass.prototype = Object.create(superclass.prototype);
  subclass.prototype.constructor = subclass;

  if (qx.$$BOOTSTRAPPING || typeof PROXY_TESTS != "undefined")
  {
    subclass.prototype.base = qx.Bootstrap.base;
  }

  // The top-most $$constructor in the prototype chain is the one to call
  if (config.construct)
  {
    Object.defineProperty(
      subclass.prototype,
      "$$constructor",
      {
        value        : subclass,
        writable     : true,
        configurable : true,
        enumerable   : false
      });
  }

  // Save this object's properties
  Object.defineProperty(
    subclass,
    "$$properties",
    {
      value        : properties || {},
      writable     : false,
      configurable : false,
      enumerable   : false
    });

  // Save the full chain of properties for this class
  allProperties = Object.assign({}, allProperties, properties || {});
  Object.defineProperty(
    subclass,
    "$$allProperties",
    {
      value        : allProperties,
      writable     : false,
      configurable : false,
      enumerable   : false
    });

  // Save any init functions that need to be called upon instantiation
  Object.defineProperty(
    subclass,
    "$$initFunctions",
    {
      value        : initFunctions,
      writable     : false,
      configurable : false,
      enumerable   : false
    });

  // Proxy the subclass so we can watch for property changes
  subclass.prototype.constructor = new Proxy(
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
              let             property = subclass.$$allProperties[prop];
              let             tracker = {};
              const           storage =
                property && property.storage
                    ? property.storage
                    : qx.core.propertystorage.Default; // for member var setter

              // Is this a property?
              if (property)
              {
                if (property.immutable == "readonly")
                {
                  throw new Error(
                    `Attempt to set value of readonly property ${prop}`);
                }
                // We can handle a group property by simply calling its setter
                if (property.group)
                {
                  let           propertyFirstUp = qx.Bootstrap.firstUp(prop);

                  obj[`set${propertyFirstUp}`](value);
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
                    value = property.transform.call(obj, value, old);
                  }
                  else // otherwise it's a string
                  {
                    value = obj[property.transform].call(obj, value, old);
                  }
                }

                // Does it have a check to be done? If nullable and
                // the value is null, we don't run the check
                if (property.check)
                {
                  // If the property is nullable and the value is null...
                  if (property.nullable && value === null)
                  {
                    // ... then we don't do the check
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
                    if (! property.check(value))
                    {
                      throw new Error(
                        `${prop}: ` +
                          `Check function indicates wrong type value; ` +
                          `value=${value}`);
                    }
                  }
                  else if (Array.isArray(property.check))
                  {
                    qx.core.Assert.assertInArray(
                      value,
                      property.check,
                      "Expected value to be one of: [" + property.check + "]");
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
                          qx.Class.getByName(property.check),
                          "Expected value to implement " + property.check);
                    }
                    else
                    {
                      // Next  try to parse the check string as JSDoc
                      let             bJSDocParsed = false;
                      try
                      {
                        const           { parse } = require("jsdoctypeparser");
                        const           ast = parse(property.check);

                        // Temporarily, while we don't yet support
                        // checks based on the jsdoc AST, flag whether
                        // we successfully parsed the type. If so, we'll
                        // stop the check when the error is thrown by
                        // _checkValueAgainstJSdocAST(); If not, we
                        // want to fall through to additional checks.
                        bJSDocParsed = true;
                        _checkValueAgainstJSdocAST(
                          prop, value, ast, property.check);
                      }
                      catch(e)
                      {
                        // If we successfully parsed, rethrow the check error
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

                      // JSDoc parsing failed, so try executing the
                      // string as a function
                      let             fCheck;
                      try
                      {
                        fCheck = new Function(
                          "value", `return (${property.check});`);
                      }
                      catch(e)
                      {
                        throw new Error(
                          `${prop}: ` +
                            `Error running check: ${property.check}`, e);
                      }

                      if (! fCheck(value))
                      {
                        throw new Error(
                          `${prop}: ` +
                            `Check code indicates wrong type value; ` +
                            `value=${value}`);
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
                  // It does. Call it. It throws an error on validation failure
                  if (typeof property.validate == "function")
                  {
                    property.validate.call(obj, value);
                  }
                  else // otherwise it's a string
                  {
                    obj[property.validate].call(obj, value);
                  }
                }

                // Does it a synchronous method with an apply method?
                // (Async properties' apply method is called directly from
                // setPropertyNameAsync() )
                if (property.apply &&
                    ! property.async &&
                    ! property.isEqual(value, old))
                {
                  // It does. Call it.
                  if (typeof property.apply == "function")
                  {
                    property.apply.call(obj, value, old, prop);
                  }
                  else // otherwise it's a string
                  {
                    obj[property.apply].call(obj, value, old, prop);
                  }
                }

                // Are we requested to generate an event?
                if (property.event &&
                    ! property.async &&
                    ! property.isEqual(value, old))
                {
                  if (typeof PROXY_TESTS == "undefined")
                  {
                    const Reg = qx.event.Registration;

                    // Yes. Generate a sync event if needed
                    if (Reg.hasListener(obj, property.event))
                    {
                      qx.event.Utils.track(
                        tracker,
                        Reg.fireEvent(
                          obj,
                          property.event,
                          qx.event.type.Data,
                          [ value, old ]));
                    }

                    // Also generate an async event, if needed
                    if (Reg.hasListener(obj, property.event + "Async"))
                    {
                      qx.event.Utils.track(
                        tracker,
                        Reg.fireEvent(
                          obj,
                          property.event + "Async",
                          qx.event.type.Data,
                          [ qx.Promise.resolve(value), old ]));
                    }
                  }
                  else // PROXY_TESTS
                  {
                    console.log(
                      `Would generate event type ${property.event} ` +
                        `{ value: ${JSON.stringify(value)}, old: ${old} }`);
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

                // Save the (possibly updated) value
                storage.set.call(obj, prop, value);

                // Also specify that this was a user-specified value
                this[`$$user_${prop}`] = value;

                if (tracker.promise)
                {
                  return tracker.promise.then(() => value);
                }

                return value;
              }

              // If there's a custom proxy handler, call it
              if (customProxyHandler && customProxyHandler.set)
              {
                customProxyHandler.set(obj, prop, value);
                return true;
              }

              // Require that members be declared in the "members"
              // section of the configuration passed to qx.Class.define
              if (! (prop in obj))
              {
                if (! prop.startsWith("$$"))
                {
                  if (! undeclared[obj.constructor.classname])
                  {
                    undeclared[obj.constructor.classname] = {};
                  }

                  if (! undeclared[obj.constructor.classname][prop])
                  {
                    console.error(
                      "Warning: member not declared: " +
                        `${obj.constructor.classname}: ${prop}`);
                      // `In class '${obj.constructor.classname}', ` +
                      //   `an attempt was made to  write to '${prop}' ` +
                      //   "which is not declared in the 'members' section " +
                      //   "of the configuration passed to qx.Class.define.");

                    undeclared[obj.constructor.classname][prop] = true;
                  }
                }
              }

              storage.set.call(obj, prop, value);
              return true;
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
          });

        this.apply(target, proxy, args);
        return proxy;
      },

      apply : function(target, _this, args)
      {
        // Call the constructor
        subclass.apply(_this, args);
      }
    });

  return subclass.prototype.constructor;
}

/**
 * Removes a class from qooxdoo defined by {@link #define}
 *
 * @param name {String}
 *   Name of the class
 */
function undefine(name)
{
  // Delete the class from the registry
  delete qx.Bootstrap.$$registry[name];

  // Delete the class' property descriptors
  qx.core.PropertyDescriptorRegistry.unregister(name);

  // Delete the class reference from the namespaces and all empty namespaces
  let ns = name.split(".");

  // Build up an array containing all namespace objects including window
  let objects = [window];
  for (let i = 0; i < ns.length; i++)
  {
    objects.push(objects[i][ns[i]]);
  }

  // go through all objects and check for the constructor or empty namespaces
  for (let i = objects.length - 1; i >= 1; i--)
  {
    var last = objects[i];
    var parent = objects[i - 1];
    if (
      // The class being undefined, but parent classes in case it is a
      // nested class that is being undefined
      (i == objects.length - 1 && qx.Bootstrap.isFunction(last)) ||
        qx.Bootstrap.objectGetLength(last) === 0)
    {
      delete parent[ns[i - 1]];
    }
    else
    {
      break;
    }
  }
}


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
function addMembers(clazz, members, patch)
{
  for (let key in members)
  {
    let             member = members[key];
    let             proto = clazz.prototype;

    if (qx.core.Environment.get("qx.debug"))
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
            `Overwriting private member ${key} of Class ${clazz.classname} ` +
              "is not allowed");
        }

        if (patch !== true && proto.hasOwnProperty(key))
        {
          throw new Error(
            `Overwriting member ${key} of Class ${clazz.classame} ` +
              "is not allowed");
        }
      }
    }

    // Annotations are not members
    if (key.charAt(0) === "@")
    {
      let annoKey = key.substring(1);
      if (member[annoKey] === undefined)
      {
        // An annotation for a superclass' member
        _attachAnno(clazz, "members", annoKey, member[key]);
      }

      continue;
    }

    if (typeof member == "function")
    {
      // Allow easily identifying this method
      qx.Bootstrap.setDisplayName(member, clazz.classname, key);

      if (qx.core.Environment.get("qx.aspects"))
      {
        member = qx.core.Aspect.wrap(clazz.classname, member, key);
      }

      // Allow base calls
      if (key in clazz.prototype)
      {
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
        writable     : true,
        configurable : true,
        enumerable   : true
      });

    // Attach annotations
    _attachAnno(clazz, "members", key, members["@" + key]);
  }
}

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
 *   Overwrite property with the limitations of a property which means you are
 *   able to refine but not to replace (esp. for new properties)
 */
function addProperties(clazz, properties, patch)
{
  let groupProperties = {};
  for (let key in properties)
  {
    let             get;
    let             apply;
    let             property = properties[key];
    let             propertyFirstUp = qx.Bootstrap.firstUp(key);
    let             storage;

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

    if (qx.core.Environment.get("qx.debug"))
    {
      // FIXME: change this to a test for that the specied storage implements
      // qx.core.propertystorage.IStorage
      if (typeof property.storage.init != "function" ||
          typeof property.storage.get != "function" ||
          typeof property.storage.set != "function" ||
          typeof property.storage.dereference != "function")
      {
        throw new Error(
          `${key}: ` +
            "property storage does not implement " +
            "qx.core.propertystorage.IStorage");
      }
    }

    storage = property.storage;

    // Initialize the property
    storage.init(key, Object.assign({}, property), clazz);

    // We always generate an event. If the event name isn't specified,
    // use the default name
    property.event = property.event || `change${propertyFirstUp}`;

    // There are three values that may be used when `resetProperty` is called:
    // - the user-assigned value
    // - a theme's value (if the property is themeable)
    // - an inherited value (if the property is inheritable)
    //
    // Create the legacy names for these values, which are used at
    // various places in and around the qooxdoo framework code.

    // user-specified
    patch && delete clazz.prototype[`$$user_${key}`];
    Object.defineProperty(
      clazz.prototype,
      `$$user_${key}`,
      {
        value        : undefined,
        writable     : true,
        configurable : false,
        enumerable   : false
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
          writable     : true,
          configurable : false,
          enumerable   : false
        });
    }

    // inheritable
    if (property.inheritable)
    {
      patch && delete clazz.prototype[`$$inherit_${key}`];
      Object.defineProperty(
        clazz.prototype,
        `$$inherit_${key}`,
        {
          value        : undefined,
          writable     : true,
          configurable : false,
          enumerable   : false
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
        typeof property.initFunction == "function")
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
    Object.defineProperty(
      clazz.prototype,
      `get${propertyFirstUp}`,
      {
        value        : propertyDescriptor.get,
        writable     : false,
        configurable : true,
        enumerable   : false
      });

    // Create the legacy property setter, setPropertyName.
    patch && delete clazz.prototype[`set${propertyFirstUp}`];
    Object.defineProperty(
      clazz.prototype,
      `set${propertyFirstUp}`,
      {
        value        : propertyDescriptor.set,
        writable     : false,
        configurable : true,
        enumerable   : false
      });

    // Create this property's resetProperty method
    patch && delete clazz.prototype[`reset${propertyFirstUp}`];
    Object.defineProperty(
      clazz.prototype,
      `reset${propertyFirstUp}`,
      {
        value        : propertyDescriptor.reset,
        writable     : false,
        configurable : true,
        enumerable   : false
      });

    if (property.inheritable)
    {
      // Create this property's refreshProperty method
      patch && delete clazz.prototype[`refresh${propertyFirstUp}`];
      Object.defineProperty(
        clazz.prototype,
        `refresh${propertyFirstUp}`,
        {
          value        : propertyDescriptor.refresh,
          writable     : false,
          configurable : true,
          enumerable   : false
        });
    }

    if (property.themeable)
    {
      // Create this property's setThemedProperty method
      patch && delete clazz.prototype[`setThemed${propertyFirstUp}`];
      Object.defineProperty(
        clazz.prototype,
        `setThemed${propertyFirstUp}`,
        {
          value        : propertyDescriptor.setThemed,
          writable     : false,
          configurable : true,
          enumerable   : false
        });

      // Create this property's resetThemedProperty method
      patch && delete clazz.prototype[`resetThemed${propertyFirstUp}`];
      Object.defineProperty(
        clazz.prototype,
        `resetThemed${propertyFirstUp}`,
        {
          value        : propertyDescriptor.resetThemed,
          writable     : false,
          configurable : true,
          enumerable   : false
        });
    }

    // If there's an init or initFunction handler, ...
    if (typeof property.init != "undefined" ||
        typeof property.initFunction == "function")
    {
      // ... then create initPropertyName
      patch && delete clazz.prototype[`init${propertyFirstUp}`];
      Object.defineProperty(
        clazz.prototype,
        `init${propertyFirstUp}`,
        {
          value        : propertyDescriptor.init,
          writable     : false,
          configurable : true,
          enumerable   : false
        });
    }

    // If this is a boolean, as indicated by check : "Boolean" ...
    if (property.check == "Boolean")
    {
      // ... then create isPropertyName and togglePropertyName
      patch && delete clazz.prototype[`is${propertyFirstUp}`];
      Object.defineProperty(
        clazz.prototype,
        `is${propertyFirstUp}`,
        {
          value        : propertyDescriptor.is,
          writable     : false,
          configurable : true,
          enumerable   : false
        });

      patch && delete clazz.prototype[`toggle${propertyFirstUp}`];
      Object.defineProperty(
        clazz.prototype,
        `toggle${propertyFirstUp}`,
        {
          value        : propertyDescriptor.toggle,
          writable     : false,
          configurable : true,
          enumerable   : false
        });
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
          writable     : true,
          configurable : true,
          enumerable   : false
        });

      // Create a function that tells the user whether there is still
      // an active async setter running
      patch && delete clazz.prototype[`isAsyncSetActive${propertyFirstUp}`];
      Object.defineProperty(
        clazz.prototype,
        `isAsyncSetActive${propertyFirstUp}`,
        {
          value        : propertyDescriptor.isAsyncSetActive,
          writable     : false,
          configurable : true,
          enumerable   : false
        });

      // Create the async property getter, getPropertyNameAsync
      patch && delete clazz.prototype[`get${propertyFirstUp}Async`];
      Object.defineProperty(
        clazz.prototype,
        `get${propertyFirstUp}Async`,
        {
          value        : propertyDescriptor.getAsync,
          writable     : false,
          configurable : true,
          enumerable   : false
        });

      // Create the async property setter, setPropertyNameAsync.
      patch && delete clazz.prototype[`set${propertyFirstUp}Async`];
      Object.defineProperty(
        clazz.prototype,
        `set${propertyFirstUp}Async`,
        {
          value        : propertyDescriptor.setAsync,
          writable     : false,
          configurable : true,
          enumerable   : false
        });
    }

    // Add the event name for this property to the list of events
    // fired by this class
    let eventName = property.event;
    let events =
        {
          [eventName] : "qx.event.type.Data"
        };
    addEvents(clazz, events, true);

    // Add annotations
    _attachAnno(clazz, "properties", key, property["@"]);

    // Add this property to the property maps
    clazz.$$properties[key] = properties[key];
    clazz.$$allProperties[key] = properties[key];
  }

  // Now handle the group properties we skipped while processing properties
  for (let key in groupProperties)
  {
    let             property = groupProperties[key];
    let             propertyFirstUp = qx.Bootstrap.firstUp(key);
    let             allProperties = clazz.$$allProperties;

    if (qx.core.Environment.get("qx.debug"))
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
    Object.defineProperty(
      clazz.prototype,
      `set${propertyFirstUp}`,
      {
        value        : propertyDescriptor.set,
        writable     : false,
        configurable : true,
        enumerable   : false
      });

    // Create the property setter, setPropertyName.
    patch && delete clazz.prototype[`reset${propertyFirstUp}`];
    Object.defineProperty(
      clazz.prototype,
      `reset${propertyFirstUp}`,
      {
        value        : propertyDescriptor.reset,
        writable     : false,
        configurable : true,
        enumerable   : false
      });

    // If group is themeable, add the styler and unstyler
    if (property.themeable)
    {
      patch && delete clazz.prototype[`setThemed${propertyFirstUp}`];
      Object.defineProperty(
        clazz.prototype,
        `setThemed${propertyFirstUp}`,
        {
          value        : propertyDescriptor.setThemed,
          writable     : false,
          configurable : true,
          enumerable   : false
        });

      patch && delete clazz.prototype[`resetThemed${propertyFirstUp}`];
      Object.defineProperty(
        clazz.prototype,
        `resetThemed${propertyFirstUp}`,
        {
          value        : propertyDescriptor.resetThemed,
          writable     : false,
          configurable : true,
          enumerable   : false
        });
    }

    // Add this property to the property maps
    clazz.$$properties[key] = properties[key];
    clazz.$$allProperties[key] = properties[key];
  }
}

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
function addEvents(clazz, events, patch)
{
  let             key;

  if (qx.core.Environment.get("qx.debug"))
  {
    if (typeof events !== "object" ||
        qx.Bootstrap.getClass(events) === "Array")
    {
      throw new Error(
        clazz.classname + ": the events must be defined as map!");
    }

    for (key in events)
    {
      if (typeof events[key] !== "string")
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
}

// Dummy function addMixin. This one is never called, as no class
// defined with qx.Bootstrap.define() has any mixins. The real one is
// defined in qx.Class
function addMixin()
{
  throw new Error("qx.Bootstrap.addMixin called; should not have been");
}

// Dummy function addInterface. This one is never called, as no class
// defined with qx.Bootstrap.define() has any interfaces. The real one is
// defined in qx.Class
function addInterface()
{
  throw new Error("qx.Bootstrap.addInterface called; should not have been");
}

/**
 * This method will be attached to all classes to return a nice
 * identifier for them.
 *
 * @internal
 * @signature function()
 * @return {String} The class identifier
 */
function genericToString()
{
  return `[Class ${this.classname}]`;
}

function createNamespace(name, object)
{
  var splits = name.split(".");
  var part = splits[0];
  var parent =
    qx.$$namespaceRoot && qx.$$namespaceRoot[part]
      ? qx.$$namespaceRoot
      : window;

  for (var i = 0, len = splits.length - 1;
       i < len;
       i++, part = splits[i])
  {
    if (!parent[part])
    {
      parent = parent[part] = {};
    }
    else
    {
      parent = parent[part];
    }
  }

  // store object
  parent[part] = object;

  // return last part name (e.g. classname)
  return part;
}

/**
 * Offers the ability to change the root for creating namespaces from
 * window to whatever object is given.
 *
 * @param root {Object}
 *   The root to use.
 *
 * @internal
 */
function setRoot(root)
{
  qx.$$namespaceRoot = root;
}

function getDisplayName(f)
{
  return f.$$displayName || "<non-qooxdoo>";
}

function setDisplayName(f, classname, name)
{
  if (name)
  {
    f.$$displayName = `${classname}.${name}()`;
  }
  else
  {
    f.$$displayName = `${classname}()`;
  }
}

function setDisplayNames(functionMap, classname)
{
  for (let name in functionMap)
  {
    let f = functionMap[name];

    if (f instanceof Function)
    {
      f.$$displayName = `${classname}.${f.name || name}()`;
    }
  }
}

function base(args, varargs)
{
  if (qx.Bootstrap.DEBUG)
  {
    if (typeof args.callee.base != "function")
    {
      throw new Error(
        "Cannot call super class. Method is not derived: " +
          qx.Bootstrap.getDisplayName(args.callee));
    }
  }

  if (arguments.length === 1)
  {
    return args.callee.base.call(this);
  }
  else
  {
    return args.callee.base.apply(
      this,
      Array.prototype.slice.call(arguments, 1)
    );
  }
}

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
function bind(func, self, varargs)
{
    var fixedArgs = Array.prototype.slice.call(arguments, 2);
    return func.bind(self, ...fixedArgs);
}

/**
 * Helper method to handle singletons
 *
 * @return {Object}
 *   The singleton instance
 *
 * @internal
 */
function getInstance()
{
  if (this.$$instance === null)
  {
    throw new Error(
      "Singleton instance of " +
        this +
        " is requested, but not ready yet. This is most likely due" +
        " to a recursive call in the constructor path."
    );
  }

  if (!this.$$instance)
  {
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
}

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
function getClass(value)
{
  // The typeof null and undefined is "object" under IE8
  if (value === undefined)
  {
    return "Undefined";
  }
  else if (value === null)
  {
    return "Null";
  }

  let classString = Object.prototype.toString.call(value);
  return (
    qx.Bootstrap._classToTypeMap[classString] || classString.slice(8, -1)
  );
}

/**
 * Find a class by its name
 *
 * @param name {String}
 *   class name to resolve
 *
 * @return {Class}
 *   The class
 */
function getByName(name)
{
  return qx.Bootstrap.$$registry[name];
}


/**
 * Whether the value is a string.
 *
 * @param value {var}
 *   Value to check.
 *
 * @return {Boolean}
 *   Whether the value is a string.
 */
function isString(value) {
  // Added "value !== null" because IE throws an exception "Object expected"
  // by executing "value instanceof String" if value is a DOM element that
  // doesn't exist. It seems that there is an internal difference between a
  // JavaScript null and a null returned from calling DOM.
  // e.q. by document.getElementById("ReturnedNull").
  return (
    value !== null &&
    (typeof value === "string" ||
      qx.Bootstrap.getClass(value) === "String" ||
      value instanceof String ||
      (!!value && !!value.$$isString))
  );
}

/**
 * Whether the value is an array.
 *
 * @param value {var} Value to check.
 * @return {Boolean} Whether the value is an array.
 */
function isArray(value)
{
  // Added "value !== null" because IE throws an exception "Object expected"
  // by executing "value instanceof Array" if value is a DOM element that
  // doesn't exist. It seems that there is an internal difference between a
  // JavaScript null and a null returned from calling DOM.
  // e.q. by document.getElementById("ReturnedNull").
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

/**
 * Whether the value is an object. Note that built-in types like Window are
 * not reported to be objects.
 *
 * @param value {var} Value to check.
 * @return {Boolean} Whether the value is an object.
 */
function isObject(value)
{
  return (
    value !== undefined &&
    value !== null &&
    qx.Bootstrap.getClass(value) === "Object"
  );
}

/**
 * Whether the value is a function.
 *
 * @param value {var} Value to check.
 * @return {Boolean} Whether the value is a function.
 */
function isFunction(value)
{
  return qx.Bootstrap.getClass(value) === "Function";
}

/**
 * Whether the value is a function or an async function.
 *
 * @param value {var} Value to check.
 * @return {Boolean} Whether the value is a function.
 */
function isFunctionOrAsyncFunction(value)
{
  var name = qx.Bootstrap.getClass(value);
  return name === "Function" || name === "AsyncFunction";
}

/**
 * Tests whether an object is an instance of qx.core.Object without
 * using instanceof - this is only for certain low level instances
 * which would otherwise cause a circular, load time dependency
 *
 * @param object {Object?} the object to test
 * @return {Boolean} true if object is an instance of qx.core.Object
 */
function isQxCoreObject(object)
{
  if (object === object.constructor)
  {
    return false;
  }

  let clz = object.constructor;
  while (clz)
  {
    if (clz.classname === "qx.core.Object")
    {
      return true;
    }
    clz = clz.superclass;
  }

  return false;
}

/**
 * Convert the first character of the string to upper case.
 *
 * @param str {String} the string
 * @return {String} the string with an upper case first character
 */
function firstUp(str)
{
  return str.charAt(0).toUpperCase() + str.substr(1);
}

/**
 * Convert the first character of the string to lower case.
 *
 * @param str {String} the string
 * @return {String} the string with a lower case first character
 */
function firstLow(str)
{
  return str.charAt(0).toLowerCase() + str.substr(1);
}

/**
 * Attaches an annotation to a class
 *
 * @param clazz {Map} Static methods or fields
 * @param group {String} Group name
 * @param key {String} Name of the annotated item
 * @param anno {Object} Annotation object
 */
function _attachAnno(clazz, group, key, anno) {
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
}

function _validatePropertyDefinitions(className, config)
{
  let             allowedKeys;
  let             properties = config.properties || {};

  for (let prop in properties)
  {
    let             property = properties[prop];

    // Ensure they're not passing a qx.core.Object descendent as a property
    if (qx.core.Environment.get("qx.debug"))
    {
      if (qx.Bootstrap.isQxCoreObject(properties))
      {
        throw new Error(
          `${prop} in ${className}: ` +
            "Can't use qx.core.Object descendent as property");
      }
    }

    // Set allowed keys based on whether this is a grouped property or not
    allowedKeys = property.group ? $$allowedPropGroupKeys : $$allowedPropKeys;

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
        if (key in $$deprecatedPropKeys)
        {
          console.warn(`Property '${prop}': ${$$deprecatedPropKeys[key]}`);
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
}

function _checkValueAgainstJSdocAST(prop, value, ast, check)
{
  console.log(
    `JSDoc AST of ${check}:\n` + JSON.stringify(ast, null, "  "));

  // TODO: implement this
  throw new Error(
    `${prop}: ` +
      `JSDoc type checking is not yet implemented`);
}

//
// Pull ourself up by our bootstraps!
//
qx.Bootstrap.define(
  "qx.Bootstrap",
  {
    type : "static",
    statics : Object.assign(
      {
        /** Timestamp of qooxdoo based application startup */
        LOADSTART : qx.$$start || new Date(),

        /**
         * Mapping for early use of the qx.debug environment setting.
         */
        DEBUG : (
          function()
          {
            // make sure to reflect all changes here to the environment class!
            var debug = true;
            if (qx.$$environment && qx.$$environment["qx.debug"] === false)
            {
              debug = false;
            }

            return debug;
          })(),

        /**
         * Minimal accessor API for the environment settings given from
         * the generator.
         *
         * WARNING: This method only should be used if the {@link
         * qx.core.Environment} class is not loaded!
         *
         * @param key {String}
         *   The key to get the value from.
         *
         * @return {var}
         *   The value of the setting or <code>undefined</code>.
         */
        getEnvironmentSetting : function(key)
        {
          if (qx.$$environment)
          {
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
        setEnvironmentSetting : function(key, value)
        {
          if (!qx.$$environment)
          {
            qx.$$environment = {};
          }

          if (qx.$$environment[key] === undefined)
          {
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
        addPendingDefer(clazz, cb)
        {
          if (qx.$$loader && qx.$$loader.delayDefer)
          {
            this.__pendingDefers.push(clazz);
            clazz.$$pendingDefer = cb;
          }
          else
          {
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
        executePendingDefers(dbClassInfo)
        {
          let execute;
          let executeForDbClassInfo;
          let executeForClassName;
          let getByName;

          execute = function (clazz)
          {
            let cb = clazz.$$pendingDefer;
            if (cb)
            {
              delete clazz.$$pendingDefer;
              clazz.$$deferComplete = true;
              cb.call(clazz);
            }
          };

          executeForDbClassInfo = function (dbClassInfo)
          {
            if (dbClassInfo.environment)
            {
              let required = dbClassInfo.environment.required;
              if (required) {
                for (let key in required)
                {
                  let info = required[key];
                  if (info.load && info.className)
                  {
                    executeForClassName(info.className);
                  }
                }
              }
            }

            for (let key in dbClassInfo.dependsOn)
            {
              let depInfo = dbClassInfo.dependsOn[key];
              if (depInfo.require || depInfo.usage === "dynamic")
              {
                executeForClassName(key);
              }
            }
          };

          executeForClassName = function (className)
          {
            let clazz = getByName(className);
            if (! clazz)
            {
              return;
            }
            
            if (clazz.$$deferComplete)
            {
              return;
            }
            let dbClassInfo = clazz.$$dbClassInfo;
            if (dbClassInfo)
            {
              executeForDbClassInfo(dbClassInfo);
            }
            execute(clazz);
          };

          getByName = function (name)
          {
            let clazz = qx.Bootstrap.getByName(name);
            if (! clazz)
            {
              let splits = name.split(".");
              let part = splits[0];
              let root =
                qx.$$namespaceRoot && qx.$$namespaceRoot[part]
                  ? qx.$$namespaceRoot
                  : window;
              let tmp = root;

              for (let i = 0, len = splits.length - 1;
                  tmp && i < len;
                   i++, part = splits[i])
              {
                tmp = tmp[part];
              }
              if (tmp != root)
              {
                clazz = tmp;
              }
            }
            return clazz;
          };

          if (! dbClassInfo)
          {
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
        objectGetLength(map)
        {
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
        objectMergeWith(target, source, overwrite)
        {
          if (overwrite === undefined) {
            overwrite = true;
          }

          for (let key in source)
          {
            if (overwrite || target[key] === undefined)
            {
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
            if (map === null ||
                (typeof map !== "object" && typeof map !== "function"))
            {
              throw new TypeError(
                "Object.keys requires an object as argument.");
            }

            let arr = [];
            let hasOwnProperty = Object.prototype.hasOwnProperty;
            for (let key in map)
            {
              if (hasOwnProperty.call(map, key))
              {
                arr.push(key);
              }
            }

            // IE does not return "shadowed" keys even if they are
            // defined directly in the object. This is incompatible
            // with the ECMA standard!! This is why this checks are
            // needed.
            var shadowedKeys = qx.Bootstrap._shadowedKeys;
            for (let i = 0, a = shadowedKeys, l = a.length; i < l; i++)
            {
              if (hasOwnProperty.call(map, a[i]))
              {
                arr.push(a[i]);
              }
            }

            return arr;
          },

          default(map)
          {
            if (map === null ||
                (typeof map !== "object" && typeof map !== "function"))
            {
              throw new TypeError(
                "Object.keys requires an object as argument.");
            }

            let arr = [];

            let hasOwnProperty = Object.prototype.hasOwnProperty;
            for (let key in map)
            {
              if (hasOwnProperty.call(map, key))
              {
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
        trace(object) {},

        undefine,
        firstLow,
        addMembers,
        addProperties,
        addEvents,
        bind
      },
      qx.Bootstrap)
  });
