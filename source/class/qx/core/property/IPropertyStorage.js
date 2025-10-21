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
 * Interface for objects that provide actual property storage
 */
qx.Interface.define("qx.core.property.IPropertyStorage", {
  members: {
    /**
     * Gets a value, returns undefined if the value is not set
     *
     * @param {qx.core.Object} thisObj
     * @param {qx.core.propety.IProperty} property the property to get the value of
     * @return {*}
     */
    get(thisObj, property) {},

    /**
     * Gets a value asynchronously, returns a promise for the value
     *
     * @param {qx.core.Object} thisObj
     * @param {qx.core.propety.IProperty} property the property to get the value of
     * @return {Promise<*>}
     */
    async getAsync(thisObj, property) {},

    /**
     * Sets a value
     *
     * @param {qx.core.Object} thisObj
     * @param {qx.core.propety.IProperty} property the property to set the value of
     * @param {*} value
     */
    set(thisObj, property, value) {},

    /**
     * Sets a value asynchronously
     *
     * @param {qx.core.Object} thisObj
     * @param {qx.core.propety.IProperty} property the property to set the value of
     * @param {*} value
     */
    async setAsync(thisObj, property, value) {},

    /**
     * Called when the property is reset; for standard properties, this just passes through to
     * `set`, but pseudo properties may need to call the implemented `reset` method
     *
     * @param {qx.core.Object} thisObj
     * @param {qx.core.propety.IProperty} property the property to set the value of
     * @param {*} value
     */
    reset(thisObj, property, value) {},

    /**
     * Deletes the value
     *
     * @param {qx.core.Object} thisObj
     * @param {qx.core.propety.IProperty} property the property to dereference
     */
    dereference(thisObj, property) {},

    /**
     * Returns whether the storage supports asynchronous backing, ie the getter could be async
     */
    isAsyncStorage() {}
  }
});
