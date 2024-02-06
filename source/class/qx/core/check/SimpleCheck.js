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
qx.Bootstrap.define("qx.core.check.SimpleCheck", {
  extend: qx.core.Object,
  implement: qx.core.check.ICheck,

  construct(matches, nullable, needsDereference) {
    super();
    this.__matches = matches;
    this.__nullable = nullable;
    this.__needsDereference = !!needsDereference;
  },

  members: {
    /** @type{Function} passed a value and returns true if the value matches this check */
    __matches: null,

    /** @type{Boolean} whether null is allowed */
    __nullable: null,

    /** @type{Boolean} whether this type needs to be dereferenced */
    __needsDereference: null,

    /**
     * @override
     */
    matches(value) {
      return this.__matches.call(this, value);
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
