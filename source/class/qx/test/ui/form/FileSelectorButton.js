/* ************************************************************************

   qooxdoo

   http://qooxdoo.org

   Copyright:
     2021 OETIKER+PARTNER AG

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tobias Oetiker (oetiker)

************************************************************************ */

qx.Class.define("qx.test.ui.form.FileSelectorButton", {
  extend: qx.test.ui.LayoutTestCase,

  include: [qx.dev.unit.MRequirements, qx.dev.unit.MMock],

  members: {
    testInstantiation() {
      let uploadField = new qx.ui.form.FileSelectorButton("Select a File");
      this.getRoot().add(uploadField);
      this.flush();
      uploadField.destroy();
    }
  }
});
