/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * @ignore(qx.test.ui.tree.virtual.Leaf)
 * @ignore(qx.test.ui.tree.virtual.Node)
 */

qx.Class.define("qx.test.ui.tree.virtual.AbstractTreeTest", {
  type: "abstract",
  extend: qx.test.ui.LayoutTestCase,
  include: [qx.dev.unit.MMock, qx.test.ui.list.MAssert],

  construct() {
    super();

    qx.Class.define("qx.test.ui.tree.virtual.Leaf", {
      extend: qx.core.Object,
      include: qx.data.marshal.MEventBubbling,

      construct(name) {
        super();

        this.setName(name);
      },

      properties: {
        name: {
          check: "String",
          event: "changeName",
          apply: "_applyEventPropagation",
          nullable: true
        }
      },

      members: {
        toString() {
          return this.getName();
        },

        equals(item) {
          return this.getName() === item.getName();
        }
      }
    });

    qx.Class.define("qx.test.ui.tree.virtual.Node", {
      extend: qx.test.ui.tree.virtual.Leaf,

      construct(name, children) {
        super(name);

        if (children == null) {
          children = new qx.data.Array();
        }
        this.setChildren(children);
      },

      properties: {
        children: {
          check: "qx.data.Array",
          event: "changeChildren",
          apply: "_applyEventPropagation",
          nullable: true
        }
      },

      destruct() {
        if (!qx.core.ObjectRegistry.inShutDown) {
          var children = this.getChildren();
          for (var i = 0; i < children.getLength(); i++) {
            children.getItem(i).dispose();
          }
          children.dispose();
          this.setChildren(null);
        }
      }
    });
  },

  members: {
    tree: null,

    setUp() {
      super.setUp();

      this.tree = new qx.ui.tree.VirtualTree();
      this.getRoot().add(this.tree);
    },

    tearDown() {
      super.tearDown();

      this.tree.dispose();
      this.tree = null;

      if (this.model != null) {
        this.model.dispose();
        this.model = null;
      }
    },

    createModel(level) {
      var root = new qx.test.ui.tree.virtual.Node("Root node");
      this._createNodes(root, level);

      return root;
    },

    createModelAndSetModel(level) {
      this.model = this.createModel(level);
      this.tree.setLabelPath("name");
      this.tree.setChildProperty("children");
      this.tree.setModel(this.model);
      return this.model;
    },

    getVisibleItemsFrom(parent, openNodes) {
      var expected = [];

      if (parent.getChildren() != null) {
        for (var i = 0; i < parent.getChildren().getLength(); i++) {
          var child = parent.getChildren().getItem(i);
          expected.push(child);

          if (openNodes.indexOf(child) > -1) {
            var otherExpected = this.getVisibleItemsFrom(child, openNodes);
            expected = expected.concat(otherExpected);
          }
        }
      }

      return expected;
    },

    /*
    ---------------------------------------------------------------------------
      HELPER METHODS TO CREATE A TREE STRUCTURE
    ---------------------------------------------------------------------------
    */

    _createNodes(parent, level) {
      if (level > 0) {
        for (var i = 0; i < 5; i++) {
          var item = new qx.test.ui.tree.virtual.Node(
            "Node " + this.__getPrefix(parent) + i
          );

          parent.getChildren().push(item);

          this._createNodes(item, level - 1);
          this._createLeafs(item);
        }
      }
    },

    _createLeafs(parent) {
      for (var i = 0; i < 5; i++) {
        var child = new qx.test.ui.tree.virtual.Leaf(
          "Leaf " + this.__getPrefix(parent) + i
        );

        parent.getChildren().push(child);
      }
    },

    __getPrefix(item) {
      var name = item.getName();
      var prefix = "";
      if (name.startsWith("Node")) {
        prefix = name.substr(5, name.length - 5) + ".";
      }
      return prefix;
    }
  },

  destruct() {
    if (qx.Class.isDefined("qx.test.ui.tree.virtual.Leaf")) {
      qx.Class.undefine("qx.test.ui.tree.virtual.Leaf");
    }

    if (qx.Class.isDefined("qx.test.ui.tree.virtual.Node")) {
      qx.Class.undefine("qx.test.ui.tree.virtual.Node");
    }
  }
});
