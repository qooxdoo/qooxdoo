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
qx.Bootstrap.define("qx.core.check.standard.NumberCheck", {
  extend: qx.core.check.AbstractCheck,

  members: {
    /**
     * @override
     */
    _matchesImpl(value) {
      return qx.lang.Type.isNumber(value) && isFinite(value);
    },

    /**
     * @override
     */
    _coerceImpl(value) {
      if (value === null || isNaN(value)) {
        return 0;
      }
      if (qx.lang.Type.isNumber(value)) {
        return value;
      }
      value = String(value).trim();
      let tmp = parseFloat(value);
      if (isNaN(tmp)) {
        return 0;
      }
      return tmp;
    }
  }
});
