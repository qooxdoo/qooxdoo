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
qx.Bootstrap.define("qx.core.check.standard.ColorCheck", {
  extend: qx.core.check.AbstractCheck,

  members: {
    /**
     * @override
     */
    _matchesImpl(value) {
      return qx.lang.Type.isString(value) && qx.util.ColorUtil.isValidPropertyValue(value);
    }
  }
});
