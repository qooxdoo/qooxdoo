/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2023-24 Zenesis Limited (https://www.zenesis.com)

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (github.com/johnspackman)

************************************************************************ */

/**
 * Property implementation for actual properties
 *
 * TODO:
 *
 * `validate` implementation
 * `delegate` implementation
 * `inheritable` implementation (pass onto `obj._getChildren`; check for special `inherit` value)
 * Array check
 * FunctionCheck
 *
 * how does init of property values work?  `init` per class and `initFunction` per instance?
 *
 */
qx.Bootstrap.define("qx.core.property.Property", {
  //extend: Object,
  implement: qx.core.property.IProperty,

  construct(propertyName, clazz) {
    //super();
    this.__propertyName = propertyName;
    this.__clazz = clazz;
  },

  environment: {
    /**
     * @deprecated Changing this setting is deprecated.
     * If set to true, then getting a property that is inheritable but has nothing to inherit from
     * will return null, instead of throwing an error.
     */
    "qx.core.property.Property.inheritableDefaultIsNull": false,
    /**
     * If set to true, then properties with init values will have their apply method called during construction.
     */
    "qx.core.property.Property.applyDuringConstruct": true,

    /**
     * Only relevant when applyDuringConstruct is true.
     * This contains regexes matching classnames which are excluded from the auto apply behaviour.
     * They refer to concrete classes only, not the superclasses.
     *
     * @type {Array<RegExp | string>}
     */
    "qx.core.property.Property.excludeAutoApply": [/^qx\./],

    /**
     * If set to true, this enables the deprecated `deferredInit` setting in property definitions,
     * before initFunctions were introduced.
     */
    "qx.core.property.Property.allowDeferredInit": true
  },

  members: {
    /** @type{String} the name of the property */
    __propertyName: null,

    /** @type{qx.Class} the class that defined the property */
    __clazz: null,

    /** @type{Boolean} whether this is a pseudo property or not */
    __pseudoProperty: false,

    /**
     * @type{qx.Class} the class that original defined this property, before it was cloned and
     * refined for the current `__clazz`
     */
    __superClass: null,

    /** @type{Object} the original definition */
    __definition: null,

    /** @type{qx.core.property.IPropertyStorage} the storage implementation */
    __storage: null,

    /** @type{Boolean} whether the property can be set */
    __readOnly: false,

    /** @type{Function|String?} the method called to validate incoming values, or the name of the function to call */
    __validate: null,

    /** @type{Function|String?} the apply method or name of the method */
    __apply: null,

    /** @type{Function?} the transform method or name of the transform method */
    __transform: null,

    /** @type{String} the name of the change event */
    __eventName: null,

    /** @type{*} the init value */
    __initValue: undefined,

    /** @type{*} the init function used to get the init value */
    __initFunction: undefined,

    /** @type{qx.core.check.Check} the check object for verifying property value compatibility */
    __check: null,

    /** @type{Function?} the function to test for equality */
    __isEqual: null,

    /** @type{qx.Annotation[]?null} any annotations */
    __annotations: null,

    /** @type{Boolean} whether the property needs to be dereferenced */
    __needsDereference: false,

    isRefineAllowed(def) {},

    /**
     * Configures a pseudo property
     */
    configurePseudoProperty() {
      this.__definition = null;
      this.__pseudoProperty = true;
      let upname = qx.Bootstrap.firstUp(this.__propertyName);
      this.__eventName = qx.Class.hasMixin(this.__clazz, qx.core.MEvent) ? "change" + upname : null;
      this.__storage = new qx.core.property.PseudoPropertyStorage(this, this.__clazz);
      this.__readOnly = this.__clazz.prototype["set" + upname] === undefined;
    },

    /**
     * @Override
     */
    configure(def) {
      let upname = qx.Bootstrap.firstUp(this.__propertyName);
      let methodNames = {};
      for (let tmp = this.__clazz; tmp; tmp = tmp.superclass) {
        for (let methodName in tmp.prototype) {
          if (typeof tmp.prototype[methodName] == "function") {
            methodNames[methodName] = tmp.prototype[methodName];
          }
        }
      }

      // Auto detect the property definition from a type name
      if (typeof def == "string") {
        def = {
          check: def
        };
        let applyName = "apply" + upname;
        if (typeof methodNames[applyName] == "function") {
          def.apply = applyName;
        } else {
          applyName = "_" + applyName;
          if (typeof methodNames[applyName] == "function") {
            def.apply = applyName;
          } else {
            applyName = "_" + applyName;
            if (typeof methodNames[applyName] == "function") {
              def.apply = applyName;
            }
          }
        }
        if (typeof methodNames["transform" + upname] == "function") {
          def.transform = "transform" + upname;
        } else if (typeof methodNames["_transform" + upname] == "function") {
          def.transform = "_transform" + upname;
        } else if (typeof methodNames["__transform" + upname] == "function") {
          def.transform = "__transform" + upname;
        }
      }
      this.__definition = def;

      // Figure out the storage implementation
      if (def.storage) {
        if (qx.Class.hasInterface(def.storage.constructor, qx.core.property.IPropertyStorage)) {
          this.__storage = def.storage;
        } else {
          this.__storage = new def.storage();
        }
      } else {
        if (def.immutable == "replace") {
          if (def.check == "Array") {
            this.__storage = qx.core.property.PropertyStorageFactory.getStorage(qx.core.property.ImmutableArrayStorage);
          } else if (def.check == "Object") {
            this.__storage = qx.core.property.PropertyStorageFactory.getStorage(qx.core.property.ImmutableObjectStorage);
          } else if (def.check == "qx.data.Array") {
            this.__storage = qx.core.property.PropertyStorageFactory.getStorage(qx.core.property.ImmutableDataArrayStorage);
          } else {
            throw new Error(
              `${this}: ` + "only `check : 'Array'` and `check : 'Object'` " + "properties may have `immutable : 'replace'`."
            );
          }
        } else {
          if (typeof def.get == "function" || typeof def.getAsync == "function") {
            this.__storage = new qx.core.property.ExplicitPropertyStorage(this, this.__clazz);
          } else {
            this.__storage = qx.core.property.PropertyStorageFactory.getStorage(qx.core.property.SimplePropertyStorage);
          }
        }
      }

      const getFunction = (value, description) => {
        if (!value) {
          return null;
        }
        if (typeof value == "function") {
          return value;
        }
        if (typeof value == "string") {
          if (value.match(/^[a-z0-9_]+$/i)) {
            return value;
          }
          return new Function(def.apply);
        }
        throw new Error(`${this}: ${description} method ` + value + " is invalid");
      };

      this.__apply = getFunction(def.apply, "Apply") || this.__apply;
      this.__transform = getFunction(def.transform, "Transform") || this.__transform;
      this.__validate = getFunction(def.validate, "Validate") || this.__validate;
      this.__readOnly =
        def.immutable === "readonly" || (this.__storage.classname === "qx.core.property.ExplicitPropertyStorage" && !def.set);

      if (def.event !== undefined) {
        this.__eventName = def.event;
        if (qx.core.Environment.get("qx.debug")) {
          if (!qx.Class.hasMixin(this.__clazz, qx.core.MEvent)) {
            this.warn(
              `Property ${this} has event "${this.__eventName}" but the class ${this.__clazz.classname} does not implement qx.core.MEvent, so event will not be fired.`
            );
          }
        }
      } else {
        this.__eventName = qx.Class.hasMixin(this.__clazz, qx.core.MEvent) ? "change" + qx.Bootstrap.firstUp(this.__propertyName) : null;
      }

      if (def.isEqual) {
        if (def.isEqual instanceof Function) {
          this.__isEqual = def.isEqual;
        } else if (typeof def.isEqual == "string") {
          if (methodNames[def.isEqual]) {
            this.__isEqual = methodNames[def.isEqual];
          } else {
            this.__isEqual = new Function("a", "b", "return " + def.isEqual);
          }
        }
      }

      if (def.init !== undefined) {
        this.__initValue = def.init;
      }
      if (def.initFunction) {
        this.__initFunction = def.initFunction;
      }

      if (qx.core.Environment.get("qx.debug")) {
        if (def.deferredInit) {
          if (qx.core.Environment.get("qx.core.property.Property.allowDeferredInit")) {
            // this.warn(`${this}: deferredInit is deprecated, use initFunction instead`);
          } else {
            throw new Error(`${this}: deferredInit is not allowed, set qx.core.property.Property.allowDeferredInit to true to allow it`);
          }
        }
      }

      if ((def.init !== undefined || def.initFunction) && def.deferredInit) {
        this.error(`${this}: init/initFunction and deferredInit are mutually exclusive, ignoring deferredInit`);
        delete def.deferredInit;
      }
      this.__needsDereference = def.dereference;

      let newCheck = null;

      if (typeof def.check == "function") {
        newCheck = new qx.core.check.SimpleCheck(def.check, !!def.nullable, false);
      } else if (def.check) {
        newCheck = qx.core.check.CheckFactory.getInstance().getCheck(def.check || "any", !!def.nullable);
        if (newCheck && def.nullable && !newCheck.isNullable()) {
          newCheck = qx.core.check.CheckFactory.getInstance().getCheck((def.check || "any") + "?");
        }

        if (!newCheck && def.check instanceof String) {
          if (qx.core.Environment.get("qx.Class.futureCheckJsDoc")) {
            // Next  try to parse the check string as JSDoc
            let bJSDocParsed = false;
            try {
              newCheck = new qx.core.check.JsDocCheck(def.check, !!def.nullable);
            } catch (e) {
              // Couldn't parse JSDoc so the check string is not a JSDoc one. Fall through to next
              // possible use of the check string.
              //
              // FALL THROUGH
            }
          }

          if (!newCheck) {
            let fn = null;
            try {
              fn = new Function("value", `return (${def.check});`);
            } catch (ex) {
              throw new Error(`${this}: ` + "Error creating check function: " + `${def.check}: ` + ex);
            }
            newCheck = new qx.core.check.SimpleCheck(fn, !!def.nullable, false);
          }
        }
      }

      if (newCheck) {
        if (this.__check && !this.__check.isCompatible(newCheck)) {
          throw new Error(
            `Property ${this} has invalid check because the definition in the superclass ${this.__superClass} is not compatible`
          );
        }
        this.__check = newCheck;
      }
      if (this.__check instanceof qx.core.check.SimpleCheck) {
        this.__needsDereference = def.dereference || this.__check.needsDereference();
      }

      if (def["@"] && def["@"].length > 0) {
        this.__annotations = [...def["@"]];
      }
    },

    /**
     * @Override
     */
    clone(clazz) {
      let clone = new qx.core.property.Property(this.__propertyName);
      clone.__propertyName = this.__propertyName;
      clone.__clazz = clazz;
      clone.__superClass = this.__clazz;
      clone.__definition = this.__definition;
      clone.__storage = this.__storage;
      clone.__readOnly = this.__readOnly;
      clone.__validate = this.__validate;
      clone.__apply = this.__apply;
      clone.__transform = this.__transform;
      clone.__eventName = this.__eventName;
      clone.__initValue = this.__initValue;
      clone.__initFunction = this.__initFunction;
      clone.__check = this.__check;
      clone.__isEqual = this.__isEqual;
      clone.__annotations = this.__annotations ? qx.lang.Array.clone(this.__annotations) : null;
      clone.__needsDereference = this.__needsDereference;
      return clone;
    },

    /**
     * Called to define the property on a class prototype
     *
     * @param {qx.Class} clazz the class having the property defined
     * @param {Boolean?} patch whether patching an existing class
     */
    defineProperty(clazz, patch) {
      let propertyName = this.__propertyName;
      let scopePrefix = "";
      if (propertyName.startsWith("__")) {
        scopePrefix = "__";
        propertyName = propertyName.substring(2);
      } else if (propertyName.startsWith("_")) {
        scopePrefix = "_";
        propertyName = propertyName.substring(1);
      }
      let upname = qx.Bootstrap.firstUp(propertyName);
      let self = this;

      let proto = clazz.prototype;

      if (qx.core.Environment.get("qx.debug")) {
        if (clazz.prototype.$$superProperties[propertyName] && propertyName.charAt(0) === "_" && propertyName.charAt(1) === "_") {
          throw new Error(`Overwriting private member "${propertyName}" ` + `of Class "${clazz.classname}" ` + "is not allowed");
        }

        if (
          patch !== true &&
          (proto.hasOwnProperty(propertyName) ||
            qx.Class.objectProperties.has(propertyName) ||
            (propertyName in proto && !(propertyName in clazz.prototype.$$superProperties)))
        ) {
          throw new Error(
            `Overwriting member or property "${propertyName}" ` +
              `of Class "${clazz.classname}" ` +
              "is not allowed. " +
              "(Members and properties are in the same namespace.)"
          );
        }
      }

      const addMethod = (name, func) => {
        clazz.prototype[scopePrefix + name] = func;
        qx.Bootstrap.setDisplayName(func, clazz.classname, "prototype." + name);
      };

      // Does this property have an initFunction?
      if (this.__initFunction !== undefined) {
        clazz.prototype.$$initFunctions.push(propertyName);
      }

      let initValue = this.__initValue;
      if (initValue !== undefined) {
        clazz.prototype["$$init_" + propertyName] = initValue;
      }

      addMethod("init" + upname, function (...args) {
        self.init(this, ...args);
      });

      // theme-specified
      if (this.__definition?.themeable) {
        addMethod("getThemed" + upname, function () {
          return self.getThemed(this);
        });

        addMethod("setThemed" + upname, function (value) {
          self.setThemed(this, value);
          return value;
        });

        addMethod("resetThemed" + upname, function () {
          self.resetThemed(this);
        });
      }

      // inheritable
      if (this.__definition?.inheritable) {
        patch && delete clazz.prototype[`$$inherit_${propertyName}`];
        Object.defineProperty(clazz.prototype, `$$inherit_${propertyName}`, {
          value: undefined,
          writable: false,
          configurable: false
        });

        addMethod("refresh" + upname, function () {
          return self.refresh(this);
        });
      }

      // Native property value
      let propertyConfig = {
        get: function () {
          // When iterating a prototype, `this` will not be an instance of the class
          //  (ie `this` will be the prototype)
          if (this instanceof this.constructor) {
            return self.get(this);
          }
          return this["$$init_" + propertyName];
        },
        configurable: qx.Class.$$options.propsAccessible || false,
        enumerable: qx.Class.$$options.propsAccessible || false
      };
      propertyConfig.set = function (value) {
        self.set(this, value);
      };
      Object.defineProperty(clazz.prototype, propertyName, propertyConfig);

      if (!this.__pseudoProperty) {
        addMethod("get" + upname, function (cb) {
          if (cb) {
            if (qx.core.Environment.get("qx.debug")) {
              if (typeof cb !== "function") {
                throw new Error(`${self}: If an argument is passed into getter, it must be a callback.`);
              }
            }
            return self.getAsync(this).then(cb);
          } else {
            return self.get(this);
          }
        });
        addMethod("get" + upname + "Async", async function () {
          return await self.getAsync(this);
        });
      }

      if (this.__definition?.check === "Boolean") {
        addMethod("is" + upname, function () {
          return self.get(this);
        });
        addMethod("is" + upname + "Async", async function () {
          return await self.getAsync(this);
        });
        addMethod("toggle" + upname, function () {
          return self.set(this, !self.get(this));
        });
        addMethod("toggle" + upname + "Async", async function () {
          return await self.setAsync(this, await !self.getAsync(this));
        });
      }

      if (!this.__pseudoProperty) {
        addMethod("set" + upname, function (value) {
          self.set(this, value);
          return value;
        });
        addMethod("set" + upname + "Async", async function (value) {
          await self.setAsync(this, value);
          return value;
        });
        addMethod("reset" + upname, function () {
          self.reset(this);
        });
        addMethod("reset" + upname + "Async", function () {
          return self.resetAsync(this);
        });
      }
    },

    /**
     * Returns an object for tracking state of the property, per object instance (ie not per class)
     *
     * @param {qx.core.Object} thisObj
     * @returns {Object}
     */
    getPropertyState(thisObj) {
      if (thisObj.$$propertyState === undefined) {
        thisObj.$$propertyState = {};
      }
      let state = thisObj.$$propertyState[this.__propertyName];
      if (state === undefined) {
        state = thisObj.$$propertyState[this.__propertyName] = {};
      }
      return state;
    },

    /**
     * Initialises a property value
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     */
    init(thisObj, value) {
      let state = this.getPropertyState(thisObj);
      if (state.initMethodCalled) {
        this.warn(`${this}: init() called more than once, ignoring`);
        return;
      }
      state.initMethodCalled = true;

      if (value !== undefined && this.__definition?.init !== undefined) {
        this.warn(
          `${this}: init() called with a value, ignoring - use deferredInit and do not specify an init value in the property definition`
        );
        value = undefined;
      }
      if (value === undefined) {
        value = this.getInitValue(thisObj);
      }
      if (value === undefined) {
        throw new Error(`${this}: init() called without a value`);
      }

      if (!this.isReadOnly()) {
        this.__storage.set(thisObj, this, value);
      }
      this._setMutating(thisObj, true);
      thisObj["$$init_" + this.__propertyName] = value;

      try {
        this.__callFunction(thisObj, this.__apply, value, undefined, this.__propertyName);
        if (this.__eventName) {
          thisObj.fireDataEvent(this.__eventName, value, undefined);
        }
        this.__applyValueToInheritedChildren(thisObj);
      } finally {
        this._setMutating(thisObj, false);
      }
    },

    /**
     *
     * @returns {Boolean} whether the property has an init value provided in the definition (either a constant init value or an init function)
     */
    hasInitValue() {
      return this.__clazz.prototype["$$init_" + this.__propertyName] !== undefined || this.__initFunction !== undefined;
    },

    /**
     * Calculates the init value used by `init()` and `reset()`
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     * @returns {*}
     */
    getInitValue(thisObj) {
      let value = thisObj["$$init_" + this.__propertyName];
      if (value !== undefined) {
        return value;
      }
      if (this.__initFunction !== undefined) {
        value = this.__initFunction.call(thisObj, value, this);
        thisObj["$$init_" + this.__propertyName] = value;
      }
      return value;
    },

    /**
     * Gets a property value; will raise an error if the property is not initialized
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     * @return {*}
     */
    get(thisObj) {
      return this.__getImpl(thisObj, false);
    },

    /**
     * Gets a property value; if not initialized and the property is async, it will
     * wait for the underlying storage to resolve but will throw an error if the underlying
     * storage cannot provide a value which is not `undefined`
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     * @return {*}
     */
    async getAsync(thisObj) {
      return this.__getImpl(thisObj, false, true);
    },

    /**
     * Gets a property value; if not initialized, it will return undefined
     * @param {qx.core.Object} thisObj
     * @param {boolean?} async
     * @returns {*}
     */
    getSafe(thisObj, async = false) {
      return this.__getImpl(thisObj, true, async);
    },

    /**
     * Gets the themed value, if there is one
     *
     * @param {qx.core.Object} thisObj
     * @returns {*}
     */
    getThemed(thisObj) {
      if (this.isThemeable()) {
        let state = this.getPropertyState(thisObj);
        return state.themeValue === undefined ? null : state.themeValue;
      }
      return null;
    },

    /**
     * 
     * @returns {Function?} If this property is refined, the superclass which this overrides. 
     * Null otherwise.
     */
    getSuperClass() {
      return this._superClass;
    },

    /**
     * Sets a property value.
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     * @param {*} value the value to set
     */
    set(thisObj, value) {
      this.__setImpl(thisObj, value, "user", "set");
    },

    /**
     * Sets the theme value for the property; this will trigger an apply & change event if the
     * final value of the property changes
     *
     * @param {*} thisObj
     * @param {*} value
     */
    setThemed(thisObj, value) {
      this.__setImpl(thisObj, value, "themed", "set");
    },

    /**
     * Resets a property value
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     */
    reset(thisObj) {
      let value = this.getInitValue(thisObj);
      this.__setImpl(thisObj, value, "user", "reset");
    },

    /**
     * Resets a property value asynchronously
     * @param {qx.core.Object} thisObj
     * @returns
     */
    resetAsync(thisObj) {
      let value = this.getInitValue(thisObj);
      return this.__setImpl(thisObj, value, "user", "reset", true);
    },

    /**
     * Resets the theme value for the property; this will trigger an apply & change event if the
     * final value of the property changes
     *
     * @param {qx.core.Object} thisObj
     */
    resetThemed(thisObj) {
      this.__setImpl(thisObj, undefined, "themed", "reset");
    },

    /**
     * Detects whether the object is using a theme value or has been overridden by a user value
     *
     * @param {qx.core.Object} thisObj
     * @returns {Boolean}
     */
    isThemedValue(thisObj) {
      if (this.isThemeable()) {
        let value = this.__storage.get(thisObj, this);
        if (value === undefined) {
          let state = this.getPropertyState(thisObj);
          value = state.themeValue;
          return value !== undefined;
        }
      }
      return false;
    },

    deleteThemeValue(thisObj) {
      let state = this.getPropertyState(thisObj);
      delete state.themeValue;
    },

    /**
     * Detects whether the object is using a user value, or has one from the theme or init
     *
     * @param {qx.core.Object} thisObj
     * @returns {Boolean}
     */
    isUserValue(thisObj) {
      let value = this.__storage.get(thisObj, this);
      if (value !== undefined) {
        return true;
      }
      return false;
    },

    /**
     *
     * @returns {boolean} whether the property is read-only
     */
    isReadOnly() {
      return this.__readOnly;
    },

    /**
     * Sets the actual value of the property
     *
     * @param {qx.core.Object} thisObj
     * @param {*} value
     * @param {"user" | "themed"} scope
     * @param {"set" | "reset" | "init"} method
     * @param {Boolean} async whether to set the value asynchronously
     */
    __setImpl(thisObj, value, scope, method, async = false) {
      let error;
      const doit = async () => {
        try {
          let state = this.getPropertyState(thisObj);

          if (this.__validate) {
            this.__callFunction(thisObj, this.__validate, value, this);
          }
          if (this.__readOnly && value !== undefined) {
            throw new Error("Property " + this + " is read-only");
          }
          let oldValue = async ? await this.__getImpl(thisObj, true, true) : this.__getImpl(thisObj, true, false);

          if (this.__transform) {
            value = this.__callFunction(thisObj, this.__transform, value, oldValue, this);
          }

          if (method == "reset") {
            if (scope == "user") {
              this.__storage.reset(thisObj, this, value);
            } else if (scope == "themed" || value === undefined) {
              delete state.themeValue;
            }
            value = this.__getImpl(thisObj, true);
          }

          if (this.isInheritable() && value === "inherit") {
            let state = this.getPropertyState(thisObj);
            value = state.inheritedValue;
          }

          let check = this.getCheck();
          if (qx.core.Environment.get("qx.debug")) {
            if (qx.lang.Type.isPromise(value) && (!check || check instanceof qx.core.check.Any)) {
              this.warn(
                "Property " +
                  this +
                  " is being set to a promise, but its check is not a Promise. The property will be set to the promise itself."
              );
            }
          }

          if (method !== "reset" && check && !check.matches(value, thisObj)) {
            let coerced = check.coerce(value, thisObj);
            if (qx.lang.Type.isPromise(value) || coerced === null || !check.matches(coerced, thisObj)) {
              throw new Error(`Invalid value for property ${this}: ${value}`);
            }
            value = coerced;
          }

          let isEqual = this.isEqual(thisObj, value, oldValue);
          if (!isEqual && this.isMutating(thisObj)) {
            this.warn("Property " + this + " is currently mutating");
          }


          const setSyncImpl = () => {
            if (scope == "user") {
              // Always set the value to the storage if it is a user value; this is because themable properties
              // might be equal now, but if the theme value changes, the user's override needs to remain.
              if (method == "set" || method == "init") {
                this.__storage.set(thisObj, this, value);
              }
              if (value == "inherit") {
                value = this.get(thisObj);
              }
            } else if (scope == "themed") {
              if (method != "reset" && value !== undefined) {
                state.themeValue = value;
                value = this.get(thisObj);
              }
            } else if (qx.core.Environment.get("qx.debug")) {
              throw new Error(`Invalid scope=${scope} in ${this.classname}.__setImpl`);
            }
            if (value === undefined) {
              value = null;
            }
            let out = this.__callFunction(thisObj, this.__apply, value, oldValue, this.__propertyName);
            if (qx.lang.Type.isPromise(out) && !this.isAsync()) {
              this.warn(
                "Apply function for property " +
                  this +
                  " returned a Promise, but the property was set synchronously. The promise will be ignored."
              );
            }
            if (this.__eventName) {
              thisObj.fireDataEvent(this.__eventName, value, oldValue);
            }
            this.__applyValueToInheritedChildren(thisObj);
          };

          const setAsyncImpl = async () => {
            await this.__storage.setAsync(thisObj, this, value);
            await this.__callFunctionAsync(thisObj, this.__apply, value, oldValue, this.__propertyName);
            if (this.__eventName) {
              await thisObj.fireDataEventAsync(this.__eventName, value, oldValue);
            }
            this.__applyValueToInheritedChildren(thisObj, value, oldValue);
          };

          let shouldApply = false;
          if (method == "init" || method == "set") {
            let isInitCalled = true;
            isInitCalled = state.initMethodCalled;
            state.initMethodCalled = true;
            shouldApply = !isEqual || (value !== undefined && !isInitCalled);
          } else if (method == "reset") {
            shouldApply = !isEqual;
          } else {
            throw new Error(`Should not call here! Invalid method=${method}`);
          }

          if (shouldApply) {
            if (async) {
              let promise = setAsyncImpl();
              this._setMutating(thisObj, promise);
              return promise;
            } else {
              this._setMutating(thisObj, true);
              try {
                setSyncImpl();
              } finally {
                this._setMutating(thisObj, false);
              }
            }
          }
        } catch (e) {
          error = e;
        }
      };

      let promise = doit();

      //If an error is thrown, ensure it's thrown synchronously if possible
      if (async) {
        return promise.then(() => {
          if (error) {
            throw error;
          }
        });
      } else {
        if (error) {
          throw error;
        }
      }
    },

    /**
     * Gets the final value for this property, checking storage, theme and init value
     * @param {qx.core.Object} thisObj
     * @param {boolean} safe If true, it will not throw exceptions if the property is not initialized
     * @param {boolean} async If we are getting the value asynchronously
     * @returns {Promise<*>|*} The final value, or undefined if not initalized
     */
    __getImpl(thisObj, safe, async = false) {
      let cb = value => {
        if (this.isThemeable() && value === undefined) {
          let state = this.getPropertyState(thisObj);
          value = state.themeValue;
        }
        if (value === undefined) {
          if (this.isInheritable()) {
            let state = this.getPropertyState(thisObj);
            value = state.inheritedValue;
          }
        }
        if (value === undefined) {
          value = this.getInitValue(thisObj);
        }
        if (this.isInheritable() && value === "inherit") {
          let state = this.getPropertyState(thisObj);
          value = state.inheritedValue;
        }
        if (value === undefined) {
          if (typeof this.__definition?.check == "Boolean") {
            return false;
          }
          if (this.__definition?.nullable || this.__check?.isNullable()) {
            return null;
          }
          if (qx.core.Environment.get("qx.core.property.Property.inheritableDefaultIsNull")) {
            if (this.__definition?.inheritable) {
              return null;
            }
          }
          if (safe) {
            return undefined;
          } else if (!async && this.__storage.isAsyncStorage()) {
            throw new Error("Property " + this + " has not been initialized - try using getAsync() instead");
          } else {
            throw new Error("Property " + this + " has not been initialized");
          }
        }
        return value;
      };

      let value = this.__storage.get(thisObj, this);

      if (value === undefined) {
        if (async) {
          value = this.__storage.getAsync(thisObj, this);
          return value.then(cb);
        } else {
          return cb(value);
        }
      } else {
        return value;
      }
    },

    /**
     * Copies the value of this property to all children of the object
     *
     * @param {qx.core.Object} thisObj
     */
    __applyValueToInheritedChildren(thisObj) {
      if (typeof thisObj._getChildren == "function") {
        for (let child of thisObj._getChildren()) {
          let property = child.constructor.prototype.$$allProperties[this.__propertyName];
          if (property && property.isInheritable()) {
            property.refresh(child);
          }
        }
      }
    },

    /**
     * Sets a property value asynchronously
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     * @param {*} value the value to set
     * @return {qx.Promise<Void>}
     */
    async setAsync(thisObj, value) {
      return this.__setImpl(thisObj, value, "user", "set", true);
    },

    /**
     * Refreshes the property, copying the value from it's layout parent if it has one
     *
     * @param {*} thisObj
     * @returns
     */
    refresh(thisObj) {
      if (!this.isInheritable()) {
        throw new Error(`${this} is not inheritable`);
      }
      let oldValue = this.__getImpl(thisObj, true);

      const computeInherited = () => {
        let layoutParent = typeof thisObj.getLayoutParent == "function" ? thisObj.getLayoutParent() : undefined;
        if (!layoutParent) {
          return;
        }

        let layoutParentProperty = layoutParent.constructor.prototype.$$allProperties[this.__propertyName];
        if (!layoutParentProperty) {
          return;
        }

        let value = layoutParentProperty.__getImpl(layoutParent, true);

        return value;
      };

      let inherited = computeInherited();

      let state = this.getPropertyState(thisObj);

      // If we found a value to inherit...
      if (inherited !== undefined) {
        state.inheritedValue = inherited;
      } else {
        delete state.inheritedValue;
      }

      let value = this.__getImpl(thisObj, true);

      if (value !== oldValue) {
        if (!this.isEqual(thisObj, value, oldValue)) {
          this._setMutating(thisObj, true);
          try {
            this.__callFunction(thisObj, this.__apply, value, oldValue, this.__propertyName);
            if (this.__eventName) {
              thisObj.fireDataEvent(this.__eventName, value, oldValue);
            }
            this.__applyValueToInheritedChildren(thisObj);
          } finally {
            this._setMutating(thisObj, false);
          }
        }
      }
    },

    /**
     * Detects if the property is currently mutating
     *
     * @param {qx.core.Object} thisObj
     * @returns {Boolean}
     */
    isMutating(thisObj) {
      let state = this.getPropertyState(thisObj);
      return state.mutatingCount !== undefined && state.mutatingCount > 0;
    },

    /**
     * Called internally to set the mutating state for a property
     *
     * @param {qx.core.Object} thisObj
     * @param {Boolean} mutating
     */
    _setMutating(thisObj, mutating) {
      let state = this.getPropertyState(thisObj);
      if (mutating) {
        if (state.mutatingCount === undefined) {
          state.mutatingCount = 1;
        } else {
          state.mutatingCount++;
        }
        if (qx.lang.Type.isPromise(mutating)) {
          return mutating.then(() => this._setMutating(thisObj, false));
        }
      } else {
        if (state.mutatingCount === undefined) {
          throw new Error(`Property ${this} of ${thisObj} is not mutating`);
        }
        state.mutatingCount--;
        if (state.mutatingCount == 0) {
          delete state.promiseMutating;
          delete state.mutatingCount;
        }
      }
    },

    /**
     * Resolves when the property has finished mutating
     *
     * @param {qx.core.Object} thisObj
     * @returns {Promise<>}
     */
    async resolveMutating(thisObj) {
      if (thisObj.$$propertyMutating === undefined || !thisObj.$$propertyMutating[this.__propertyName]) {
        return qx.Promise.resolve();
      }
      let promise = thisObj.$$propertyMutating[this.__propertyName];
      if (typeof promise == "boolean") {
        promise = new qx.Promise();
        thisObj.$$propertyMutating[this.__propertyName] = promise;
      }
      await promise;
    },

    /**
     * Returns the `qx.core.check.Check` instance that can be used to verify property value compatibility
     *
     * @return {qx.core.check.Check}
     */
    getCheck(value) {
      return this.__check;
    },

    /**
     * Called to dereference, after the destructor, if the property has `dereference : true`.
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     */
    dereference(thisObj) {
      this.__storage.dereference(thisObj, this);
      // Get rid of our internal storage of the various possible
      // values for this property
      let propertyName = this.__propertyName;
      delete thisObj[`$$user_${propertyName}`];
      delete thisObj[`$$theme_${propertyName}`];
      delete thisObj[`$$inherit_${propertyName}`];
    },

    /**
     * Helper method to call a function, prefering an actual function over a named function.
     * this is used so that inherited classes can override methods, ie because the method
     * if located on demand.  This is used to call `apply` and `transform` methods.
     *
     * @param {*} thisObj
     * @param {Function|String?} fn
     * @param  {...any} args
     * @returns
     */
    __callFunction(thisObj, fn, ...args) {
      if (fn === null || fn === undefined) {
        return null;
      }

      if (typeof fn == "function") {
        return fn.call(thisObj, ...args);
      }

      if (typeof fn == "string") {
        let memberFn = thisObj[fn];
        if (memberFn) {
          return memberFn.call(thisObj, ...args);
        }

        throw new Error(`${this}: method ${fn} does not exist`);
      }

      return null;
    },

    /**
     * Helper method to call a function, prefering an actual function over a named function.
     * this is used so that inherited classes can override methods, ie because the method
     * if located on demand.  Same as `__callFunction` but async.
     *
     * @param {*} thisObj the this object
     * @param {*} fnName the name of the function
     * @param {*} fn the function, if not named
     * @param  {...any} args
     * @returns
     */
    async __callFunctionAsync(thisObj, fn, ...args) {
      if (typeof fn == "function") {
        return await fn.call(thisObj, ...args);
      }
      if (typeof fn == "string") {
        let memberFn = thisObj[fn];
        if (memberFn) {
          return await memberFn.call(thisObj, ...args);
        }

        throw new Error(`${this}: method ${fn} does not exist`);
      }
    },

    /**
     * Tests whether the property needs to be dereferenced
     *
     * @returns {Boolean}
     */
    needsDereference() {
      return this.__needsDereference;
    },

    /**
     * Compares two property values for equality, used to determine whether to apply
     * and fire change events
     *
     * @param {*} value
     * @param {*} oldValue
     */
    isEqual(thisObj, value, oldValue) {
      if (this.__isEqual) {
        return this.__isEqual.call(thisObj, value, oldValue, this);
      }
      if (value === oldValue) {
        if (value === 0) {
          return Object.is(value, oldValue);
        }
        return true;
      }

      return false;
    },

    /**
     * Promise that resolves when the property is ready, or when it has finished mutating
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     */
    promiseReady(thisObj) {},

    /**
     * Whether the property is initialized
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     * @return {Boolean}
     */
    isInitialized(thisObj) {
      let value = this.__getImpl(thisObj, true);
      return value !== undefined;
    },

    /**
     * Whether the property supports async
     *
     * @return {Boolean}
     */
    isAsync() {
      return !!this.__definition?.async;
    },

    /**
     * Whether the property is themable
     *
     * @return {Boolean}
     */
    isThemeable() {
      return !!this.__definition?.themeable;
    },

    /**
     * Whether the property is inheritable
     *
     * @return {Boolean}
     */
    isInheritable() {
      if (this.__superClass) {
        let parent = this.__superClass.prototype.$$allProperties[this.__propertyName];
        return parent.isInheritable();
      } else {
        return !!this.__definition?.inheritable;
      }
    },

    isPseudoProperty() {
      return this._pseudoProperty;
    },

    /**
     * Returns an array of annotations for the property, or null if there are none
     *
     * @return {qx.Annotation[]?null}
     */
    getAnnotations() {
      return this.__annotations;
    },

    /**
     * Returns the property name
     *
     * @returns {String}
     */
    getPropertyName() {
      return this.__propertyName;
    },

    /**
     * Returns the event name
     *
     * @returns {String?}
     */
    getEventName() {
      return this.__eventName;
    },

    /**
     * Returns the raw definition
     *
     * @return {*}
     */
    getDefinition() {
      return this.__definition;
    },

    /**
     * Outputs a warning; the logging system is probably not loaded and working yet, so we
     * have to implement our own
     *
     * @param  {...any} args
     */
    warn(...args) {
      if (qx.core.Environment.get("qx.debug")) {
        console.warn(...args);
      }
    },

    /**
     * @Override
     */
    toString() {
      return this.__clazz.classname + "." + this.__propertyName;
    }
  }
});
