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
 * Implementation of check for any value
 */
qx.Bootstrap.define("qx.core.check.Any", {
  extend: Object,
  implement: qx.core.check.ICheck,

  construct(nullable) {
    super();
    this.__nullable = nullable;
  },

  members: {
    /** @type{Boolean} whether null is allowed */
    __nullable: null,

    /**
     * @override
     */
    matches(value) {
      return true;
    },

    /**
     * @override
     */
    isNullable() {
      return this.__nullable;
    },

    /**
     * @override
     */
    isCompatible(check) {
      return true;
    },

    /**
     * @override
     */
    needsDereference() {
      return false;
    }
  }
});
