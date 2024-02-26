/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2024 Zenesis Limited (https://www.zenesis.com)

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

  members: {
    /** @type{String} the name of the property */
    __propertyName: null,

    /** @type{qx.Class} the class that defined the property */
    __clazz: null,

    /** @type{qx.Class} the class that original defined this property, before it was cloned and
     * refined for the current `__clazz` */
    __superClass: null,

    /** @type{Object} the original definition */
    __definition: null,

    /** @type{qx.core.property.IPropertyStorage} the storage implementation */
    __storage: null,

    /** @type{Boolean} whether the property can be set */
    __readOnly: false,

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
     * @Override
     */
    configure(def) {
      let upname = qx.Bootstrap.firstUp(this.__propertyName);
      let methodNames = {};
      for (let tmp = this.__clazz; tmp; tmp = tmp.superclass) {
        for (let methodName in tmp.prototype) {
          if (typeof tmp[methodName] == "function") {
            methodNames[methodName] = true;
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
          def.apply = "transform" + upname;
        } else if (typeof methodNames["_transform" + upname] == "function") {
          def.apply = "_transform" + upname;
        } else if (typeof methodNames["__transform" + upname] == "function") {
          def.apply = "__transform" + upname;
        }
      }
      this.__definition = def;

      // Figure out the storage implementation
      if (def.storage) {
        if (def.storage instanceof qx.core.property.IPropertyStorage) {
          this.__storage = def.storage;
        } else {
          this.__storage = new def.storage();
        }
      } else {
        if (def.immutable == "replace") {
          if (def.check == "Array") {
            this.__storage = qx.core.property.PropertyStorageFactory.getStorage(
              qx.core.property.ImmutableArrayStorage
            );
          } else if (def.check == "Object") {
            this.__storage = qx.core.property.PropertyStorageFactory.getStorage(
              qx.core.property.ImmutableObjectStorage
            );
          } else if (def.check == "qx.data.Array") {
            this.__storage = qx.core.property.PropertyStorageFactory.getStorage(
              qx.core.property.ImmutableDataArrayStorage
            );
          } else {
            throw new Error(
              `${this.__propertyName}: ` +
                "only `check : 'Array'` and `check : 'Object'` " +
                "properties may have `immutable : 'replace'`."
            );
          }
        } else {
          if (methodNames["get" + upname]) {
            this.__storage = new qx.core.property.PsuedoPropertyStorage(
              this,
              this.__clazz
            );
            this.__readOnly = methodNames["set" + upname] === undefined;
          } else if (typeof def.get == "function") {
            this.__storage = new qx.core.property.ExplicitPropertyStorage(
              this,
              this.__clazz
            );
            this.__readOnly = def.set === undefined;
          } else {
            this.__storage = qx.core.property.PropertyStorageFactory.getStorage(
              qx.core.property.SimplePropertyStorage
            );
          }
        }
      }

      if (def.event !== undefined) {
        this.__eventName = def.event;
      } else if (!this.__superClazz) {
        this.__eventName = "change" + qx.Bootstrap.firstUp(this.__propertyName);
      }

      if (def.isEqual) {
        if (def.isEqual instanceof Function) {
          this.__isEqual = def.isEqual;
        } else if (def.isEqual instanceof String) {
          this.__isEqual = new Function("a", "b", "return " + def.isEqual);
        }
      }

      if (def.init !== undefined) {
        this.__initValue = def.init;
      }
      if (def.initFunction) {
        this.__initFunction = def.initFunction;
      }
      this.__needsDereference = def.dereference;

      let newCheck = null;

      if (typeof def.check == "function") {
        newCheck = new qx.core.check.SimpleCheck(
          def.check,
          !!def.nullable,
          false
        );
      } else if (def.check) {
        newCheck = qx.core.check.CheckFactory.getInstance().getCheck(
          def.check || "any"
        );
        if (newCheck && def.nullable && !newCheck.isNullable()) {
          newCheck = qx.core.check.CheckFactory.getInstance().getCheck(
            (def.check || "any") + "?"
          );
        }

        if (!newCheck && def.check instanceof String) {
          if (qx.core.Environment.get("qx.Class.futureCheckJsDoc")) {
            // Next  try to parse the check string as JSDoc
            let bJSDocParsed = false;
            try {
              newCheck = new qx.core.check.JsDocCheck(
                def.check,
                !!def.nullable
              );
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
              throw new Error(
                `${this}: ` +
                  "Error creating check function: " +
                  `${def.check}: ` +
                  ex
              );
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
        this.__needsDereference =
          def.dereference || this.__check.needsDereference();
      }

      if (
        this.__check &&
        this.__check.isNullable() &&
        this.__initValue === undefined
      ) {
        this.__initValue = null;
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
      clone.__eventName = this.__eventName;
      clone.__initValue = this.__initValue;
      clone.__initFunction = this.__initFunction;
      clone.__check = this.__check;
      clone.__isEqual = this.__isEqual;
      clone.__annotations = this.__annotations
        ? qx.lang.Array.clone(this.__annotations)
        : null;
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

      if (clazz.prototype.$$propertyValues === undefined) {
        let $$propertyValues = {};
        let superClassWithPropertyValues = null;
        for (let tmp = clazz; tmp; tmp = tmp.superclass) {
          if (Object.hasOwnProperty(tmp.prototype, "$$propertyValues")) {
            superClassWithPropertyValues = tmp;
            break;
          }
        }
        if (superClassWithPropertyValues) {
          $$propertyValues.prototype =
            superClassWithPropertyValues.prototype.$$propertyValues;
        }
        Object.defineProperty(clazz.prototype, "$$propertyValues", {
          value: $$propertyValues,
          writable: false,
          configurable: true,
          enumerable: false
        });
      }

      let proto = clazz.prototype;
      Object.defineProperty(clazz.prototype.$$propertyValues, propertyName, {
        value: {},
        writable: false,
        configurable: true,
        enumerable: false
      });
      let propertyValues = clazz.prototype.$$propertyValues[propertyName];

      if (qx.core.Environment.get("qx.debug")) {
        if (
          clazz.prototype.$$superProperties[propertyName] &&
          propertyName.charAt(0) === "_" &&
          propertyName.charAt(1) === "_"
        ) {
          throw new Error(
            `Overwriting private member "${propertyName}" ` +
              `of Class "${clazz.classname}" ` +
              "is not allowed"
          );
        }

        if (
          patch !== true &&
          (proto.hasOwnProperty(propertyName) ||
            qx.Class.objectProperties.has(propertyName) ||
            (propertyName in proto &&
              !(propertyName in clazz.prototype.$$superProperties)))
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

      patch && delete clazz.prototype[`$$init_${propertyName}`];
      Object.defineProperty(clazz.prototype, `$$init_${propertyName}`, {
        get: function () {
          return self.__getInitValue(this);
        },
        configurable: qx.Class.$$options.propsAccessible || false,
        enumerable: qx.Class.$$options.propsAccessible || false
      });
      clazz.prototype.$$initFunctions.push(propertyName);

      if (
        this.__initValue !== undefined ||
        typeof this.__initFunction == "function" ||
        this.__apply !== undefined ||
        typeof this.__definition.check == "Boolean" ||
        this.__definition.deferredInit ||
        this.__definition.inheritable
      ) {
        addMethod("init" + upname, function () {
          self.init(this);
        });
      }

      // user-specified
      patch && delete clazz.prototype[`$$user_${propertyName}`];
      Object.defineProperty(clazz.prototype, `$$user_${propertyName}`, {
        get: function () {
          return self.get(this);
        },
        configurable: false
      });

      // theme-specified
      if (this.__definition.themeable) {
        patch && delete clazz.prototype[`$$theme_${propertyName}`];
        Object.defineProperty(clazz.prototype, `$$theme_${propertyName}`, {
          get: function () {
            return self.getThemed(this);
          },
          configurable: false
        });

        addMethod("getThemed" + upname, function () {
          return self.getThemed(this);
        });

        addMethod("setThemed" + upname, function (value) {
          self.setThemed(this, value);
        });

        addMethod("resetThemed" + upname, function () {
          self.resetThemed(this);
        });
      }

      // whether to call apply after setting init value
      let variant =
        typeof this.__definition.init != "undefined" ||
        typeof this.__definition.initFunction == "function"
          ? "init"
          : null;
      Object.defineProperty(clazz.prototype, `$$variant_${propertyName}`, {
        get: new Function("return " + variant),
        configurable: false
      });

      // inheritable
      if (this.__definition.inheritable) {
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
          return self.get(this);
        },
        configurable: qx.Class.$$options.propsAccessible || false,
        enumerable: qx.Class.$$options.propsAccessible || false
      };
      if (!this.__readOnly) {
        propertyConfig.set = function (value) {
          self.set(this, value);
        };
      }
      Object.defineProperty(clazz.prototype, propertyName, propertyConfig);

      addMethod("get" + upname, function () {
        return self.get(this);
      });
      addMethod("get" + upname + "Async", async function () {
        return await self.getAsync(this);
      });

      if (this.__definition.check === "Boolean") {
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

      addMethod("set" + upname, function (value) {
        return self.set(this, value);
      });
      addMethod("set" + upname + "Async", async function (value) {
        return await self.setAsync(this, value);
      });
      addMethod("reset" + upname, function (value) {
        self.reset(this, value);
      });
    },

    /**
     * Initialises a property value
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     */
    init(thisObj) {
      let value = this.__getInitValue(thisObj);
      this.__storage.set(thisObj, this, value);

      /*
                  this[`init${propertyFirstUp}`]();
                  this[`$$variant_${prop}`] = "init";
*/
    },

    /**
     * Resets a property value
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     */
    reset(thisObj) {
      let value = this.__getInitValue(thisObj);
      this.__storage.set(thisObj, this, value);
    },

    /**
     * Calculates the init value used by `init()` and `reset()`
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     * @returns {*}
     */
    __getInitValue(thisObj) {
      let value = undefined;
      if (this.__initFunction !== undefined) {
        value = this.__initFunction.call(thisObj, this);
      } else if (value === undefined) {
        value = this.__initValue;
      } else if (this.__definition.check == "Boolean") {
        value = false;
      }
      return value;
    },

    /**
     * Gets the current value from the storage, does not throw exceptions if nothing has
     * been initialized yet.  This does not support async storage.
     *
     * @param {qx.core.Object} thisObj
     * @returns {*}
     */
    __getSafe(thisObj) {
      let value = this.__storage.get(thisObj, this);
      if (value === undefined) {
        if (this.isThemeable()) {
          value = this.__storage.get(thisObj, this, "theme");
        }
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
      let value = this.__storage.get(thisObj, this);
      if (value === undefined) {
        if (this.isThemeable()) {
          value = this.__storage.get(thisObj, this, "theme");
        }
        if (value === undefined) {
          if (this.__storage.isAsyncStorage()) {
            throw new Error(
              "Property " +
                this +
                " has not been initialized - try using getAsync() instead"
            );
          }
          throw new Error("Property " + this + " has not been initialized");
        }
      }
      return value;
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
      throw new Error("TODO - inherited and theme values.  ");
      let value = await this.__storage.getAsync(thisObj, this);
      if (value === undefined) {
        if (this.isInheritable()) {
          value = this.__storage.get(thisObj, this, "inherited");
        }
        if (value === undefined) {
          if (this.isThemeable()) {
            value = this.__storage.get(thisObj, this, "theme");
          }
          if (value === undefined) {
            throw new Error("Property " + this + " has not been initialized");
          }
        }
      }
      return value;
    },

    __applyValue(thisObj, value, oldValue) {
      if (!this.isEqual(value, oldValue)) {
        this._setMutating(thisObj, true);
        try {
          this.__storage.set(thisObj, this, value);
          if (this.__apply) {
            this.__apply.call(thisObj, value, oldValue, this.__propertyName);
          }
          if (this.__eventName) {
            thisObj.fireDataEvent(this.__eventName, value, oldValue);
          }
          this.__applyValueToInheritedChildren(thisObj, value, oldValue);
        } finally {
          this._setMutating(thisObj, false);
        }
      }
    },

    __applyValueToInheritedChildren(thisObj, value, oldValue) {
      if (this.isInheritable() && typeof thisObj._getChildren == "function") {
        for (let child of thisObj._getChildren()) {
          let property = child.constructor.$$allProperties[this.__propertyName];
          if (property && property.isInheritable()) {
            property.setInheritedValue(thisObj, value);
          }
        }
      }
    },

    /**
     * Sets a property value.
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     * @param {*} value the value to set
     */
    set(thisObj, value) {
      if (this.__readOnly && value !== undefined) {
        throw new Error("Property " + this + " is read-only");
      }
      if (this.isMutating(thisObj)) {
        throw new Error("Property " + this + " is currently mutating");
      }
      let oldValue = this.__storage.get(thisObj, this);
      this.__applyValue(thisObj, value, oldValue);
    },

    /**
     * Sets a property value asynchronously
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     * @param {*} value the value to set
     * @return {qx.Promise<Void>}
     */
    async setAsync(thisObj, value) {
      if (this.__readOnly && value !== undefined) {
        throw new Error("Property " + this + " is read-only");
      }
      if (this.isMutating(thisObj)) {
        throw new Error("Property " + this + " is currently mutating");
      }

      const setAsyncImpl = async () => {
        await this.__storage.setAsync(thisObj, this, value);
        if (this.__apply) {
          await this.__apply.call(
            thisObj,
            value,
            oldValue,
            this.__propertyName
          );
        }
        if (this.__eventName) {
          await thisObj.fireDataEventAsync(this.__eventName, value, oldValue);
        }
        this.__applyValueToInheritedChildren(thisObj, value, oldValue);
      };

      let oldValue = await this.__storage.getAsync(thisObj, this);
      if (!this.isEqual(value, oldValue)) {
        let promise = setAsyncImpl();
        this._setMutating(thisObj, promise);
        await promise;
      }
    },

    setThemed(thisObj, value) {
      // Get the current value
      let oldValue = this.__getSafe(thisObj);

      // Save the provided themed value
      this.__storage.set(thisObj, this, value, "theme");

      // What's the new value
      value = this.__getSafe(thisObj);

      this.__applyValue(thisObj, value, oldValue);

      return value;
    },

    resetThemed(thisObj) {
      let oldValue = this.__getSafe(thisObj);
      this.__storage.set(thisObj, this, undefined, "theme");
      let value = this.__getSafe(thisObj);

      this.__applyValue(thisObj, value, oldValue);
    },

    refresh(thisObj) {
      let oldValue = this.__storage.get(thisObj, this);

      // If there's a user value, it takes precedence
      if (oldValue != undefined) {
        return;
      }

      // If there's a layout parent and if it has a property (not
      // a member!) of this name, ...
      let layoutParent =
        typeof this.getLayoutParent == "function"
          ? this.getLayoutParent()
          : undefined;
      let propertyName = this.__propertyName;
      if (
        layoutParent &&
        propertyName in layoutParent.constructor.$$allProperties
      ) {
        // ... then retrieve its value
        let inheritedValue = layoutParent[propertyName];

        // If we found a value to inherit...
        if (typeof inheritedValue != "undefined") {
          // ... then save the inherited value, ...
          this[`$$inherit_${propertyName}`] = inheritedValue;

          // ... and also use the inherited value as the
          // property value
          // Debugging hint: this will trap into setter code.
          this[propertyName] = inheritedValue;

          // The setter code (incorrectly, in this case)
          // saved the value as the $$user value. Reset
          // it to its original value.
          this[`$$user_${propertyName}`] = inheritedValue;
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
      return !!this.__storage.isMutating(thisObj);
    },

    /**
     * Called internally to set the mutating state for a property
     *
     * @param {qx.core.Object} thisObj
     * @param {Boolean} mutating
     */
    _setMutating(thisObj, mutating) {
      if (thisObj.$$propertyMutating === undefined) {
        thisObj.$$propertyMutating = {};
      }
      if (mutating) {
        if (thisObj.$$propertyMutating[this.__propertyName]) {
          throw new Error(`Property ${this} of ${thisObj} is already mutating`);
        }

        thisObj.$$propertyMutating[this.__propertyName] = mutating;
        if (qx.lang.Type.isPromise(mutating)) {
          mutating.then(
            () => delete thisObj.$$propertyMutating[this.__propertyName]
          );
        }
      } else {
        if (!thisObj.$$propertyMutating[this.__propertyName]) {
          throw new Error(`Property ${this} of ${thisObj} is not mutating`);
        }
        let promise = thisObj.$$propertyMutating[this.__propertyName];
        delete thisObj.$$propertyMutating[this.__propertyName];
        if (typeof promise != "boolean") {
          promise.resolve();
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
      if (
        thisObj.$$propertyMutating === undefined ||
        !thisObj.$$propertyMutating[this.__propertyName]
      ) {
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
    isEqual(value, oldValue) {
      if (this.__isEqual) {
        return this.__isEqual.call(this, value, oldValue);
      }
      return value == oldValue;
    },

    /**
     * Promise that resolves when the property is ready, or when it has finished mutating
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     */
    promiseReady(thisObj) {},

    /**
     * Whether the property is mutating (asynchronously or recursively)
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     * @return {Boolean}
     */
    isMutating(thisObj) {},

    /**
     * Whether the property is initialized
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     * @return {Boolean}
     */
    isInited(thisObj) {
      return this.__storage.get(thisObj, this) !== undefined;
    },

    /**
     * Tests whether the property needs to be initialized
     *
     * @returns {Boolean}
     */
    needsInit() {
      return this.__initFunction || this.__initValue !== undefined;
    },

    /**
     * Whether the property supports async
     *
     * @return {Boolean}
     */
    isAsync() {
      return !!this.__definition.async;
    },

    /**
     * Whether the property is themable
     *
     * @return {Boolean}
     */
    isThemeable() {
      return !!this.__definition.themeable;
    },

    /**
     * Whether the property is inheritable
     *
     * @return {Boolean}
     */
    isInheritable() {
      return !!this.__definition.inheritable;
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
     * @Override
     */
    toString() {
      return this.__clazz.classname + "." + this.__propertyName;
    }
  }
});
