/**
 * The API viewer. Shows the API documentation.
 *
 * @param clientWindow {qx.client.ClientWindow} the window were to show the API
 *        documentation.
 */
qx.OO.defineClass("qx.apiviewer.ApiViewer", qx.core.Object, 
function (clientWindow) {
  qx.core.Object.call(this);

  var boxLayout = new qx.ui.layout.HorizontalBoxLayout;

  boxLayout.setLocation(0, 0);
  boxLayout.set({ right:0, bottom:0, spacing:5 });

  this._tree = new qx.ui.tree.Tree("qooxdoo API Documentation")
  this._tree.set({ backgroundColor:255, border:qx.renderer.border.BorderObject.presets.black,
    overflow:"scrollY", width:300, height:qx.Const.CORE_HUNDREDPERCENT });
  this._tree.getManager().addEventListener("changeSelection", this._onTreeSelectionChange, this);
  boxLayout.add(this._tree);

  this._detailViewer = new qx.apiviewer.DetailViewer;
  this._detailViewer.set({ border:qx.renderer.border.BorderObject.presets.black,
    width:qx.Const.CORE_FLEX, height:qx.Const.CORE_HUNDREDPERCENT,
    visibility:false });
  boxLayout.add(this._detailViewer);

  // Workaround: Since navigating in qx.ui.tree.Tree doesn't work, we've to maintain a
  //             hash that keeps the tree nodes for class names
  this._classTreeNodeHash = {};

  clientWindow.getClientDocument().add(boxLayout);

  qx.apiviewer.ApiViewer.instance = this;
};

clazz = qx.apiviewer.ApiViewer;

clazz.extend(QxObject, "qx.apiviewer.ApiViewer");


/** The documentation tree to show. */
qx.OO.addProperty({ name:"docTree", type:QxConst.TYPEOF_OBJECT });


// property checker
proto._modifyDocTree = function(propValue, propOldValue, propData) {
  this._updateTree(propValue);
  return true;
};


/**
 * Loads the API doc tree from a URL. The URL must point to a JSON encoded
 * doc tree.
 *
 * @param url {string} the URL.
 */
proto.loadDocTreeFromUrl = function(url) {
  var req = new qx.io.remote.RemoteRequest(url);
  handler = function(evt) {
    this.debug("request handler");
    req.removeEventListener("completed", handler, this);

    content = evt.getData().getContent();
    this.setDocTree(eval("(" + content + ")"));

    var self = this;
    window.setTimeout(function() {
      if (window.location.hash) {
        self.selectItem(window.location.hash.substring(1));
      }
    }, 0);

  };
  req.addEventListener("completed", handler, this);
  req.send(); 
  this.debug("### sending request: " + req.getState());
};


/**
 * Updates the tree on the left.
 *
 * @param docTree {Map} the documentation tree to use for updating.
 */
proto._updateTree = function(docTree) {
  this.debug("_updateTree");
  var packagesNode = new qx.ui.tree.TreeFolder("Packages");

  this._tree.removeAll();
  this._tree.add(packagesNode);

  this._fillPackageNode(packagesNode, docTree);

  packagesNode.open();
};


/**
 * Fills a package tree node with tree nodes for the sub packages and classes.
 *
 * @param treeNode {qx.ui.tree.TreeFolder} the package tree node.
 * @param docNode {Map} the documentation node of the package.
 */
proto._fillPackageNode = function(treeNode, docNode) {
  var TreeUtil = qx.apiviewer.TreeUtil;

  var packagesDocNode = TreeUtil.getChild(docNode, "packages");
  if (packagesDocNode && packagesDocNode.children) {
    for (var i = 0; i < packagesDocNode.children.length; i++) {
      var packageDocNode = packagesDocNode.children[i];
      var iconUrl = TreeUtil.getIconUrl(packageDocNode);
      var packageTreeNode = new qx.ui.tree.TreeFolder(packageDocNode.attributes.name, iconUrl);
      packageTreeNode.docNode = packageDocNode;
      treeNode.add(packageTreeNode);

      this._fillPackageNode(packageTreeNode, packageDocNode);

      // Open the package node if it has child packages
      if (TreeUtil.getChild(packageDocNode, "packages")) {
        packageTreeNode.open();
      }
    }
  }

  var classesDocNode = TreeUtil.getChild(docNode, "classes");
  if (classesDocNode && classesDocNode.children) {
    for (var i = 0; i < classesDocNode.children.length; i++) {
      var classDocNode = classesDocNode.children[i];
      var iconUrl = TreeUtil.getIconUrl(classDocNode);
      var classTreeNode = new qx.ui.tree.TreeFolder(classDocNode.attributes.name, iconUrl);
      classTreeNode.docNode = classDocNode;
      treeNode.add(classTreeNode);

      this._classTreeNodeHash[classDocNode.attributes.fullName] = classTreeNode
    }
  }
};


/**
 * Event handler. Called when the tree selection has changed.
 *
 * @param evt {Map} the event.
 */
proto._onTreeSelectionChange = function(evt) {
  var docNode = evt.getData().getFirst().docNode;
  if (docNode && docNode.type == "class") {
    this._detailViewer.showClass(docNode);
    this._detailViewer.setVisibility(true);
  } else {
    this._detailViewer.setVisibility(false);
  }
};


/**
 * Selects an item (class, property, method or constant).
 *
 * @param fullItemName {string} the full name of the item to select.
 *        (e.g. "qx.mypackage.MyClass" or "qx.mypackage.MyClass#myProperty")
 */
proto.selectItem = function(fullItemName) {
  var className = fullItemName;
  var itemName = null;
  var hashPos = fullItemName.indexOf("#");
  if (hashPos != -1) {
    className = fullItemName.substring(0, hashPos);
    itemName = fullItemName.substring(hashPos + 1);

    var parenPos = itemName.indexOf("(");
    if (parenPos != -1) {
      itemName = itemName.substring(0, parenPos).trim();
    }
  }

  this.showClass(className);
  if (itemName) {
    this._detailViewer.showItem(itemName);
  }
};


/**
 * Shows a certain class.
 *
 * @param className {string} the name of the class to show.
 */
proto.showClass = function(className) {
  /*
  this.debug("Showing class: " + className);
  this.debug("traverse bug:"+(this._tree.getItems()[0] == this._tree));
  this.debug("child 1: " + this._tree.getChildren()[1]);
  this.debug("items:"+this._tree.getItems().length);
  this.debug("item 0:"+this._tree.getItems()[0]);
  
  var item1 = this._tree.getItems()[1];
  this.debug("item 1:"+item1);
  this.debug("item 1 label:"+item1.getLabel());
  this.debug("item 1 items:"+item1.getItems().length);
  this.debug("item 1 items:"+item1.getItems()[0].getLabel());

  var splits = className.split(".");
  var treeNode = this._tree.getItems()[0].getItems()[0];
  for (var i = 0; i < splits.length; i++) {
    if (treeNode) {
      this.debug("Searching " + splits[i] + " in " + treeNode);
      var childNodes = treeNode.getItems();
      nextChild = null;
      for (var j = 0; j < childNodes.length; j++) {
        if (childNodes[j].getLabel() == splits[i]) {
          nextChild = childNodes[j];
          break;
        }
      }
      this.debug("Found: " + nextChild);
      treeNode = nextChild;
    }
  }
  */

  var treeNode = this._classTreeNodeHash[className];

  if (treeNode) {
    treeNode.setSelected(true);
    
    // Open the parents
    /*
    // Grrrrrrrrr: Tree navigation doesn't work!
    var parent = treeNode.getParent();
    while (parent && parent.open) {
      parent.open();
      parent = parent.getParent();
    }
    */
  } else {
    alert("Unknown class: " + className);
  }
};
