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
 * @ignore(require)
 */
qx.Bootstrap.define("qx.core.check.JsDocCheck", {
  extend: Object,
  implement: qx.core.check.ICheck,

  construct(jsdoc, nullable) {
    super();
    const { parse } = require("jsdoctypeparser");
    this.__ast = parse(jsdoc);
    this.__nullable = nullable;
  },

  members: {
    /** @type{*} the AST from jsdoctypeparser */
    __ast: null,

    /** @type{Boolean} whether null is allowed */
    __nullable: null,

    /**
     * @override
     */
    matches(value) {
      console.log(`JSDoc type checking is not yet implemented`);

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
