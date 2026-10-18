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
 * Tests that prune() leaves exactly the model the recursive, per-child removal
 * it replaces used to leave. Every case is run twice over two identically
 * built trees: once through the algorithm as it was, once through prune(), and
 * the two models are then compared node for node and row for row.
 */
qx.Class.define("qx.test.ui.treevirtual.SimpleTreeDataModel", {
  extend: qx.dev.unit.TestCase,

  members: {
    __trees: null,

    setUp() {
      this.__trees = [];
    },

    tearDown() {
      for (var i = 0; i < this.__trees.length; i++) {
        this.__trees[i].destroy();
      }
      this.__trees = null;
    },

    /**
     * Build a tree with the shapes prune() has to cope with: a flat folder, an
     * empty branch, a deep chain, a lone leaf, an untouched sibling subtree,
     * and a couple of selected nodes.
     *
     * @return {Map} The tree, its data model, and the ids of the named nodes.
     */
    __buildTree() {
      var tree = new qx.ui.treevirtual.TreeVirtual(["Tree"]);
      this.__trees.push(tree);

      var model = tree.getDataModel();
      var ids = {};

      ids.top = model.addBranch(null, "top", true);
      ids.empty = model.addBranch(ids.top, "empty", true);
      ids.flat = model.addBranch(ids.top, "flat", true);
      for (var i = 0; i < 25; i++) {
        ids["flatLeaf" + i] = model.addLeaf(ids.flat, "flat leaf " + i);
      }

      var parent = (ids.deep = model.addBranch(ids.top, "deep", true));
      for (var level = 0; level < 5; level++) {
        parent = model.addBranch(parent, "level " + level, true);
        model.addLeaf(parent, "leaf of level " + level);
      }
      ids.deepest = parent;

      ids.lonely = model.addLeaf(ids.top, "lonely");
      ids.sibling = model.addBranch(null, "sibling", true);
      ids.siblingLeaf = model.addLeaf(ids.sibling, "sibling leaf");

      model.setData();

      model.setState(ids.flatLeaf7, { bSelected: true });
      model.setState(ids.deepest, { bSelected: true });
      model.setState(ids.siblingLeaf, { bSelected: true });

      return { tree: tree, model: model, ids: ids };
    },

    /**
     * prune() as it was before it stopped searching the parent for each child.
     *
     * @param model {qx.ui.treevirtual.SimpleTreeDataModel} The model to prune.
     * @param nodeReference {Object|Integer} The node to prune.
     * @param bSelfAlso {Boolean} Whether to remove that node as well.
     */
    __legacyPrune(model, nodeReference, bSelfAlso) {
      var node;
      var nodeId;

      if (typeof nodeReference == "object") {
        node = nodeReference;
        nodeId = node.nodeId;
      } else if (typeof nodeReference == "number") {
        nodeId = nodeReference;
      } else {
        throw new Error("Expected node object or node id");
      }

      for (var i = model._nodeArr[nodeId].children.length - 1; i >= 0; i--) {
        this.__legacyPrune(model, model._nodeArr[nodeId].children[i], true);
      }

      if (bSelfAlso && nodeId != 0) {
        node = model._nodeArr[nodeId];
        qx.lang.Array.remove(
          model._nodeArr[node.parentNodeId].children,
          nodeId
        );

        if (model._selections[nodeId]) {
          delete model._selections[nodeId];
        }

        model._nodeArr[nodeId] = null;
      }
    },

    /**
     * The whole state prune() is allowed to touch, as a comparable string.
     *
     * @param model {qx.ui.treevirtual.SimpleTreeDataModel} The model to read.
     * @return {String} The node array and the selection list.
     */
    __snapshot(model) {
      var nodes = [];
      for (var nodeId = 0; nodeId < model._nodeArr.length; nodeId++) {
        var node = model._nodeArr[nodeId];
        nodes.push(
          node == null
            ? null
            : {
                nodeId: node.nodeId,
                parentNodeId: node.parentNodeId,
                label: node.label,
                type: node.type,
                children: node.children.concat()
              }
        );
      }

      return qx.lang.Json.stringify({
        nodes: nodes,
        selections: Object.keys(model._selections).sort()
      });
    },

    /**
     * The rendered rows, as a comparable string.
     *
     * @param model {qx.ui.treevirtual.SimpleTreeDataModel} The model to read.
     * @return {String} One entry per row, with its indentation level.
     */
    __rows(model) {
      var rows = [];
      for (var row = 0; row < model.getRowCount(); row++) {
        var node = model.getNode(row);
        rows.push(node.level + ":" + node.label);
      }
      return rows.join("|");
    },

    /**
     * Prune the same node out of two identical trees, the first with the old
     * algorithm and the second with prune(), and assert that nothing tells
     * them apart - before or after the tree is re-rendered.
     *
     * @param message {String} What is being pruned.
     * @param pick {Function} Picks the node to prune out of the id map.
     * @param bSelfAlso {Boolean} Whether to remove that node as well.
     */
    __assertPruneMatchesLegacy(message, pick, bSelfAlso) {
      var before = this.__buildTree();
      var after = this.__buildTree();

      var intact = this.__snapshot(before.model);
      this.assertEquals(
        intact,
        this.__snapshot(after.model),
        "the two fixtures start out identical"
      );

      this.__legacyPrune(before.model, pick(before), bSelfAlso);
      after.model.prune(pick(after), bSelfAlso);

      var pruned = this.__snapshot(before.model);
      this.assertNotEquals(intact, pruned, message + " changes the model");
      this.assertEquals(pruned, this.__snapshot(after.model), message);

      before.model.setData();
      after.model.setData();
      this.assertEquals(
        this.__rows(before.model),
        this.__rows(after.model),
        message + ", rendered"
      );
    },

    testPruneFlatFolderKeepingIt() {
      // The folder-reload case: empty the folder, then refill it.
      this.__assertPruneMatchesLegacy(
        "pruning a flat folder's contents",
        fixture => fixture.ids.flat,
        false
      );
    },

    testPruneFlatFolderWithIt() {
      this.__assertPruneMatchesLegacy(
        "pruning a flat folder",
        fixture => fixture.ids.flat,
        true
      );
    },

    testPruneNestedBranch() {
      this.__assertPruneMatchesLegacy(
        "pruning a branch of branches",
        fixture => fixture.ids.top,
        true
      );
    },

    testPruneEmptyBranch() {
      this.__assertPruneMatchesLegacy(
        "pruning a branch with no children",
        fixture => fixture.ids.empty,
        true
      );
    },

    testPruneLeaf() {
      this.__assertPruneMatchesLegacy(
        "pruning a leaf",
        fixture => fixture.ids.lonely,
        true
      );
    },

    testPruneRoot() {
      this.__assertPruneMatchesLegacy(
        "pruning the root, which is never removed itself",
        () => 0,
        true
      );
    },

    testPruneByNodeObject() {
      this.__assertPruneMatchesLegacy(
        "pruning by node object rather than node id",
        fixture => fixture.model._nodeArr[fixture.ids.deep],
        true
      );
    },

    testPruneRejectsSomethingThatIsNeitherNodeNorId() {
      var model = this.__buildTree().model;
      this.assertException(
        () => model.prune("flat", true),
        Error,
        "Expected node object or node id"
      );
    },

    testPrunedChildrenListIsEmptiedInPlace() {
      // Callers reload a folder by pruning it and adding the new children to
      // the very same node, so the list has to survive as an empty list.
      var fixture = this.__buildTree();
      var children = fixture.model._nodeArr[fixture.ids.flat].children;

      fixture.model.prune(fixture.ids.flat, false);

      this.assertIdentical(
        children,
        fixture.model._nodeArr[fixture.ids.flat].children,
        "the children list is the one that was there before"
      );
      this.assertEquals(0, children.length, "and it is empty");
    },

    testPruneDoesNotSearchTheParentForEachChild() {
      // The cost that made this quadratic: one qx.lang.Array.remove per node
      // removed, each an indexOf over what was left of the parent's children.
      // Only the pruned node itself is looked up now, however many
      // descendants it has.
      var fixture = this.__buildTree();
      var branch = fixture.model.addBranch(fixture.ids.top, "big", true);
      for (var i = 0; i < 20000; i++) {
        fixture.model.addLeaf(branch, "leaf " + i);
      }

      var removes = 0;
      var remove = qx.lang.Array.remove;
      qx.lang.Array.remove = function () {
        removes++;
        return remove.apply(this, arguments);
      };

      try {
        fixture.model.prune(branch, false);
        this.assertEquals(0, removes, "emptying a folder searches nothing");

        fixture.model.prune(branch, true);
        this.assertEquals(
          1,
          removes,
          "removing the folder searches only for the folder"
        );
      } finally {
        qx.lang.Array.remove = remove;
      }

      this.assertNull(
        fixture.model._nodeArr[branch],
        "and the folder is gone, with its leaves"
      );
    }
  }
});
