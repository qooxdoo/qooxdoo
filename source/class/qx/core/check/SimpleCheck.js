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
 * Type checking for basic, native types
 */
qx.Class.define("qx.core.check.SimpleCheck", {
  extend: qx.core.Object,
  implement: qx.core.check.ICheck,

  construct(matches, nullable, needsDereference) {
    super();
    this.__matches = matches;
    this.__nullable = nullable;
    this.__needsDereference = !!needsDereference;
  },

  members: {
    /**
     * @override
     */
    matches(value) {
      return this.__matches(value);
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
      return check instanceof this.constructor;
    },

    needsDereference() {
      return this.__needsDereference;
    }
  }
});
