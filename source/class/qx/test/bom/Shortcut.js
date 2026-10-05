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
    /**
     * Number of listeners of the given type currently registered on
     * <code>document.documentElement</code>.
     *
     * @param type {String} event type
     * @return {Integer} number of listeners
     */
    __countListeners(type) {
      var el = document.documentElement;
      var listeners = qx.event.Registration.getManager(el).getListeners(
        el,
        type,
        false
      );

      return listeners ? listeners.length : 0;
    },

    /**
     * Snapshot of the keydown and keypress listener counts.
     *
     * @return {Map} map with a <code>keydown</code> and a
     *    <code>keypress</code> count
     */
    __keyListeners() {
      return {
        keydown: this.__countListeners("keydown"),
        keypress: this.__countListeners("keypress")
      };
    },

    /**
     * Asserts that the key listener counts moved by the expected amount.
     *
     * @param before {Map} snapshot taken before
     * @param delta {Integer} expected change
     */
    __assertKeyListenerDelta(before, delta) {
      var now = this.__keyListeners();
      this.assertEquals(
        before.keydown + delta,
        now.keydown,
        "keydown listeners"
      );

      this.assertEquals(
        before.keypress + delta,
        now.keypress,
        "keypress listeners"
      );
    },

    testNoListenersWithoutShortcut() {
      var before = this.__keyListeners();

      var shortcuts = [];
      for (var i = 0; i < 5; i++) {
        shortcuts.push(new qx.bom.Shortcut());
      }
      this.__assertKeyListenerDelta(before, 0);

      shortcuts.forEach(function (shortcut) {
        shortcut.dispose();
      });
      this.__assertKeyListenerDelta(before, 0);
    },

    testListenersWhileShortcutSet() {
      var before = this.__keyListeners();

      var shortcut = new qx.bom.Shortcut("Control+K");
      this.__assertKeyListenerDelta(before, 1);

      shortcut.dispose();
      this.__assertKeyListenerDelta(before, 0);
    },

    testSettingShortcutAddsListeners() {
      var before = this.__keyListeners();

      var shortcut = new qx.bom.Shortcut();
      this.__assertKeyListenerDelta(before, 0);

      shortcut.setShortcut("Control+K");
      this.__assertKeyListenerDelta(before, 1);

      shortcut.dispose();
      this.__assertKeyListenerDelta(before, 0);
    },

    testDisablingRemovesListeners() {
      var before = this.__keyListeners();

      var shortcut = new qx.bom.Shortcut("Control+K");
      shortcut.setEnabled(false);
      this.__assertKeyListenerDelta(before, 0);

      shortcut.setEnabled(true);
      this.__assertKeyListenerDelta(before, 1);

      shortcut.dispose();
      this.__assertKeyListenerDelta(before, 0);
    },

    testSetShortcutNullClearsKey() {
      var before = this.__keyListeners();

      var shortcut = new qx.bom.Shortcut("Control+K");
      shortcut.setShortcut(null);

      this.assertNull(shortcut.getShortcut());
      this.assertEquals("", shortcut.toString());
      this.__assertKeyListenerDelta(before, 0);

      shortcut.dispose();
    },

    testResetShortcutClearsKey() {
      var before = this.__keyListeners();

      var shortcut = new qx.bom.Shortcut("Control+K");
      shortcut.resetShortcut();

      this.assertNull(shortcut.getShortcut());
      this.assertEquals("", shortcut.toString());
      this.__assertKeyListenerDelta(before, 0);

      shortcut.dispose();
    },

    testSetShortcutEmptyStringClearsKey() {
      var before = this.__keyListeners();

      var shortcut = new qx.bom.Shortcut("Control+K");
      shortcut.setShortcut("");

      this.assertEquals("", shortcut.getShortcut());
      this.assertEquals("", shortcut.toString());
      this.__assertKeyListenerDelta(before, 0);

      shortcut.dispose();
    },

    testShortcutCanBeSetAgainAfterClearing() {
      var before = this.__keyListeners();

      var shortcut = new qx.bom.Shortcut("Control+K");
      shortcut.setShortcut(null);
      shortcut.setShortcut("Alt+F1");

      this.assertEquals("Alt+F1", shortcut.getShortcut());
      this.__assertKeyListenerDelta(before, 1);

      shortcut.dispose();
      this.__assertKeyListenerDelta(before, 0);
    }
  }
});
