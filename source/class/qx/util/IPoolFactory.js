/* ************************************************************************

  qooxdoo - the new era of web development

  http://qooxdoo.org

  Copyright:
     2019-2025 Zenesis Ltd, https://www.zenesis.com

 License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

 Authors:
     John Spackman (john.spackman@zenesis.com, @johnspackman)

 ************************************************************************ */

/**
 * Factory for qx.util.Pool
 */
qx.Interface.define("qx.util.IPoolFactory", {
  members: {
    /**
     * Creates a new poolable entity
     *
     * @returns {*}
     */
    async createPoolableEntity() {},

    /**
     * Destroys a poolable entity when it is no longer needed
     *
     * @param {*} entity a value previously returned by `create`
     */
    async destroyPoolableEntity(entity) {}
  }
});
