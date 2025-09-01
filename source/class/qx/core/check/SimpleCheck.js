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
qx.Bootstrap.define("qx.core.check.SimpleCheck", {
  extend: qx.core.check.AbstractCheck,
  implement: qx.core.check.ICheck,

  construct(matches, nullable) {
    super(nullable);
    this.__matches = matches;
  },

  members: {
    /** @type{Function} passed a value and returns true if the value matches this check */
    __matches: null,

    /**
     * @override
     */
    _matchesImpl(value, thisObj) {
      return this.__matches.call(thisObj, value);
    }
  }
});
