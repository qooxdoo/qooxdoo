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
qx.Bootstrap.define("qx.core.check.standard.PositiveNumberCheck", {
  extend: qx.core.check.standard.NumberCheck,

  members: {
    /**
     * @override
     */
    _matchesImpl(value) {
      let ok = super._matchesImpl(value);
      return ok && value >= 0;
    },

    /**
     * @override
     */
    _coerceImpl(value) {
      value = super._coerceImpl(value);
      if (!isNaN(value) && value < 0) {
        return 0;
      }
      return value;
    }
  }
});
