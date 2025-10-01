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
 * Type checking for basic, native types
 */
qx.Bootstrap.define("qx.core.check.standard.DateCheck", {
  extend: qx.core.check.AbstractCheck,

  members: {
    /**
     * @override
     */
    _matchesImpl(value) {
      return value instanceof Date;
    },

    /**
     * @override
     */
    _coerceImpl(value) {
      if (value === null) {
        return null;
      }
      if (value instanceof Date) {
        return value;
      }
      if (typeof value === "string" || qx.lang.Type.isNumber(value)) {
        return new Date(value);
      }
      return null;
    }
  }
});
