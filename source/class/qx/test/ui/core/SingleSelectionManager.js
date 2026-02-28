/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2025 Qooxdoo contributors

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * Minimal ISingleSelectionProvider implementation for unit testing.
 *
 * @internal
 * @ignore(qx.test.ui.core.MockSingleSelectionProvider)
 */
qx.Class.define("qx.test.ui.core.MockSingleSelectionProvider", {
  extend: qx.core.Object,
  implement: [qx.ui.core.ISingleSelectionProvider],

  construct(items) {
    super();
    this._items = items;
  },

  members: {
    _items: null,

    getItems() {
      return this._items || [];
    },

    isItemSelectable(item) {
      return true;
    }
  }
});

/**
 * Tests for qx.ui.core.SingleSelectionManager
 */
qx.Class.define("qx.test.ui.core.SingleSelectionManager", {
  extend: qx.dev.unit.TestCase,

  members: {
    __manager: null,
    __provider: null,
    __items: null,

    setUp() {
      this.__items = [new qx.core.Object(), new qx.core.Object(), new qx.core.Object()];
      this.__provider = new qx.test.ui.core.MockSingleSelectionProvider(this.__items);
      this.__manager = new qx.ui.core.SingleSelectionManager(this.__provider);
    },

    tearDown() {
      this.__manager.dispose();
      this.__provider.dispose();
      for (var item of this.__items) {
        item.dispose();
      }
      this.__items = null;
    },

    /**
     * Regression test for the fix: resetSelected() with allowEmptySelection=false
     * must NOT fire changeSelected when the first item is already selected.
     */
    testNoSpuriousEventWhenResetSelectedWithFirstItemAlreadySelected() {
      this.__manager.setAllowEmptySelection(false);
      this.__manager.resetSelected();
      this.assertIdentical(this.__items[0], this.__manager.getSelected(), "item[0] should be auto-selected");

      var eventCount = 0;
      this.__manager.addListener("changeSelected", function () {
        eventCount++;
      });

      this.__manager.resetSelected();

      this.assertEquals(0, eventCount, "changeSelected must not fire when selection is unchanged");
      this.assertIdentical(this.__items[0], this.__manager.getSelected(), "Selection must still be item[0]");
    },

    /**
     * resetSelected() when another item is selected must fire changeSelected
     * and switch back to item[0].
     */
    testEventFiredWhenResetSelectedChangesSelection() {
      this.__manager.setAllowEmptySelection(false);
      this.__manager.setSelected(this.__items[1]);

      var eventCount = 0;
      var eventData = null;
      this.__manager.addListener("changeSelected", function (e) {
        eventCount++;
        eventData = e.getData();
      });

      this.__manager.resetSelected();

      this.assertEquals(1, eventCount, "changeSelected must fire when selection changes");
      this.assertIdentical(this.__items[0], eventData, "Event data should be item[0]");
      this.assertIdentical(this.__items[0], this.__manager.getSelected(), "item[0] should be selected after reset");
    },

    /**
     * setSelected() with the already-selected item must not fire changeSelected
     * (pre-existing early-exit guard).
     */
    testNoEventWhenSetSelectedWithSameItem() {
      this.__manager.setSelected(this.__items[0]);

      var eventCount = 0;
      this.__manager.addListener("changeSelected", function () {
        eventCount++;
      });

      this.__manager.setSelected(this.__items[0]);

      this.assertEquals(0, eventCount, "changeSelected must not fire when setting the same item");
    },

    /**
     * Switching allowEmptySelection from true to false on an empty manager
     * must auto-select item[0] and fire changeSelected exactly once.
     */
    testAllowEmptySelectionFalseTriggersAutoSelect() {
      this.assertTrue(this.__manager.isSelectionEmpty(), "Selection should be empty initially");

      var eventCount = 0;
      var eventData = null;
      this.__manager.addListener("changeSelected", function (e) {
        eventCount++;
        eventData = e.getData();
      });

      this.__manager.setAllowEmptySelection(false);

      this.assertEquals(1, eventCount, "changeSelected must fire when auto-selecting the first item");
      this.assertIdentical(this.__items[0], eventData, "Event data should be item[0]");
      this.assertIdentical(this.__items[0], this.__manager.getSelected(), "item[0] should be auto-selected");
    }
  }
});
