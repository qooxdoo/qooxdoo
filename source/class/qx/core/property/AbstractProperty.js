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
 * Base class for properties, shared between individual properties and property groups
 */
qx.Class.define("qx.core.property.AbstractProperty", {
  extend: qx.core.Object,

  construct(propertyName, clazz) {
    super();
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
    __readOnly: true,

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

    /**
     * @Override
     */
    toString() {
      return this.__clazz.classname + "." + this.__propertyName;
    },

    /**
     * Configures the property from a property definition; note that this can be called
     * after `clone` or after constructing a new object
     *
     * @param {*} def the property definition as written by the user
     */
    configure(def, clazz) {
      let upname = qx.lang.String.firstUp(this.__propertyName);
      let methodNames = {};
      for (let tmp = clazz; tmp; tmp = tmp.superclass) {
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
              `${this.getPropertyName()}: ` +
                "only `check : 'Array'` and `check : 'Object'` " +
                "properties may have `immutable : 'replace'`."
            );
          }
        } else {
          if (methodNames["get" + upname]) {
            this.__storage = new qx.core.property.PsuedoPropertyStorage(
              this,
              clazz
            );
            this.__readOnly = methodNames["set" + upname] === undefined;
          } else if (typeof def.get == "function") {
            this.__storage = new qx.core.property.ExplicitPropertyStorage(
              this,
              clazz
            );
            this.__readOnly = def.set === undefined;
          } else {
            this.__storage = qx.core.property.PropertyStorageFactory.getStorage(
              qx.core.property.SimplePropertyStorage
            );
          }
        }
      }
      if (def.event) {
        this.__eventName = def.event;
      } else if (def.event !== null) {
        this.__eventName =
          "change" + qx.lang.String.firstUp(this.__propertyName);
      }
      if (def.isEqual) {
        if (def.isEqual instanceof Function) {
          this.__isEqual = def.isEqual;
        } else if (def.isEqual instanceof String) {
          this.__isEqual = new Function("a", "b", "return " + def.isEqual);
        }
      }
      if (def.init) {
        this.__initValue = def.init;
      }
      if (def.initFunction) {
        this.__initFunction = def.initFunction;
      }
      this.__needsDereference = def.dereference;
      let newCheck = qx.core.check.CheckFactory.getCheck(def.check || "any");
      if (def.nullable !== undefined) {
        if (def.nullable && !newCheck.isNullable()) {
          newCheck = qx.core.check.CheckFactory.getCheck(
            (def.check || "any") + "?"
          );
        }
        throw new Error(
          "Property " +
            this +
            " has invalid check because the definition is not compatible with the nullable setting"
        );
      }
      if (!this.__check.isCompatible(newCheck)) {
        throw new Error(
          `Property ${this} has invalid check because the definition in the superclass ${this.__superClass} is not compatible`
        );
      }
      this.__check = newCheck;
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
     * Clones this property definition
     *
     * @return {qx.core.property.IProperty}
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
      clone.__annotations = qx.lang.Array.clone(this.__annotations);
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
      let propertyName = this.getPropertyName();
      let scopePrefix = "";
      if (propertyName.startsWith("__")) {
        scopePrefix = "__";
        propertyName = propertyName.substring(2);
      } else if (propertyName.startsWith("_")) {
        scopePrefix = "_";
        propertyName = propertyName.substring(1);
      }
      let upname = qx.lang.String.firstUp(propertyName);
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
          proto[propertyName] !== undefined &&
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
              !(propertyName in clazz.$$superProperties)))
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

      // theme-specified
      if (this.__definition.themeable) {
        patch && delete clazz.prototype[`$$theme_${propertyName}`];
        Object.defineProperty(clazz.prototype, `$$theme_${propertyName}`, {
          get: function () {
            return self.getThemed(this);
          },
          writable: false,
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
    },

    /**
     * Initialises a property value
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     */
    init(thisObj) {
      if (thisObj["$$propertyValues"] === undefined) {
        thisObj["$$propertyValues"] = {};
      }
      let value = this.__getInitValue(thisObj);
      if (value !== undefined) {
        this.__storage.set(thisObj, this, value);
      }
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
      }
      if (value === undefined) {
        value = this.__initValue;
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
        if (this.__storage.isAsyncStorage()) {
          throw new Error(
            "Property " +
              this +
              " has not been initialized - try using getAsync() instead"
          );
        }
        throw new Error("Property " + this + " has not been initialized");
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
      let value = await this.__storage.getAsync(thisObj, this);
      if (value === undefined) {
        throw new Error("Property " + this + " has not been initialized");
      }
      return value;
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
      if (!this.isEqual(value, oldValue)) {
        this.__storage.setMutating(true);
        try {
          this.__storage.set(thisObj, this, value);
          if (this.__apply) {
            this.__apply.call(thisObj, value, oldValue, this.getPropertyName());
          }
          if (this.__eventName) {
            thisObj.fireDataEvent(this.__eventName, value, oldValue);
          }
        } finally {
          this.__storage.setMutating(false);
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
            this.getPropertyName()
          );
        }
        if (this.__eventName) {
          await thisObj.fireDataEventAsync(this.__eventName, value, oldValue);
        }
      };

      let oldValue = await this.__storage.getAsync(thisObj, this);
      if (!this.isEqual(value, oldValue)) {
        let promise = setAsyncImpl();
        promise = promise.finally(() => {
          this.__storage.setMutating(null);
        });
        this.__storage.setMutating(promise);
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
     * Resolves when the property has finished mutating
     *
     * @param {qx.core.Object} thisObj
     * @returns {Promise<>}
     */
    async resolveMutating(thisObj) {
      await qx.Promise.resolve(this.__storage.isMutating(thisObj));
    },

    setThemed(thisObj, value) {},

    resetThemed(thisObj) {},

    refresh(thisObj) {},

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
     * Whether the property supports async
     *
     * @return {Boolean}
     */
    isAsync() {
      return !!this._definition.async;
    },

    /**
     * Whether the property is themable
     *
     * @return {Boolean}
     */
    isThemeable() {
      return !!this._definition.themable;
    },

    /**
     * Whether the property is inheritable
     *
     * @return {Boolean}
     */
    isInheritable() {
      return !!this._definition.inheritable;
    },

    /**
     * Returns an array of annotations for the property, or null if there are none
     *
     * @return {qx.Annotation[]?null}
     */
    getAnnotations() {
      return this.__annotations;
    }
  }
});
