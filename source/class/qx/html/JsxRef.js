/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2019 Zenesis Ltd http://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (https://github.com/johnspackman)
  
************************************************************************ */

/**
 * This class provides encapsulation for a JSX reference
 */
qx.Class.define("qx.html.JsxRef", {
  extend: qx.core.Object,

  properties: {
    value: {
      init: null,
      nullable: true,
      check: "qx.html.Element",
      event: "changeValue"
    }
  },

  members: {}
});
