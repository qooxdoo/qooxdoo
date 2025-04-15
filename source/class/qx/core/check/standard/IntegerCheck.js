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
qx.Bootstrap.define("qx.core.check.standard.IntegerCheck", {
  extend: qx.core.check.AbstractCheck,

  members: {
    /**
     * @override
     */
    _matchesImpl(value) {
      return qx.lang.Type.isNumber(value) && (value % 1 === 0 || value === Infinity || value === -Infinity);
    },

    /**
     * @override
     */
    _coerceImpl(value) {
      if (value === null) {
        return 0;
      }
      if (isNaN(value)) {
        return 0;
      }
      if (qx.lang.Type.isNumber(value)) {
        return Math.round(value);
      }
      value = String(value).trim();
      let tmp = parseInt(value, 10);
      if (isNaN(tmp)) {
        return 0;
      }
      return tmp;
    }
  }
});
