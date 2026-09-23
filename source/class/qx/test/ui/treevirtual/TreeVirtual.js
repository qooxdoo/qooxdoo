/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2026 qooxdoo contributors

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * Tests for the row lookups that have to tolerate a row index outliving the row
 * it points at. Collapsing a branch rebuilds the row array shorter, and
 * SimpleTreeDataModel.getNode() throws on an index past the end rather than
 * returning nothing.
 *
 * The focused row is the case that is reachable by construction: the tree's
 * dataChanged event carries no removeStart/removeCount, so Table's "remove
 * focus if the focused row has been removed" branch never runs for a tree.
 */
qx.Class.define("qx.test.ui.treevirtual.TreeVirtual", {
  extend: qx.dev.unit.TestCase,

  members: {
    __tree: null,
    __root: null,

    setUp() {
      this.__tree = new qx.ui.treevirtual.TreeVirtual(["Tree"]);
      var dataModel = this.__tree.getDataModel();
      // Node 0 is the model's own hidden root, so the visible rows start here.
      this.__root = dataModel.addBranch(null, "root", true);
      dataModel.addLeaf(this.__root, "one");
      dataModel.addLeaf(this.__root, "two");
      dataModel.setData();
    },

    tearDown() {
      this.__tree.destroy();
      this.__tree = null;
    },

    testFocusedNodeIsNullOnceItsRowIsGone() {
      this.__tree.setFocusedCell(0, 2, false);
      this.assertNotNull(
        this.__tree._getFocusedNode(),
        "the leaf resolves while it exists"
      );

      this.__shrinkToRoot();

      this.assertEquals(
        2,
        this.__tree.getFocusedRow(),
        "a collapse leaves the focus where it was"
      );
      this.assertNull(
        this.__tree._getFocusedNode(),
        "so the focused row no longer resolves to a node"
      );
    },

    testFocusedNodeIsNullWhenNothingIsFocused() {
      // The focused row starts unset, and `null >= 0` is true, so a bounds
      // check alone lets it through to a missing row-array entry.
      this.assertNull(this.__tree.getFocusedRow(), "nothing is focused yet");

      this.assertNull(this.__tree._getFocusedNode(), "and nothing resolves");
    },

    testKeyboardNavigationSurvivesAStaleFocus() {
      this.__tree.setFocusedCell(0, 2, false);
      this.__shrinkToRoot();

      // Every key that reaches for the focused node: Enter toggles it, the Ctrl
      // pair opens/closes it, the Shift pair walks to its parent / first child.
      // Each used to throw here.
      this.__staleFocusKeys().forEach(function (key) {
        this.__tree.setFocusedCell(0, 2, false);
        this.__tree._onKeyDown(this.__keyEvent(key[0], key[1]));
      }, this);

      // Not a requirement, just what the code does today: the guard stops the
      // throw, it doesn't reconcile the focus onto a row that exists. If focus
      // reconciliation lands later this assertion is what will go red.
      this.assertEquals(
        2,
        this.__tree.getFocusedRow(),
        "the focus is left where it was"
      );
    },

    testTapSelectionSurvivesAStaleFocus() {
      this.__tree.setFocusedCell(0, 2, false);
      this.__shrinkToRoot();

      // The selection manager resolves the focused node to decide whether the
      // press hit the open/close button.
      var handled = this.__tree
        .getSelectionManager()
        ._handleSelectEvent(0, this.__keyEvent("Space", 0));

      this.assertUndefined(
        handled,
        "the press falls through to the normal selection"
      );
    },

    testCalculatedSelectionSkipsRowsTheModelNoLongerHas() {
      var dataModel = this.__tree.getDataModel();
      this.assertEquals(3, dataModel.getRowCount(), "root plus its two leaves");

      this.__shrinkToRoot();

      // Selecting a row the model has dropped used to throw out of getNode()
      // ("this._rowArr row (2) out of bounds"), by way of _onSelectionChanged.
      this.__tree.getSelectionModel().setSelectionInterval(2, 2);

      this.assertArrayEquals(
        [],
        this.__tree._calculateSelectedNodes(),
        "a selection pointing past the end selects nothing"
      );
    },

    // Guards against an over-eager bounds check rejecting a row that is there.
    testCalculatedSelectionKeepsARowThatStillExists() {
      this.__tree.getSelectionModel().setSelectionInterval(0, 0);

      var selected = this.__tree._calculateSelectedNodes();

      this.assertEquals(1, selected.length, "a live row still resolves");
      this.assertEquals("root", selected[0].label);
    },

    /** Every key combination that resolves the focused node. */
    __staleFocusKeys() {
      var dom = qx.event.type.Dom;
      return [
        ["Enter", 0],
        ["Left", dom.CTRL_MASK],
        ["Right", dom.CTRL_MASK],
        ["Left", dom.SHIFT_MASK],
        ["Right", dom.SHIFT_MASK]
      ];
    },

    /** A stand-in for the key sequence the handlers under test read. */
    __keyEvent(identifier, modifiers) {
      var dom = qx.event.type.Dom;
      return {
        getKeyIdentifier: () => identifier,
        getModifiers: () => modifiers,
        isShiftPressed: () => (modifiers & dom.SHIFT_MASK) !== 0,
        isCtrlOrCommandPressed: () => (modifiers & dom.CTRL_MASK) !== 0,
        preventDefault() {},
        stopPropagation() {}
      };
    },

    /** Drop the leaves, leaving the row array shorter than the selection. */
    __shrinkToRoot() {
      var dataModel = this.__tree.getDataModel();
      dataModel.prune(this.__root, false);
      dataModel.setData();
      this.assertEquals(1, dataModel.getRowCount(), "only the root is left");
    }
  }
});
