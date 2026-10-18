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
 * Tests that the lookup table the tree builds is the one the traversal built
 * before it stopped concatenating its result and copying each branch's
 * children. Every case runs the old traversal over the very same tree and
 * compares the rows and their nesting levels.
 *
 * @ignore(qx.test.ui.tree.virtual.Leaf)
 * @ignore(qx.test.ui.tree.virtual.Node)
 */
qx.Class.define("qx.test.ui.tree.virtual.LookupTable", {
  extend: qx.test.ui.tree.virtual.AbstractTreeTest,

  members: {
    /**
     * buildLookupTable() as it was, reading only what it read.
     *
     * @return {Map} The rows and their nesting levels.
     */
    __legacyLookupTable() {
      var levels = [];
      var lookupTable = [];
      var nestedLevel = -1;

      var root = this.tree.getModel();
      if (root != null) {
        if (!this.tree.isHideRoot()) {
          nestedLevel++;
          lookupTable.push(root);
          levels.push(nestedLevel);
        }

        if (this.tree.isNodeOpen(root)) {
          lookupTable = lookupTable.concat(
            this.__legacyVisibleChildrenFrom(root, nestedLevel, levels)
          );
        }
      }

      return { rows: lookupTable, levels: levels };
    },

    /**
     * __getVisibleChildrenFrom() as it was.
     *
     * @param node {qx.core.Object} The start node to start search.
     * @param nestedLevel {Integer} The nested level from the start node.
     * @param levels {Array} Collects the nesting level of each visible row.
     * @return {Array} All visible children form the parent.
     */
    __legacyVisibleChildrenFrom(node, nestedLevel, levels) {
      var visible = [];
      nestedLevel++;

      if (!this.tree.isNode(node)) {
        return visible;
      }

      var children = node.get(this.tree.getChildProperty());
      if (children == null) {
        return visible;
      }

      children = children.copy();

      var delegate = this.tree.getDelegate();
      var filter = qx.util.Delegate.getMethod(delegate, "filter");
      var sorter = qx.util.Delegate.getMethod(delegate, "sorter");

      if (sorter != null) {
        children.sort(sorter);
      }

      for (var i = 0; i < children.getLength(); i++) {
        var child = children.getItem(i);

        if (filter && !filter(child)) {
          continue;
        }

        if (this.tree.isNode(child)) {
          levels.push(nestedLevel);
          visible.push(child);

          if (this.tree.isNodeOpen(child)) {
            visible = visible.concat(
              this.__legacyVisibleChildrenFrom(child, nestedLevel, levels)
            );
          }
        } else {
          if (this.tree.isShowLeafs()) {
            levels.push(nestedLevel);
            visible.push(child);
          }
        }
      }

      children.dispose();

      return visible;
    },

    /**
     * Assert that the tree's lookup table and nesting levels are the ones the
     * old traversal produces for the tree as it stands.
     *
     * @param message {String} What is being compared.
     * @param mayBeEmpty {Boolean?false} Allow a lookup table with no rows.
     */
    __assertMatchesLegacy(message, mayBeEmpty) {
      this.flush();

      var expected = this.__legacyLookupTable();
      var rows = this.tree.getLookupTable().toArray();

      if (!mayBeEmpty) {
        this.assertTrue(
          expected.rows.length > 1,
          message + ": the fixture has rows to compare"
        );
      }

      this.assertArrayEquals(expected.rows, rows, message + ": rows");

      var levels = [];
      for (var i = 0; i < rows.length; i++) {
        levels.push(this.tree.getLevel(i));
      }

      this.assertEquals(
        expected.levels.length,
        rows.length,
        message + ": one level per row"
      );

      this.assertArrayEquals(expected.levels, levels, message + ": levels");
    },

    /**
     * Open a handful of nodes spread over the tree, including a nested one.
     *
     * @param root {qx.core.Object} The model root.
     */
    __openSome(root) {
      var second = root.getChildren().getItem(1);
      this.tree.openNode(second);
      this.tree.openNode(second.getChildren().getItem(3));
      this.tree.openNode(root.getChildren().getItem(4));
    },

    testClosedTree() {
      this.createModelAndSetModel(2);

      this.__assertMatchesLegacy("only the root is open");
    },

    testOpenNodes() {
      var root = this.createModelAndSetModel(2);
      this.__openSome(root);

      this.__assertMatchesLegacy("a few branches are open");
    },

    testHideRoot() {
      var root = this.createModelAndSetModel(2);
      this.__openSome(root);
      this.tree.setHideRoot(true);

      this.__assertMatchesLegacy("the root is hidden");
    },

    testHideLeafs() {
      var root = this.createModelAndSetModel(2);
      this.__openSome(root);
      this.tree.setShowLeafs(false);

      this.__assertMatchesLegacy("leafs are hidden");
    },

    testShowTopLevelOpenCloseIcons() {
      var root = this.createModelAndSetModel(2);
      this.__openSome(root);
      this.tree.setShowTopLevelOpenCloseIcons(true);

      this.__assertMatchesLegacy("the top level shows open/close icons");
    },

    testEmptyBranch() {
      var root = this.createModelAndSetModel(1);
      root
        .getChildren()
        .push(
          new qx.test.ui.tree.virtual.Node("Empty node", new qx.data.Array())
        );

      this.tree.openNode(root.getChildren().getItem(5));

      this.__assertMatchesLegacy("an open branch with no children");
    },

    testBranchWithoutChildrenArray() {
      var root = this.createModelAndSetModel(1);
      var node = new qx.test.ui.tree.virtual.Node("Node without children");
      var children = node.getChildren();
      root.getChildren().push(node);

      this.tree.openNode(node);
      node.setChildren(null);

      this.__assertMatchesLegacy("an open branch whose children are null");

      // put the array back so the model can dispose itself
      node.setChildren(children);
    },

    testFilterHidingEveryChildOfABranch() {
      var root = this.createModelAndSetModel(2);
      this.__openSome(root);

      var hidden = root.getChildren().getItem(1).getChildren().getItem(3);
      this.tree.setDelegate({
        filter(item) {
          return item.getName().indexOf("Leaf 1.3.") !== 0;
        }
      });

      this.assertTrue(
        this.tree.isNodeOpen(hidden),
        "the emptied branch is still open"
      );

      this.__assertMatchesLegacy("a filter hides every child of a branch");
    },

    testFilterHidingEverything() {
      var root = this.createModelAndSetModel(2);
      this.__openSome(root);
      this.tree.setDelegate({
        filter() {
          return false;
        }
      });

      this.__assertMatchesLegacy("a filter hides everything", true);
      this.assertEquals(
        1,
        this.tree.getLookupTable().getLength(),
        "only the root is left"
      );
    },

    testSorter() {
      var root = this.createModelAndSetModel(2);
      this.__openSome(root);

      var order = root.getChildren().toArray().concat();
      this.tree.setDelegate({
        sorter(a, b) {
          a = a.getName();
          b = b.getName();
          return a < b ? 1 : a > b ? -1 : 0;
        }
      });

      this.__assertMatchesLegacy("a sorter reverses every branch");

      this.assertArrayEquals(
        order,
        root.getChildren().toArray(),
        "and the model is left in its own order"
      );
    },

    testSorterAndFilter() {
      var root = this.createModelAndSetModel(2);
      this.__openSome(root);

      this.tree.setDelegate({
        sorter(a, b) {
          a = a.getName();
          b = b.getName();
          return a < b ? 1 : a > b ? -1 : 0;
        },

        filter(item) {
          return item.getName().indexOf("2") === -1;
        }
      });

      this.__assertMatchesLegacy("a sorter and a filter together");
    },

    testOpeningAndClosingKeepTheTableInStep() {
      var root = this.createModelAndSetModel(2);
      var node = root.getChildren().getItem(2);

      this.tree.openNode(node);
      this.__assertMatchesLegacy("a branch has been opened");

      this.tree.openNode(node.getChildren().getItem(1));
      this.__assertMatchesLegacy("a nested branch has been opened");

      this.tree.closeNode(node);
      this.__assertMatchesLegacy("the outer branch has been closed again");

      this.tree.openNode(node);
      this.__assertMatchesLegacy("and the nested branch is still open");
    },

    testRebuildDoesNotCopyEachBranch() {
      // One of the two costs this fix removes: every visited branch's
      // children were copied into a qx.data.Array which was then disposed.
      // The other, concatenating the rows collected so far once per open
      // branch, is not observable without patching a built-in, so it is left
      // to the equivalence tests above. The rebuild below changes nothing, so
      // the traversal and the comparison against the current table are all
      // that runs.
      var root = this.createModelAndSetModel(2);
      this.__openSome(root);
      this.flush();

      var copies = 0;
      var copy = qx.data.Array.prototype.copy;
      qx.data.Array.prototype.copy = function () {
        copies++;
        return copy.apply(this, arguments);
      };

      try {
        this.tree.refresh();
      } finally {
        qx.data.Array.prototype.copy = copy;
      }

      this.assertTrue(
        this.tree.getLookupTable().getLength() > 25,
        "the fixture is big enough for the count to mean something"
      );

      this.assertEquals(0, copies, "no branch's children are copied");
    }
  }
});
