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
qx.Bootstrap.define("qx.core.check.IsOneOfCheck", {
  extend: qx.core.check.AbstractCheck,

  construct(values, nullable) {
    super(nullable);
    this.__values = values;
  },

  members: {
    /** @type{Array} list of allowed values */
    __values: null,

    /**
     * @override
     */
    _matchesImpl(value) {
      if (value === null) {
        return null;
      }

      if (this.__values.indexOf(value) !== -1) {
        return true;
      }

      return false;
    },

    /**
     * @override
     */
    isCompatible(check) {
      if (check instanceof qx.core.check.IsOneOfCheck) {
        for (let i = 0; i < this.__values.length; i++) {
          if (check.__values.indexOf(this.__values[i]) === -1) {
            return false;
          }
        }
      }
      return true;
    }
  }
});
