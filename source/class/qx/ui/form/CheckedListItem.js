/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2026 Zenesis Limited https://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (github.com/johnspackman)

************************************************************************ */

qx.Class.define("qx.ui.form.CheckedListItem", {
  extend: qx.ui.form.CheckBox,

  properties: {
    appearance: {
      init: "checkbox",
      refine: true
    }
  }
});
