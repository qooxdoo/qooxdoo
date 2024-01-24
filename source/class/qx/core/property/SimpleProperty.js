qx.Bootstrap.define("qx.core.property.SimpleProperty", {
  extend: qx.core.Object,
  implement: [qx.core.property.IProperty],

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

    /** @type{String} the name of the change event */
    __eventName: null,

    /** @type{*} the init value */
    __initValue: undefined,

    /** @type{*} the init function used to get the init value */
    __initFunction: undefined,

    /** @type{qx.core.property.Check} the check object for verifying property value compatibility */
    __check: null,

    /** @type{Boolean} whether the property is asynchronous by nature */
    __async: false,

    /** @type{qx.Annotation[]?null} any annotations */
    __annotations: null,

    /** @type{Boolean} whether the property is themable */
    __themable: false,

    /** @type{Boolean} whether the property is inheritable */
    __inheritable: false,

    toString() {
      return this.__clazz.classname + "." + this.__propertyName;
    },

    /**
     * @Override
     */
    configure(def) {
      if (def.event) {
        this.__eventName = def.event;
      }
      if (def.init) {
        this.__initValue = def.init;
      }
      if (def.initFunction) {
        this.__initFunction = def.initFunction;
      }
      if (def.check) {
        let newCheck = qx.core.property.CheckFactory.getCheck(def.check);
        if (this.__check && !this.__check.isCompatible(newCheck)) {
          throw new Error(`Property ${this} has invalid check because the definition in the superclass ${this.__superClass} is not compatible`);
        }
        this.__check = qx.property.Check.getInstance(def.check);
      }
      if (def.async) {
        this.__async = true;
      }
      if (def.themable) {
        this.__themable = true;
      }
      if (def.inheritable) {
        this.__inheritable = true;
      }
      if (def["@"] && def["@"].length > 0) {
        this.__annotations = [...def["@"]];
      }
    },

    /**
     * @Override
     */
    clone(clazz) {
      let clone = new qx.core.property.SimpleProperty(this.__propertyName);
      clone.__clazz = clazz;
      clone.__superClass = this.__clazz;
      clone.__eventName = this.__eventName;
      clone.__initValue = this.__initValue;
      clone.__initFunction = this.__initFunction;
      clone.__check = this.__check;
      clone.__async = this.__async;
      clone.__themable = this.__themable;
      clone.__inheritable = this.__inheritable;
      clone.__annotations = this.__annotations;
      return clone;
    },

    /**
     * @Override
     */
    init(thisObj) {
      if (thisObj["$$propertyValues"] === undefined) {
        thisObj["$$propertyValues"] = {};
      }
      let value = this.__getInitValue(thisObj);
      if (value !== undefined) {
        thisObj["$$propertyValues"][this.__propertyName] = value;
      }
    },

    /**
     * @Override
     */
    reset(thisObj) {
      let value = this.__getInitValue(thisObj);
      thisObj["$$propertyValues"][this.__propertyName] = value;]
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
     * @Override
     */
    get(thisObj) {
      return thisObj["$$propertyValues"][this.__propertyName];
    },

    /**
     * @Override
     */
    set(thisObj, value) {
      thisObj["$$propertyValues"][this.__propertyName] = value;
    },

    /**
     * @Override
     */
    getCheck(value) {
      return this.__check;
    },

    /**
     * @Override
     */
    dereference(thisObj) {
      delete thisObj["$$propertyValues"][this.__propertyName];
    },

    /**
     * @Override
     */
    fireEvent(thisObj, value, oldValue) {
      thisObj.fireDataEvent(this.__eventName, value, oldValue);
    },

    /**
     * @Override
     */
    compare(value, oldValue) {
      return value == oldValue;
    },

    /**
     * @Override
     */
    isInited(thisObj) {
      return thisObj["$$propertyValues"][this.__propertyName] !== undefined;
    },

    /**
     * @Override
     */
    isAsync() {
      return this.__async;
    },

    /**
     * @Override
     */
    isThemeable() {
      return this.__themable;
    },

    /**
     * @Override
     */
    isInheritable() {
      return this.__inheritable
    },

    /**
     * @Override
     */
    getAnnotations() {
      return this.__annotations;
    }
  }
});
