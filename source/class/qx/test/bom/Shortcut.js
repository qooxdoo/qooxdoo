/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2025 Tartan Solutions Inc, https://www.tartansolutions.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Pat Buxton (rad-pat)

************************************************************************ */

qx.Class.define("qx.test.bom.Shortcut", {
  extend: qx.dev.unit.TestCase,

  members: {
    testSetShortcutNullClearsKey() {
      var shortcut = new qx.bom.Shortcut("Control+K");
      shortcut.setShortcut(null);

      this.assertNull(shortcut.getShortcut());
      this.assertEquals("", shortcut.toString());

      shortcut.dispose();
    },

    testResetShortcutClearsKey() {
      var shortcut = new qx.bom.Shortcut("Control+K");
      shortcut.resetShortcut();

      this.assertNull(shortcut.getShortcut());
      this.assertEquals("", shortcut.toString());

      shortcut.dispose();
    },

    testSetShortcutEmptyStringClearsKey() {
      var shortcut = new qx.bom.Shortcut("Control+K");
      shortcut.setShortcut("");

      this.assertEquals("", shortcut.getShortcut());
      this.assertEquals("", shortcut.toString());

      shortcut.dispose();
    },

    testShortcutCanBeSetAgainAfterClearing() {
      var shortcut = new qx.bom.Shortcut("Control+K");
      shortcut.setShortcut(null);
      shortcut.setShortcut("Alt+F1");

      this.assertEquals("Alt+F1", shortcut.getShortcut());

      shortcut.dispose();
    }
  }
});
