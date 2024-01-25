/**
 *
 * TODO
 *
 * [I]Property handles the entire property and does include type checking, apply etc
 * [I]Storage handles the storage of the property, and does not include type checking
 *
 * [gs]etAsync is passed through to IStorage
 * get on IProperty throws an error if the property is not initialized
 * getAsync on IProperty throws an error if the property is not initialized unless it is
 *  async and the storage can resolve it
 *
 *
 */

qx.Interface.define("qx.core.property.IProperty", {
  members: {
    /**
     * Configures the property from a property definition; note that this can be called
     * after `clone` or after constructing a new object
     *
     * @param {*} def the property definition as written by the user
     */
    configure(def) {},

    /**
     * Clones this property definition
     *
     * @return {qx.core.property.IProperty}
     */
    clone() {},

    /**
     * Initialises a property value
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     */
    init(thisObj) {},

    /**
     * Resets a property value
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     */
    reset(thisObj) {},

    /**
     * Gets a property value; will raise an error if the property is not initialized
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     * @return {*}
     */
    get(thisObj) {},

    /**
     * Gets a property value; if not initialized and the property is async, it will
     * wait for the underlying storage to resolve but will throw an error if the underlying
     * storage cannot provide a value which is not `undefined`
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     * @return {*}
     */
    getAsync(thisObj) {},

    /**
     * Sets a property value.
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     * @param {*} value the value to set
     */
    set(thisObj, value) {},

    /**
     * Sets a property value asynchronously
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     * @param {*} value the value to set
     * @return {qx.Promise<Void>}
     */
    setAsync(thisObj, value) {},

    /**
     * Returns the `qx.core.property.Check` instance that can be used to verify property value compatibility
     *
     * @return {qx.core.property.Check}
     */
    getCheck() {},

    /**
     * Called to dereference, after the destructor, if the property has `dereference : true`.
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     */
    dereference(thisObj) {},

    /**
     * Compares two property values for equality, used to determine whether to apply
     * and fire change events
     *
     * @param {*} value
     * @param {*} oldValue
     */
    compare(value, oldValue) {},

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
    isInited(thisObj) {},

    /**
     * Whether the property is mutating (asynchronously or recursively)
     *
     * @param {qx.core.Object} thisObj the object on which the property is defined
     * @return {Boolean}
     */
    isMutating(thisObj) {},

    /**
     * Whether the property supports async
     *
     * @return {Boolean}
     */
    isAsync() {},

    /**
     * Whether the property is themable
     *
     * @return {Boolean}
     */
    isThemeable() {},

    /**
     * Whether the property is inheritable
     *
     * @return {Boolean}
     */
    isInheritable() {},

    /**
     * Returns an array of annotations for the property, or null if there are none
     *
     * @return {qx.Annotation[]?null}
     */
    getAnnotations() {}
  }
});
